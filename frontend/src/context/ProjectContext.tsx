import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Project {
  id: number;
  name: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  founder_id: number;
  founder_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProjectContextType {
  projects: Project[];
  userProjects: Project[];
  loading: boolean;
  error: string | null;
  createProject: (projectData: {
    name: string;
    description: string;
    target_amount: number;
  }) => Promise<Project>;
  updateProject: (id: number, projectData: {
    name: string;
    description: string;
    target_amount: number;
    status: string;
  }) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchUserProjects: () => Promise<void>;
  fetchProjectById: (id: number) => Promise<Project>;
  investInProject: (projectId: number, amount: number) => Promise<void>;
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

  const createProject = async (projectData: {
    name: string;
    description: string;
    target_amount: number;
  }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/projects`,
        {
          name: projectData.name,
          description: projectData.description,
          targetAmount: projectData.target_amount
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const newProject: Project = {
        id: response.data.project.id,
        name: response.data.project.name,
        description: response.data.project.description,
        target_amount: response.data.project.target_amount,
        raised_amount: 0,
        founder_id: response.data.project.founder_id,
        founder_name: response.data.project.founder_name,
        status: response.data.project.status,
        created_at: response.data.project.created_at,
        updated_at: response.data.project.updated_at,
      };

      setProjects((prev) => [newProject, ...prev]);
      setUserProjects((prev) => [newProject, ...prev]);
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (
    id: number,
    projectData: {
      name: string;
      description: string;
      target_amount: number;
      status: string;
    }
  ) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/projects/${id}`,
        projectData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const updatedProject: Project = {
        id: response.data.project.id,
        name: response.data.project.name,
        description: response.data.project.description,
        target_amount: response.data.project.target_amount,
        raised_amount: response.data.project.raised_amount,
        founder_id: response.data.project.founder_id,
        founder_name: response.data.project.founder_name,
        status: response.data.project.status,
        created_at: response.data.project.created_at,
        updated_at: response.data.project.updated_at,
      };

      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p))
      );
      setUserProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p))
      );
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
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

  const investInProject = async (projectId: number, amount: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/projects/${projectId}/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to invest in project');
      }

      // Refresh projects list to show updated raised amount
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while investing in the project');
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
        fetchProjectById,
        investInProject
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}; 