import { useEffect, useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ProjectDetailsPopup } from './ProjectDetailsPopup';
import { Project } from '../context/ProjectContext';

interface ProjectListProps {
  showUserProjects?: boolean;
}

export const ProjectList = ({ showUserProjects = false }: ProjectListProps) => {
  const { user } = useAuth();
  const { 
    projects, 
    userProjects, 
    loading, 
    error, 
    fetchProjects, 
    fetchUserProjects 
  } = useProject();
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (showUserProjects && user) {
      fetchUserProjects();
    } else {
      fetchProjects();
    }
  }, [showUserProjects, user]);

  const displayProjects = showUserProjects ? userProjects : projects;

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleClosePopup = () => {
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!displayProjects.length) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">
          {showUserProjects 
            ? "You haven't created any projects yet." 
            : "No projects available."}
        </p>
        {showUserProjects && user?.role === 'founder' && (
          <Link
            to="/projects/create"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create New Project
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {displayProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleProjectClick(project)}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target Amount:</span>
                  <span className="font-medium">{project.target_amount} ETH</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Raised:</span>
                  <span className="font-medium">{project.raised_amount} ETH</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (project.raised_amount / project.target_amount) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Founder:</span>
                  <span className="font-medium">{project.founder_name}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedProject && (
        <ProjectDetailsPopup 
          project={selectedProject} 
          onClose={handleClosePopup} 
        />
      )}
    </>
  );
}; 