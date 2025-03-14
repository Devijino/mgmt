import os
from typing import List, Dict, Any
from datetime import datetime, timedelta
import openai
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.llms import OpenAI
from dotenv import load_dotenv
import json

from .. import models, schemas

# Load environment variables
load_dotenv()

# Get OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
if not OPENAI_API_KEY:
    print("Warning: OPENAI_API_KEY not set. AI features will not work.")

# Setup LangChain
try:
    llm = OpenAI(temperature=0.2, api_key=OPENAI_API_KEY)
except Exception as e:
    print(f"Error initializing OpenAI: {e}")
    llm = None

# Template for task scheduling
SCHEDULE_OPTIMIZATION_TEMPLATE = """
You are an AI project management assistant. I need you to optimize the schedule for the following tasks, taking into account dependencies, priorities, and deadlines.

Here are the current tasks:
{tasks_json}

The current date is {current_date}.

Please analyze these tasks and provide an optimized schedule by:
1. Identifying the most critical tasks based on priority and due dates
2. Suggesting adjusted due dates if needed to create a more realistic schedule
3. Reprioritizing tasks where appropriate
4. Ensuring a balanced workload

FORMAT YOUR RESPONSE AS A JSON ARRAY with the same structure as the input tasks, but with optimized 'due_date' and potentially updated 'priority' fields.
The JSON should include all task fields from the original tasks, especially preserving the 'id' field.
Only modify the 'due_date' and 'priority' fields.
"""

def optimize_task_schedule(tasks: List[models.Task]) -> List[models.Task]:
    """Optimize the schedule of tasks using AI."""
    # If OpenAI is not available or no tasks to optimize, return the original tasks
    if not llm or not tasks:
        print("Using fallback schedule optimization")
        return fallback_optimize_tasks(tasks)
    
    try:
        # Convert tasks to JSON-serializable format
        tasks_data = []
        for task in tasks:
            task_dict = {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status.value,
                "priority": task.priority.value,
                "project_id": task.project_id,
                "due_date": task.due_date.isoformat(),
                "estimated_hours": task.estimated_hours,
                "actual_hours": task.actual_hours,
                "assignee_id": task.assignee_id,
            }
            tasks_data.append(task_dict)
        
        # Create prompt
        prompt = PromptTemplate(
            input_variables=["tasks_json", "current_date"],
            template=SCHEDULE_OPTIMIZATION_TEMPLATE
        )
        
        # Create chain
        chain = LLMChain(llm=llm, prompt=prompt)
        
        # Run chain
        result = chain.run(
            tasks_json=json.dumps(tasks_data, indent=2),
            current_date=datetime.now().strftime("%Y-%m-%d")
        )
        
        # Parse the result (expecting JSON)
        try:
            optimized_tasks_data = json.loads(result)
            
            # Create a dictionary to map task IDs to original tasks
            tasks_by_id = {task.id: task for task in tasks}
            
            # Update the original tasks with the optimized values
            for optimized_data in optimized_tasks_data:
                task_id = optimized_data.get("id")
                if task_id in tasks_by_id:
                    # Get the original task
                    task = tasks_by_id[task_id]
                    
                    # Update due date if provided
                    if "due_date" in optimized_data:
                        try:
                            new_due_date = datetime.fromisoformat(optimized_data["due_date"])
                            task.due_date = new_due_date
                        except (ValueError, TypeError):
                            print(f"Invalid due_date format for task {task_id}: {optimized_data['due_date']}")
                    
                    # Update priority if provided
                    if "priority" in optimized_data:
                        new_priority = optimized_data["priority"]
                        if new_priority in [p.value for p in models.Priority]:
                            task.priority = models.Priority(new_priority)
            
            return list(tasks_by_id.values())
        
        except json.JSONDecodeError:
            print(f"Error parsing LLM response: {result}")
            return fallback_optimize_tasks(tasks)
    
    except Exception as e:
        print(f"Error optimizing schedule: {e}")
        return fallback_optimize_tasks(tasks)

def fallback_optimize_tasks(tasks: List[models.Task]) -> List[models.Task]:
    """Fallback method to optimize tasks when AI is not available."""
    # Simple optimization logic:
    # 1. Sort tasks by priority
    # 2. For overdue tasks, reschedule them based on priority
    
    # Make a copy of the tasks to avoid modifying the original objects
    optimized_tasks = list(tasks)
    
    # Current date for reference
    now = datetime.now()
    
    # Collect overdue tasks
    overdue_tasks = [t for t in optimized_tasks 
                    if t.due_date < now and t.status != models.TaskStatus.DONE]
    
    # Sort overdue tasks by priority (urgent first, then high, etc.)
    priority_order = {
        models.Priority.URGENT: 0,
        models.Priority.HIGH: 1,
        models.Priority.MEDIUM: 2,
        models.Priority.LOW: 3
    }
    
    overdue_tasks.sort(key=lambda t: priority_order[t.priority])
    
    # Reschedule overdue tasks
    for i, task in enumerate(overdue_tasks):
        # Set new due dates based on priority and estimated hours
        if task.priority == models.Priority.URGENT:
            # Urgent tasks should be done ASAP (1-2 days)
            task.due_date = now + timedelta(days=1)
            # If it's overdue and not urgent, make it urgent
            if task.priority != models.Priority.URGENT:
                task.priority = models.Priority.URGENT
        
        elif task.priority == models.Priority.HIGH:
            # High priority tasks within a week
            task.due_date = now + timedelta(days=min(7, 2 + i))
        
        elif task.priority == models.Priority.MEDIUM:
            # Medium priority tasks within two weeks
            task.due_date = now + timedelta(days=min(14, 7 + i))
        
        else:  # LOW priority
            # Low priority tasks within a month
            task.due_date = now + timedelta(days=min(30, 14 + i))
    
    # Also schedule other tasks that are due soon but not yet overdue
    upcoming_tasks = [t for t in optimized_tasks 
                     if now <= t.due_date <= now + timedelta(days=3) 
                     and t.status != models.TaskStatus.DONE]
    
    # For each upcoming task, adjust priority if needed
    for task in upcoming_tasks:
        if task.priority == models.Priority.LOW:
            task.priority = models.Priority.MEDIUM
        elif task.priority == models.Priority.MEDIUM:
            task.priority = models.Priority.HIGH
    
    return optimized_tasks 