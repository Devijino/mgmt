import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define types for our project management system
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
  projectId: string;
  tags: string[];
  estimatedHours: number;
  actualHours: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  completionPercentage: number;
  budget: number;
  expenses: number;
  team: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  tasksCompleted: number;
  tasksDue: number;
}

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  projectStats: ProjectStats;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  selectProject: (projectId: string) => void;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'completionPercentage'>) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    overdueProjects: 0,
    tasksCompleted: 0,
    tasksDue: 0,
  });

  // Mock API URL (replace with real API when available)
  const API_URL = process.env.API_URL || 'http://localhost:8000';

  // Fetch all projects
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      // For development, use mock data
      // In production, this would be an API call:
      // const response = await axios.get(`${API_URL}/api/projects`);
      // setProjects(response.data);
      
      // Mock data for initial development
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'AI Chatbot Development',
          description: 'Develop an AI-powered chatbot for customer service',
          category: 'AI',
          status: 'active',
          startDate: '2023-06-01',
          endDate: '2023-08-31',
          createdAt: '2023-05-15',
          updatedAt: '2023-06-10',
          tasks: [
            {
              id: '101',
              title: 'Design conversation flows',
              description: 'Create diagrams for all possible conversation paths',
              status: 'done',
              priority: 'high',
              dueDate: '2023-06-15',
              createdAt: '2023-06-01',
              updatedAt: '2023-06-15',
              assignedTo: 'John Doe',
              projectId: '1',
              tags: ['design', 'AI'],
              estimatedHours: 20,
              actualHours: 18
            },
            {
              id: '102',
              title: 'Implement NLP engine',
              description: 'Connect to OpenAI API and implement response logic',
              status: 'in-progress',
              priority: 'urgent',
              dueDate: '2023-07-15',
              createdAt: '2023-06-16',
              updatedAt: '2023-07-01',
              assignedTo: 'Jane Smith',
              projectId: '1',
              tags: ['development', 'AI', 'NLP'],
              estimatedHours: 40,
              actualHours: 20
            }
          ],
          completionPercentage: 35,
          budget: 50000,
          expenses: 18000,
          team: ['John Doe', 'Jane Smith', 'Bob Johnson'],
          priority: 'high'
        },
        {
          id: '2',
          name: 'E-commerce Platform Redesign',
          description: 'Redesign the UI/UX of our e-commerce platform',
          category: 'E-commerce',
          status: 'planning',
          startDate: '2023-07-01',
          endDate: '2023-09-30',
          createdAt: '2023-06-01',
          updatedAt: '2023-06-20',
          tasks: [
            {
              id: '201',
              title: 'User research',
              description: 'Conduct user interviews and surveys',
              status: 'todo',
              priority: 'high',
              dueDate: '2023-07-20',
              createdAt: '2023-06-20',
              updatedAt: '2023-06-20',
              assignedTo: 'Alice Brown',
              projectId: '2',
              tags: ['research', 'UX'],
              estimatedHours: 30,
              actualHours: 0
            }
          ],
          completionPercentage: 10,
          budget: 75000,
          expenses: 5000,
          team: ['Alice Brown', 'Charlie Davis'],
          priority: 'medium'
        }
      ];
      
      setProjects(mockProjects);
      
      // Calculate project stats
      const stats: ProjectStats = {
        totalProjects: mockProjects.length,
        activeProjects: mockProjects.filter(p => p.status === 'active').length,
        completedProjects: mockProjects.filter(p => p.status === 'completed').length,
        overdueProjects: mockProjects.filter(p => new Date(p.endDate) < new Date() && p.status !== 'completed').length,
        tasksCompleted: mockProjects.flatMap(p => p.tasks).filter(t => t.status === 'done').length,
        tasksDue: mockProjects.flatMap(p => p.tasks).filter(t => new Date(t.dueDate) < new Date() && t.status !== 'done').length,
      };
      setProjectStats(stats);
      
    } catch (err) {
      setError('Failed to fetch projects. Please try again later.');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Select a specific project
  const selectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId) || null;
    setSelectedProject(project);
  };

  // Create a new project
  const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'completionPercentage'>) => {
    setLoading(true);
    setError(null);
    try {
      // In production: const response = await axios.post(`${API_URL}/api/projects`, project);
      
      // Mock implementation
      const newProject: Project = {
        ...project,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: [],
        completionPercentage: 0
      };
      
      setProjects(prev => [...prev, newProject]);
      
      // Update stats
      setProjectStats(prev => ({
        ...prev,
        totalProjects: prev.totalProjects + 1,
        activeProjects: project.status === 'active' ? prev.activeProjects + 1 : prev.activeProjects
      }));
      
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.error('Error creating project:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing project
  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    setLoading(true);
    setError(null);
    try {
      // In production: const response = await axios.patch(`${API_URL}/api/projects/${projectId}`, updates);
      
      // Mock implementation
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, ...updates, updatedAt: new Date().toISOString() } 
            : project
        )
      );
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
      }
      
    } catch (err) {
      setError('Failed to update project. Please try again.');
      console.error('Error updating project:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      // In production: await axios.delete(`${API_URL}/api/projects/${projectId}`);
      
      // Mock implementation
      const projectToDelete = projects.find(p => p.id === projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      
      // Update stats
      if (projectToDelete) {
        setProjectStats(prev => ({
          ...prev,
          totalProjects: prev.totalProjects - 1,
          activeProjects: projectToDelete.status === 'active' ? prev.activeProjects - 1 : prev.activeProjects,
          completedProjects: projectToDelete.status === 'completed' ? prev.completedProjects - 1 : prev.completedProjects,
        }));
      }
      
    } catch (err) {
      setError('Failed to delete project. Please try again.');
      console.error('Error deleting project:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new task in a project
  const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      // In production: const response = await axios.post(`${API_URL}/api/tasks`, task);
      
      // Mock implementation
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setProjects(prev => 
        prev.map(project => 
          project.id === task.projectId 
            ? { 
                ...project, 
                tasks: [...project.tasks, newTask],
                updatedAt: new Date().toISOString() 
              } 
            : project
        )
      );
      
      if (selectedProject?.id === task.projectId) {
        setSelectedProject(prev => 
          prev 
            ? { 
                ...prev, 
                tasks: [...prev.tasks, newTask],
                updatedAt: new Date().toISOString() 
              } 
            : null
        );
      }
      
    } catch (err) {
      setError('Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setLoading(true);
    setError(null);
    try {
      // In production: const response = await axios.patch(`${API_URL}/api/tasks/${taskId}`, updates);
      
      // Mock implementation
      setProjects(prev => 
        prev.map(project => ({
          ...project,
          tasks: project.tasks.map(task => 
            task.id === taskId 
              ? { ...task, ...updates, updatedAt: new Date().toISOString() } 
              : task
          ),
          updatedAt: project.tasks.some(task => task.id === taskId) 
            ? new Date().toISOString() 
            : project.updatedAt
        }))
      );
      
      if (selectedProject?.tasks.some(task => task.id === taskId)) {
        setSelectedProject(prev => 
          prev 
            ? {
                ...prev,
                tasks: prev.tasks.map(task => 
                  task.id === taskId 
                    ? { ...task, ...updates, updatedAt: new Date().toISOString() } 
                    : task
                ),
                updatedAt: new Date().toISOString()
              } 
            : null
        );
      }
      
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      // In production: await axios.delete(`${API_URL}/api/tasks/${taskId}`);
      
      // Mock implementation
      setProjects(prev => 
        prev.map(project => {
          const hasTask = project.tasks.some(task => task.id === taskId);
          return {
            ...project,
            tasks: project.tasks.filter(task => task.id !== taskId),
            updatedAt: hasTask ? new Date().toISOString() : project.updatedAt
          };
        })
      );
      
      if (selectedProject?.tasks.some(task => task.id === taskId)) {
        setSelectedProject(prev => 
          prev 
            ? {
                ...prev,
                tasks: prev.tasks.filter(task => task.id !== taskId),
                updatedAt: new Date().toISOString()
              } 
            : null
        );
      }
      
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{
      projects,
      selectedProject,
      projectStats,
      loading,
      error,
      fetchProjects,
      selectProject,
      createProject,
      updateProject,
      deleteProject,
      createTask,
      updateTask,
      deleteTask
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}; 