import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

const Homepage = () => {
  const { user, isAuthenticated } = useAuth();
  const { account, isConnected } = useWeb3();

  // This component should only be rendered when the user is authenticated
  // If not authenticated, the HomepageBL component will be shown instead
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            {user?.role === 'founder' && (
              <a
                href="/projects"
                className="block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center"
              >
                Create New Project
              </a>
            )}
            {user?.role === 'investor' && (
              <a
                href="/projects"
                className="block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center"
              >
                Browse Projects to Invest
              </a>
            )}
            {user?.role === 'collaborator' && (
              <a
                href="/projects"
                className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center"
              >
                Find Projects to Collaborate
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage; 