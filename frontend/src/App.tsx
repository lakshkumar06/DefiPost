import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './context/AppProviders';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Homepage from './pages/HomePage';
import HomepageBL from './pages/HomepageBL';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateProject from './pages/CreateProject';
import { useAuth } from './context/AuthContext';

// Wrapper component to conditionally render Homepage or HomepageBL
const HomeWrapper = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <Homepage /> : <HomepageBL />;
};

function App() {
  return (
    <Router>
      <AppProviders>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomeWrapper />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Homepage />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/create"
              element={
                <PrivateRoute>
                  <CreateProject />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AppProviders>
    </Router>
  );
}

export default App;
