import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { Project } from '../context/ProjectContext';
import { ProjectDetailsPopup } from '../components/ProjectDetailsPopup';

const ProjectsPage = () => {
  const { user } = useAuth();
  const { projects, loading, error, fetchProjects, createProject } = useProject();
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    targetAmount: 0,
    status: 'active' as const,
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject({
        name: newProject.name,
        description: newProject.description,
        target_amount: newProject.targetAmount
      });
      setNewProject({ name: '', description: '', targetAmount: 0, status: 'active' });
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleClosePopup = () => {
    setSelectedProject(null);
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>

      {/* Founder View - Create Project Form */}
      {user?.role === 'founder' && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Name</label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Amount</label>
              <input
                type="number"
                value={newProject.targetAmount}
                onChange={(e) => setNewProject({ ...newProject, targetAmount: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Create Project
            </button>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => handleProjectClick(project)}
          >
            <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Raised: ${project.raised_amount}</p>
              <p className="text-sm text-gray-500">Target: ${project.target_amount}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${(project.raised_amount / project.target_amount) * 100}%` }}
                ></div>
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
    </div>
  );
};

export default ProjectsPage; 