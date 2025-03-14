from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text, DateTime, Table, Enum, JSON, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime
from typing import List, Optional

from .database import Base

# Many-to-many relationship table for task tags
task_tags = Table(
    "task_tags",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)

# Project team members
project_team_members = Table(
    "project_team_members",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
)

# Enums for status and priority
class ProjectStatus(str, enum.Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    ON_HOLD = "on-hold"
    COMPLETED = "completed"

class TaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in-progress"
    REVIEW = "review"
    DONE = "done"

class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# User model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="owner")
    tasks_assigned = relationship("Task", back_populates="assignee")

# Project model
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    category = Column(String)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNING)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    completion_percentage = Column(Float, default=0)
    budget = Column(Float, default=0)
    expenses = Column(Float, default=0)
    priority = Column(Enum(Priority), default=Priority.MEDIUM)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    team = relationship("User", secondary=project_team_members, backref="team_projects")

# Task model
class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO)
    priority = Column(Enum(Priority), default=Priority.MEDIUM)
    due_date = Column(DateTime)
    estimated_hours = Column(Float, default=0)
    actual_hours = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    project_id = Column(Integer, ForeignKey("projects.id"))
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks_assigned")
    tags = relationship("Tag", secondary=task_tags, backref="tasks")
    attachments = relationship("Attachment", back_populates="task", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="task", cascade="all, delete-orphan")

# Tag model
class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    color = Column(String, default="#4299E1")  # Default blue color
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Comment model
class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    task = relationship("Task", back_populates="comments")
    user = relationship("User")

# Attachment model
class Attachment(Base):
    __tablename__ = "attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    file_path = Column(String)
    file_size = Column(Integer)  # Size in bytes
    file_type = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign Keys
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    task = relationship("Task", back_populates="attachments")
    user = relationship("User")

# Automation rule model
class AutomationRule(Base):
    __tablename__ = "automation_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    trigger_type = Column(String)  # e.g., "task_status_change", "due_date_approaching", etc.
    trigger_conditions = Column(JSON)
    actions = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    user = relationship("User")

# Log model for tracking automation and significant events
class Log(Base):
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String)  # e.g., "automation_executed", "task_status_changed", etc.
    description = Column(Text)
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    
    # Relationships
    user = relationship("User")
    project = relationship("Project")
    task = relationship("Task")

# AI Suggestion model
class AISuggestion(Base):
    __tablename__ = "ai_suggestions"
    
    id = Column(Integer, primary_key=True, index=True)
    suggestion_type = Column(String)  # e.g., "task", "schedule", "priority", etc.
    content = Column(Text)
    context = Column(JSON)
    is_applied = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    # Relationships
    user = relationship("User")
    project = relationship("Project") 