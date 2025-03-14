import os
from typing import List
from datetime import datetime, timedelta
import openai
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.llms import OpenAI
from dotenv import load_dotenv

from .. import models, schemas

# Load environment variables
load_dotenv()

# Get OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
if not OPENAI_API_KEY:
    print("Warning: OPENAI_API_KEY not set. AI features will not work.")

# Setup LangChain
try:
    llm = OpenAI(temperature=0.5, api_key=OPENAI_API_KEY)
except Exception as e:
    print(f"Error initializing OpenAI: {e}")
    llm = None

# Template for task suggestions
TASK_SUGGESTION_TEMPLATE = """
You are an AI project management assistant. Based on the project information below, suggest {num_suggestions} tasks that should be created to help the project move forward effectively.

Project name: {project_name}
Project description: {project_description}
Project category: {project_category}
Project status: {project_status}
Project priority: {project_priority}
Project start date: {project_start_date}
Project end date: {project_end_date}
Project completion percentage: {project_completion}%

Current tasks:
{current_tasks}

For each task suggestion, provide:
1. A clear, concise title
2. A detailed description
3. An appropriate priority level (low, medium, high, or urgent)
4. Estimated hours to complete
5. Suggested due date
6. Relevant tags
7. A rationale for why this task is important

FORMAT YOUR RESPONSE AS A JSON ARRAY WITH EACH TASK AS A JSON OBJECT.
"""

# Function to generate task suggestions
def generate_task_suggestions(project: models.Project, num_suggestions: int = 3) -> List[schemas.TaskSuggestion]:
    # If OpenAI is not available, return dummy suggestions
    if not llm:
        return generate_fallback_suggestions(project, num_suggestions)
    
    try:
        # Prepare current tasks info
        current_tasks_info = ""
        for i, task in enumerate(project.tasks, 1):
            current_tasks_info += f"{i}. {task.title} - Status: {task.status}, Priority: {task.priority}\n"
        
        if not current_tasks_info:
            current_tasks_info = "No tasks created yet."
        
        # Create prompt
        prompt = PromptTemplate(
            input_variables=["num_suggestions", "project_name", "project_description", 
                            "project_category", "project_status", "project_priority",
                            "project_start_date", "project_end_date", 
                            "project_completion", "current_tasks"],
            template=TASK_SUGGESTION_TEMPLATE
        )
        
        # Create chain
        chain = LLMChain(llm=llm, prompt=prompt)
        
        # Run chain
        result = chain.run(
            num_suggestions=num_suggestions,
            project_name=project.name,
            project_description=project.description,
            project_category=project.category,
            project_status=project.status,
            project_priority=project.priority,
            project_start_date=project.start_date.strftime("%Y-%m-%d"),
            project_end_date=project.end_date.strftime("%Y-%m-%d"),
            project_completion=project.completion_percentage,
            current_tasks=current_tasks_info
        )
        
        # Parse the result (expecting JSON)
        import json
        try:
            suggestions_data = json.loads(result)
            suggestions = []
            
            for data in suggestions_data:
                suggestion = schemas.TaskSuggestion(
                    title=data.get("title", "Untitled Task"),
                    description=data.get("description", ""),
                    priority=data.get("priority", "medium"),
                    estimated_hours=float(data.get("estimated_hours", 2)),
                    due_date=datetime.fromisoformat(data.get("due_date", 
                                                           (datetime.now() + timedelta(days=7)).isoformat())),
                    tags=data.get("tags", []),
                    rationale=data.get("rationale", "")
                )
                suggestions.append(suggestion)
            
            return suggestions
        except json.JSONDecodeError:
            print(f"Error parsing LLM response: {result}")
            return generate_fallback_suggestions(project, num_suggestions)
        
    except Exception as e:
        print(f"Error generating suggestions: {e}")
        return generate_fallback_suggestions(project, num_suggestions)

