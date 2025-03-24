
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Vehicles from './pages/Vehicles';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import VehicleProvider from './providers/VehicleProvider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/auth/AuthContext';

// Create a new query client with retry settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Router>
          <AuthProvider>
            <VehicleProvider>
              <Routes>
                <Route path="/" element={<Chat />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:chatId" element={<Chat />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route 
                  path="/vehicles" 
                  element={
                    <ProtectedRoute>
                      <Vehicles />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </VehicleProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
