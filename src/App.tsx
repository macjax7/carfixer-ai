
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VehicleProvider } from "./context/VehicleContext";
import { DiagnosticProvider } from "./context/DiagnosticContext";

import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Scan from "./pages/Scan";
import Vehicles from "./pages/Vehicles";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <VehicleProvider>
        <DiagnosticProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DiagnosticProvider>
      </VehicleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
