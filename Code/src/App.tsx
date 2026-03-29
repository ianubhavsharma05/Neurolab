import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/layouts/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import MRIUpload from "./pages/MRIUpload";
import SpeechAnalysis from "./pages/SpeechAnalysis";
import CognitiveTests from "./pages/CognitiveTests";
import NeuralNetwork from "@/components/ui/NeuralNetwork";
import Chatbot from "@/components/ui/Chatbot";
import Results from "./pages/Results";
import Reports from "./pages/Reports";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import FloatingDock from "@/components/ui/FloatingDock";

const queryClient = new QueryClient();

const RouteScrollRestorer: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return null;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // If we are still initializing the Identity Shield, wait.
  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <FloatingDock />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/mri" element={<ProtectedRoute><MRIUpload /></ProtectedRoute>} />
      <Route path="/speech" element={<ProtectedRoute><SpeechAnalysis /></ProtectedRoute>} />
      <Route path="/cognitive" element={<ProtectedRoute><CognitiveTests /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
              <RouteScrollRestorer />
              <NeuralNetwork />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <AppRoutes />
              </div>
              <Chatbot />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
