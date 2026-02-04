import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Settings from './pages/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const { token, initAuth } = useAuthStore();
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    initAuth();
    setAuthInitialized(true);
  }, []);

  // Show loading state until auth is initialized
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-xl font-bold text-cyan-500">INITIALIZING APP...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={token ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/settings"
            element={token ? <Settings /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

