import { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export interface Project {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  founderId: number;
  founderName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectContextType {
  projects: Project[];
  userProjects: Project[];
  loading: boolean;
  error: string | null;
  createProject: (name: string, description: string, targetAmount: number) => Promise<Project>;
  updateProject: (id: number, name: string, description: string, targetAmount: number, status: string) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchUserProjects: () => Promise<void>;
  fetchProjectById: (id: number) => Promise<Project>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider = ({ children }: ProjectProviderProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();

  // Set up axios with auth token
  const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to requests if available
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/projects/founder/${user.id}`);
      setUserProjects(response.data);
    } catch (err) {
      console.error('Error fetching user projects:', err);
      setError('Failed to fetch your projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectById = async (id: number): Promise<Project> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to fetch project details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, description: string, targetAmount: number): Promise<Project> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/projects', {
        name,
        description,
        targetAmount
      });
      
      // Update local state
      const newProject = response.data.project;
      setProjects(prev => [newProject, ...prev]);
      setUserProjects(prev => [newProject, ...prev]);
      
      return newProject;
    } catch (err: any) {
      console.error('Error creating project:', err);
      if (err.response?.status === 403) {
        setError('Only founders can create projects');
      } else {
        setError('Failed to create project');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: number, name: string, description: string, targetAmount: number, status: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/projects/${id}`, {
        name,
        description,
        targetAmount,
        status
      });
      
      // Update local state
      const updatedProject = { id, name, description, targetAmount, status } as Project;
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedProject } : p));
      setUserProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedProject } : p));
    } catch (err: any) {
      console.error('Error updating project:', err);
      if (err.response?.status === 403) {
        setError('You can only update your own projects');
      } else {
        setError('Failed to update project');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/projects/${id}`);
      
      // Update local state
      setProjects(prev => prev.filter(p => p.id !== id));
      setUserProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting project:', err);
      if (err.response?.status === 403) {
        setError('You can only delete your own projects');
      } else {
        setError('Failed to delete project');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        userProjects,
        loading,
        error,
        createProject,
        updateProject,
        deleteProject,
        fetchProjects,
        fetchUserProjects,
        fetchProjectById
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}; 