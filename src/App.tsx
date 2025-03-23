
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { VehicleProvider } from '@/context/VehicleContext';
import HomePage from './pages/Home';
import ChatPage from '@/pages/Chat';
import LoginPage from '@/pages/Login';
import RegisterPage from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <VehicleProvider>
            <SidebarProvider defaultOpen={false}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                  path="/chat/*" 
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
              <Toaster />
            </SidebarProvider>
          </VehicleProvider>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
