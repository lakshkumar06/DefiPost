import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { disconnect } = useWeb3();

  const handleLogout = async () => {
    await disconnect();
    await logout();
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold">
            DefiPost
          </Link>
          {isAuthenticated && (
            <Link
              to="/projects"
              className="text-white hover:text-blue-100 transition"
            >
              Projects
            </Link>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm">
                Welcome, {user?.name || user?.walletAddress?.slice(0, 6) + '...' + user?.walletAddress?.slice(-4)} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 