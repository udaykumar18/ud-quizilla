import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-hot-toast";

const StartAssessment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attemptId = searchParams.get("attempt_id");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = async () => {
    if (!attemptId) {
      console.error("❌ No attempt_id found in URL");
      setError("Missing attempt ID in URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("📤 Sending POST to /start-assessments with:", {
        attempt_id: attemptId,
      });

      const response = await api.startAssessment({ attempt_id: attemptId });

      console.log("✅ Start Assessment Response:", response);

      toast.success("Assessment started!");
      navigate(`/take-assessment?attempt_id=${attemptId}`);
    } catch (err) {
      console.error("❌ Error in startAssessment:", err);
      setError(
        "Unable to start assessment. The link may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome to Quizilla!</h1>
      {attemptId ? (
        <>
          <p className="mb-4 text-gray-700">
            You’ve been invited to take an assessment. Click below when you’re
            ready to begin.
          </p>

          <button
            onClick={handleStart}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Starting..." : "Start Assessment"}
          </button>
        </>
      ) : (
        <p className="text-red-600 font-medium">
          Invalid or missing attempt ID in URL.
        </p>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default StartAssessment;
