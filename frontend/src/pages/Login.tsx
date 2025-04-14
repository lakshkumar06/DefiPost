import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { connect, account, isConnected } = useWeb3();
  const { loginWithWallet, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (isAuthenticated) {
        navigate('/dashboard');
        return;
      }

      if (isConnected && account && !isAuthenticated) {
        try {
          await loginWithWallet(account);
          navigate('/dashboard');
        } catch (err: any) {
          console.error('Auto-login error:', err);
          // Check if the error is due to wallet not being registered
          if (err.response?.status === 401 && err.response?.data?.message === 'Wallet not registered') {
            setIsRedirecting(true);
            setError('This wallet is not registered. Redirecting to signup...');
            setTimeout(() => {
              navigate('/signup');
            }, 2000);
          }
        }
      }
    };

    checkAuthAndRedirect();
  }, [isAuthenticated, isConnected, account, navigate, loginWithWallet]);

  const handleLogin = async () => {
    try {
      if (!isConnected) {
        await connect();
      }
      
      if (account) {
        await loginWithWallet(account);
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Check if the error is due to wallet not being registered
      if (err.response?.status === 401 && err.response?.data?.message === 'Wallet not registered') {
        setIsRedirecting(true);
        setError('This wallet is not registered. Redirecting to signup...');
        setTimeout(() => {
          navigate('/signup');
        }, 2000);
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect your Universal Profile to continue
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <button
              onClick={handleLogin}
              disabled={isRedirecting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isConnected ? 'Continue with Universal Profile' : 'Connect Universal Profile'}
            </button>
          </div>
          {error && (
            <div className={`text-center text-sm ${isRedirecting ? 'text-blue-500' : 'text-red-500'}`}>
              {error}
            </div>
          )}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
