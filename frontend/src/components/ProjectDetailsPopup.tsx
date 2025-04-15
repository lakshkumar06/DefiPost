import { useState } from 'react';
import { Project } from '../context/ProjectContext';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

interface ProjectDetailsPopupProps {
  project: Project;
  onClose: () => void;
}

export const ProjectDetailsPopup = ({ project, onClose }: ProjectDetailsPopupProps) => {
  const { user } = useAuth();
  const { investInProject, loading, error } = useProject();
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amount = parseFloat(investmentAmount);
      if (isNaN(amount) || amount <= 0) {
        return;
      }
      await investInProject(project.id, amount);
      setShowInvestmentForm(false);
      setInvestmentAmount('');
    } catch (err) {
      console.error('Error investing in project:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Funding Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Target Amount:</span>
                    <span className="font-medium">{project.target_amount} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Raised:</span>
                    <span className="font-medium">{project.raised_amount} ETH</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          (project.raised_amount / project.target_amount) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Project Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Section */}
            {user?.role === 'investor' && project.status === 'active' && (
              <div className="mt-6">
                {!showInvestmentForm ? (
                  <button
                    onClick={() => setShowInvestmentForm(true)}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Invest in this Project
                  </button>
                ) : (
                  <form onSubmit={handleInvest} className="space-y-4">
                    <div>
                      <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700">
                        Investment Amount (ETH)
                      </label>
                      <input
                        type="number"
                        id="investmentAmount"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowInvestmentForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Confirm Investment'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 