# Fallback suggestions when AI is not available
def generate_fallback_suggestions(project: models.Project, num_suggestions: int = 3) -> List[schemas.TaskSuggestion]:
    suggestions = []
    
    # Define a few generic task templates based on project status
    if project.status == models.ProjectStatus.PLANNING:
        templates = [
            {
                "title": "Create project requirements document",
                "description": "Define the detailed requirements for the project including all features, constraints, and acceptance criteria.",
                "priority": "high",
                "estimated_hours": 6,
                "tags": ["documentation", "planning"],
                "rationale": "A clear requirements document is essential for project success."
            },
            {
                "title": "Define project milestones and timeline",
                "description": "Break down the project into key milestones with specific deadlines to track progress effectively.",
                "priority": "high",
                "estimated_hours": 4,
                "tags": ["planning", "timeline"],
                "rationale": "Proper timeline planning is critical for meeting the project deadline."
            },
            {
                "title": "Create resource allocation plan",
                "description": "Identify all resources needed for the project and create a plan for their allocation.",
                "priority": "medium",
                "estimated_hours": 3,
                "tags": ["planning", "resources"],
                "rationale": "Resource planning prevents bottlenecks during project execution."
            }
        ]
    elif project.status == models.ProjectStatus.ACTIVE:
        templates = [
            {
                "title": "Conduct weekly progress review",
                "description": "Review the progress of all ongoing tasks and identify any bottlenecks or issues.",
                "priority": "medium",
                "estimated_hours": 2,
                "tags": ["review", "meeting"],
                "rationale": "Regular reviews help keep the project on track."
            },
            {
                "title": "Update project documentation",
                "description": "Ensure all project documentation is up-to-date with the latest changes and decisions.",
                "priority": "low",
                "estimated_hours": 3,
                "tags": ["documentation", "maintenance"],
                "rationale": "Maintaining documentation is important for knowledge sharing and future reference."
            },
            {
                "title": "Prepare progress report for stakeholders",
                "description": "Create a detailed progress report highlighting achievements, challenges, and next steps.",
                "priority": "medium",
                "estimated_hours": 2.5,
                "tags": ["reporting", "communication"],
                "rationale": "Keeping stakeholders informed is crucial for project support."
            }
        ]
    elif project.status == models.ProjectStatus.ON_HOLD:
        templates = [
            {
                "title": "Document current project status",
                "description": "Create a detailed document capturing the current state of the project before on-hold period.",
                "priority": "high",
                "estimated_hours": 4,
                "tags": ["documentation", "status"],
                "rationale": "Proper documentation will facilitate smooth resumption of the project."
            },
            {
                "title": "Identify blockers preventing project progress",
                "description": "Analyze and document all blockers that led to the project being put on hold.",
                "priority": "high",
                "estimated_hours": 3,
                "tags": ["analysis", "blockers"],
                "rationale": "Understanding blockers is the first step to resolving them."
            },
            {
                "title": "Create resumption plan",
                "description": "Develop a detailed plan for resuming the project once the on-hold status is lifted.",
                "priority": "medium",
                "estimated_hours": 4,
                "tags": ["planning", "strategy"],
                "rationale": "A proper resumption plan will minimize delays when the project restarts."
            }
        ]
    else:  # Completed
        templates = [
            {
                "title": "Conduct project retrospective",
                "description": "Analyze what went well and what could be improved for future projects.",
                "priority": "medium",
                "estimated_hours": 3,
                "tags": ["analysis", "closing"],
                "rationale": "Learning from completed projects improves future performance."
            },
            {
                "title": "Create project closure report",
                "description": "Document the final state of the project, achievements, and any outstanding items.",
                "priority": "high",
                "estimated_hours": 5,
                "tags": ["documentation", "closing"],
                "rationale": "Proper closure documentation is important for organizational knowledge."
            },
            {
                "title": "Plan maintenance and support activities",
                "description": "Define the approach for ongoing maintenance and support of the project deliverables.",
                "priority": "medium",
                "estimated_hours": 4,
                "tags": ["planning", "maintenance"],
                "rationale": "Planning for maintenance ensures the long-term success of the project."
            }
        ]
    
    # Create task suggestions from templates
    templates = templates[:num_suggestions]  # Limit to requested number
    
    for template in templates:
        # Calculate a due date based on project end date and estimated hours
        days_to_add = min(int(template["estimated_hours"] * 2), 14)  # Simple heuristic
        due_date = datetime.now() + timedelta(days=days_to_add)
        
        # Don't exceed project end date
        if due_date > project.end_date:
            due_date = project.end_date - timedelta(days=1)
        
        suggestion = schemas.TaskSuggestion(
            title=template["title"],
            description=template["description"],
            priority=template["priority"],
            estimated_hours=template["estimated_hours"],
            due_date=due_date,
            tags=template["tags"],
            rationale=template["rationale"]
        )
        suggestions.append(suggestion)
    
    return suggestions 