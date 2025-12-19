import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import Subjects from "./pages/Subjects";
import SubjectDetail from "./pages/SubjectDetail";
import ProfileSettings from "./pages/ProfileSettings";
import LogoPage from "./pages/LogoPage";
import QuizGame from "./pages/games/QuizGame";
import MemoryGame from "./pages/games/MemoryGame";
import DragDropGame from "./pages/games/DragDropGame";
import PuzzleGame from "./pages/games/PuzzleGame";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
              <Route path="/settings" element={<ProfileSettings />} />
              <Route path="/logo" element={<LogoPage />} />
              <Route path="/play/quiz/:topicId" element={<QuizGame />} />
              <Route path="/play/quiz/:topicId/:gameId" element={<QuizGame />} />
              <Route path="/play/memory/:topicId" element={<MemoryGame />} />
              <Route path="/play/drag_drop/:topicId" element={<DragDropGame />} />
              <Route path="/play/puzzle/:topicId" element={<PuzzleGame />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
