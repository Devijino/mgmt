from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, Date
from datetime import datetime, timedelta
from typing import List, Optional, Dict
import json

from . import models, schemas
from .auth import get_password_hash

# Dependency to get DB session
def get_db():
    from .database import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    
    update_data = user.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    db.delete(db_user)
    db.commit()
    return db_user

# Project CRUD operations
def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def get_projects(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Project).filter(models.Project.user_id == user_id).offset(skip).limit(limit).all()

def create_project(db: Session, project: schemas.ProjectCreate, user_id: int):
    db_project = models.Project(
        **project.dict(exclude={"team"}),
        user_id=user_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    # Add team members
    if project.team:
        for member_id in project.team:
            # Check if user exists
            user = db.query(models.User).filter(models.User.id == member_id).first()
            if user:
                db_project.team.append(user)
        
        db.commit()
        db.refresh(db_project)
    
    return db_project

def update_project(db: Session, project_id: int, project: schemas.ProjectUpdate):
    db_project = get_project(db, project_id)
    
    # Update basic fields
    update_data = project.dict(exclude={"team"}, exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    # Update team members if provided
    if project.team is not None:
        # Clear existing team members
        db_project.team = []
        
        # Add new team members
        for member_id in project.team:
            user = db.query(models.User).filter(models.User.id == member_id).first()
            if user:
                db_project.team.append(user)
    
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    db_project = get_project(db, project_id)
    db.delete(db_project)
    db.commit()
    return db_project

# Task CRUD operations
def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def get_tasks(db: Session, user_id: int, project_id: Optional[int] = None, 
              status: Optional[str] = None, skip: int = 0, limit: int = 100):
    # Get projects owned by user
    user_projects = db.query(models.Project.id).filter(models.Project.user_id == user_id)
    
    # Base query for tasks in user's projects
    query = db.query(models.Task).filter(models.Task.project_id.in_(user_projects))
    
    # Apply filters if provided
    if project_id is not None:
        query = query.filter(models.Task.project_id == project_id)
    
    if status is not None:
        query = query.filter(models.Task.status == status)
    
    # Apply pagination
    return query.offset(skip).limit(limit).all()

def create_task(db: Session, task: schemas.TaskCreate):
    # Handle tags
    tag_objects = []
    for tag_name in task.tags:
        # Check if tag exists
        tag = db.query(models.Tag).filter(models.Tag.name == tag_name).first()
        if not tag:
            # Create new tag
            tag = models.Tag(name=tag_name)
            db.add(tag)
            db.flush()
        
        tag_objects.append(tag)
    
    # Create task
    db_task = models.Task(
        **task.dict(exclude={"tags"}),
    )
    db.add(db_task)
    db.flush()
    
    # Associate tags with task
    db_task.tags = tag_objects
    
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task: schemas.TaskUpdate):
    db_task = get_task(db, task_id)
    
    # Handle tags if provided
    if task.tags is not None:
        # Clear existing tags
        db_task.tags = []
        
        # Add new tags
        for tag_name in task.tags:
            # Check if tag exists
            tag = db.query(models.Tag).filter(models.Tag.name == tag_name).first()
            if not tag:
                # Create new tag
                tag = models.Tag(name=tag_name)
                db.add(tag)
                db.flush()
            
            db_task.tags.append(tag)
    
    # Update other fields
    update_data = task.dict(exclude={"tags"}, exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    # If status is changed to "done", record completion time
    if task.status == models.TaskStatus.DONE and db_task.status != models.TaskStatus.DONE:
        # Create a log entry
        log_entry = models.Log(
            event_type="task_completed",
            description=f"Task '{db_task.title}' marked as done",
            metadata=json.dumps({
                "task_id": db_task.id,
                "project_id": db_task.project_id,
                "time_taken": str(datetime.now() - db_task.created_at),
            }),
            task_id=db_task.id,
            project_id=db_task.project_id,
            user_id=db_task.assignee_id
        )
        db.add(log_entry)
        
        # Update project completion percentage
        update_project_completion(db, db_task.project_id)
    
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    project_id = db_task.project_id
    db.delete(db_task)
    db.commit()
    
    # Update project completion percentage
    update_project_completion(db, project_id)
    
    return db_task

# Helper function to update project completion percentage
def update_project_completion(db: Session, project_id: int):
    project = get_project(db, project_id)
    if not project:
        return
    
    # Count total and completed tasks
    total_tasks = db.query(models.Task).filter(models.Task.project_id == project_id).count()
    completed_tasks = db.query(models.Task).filter(
        models.Task.project_id == project_id,
        models.Task.status == models.TaskStatus.DONE
    ).count()
    
    # Calculate completion percentage
    completion_percentage = 0
    if total_tasks > 0:
        completion_percentage = (completed_tasks / total_tasks) * 100
    
    # Update project
    project.completion_percentage = completion_percentage
    db.commit()

# Analytics CRUD operations
def get_project_stats(db: Session, user_id: int) -> schemas.ProjectStats:
    # Get projects owned by user
    user_projects = db.query(models.Project).filter(models.Project.user_id == user_id)
    
    # Count statistics
    total_projects = user_projects.count()
    active_projects = user_projects.filter(models.Project.status == models.ProjectStatus.ACTIVE).count()
    completed_projects = user_projects.filter(models.Project.status == models.ProjectStatus.COMPLETED).count()
    
    # Get overdue projects
    overdue_projects = user_projects.filter(
        models.Project.end_date < datetime.now(),
        models.Project.status != models.ProjectStatus.COMPLETED
    ).count()
    
    # Get project IDs for task queries
    project_ids = [p.id for p in user_projects.all()]
    
    # Task statistics
    tasks_query = db.query(models.Task).filter(models.Task.project_id.in_(project_ids))
    total_tasks = tasks_query.count()
    completed_tasks = tasks_query.filter(models.Task.status == models.TaskStatus.DONE).count()
    overdue_tasks = tasks_query.filter(
        models.Task.due_date < datetime.now(),
        models.Task.status != models.TaskStatus.DONE
    ).count()
    
    # Calculate completion rate
    completion_rate = 0
    if total_tasks > 0:
        completion_rate = (completed_tasks / total_tasks) * 100
    
    return schemas.ProjectStats(
        total_projects=total_projects,
        active_projects=active_projects,
        completed_projects=completed_projects,
        overdue_projects=overdue_projects,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        overdue_tasks=overdue_tasks,
        completion_rate=completion_rate
    )

def get_task_completion_stats(db: Session, user_id: int, project_id: Optional[int] = None, 
                              time_range: str = "month") -> schemas.TaskCompletionStats:
    # Get projects owned by user
    user_projects = db.query(models.Project.id).filter(models.Project.user_id == user_id)
    
    # Base query for tasks in user's projects
    query = db.query(models.Task).filter(models.Task.project_id.in_(user_projects))
    
    # Apply project filter if provided
    if project_id is not None:
        query = query.filter(models.Task.project_id == project_id)
    
    # Determine time range
    now = datetime.now()
    if time_range == "week":
        start_date = now - timedelta(days=7)
    elif time_range == "month":
        start_date = now - timedelta(days=30)
    elif time_range == "year":
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)  # Default to month
    
    # Apply time range filter
    time_filtered_query = query.filter(models.Task.updated_at >= start_date)
    
    # Count completed and pending tasks
    total_completed = time_filtered_query.filter(models.Task.status == models.TaskStatus.DONE).count()
    total_pending = time_filtered_query.filter(models.Task.status != models.TaskStatus.DONE).count()
    
    # Calculate completion rate
    completion_rate = 0
    total_tasks = total_completed + total_pending
    if total_tasks > 0:
        completion_rate = (total_completed / total_tasks) * 100
    
    # Group by date
    task_completion_by_date = (
        db.query(
            cast(models.Task.updated_at, Date).label('date'),
            func.count().label('count')
        )
        .filter(
            models.Task.project_id.in_(user_projects),
            models.Task.status == models.TaskStatus.DONE,
            models.Task.updated_at >= start_date
        )
        .group_by(cast(models.Task.updated_at, Date))
        .order_by(cast(models.Task.updated_at, Date))
        .all()
    )
    
    # Transform to TimeSeriesPoint
    by_date = [
        schemas.TimeSeriesPoint(date=entry.date, value=entry.count)
        for entry in task_completion_by_date
    ]
    
    # Group by priority
    task_completion_by_priority = (
        db.query(
            models.Task.priority,
            func.count().label('count')
        )
        .filter(
            models.Task.project_id.in_(user_projects),
            models.Task.status == models.TaskStatus.DONE,
            models.Task.updated_at >= start_date
        )
        .group_by(models.Task.priority)
        .all()
    )
    
    # Transform to dictionary
    by_priority = {str(p.priority.name): p.count for p in task_completion_by_priority}
    
    # Group by project
    task_completion_by_project = (
        db.query(
            models.Project.name,
            func.count().label('count')
        )
        .join(models.Task, models.Task.project_id == models.Project.id)
        .filter(
            models.Task.project_id.in_(user_projects),
            models.Task.status == models.TaskStatus.DONE,
            models.Task.updated_at >= start_date
        )
        .group_by(models.Project.name)
        .all()
    )
    
    # Transform to dictionary
    by_project = {p.name: p.count for p in task_completion_by_project}
    
    return schemas.TaskCompletionStats(
        total_completed=total_completed,
        total_pending=total_pending,
        completion_rate=completion_rate,
        by_date=by_date,
        by_priority=by_priority,
        by_project=by_project
    ) 