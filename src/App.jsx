import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import CandidateSidebar from "./components/CandidateSidebar";
import Dashboard from "./pages/Dashboard";
import QuestionSets from "./pages/QuestionSets";
import CreateQuestionSet from "./pages/CreateQuestionSet";
import Questions from "./pages/Questions";
import Assessments from "./pages/Assessments";
import CreateAssessment from "./pages/CreateAssessment";
import AssessmentCandidates from "./pages/AssessmentCandidates";
import CandidateResult from "./pages/CandidateResult";
import InviteCandidate from "./pages/InviteCandidate";
import StartAssessment from "./pages/StartAssessment";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";

import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const AppLayout = ({ children }) => {
  const { role } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {role === "admin" && <Sidebar />}
      {role === "candidate" && <CandidateSidebar />}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

const PrivateRoutes = () => {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["admin"]} element={<Dashboard />} />
          }
        />
        <Route
          path="/question-sets"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
              element={<QuestionSets />}
            />
          }
        />
        <Route
          path="/create-question-set"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
              element={<CreateQuestionSet />}
            />
          }
        />
        <Route
          path="/questions/:setId"
          element={
            <ProtectedRoute allowedRoles={["admin"]} element={<Questions />} />
          }
        />
        <Route
          path="/assessments"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
              element={<Assessments />}
            />
          }
        />
        <Route
          path="/create-assessment"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
              element={<CreateAssessment />}
            />
          }
        />
        <Route
          path="/assessment/:id/candidates"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
              element={<AssessmentCandidates />}
            />
          }
        />
        <Route
          path="/candidate/:candidateId/result/:assessmentId"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
              element={<CandidateResult />}
            />
          }
        />
        <Route
          path="/invite-candidate"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
              element={<InviteCandidate />}
            />
          }
        />
        <Route
          path="/start-assessment"
          element={
            <ProtectedRoute
              allowedRoles={["candidate"]}
              element={<StartAssessment />}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/*" element={<PrivateRoutes />} />
        </Routes>
      </AuthProvider>
      <Toaster />
    </Router>
  );
};

export default App;
