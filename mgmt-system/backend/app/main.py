from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from . import models, schemas, crud
from .database import engine, SessionLocal, Base
from .auth import auth_router, get_current_user

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Project Management System",
    description="API for managing projects and tasks with AI-powered automation",
    version="0.1.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to the AI Project Management System API",
        "documentation": "/docs",
    }

# Projects endpoints
@app.post("/api/projects/", response_model=schemas.Project, tags=["Projects"])
def create_project(
    project: schemas.ProjectCreate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    return crud.create_project(db=db, project=project, user_id=current_user.id)

@app.get("/api/projects/", response_model=List[schemas.Project], tags=["Projects"])
def read_projects(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    projects = crud.get_projects(db, user_id=current_user.id, skip=skip, limit=limit)
    return projects

@app.get("/api/projects/{project_id}", response_model=schemas.Project, tags=["Projects"])
def read_project(
    project_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None or db_project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@app.put("/api/projects/{project_id}", response_model=schemas.Project, tags=["Projects"])
def update_project(
    project_id: int, 
    project: schemas.ProjectUpdate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None or db_project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.update_project(db=db, project_id=project_id, project=project)

@app.delete("/api/projects/{project_id}", response_model=schemas.Project, tags=["Projects"])
def delete_project(
    project_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None or db_project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.delete_project(db=db, project_id=project_id)

# Tasks endpoints
@app.post("/api/tasks/", response_model=schemas.Task, tags=["Tasks"])
def create_task(
    task: schemas.TaskCreate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    # Check if the project exists and belongs to the user
    project = crud.get_project(db, project_id=task.project_id)
    if project is None or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.create_task(db=db, task=task)

@app.get("/api/tasks/", response_model=List[schemas.Task], tags=["Tasks"])
def read_tasks(
    skip: int = 0, 
    limit: int = 100, 
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    return crud.get_tasks(
        db, 
        user_id=current_user.id, 
        project_id=project_id,
        status=status,
        skip=skip, 
        limit=limit
    )

@app.get("/api/tasks/{task_id}", response_model=schemas.Task, tags=["Tasks"])
def read_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_task = crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if the task belongs to a project owned by the user
    project = crud.get_project(db, project_id=db_task.project_id)
    if project is None or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return db_task

@app.put("/api/tasks/{task_id}", response_model=schemas.Task, tags=["Tasks"])
def update_task(
    task_id: int, 
    task: schemas.TaskUpdate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_task = crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if the task belongs to a project owned by the user
    project = crud.get_project(db, project_id=db_task.project_id)
    if project is None or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return crud.update_task(db=db, task_id=task_id, task=task)

@app.delete("/api/tasks/{task_id}", response_model=schemas.Task, tags=["Tasks"])
def delete_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_task = crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if the task belongs to a project owned by the user
    project = crud.get_project(db, project_id=db_task.project_id)
    if project is None or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return crud.delete_task(db=db, task_id=task_id)

# AI Assistance endpoints
@app.post("/api/ai/task-suggestions", response_model=List[schemas.TaskSuggestion], tags=["AI"])
def get_task_suggestions(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    # Check if the project exists and belongs to the user
    project = crud.get_project(db, project_id=project_id)
    if project is None or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    
    from .ai.task_suggestions import generate_task_suggestions
    return generate_task_suggestions(project)

@app.post("/api/ai/schedule-optimization", response_model=List[schemas.Task], tags=["AI"])
def optimize_schedule(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    # Get all tasks for the current user
    tasks = crud.get_tasks(db, user_id=current_user.id)
    
    from .ai.schedule_optimizer import optimize_task_schedule
    optimized_tasks = optimize_task_schedule(tasks)
    
    # Update the tasks in the database
    for task in optimized_tasks:
        crud.update_task(db=db, task_id=task.id, task=schemas.TaskUpdate(
            due_date=task.due_date,
            priority=task.priority
        ))
    
    return optimized_tasks

# Analytics endpoints
@app.get("/api/analytics/project-stats", response_model=schemas.ProjectStats, tags=["Analytics"])
def get_project_stats(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    return crud.get_project_stats(db, user_id=current_user.id)

@app.get("/api/analytics/task-completion", response_model=schemas.TaskCompletionStats, tags=["Analytics"])
def get_task_completion_stats(
    project_id: Optional[int] = None,
    time_range: Optional[str] = "month",  # "week", "month", "year"
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    return crud.get_task_completion_stats(
        db, 
        user_id=current_user.id, 
        project_id=project_id, 
        time_range=time_range
    ) 