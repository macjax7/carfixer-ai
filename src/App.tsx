import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AIChat from './components/AIChat';
import Header from './components/Header';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import { useSubscription } from './hooks/useSubscription';
import CarIssuesDashboard from './components/dashboard/CarIssuesDashboard';

// Define a protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { isLoading, hasActiveSubscription } = useSubscription();

  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to login");
    }
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check for active subscription on specific routes
  const needsSubscription = window.location.pathname.startsWith('/pricing');
  if (needsSubscription && !hasActiveSubscription) {
    return <Navigate to="/pricing" />;
  }

  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  const { initializeAuth } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      await initializeAuth();
      setLoading(false);
    };

    initialize();
  }, [initializeAuth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={
          <ProtectedRoute>
            <PricingPage />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background">
              <Header />
              <Chat />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/chat/:chatId" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background">
              <Header />
              <Chat />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Add the dashboard route */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background">
              <Header />
              <CarIssuesDashboard />
            </div>
          </ProtectedRoute>
        } />
        
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
