// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import QuestionSets from "./pages/QuestionSets";
import CreateQuestionSet from "./pages/CreateQuestionSet";
import Questions from "./pages/Questions";
import Assessments from "./pages/Assessments";
import CreateAssessment from "./pages/CreateAssessment";

import AssessmentCandidates from "./pages/AssessmentCandidates";
import CandidateResult from "./pages/CandidateResult";

import InviteCandidate from "./pages/InviteCandidate";

import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Router>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/question-sets" element={<QuestionSets />} />
              <Route
                path="/create-question-set"
                element={<CreateQuestionSet />}
              />
              <Route path="/questions/:setId" element={<Questions />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/create-assessment" element={<CreateAssessment />} />
              <Route
                path="/assessment/:id/candidates"
                element={<AssessmentCandidates />}
              />
              <Route
                path="/candidate/:candidateId/result/:assessmentId"
                element={<CandidateResult />}
              />
              <Route path="/invite-candidate" element={<InviteCandidate />} />
            </Routes>
          </div>
        </div>
      </Router>
      <Toaster />
    </>
  );
};

export default App;
