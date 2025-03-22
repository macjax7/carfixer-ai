
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
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
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
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <Navigate to="/" replace />
                    </ProtectedRoute>
                  } />
                  <Route path="/vehicles" element={
                    <ProtectedRoute>
                      <Vehicles />
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
);

export default App;
