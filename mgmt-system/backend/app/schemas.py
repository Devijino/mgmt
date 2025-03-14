from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date
from enum import Enum

# Enums
class ProjectStatus(str, Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    ON_HOLD = "on-hold"
    COMPLETED = "completed"

class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in-progress"
    REVIEW = "review"
    DONE = "done"

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# Base schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    status: ProjectStatus = ProjectStatus.PLANNING
    start_date: datetime
    end_date: datetime
    budget: float = 0
    expenses: float = 0
    priority: Priority = Priority.MEDIUM

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: Priority = Priority.MEDIUM
    due_date: datetime
    estimated_hours: float = 0
    actual_hours: float = 0
    project_id: int
    assignee_id: Optional[int] = None
    tags: List[str] = []

class TagBase(BaseModel):
    name: str
    color: Optional[str] = "#4299E1"  # Default blue color

class CommentBase(BaseModel):
    content: str
    task_id: int

class AttachmentBase(BaseModel):
    filename: str
    file_type: str
    task_id: int

# Create schemas
class UserCreate(UserBase):
    password: str

class ProjectCreate(ProjectBase):
    team: List[int] = []  # List of user IDs

class TaskCreate(TaskBase):
    pass

class TagCreate(TagBase):
    pass

class CommentCreate(CommentBase):
    pass

class AttachmentCreate(AttachmentBase):
    file_path: str
    file_size: int

# Update schemas
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[ProjectStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    completion_percentage: Optional[float] = None
    budget: Optional[float] = None
    expenses: Optional[float] = None
    priority: Optional[Priority] = None
    team: Optional[List[int]] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    project_id: Optional[int] = None
    assignee_id: Optional[int] = None
    tags: Optional[List[str]] = None

class CommentUpdate(BaseModel):
    content: Optional[str] = None

# Response schemas
class Tag(TagBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class Comment(CommentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: User
    
    class Config:
        orm_mode = True

class Attachment(AttachmentBase):
    id: int
    user_id: int
    file_path: str
    file_size: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    assignee: Optional[User] = None
    tags: List[Tag] = []
    attachments: List[Attachment] = []
    comments: List[Comment] = []
    
    class Config:
        orm_mode = True

class Project(ProjectBase):
    id: int
    user_id: int
    completion_percentage: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner: User
    team: List[User] = []
    tasks: List[Task] = []
    
    class Config:
        orm_mode = True

class TaskSummary(BaseModel):
    id: int
    title: str
    status: TaskStatus
    priority: Priority
    due_date: datetime
    
    class Config:
        orm_mode = True

class ProjectSummary(BaseModel):
    id: int
    name: str
    status: ProjectStatus
    completion_percentage: float
    end_date: datetime
    priority: Priority
    
    class Config:
        orm_mode = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# AI-related schemas
class TaskSuggestion(BaseModel):
    title: str
    description: str
    priority: Priority
    estimated_hours: float
    due_date: datetime
    tags: List[str]
    rationale: str

class ProjectStats(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    overdue_projects: int
    total_tasks: int
    completed_tasks: int
    overdue_tasks: int
    completion_rate: float
    
class TimeSeriesPoint(BaseModel):
    date: date
    value: int

class TaskCompletionStats(BaseModel):
    total_completed: int
    total_pending: int
    completion_rate: float
    by_date: List[TimeSeriesPoint]
    by_priority: Dict[str, int]
    by_project: Dict[str, int] 