import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { Link } from 'react-router-dom';
import { ProjectList } from '../components/ProjectList';

const Homepage = () => {
  const { user, isAuthenticated } = useAuth();
  const { account, isConnected } = useWeb3();

  // This component should only be rendered when the user is authenticated
  // If not authenticated, the HomepageBL component will be shown instead
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">Role:</span> {user?.role}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {user?.email || 'Not provided'}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Wallet Address:</span> {account || 'Not connected'}
            </p>
          </div>
        </div>
        
        {/* Quick Actions - Only for founders */}
        {user?.role === 'founder' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <Link
                to="/projects/create"
                className="block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center"
              >
                Create New Project
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Recent Projects Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Link
            to="/projects"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All Projects
          </Link>
        </div>
        <ProjectList showUserProjects={user?.role === 'founder'} />
      </div>
    </div>
  );
};

export default Homepage; 