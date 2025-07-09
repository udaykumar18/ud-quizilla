import React from "react";
import { useNavigate } from "react-router-dom";
import { useAssessment } from "../context/AssessmentContext";
import { toast } from "react-hot-toast";

const Instructions = () => {
  const navigate = useNavigate();
  const { attemptId, assessmentData, currentSetIndex, currentQuestionIndex } =
    useAssessment();

  const handleStartTest = async () => {
    console.log("Starting test with:");
    console.log("✅ attemptId:", attemptId);
    console.log("✅ currentSetIndex:", currentSetIndex);
    console.log("✅ currentQuestionIndex:", currentQuestionIndex);
    console.log("✅ assessmentData:", assessmentData);

    toast.success("Test flow coming soon!");
    // For now, just navigate to a placeholder
    // Later we replace this with /question-flow call
    navigate("/take-assessment");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Instructions</h1>
      <ul className="list-disc list-inside mb-6 text-gray-700">
        <li>Each question has only one correct answer.</li>
        <li>Questions are presented one by one. You cannot go back.</li>
        <li>Your progress will be saved automatically.</li>
        <li>Do not refresh the page during the test.</li>
      </ul>

      <button
        onClick={handleStartTest}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
      >
        Start Test
      </button>
    </div>
  );
};

export default Instructions;
