
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { VehicleProvider } from "./context/VehicleContext";
import { DiagnosticProvider } from "./context/DiagnosticContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

import Chat from "./pages/Chat";
import Vehicles from "./pages/Vehicles";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

// Create the query client outside of the component
const queryClient = new QueryClient();

// Make sure App is a proper React function component
const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <VehicleProvider>
              <DiagnosticProvider>
                <NotificationProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      {/* Chat page is accessible without authentication */}
                      <Route path="/" element={<Chat />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<SignUp />} />
                      <Route path="/chat" element={<Navigate to="/" replace />} />
                      
                      {/* These routes still require authentication */}
                      <Route path="/vehicles" element={
                        <ProtectedRoute>
                          <Vehicles />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </NotificationProvider>
              </DiagnosticProvider>
            </VehicleProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
