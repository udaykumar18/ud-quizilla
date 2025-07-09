import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-hot-toast";

const StartAssessment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, role, authReady } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);

  // Store attempt_id when component mounts
  useEffect(() => {
    const urlAttemptId = searchParams.get("attempt_id");
    const storedAttemptId = localStorage.getItem("current_attempt_id");

    console.log("StartAssessment → URL attempt_id:", urlAttemptId);
    console.log("StartAssessment → Stored attempt_id:", storedAttemptId);

    if (urlAttemptId) {
      // Store the attempt_id from URL
      localStorage.setItem("current_attempt_id", urlAttemptId);
      setAttemptId(urlAttemptId);
      console.log("StartAssessment → Stored attempt_id:", urlAttemptId);
    } else if (storedAttemptId) {
      // Use stored attempt_id
      setAttemptId(storedAttemptId);
      console.log(
        "StartAssessment → Using stored attempt_id:",
        storedAttemptId
      );
    }
  }, [searchParams]);

  const handleLoginRedirect = () => {
    // Store current attempt_id before redirecting to login
    if (attemptId) {
      localStorage.setItem("current_attempt_id", attemptId);
      localStorage.setItem("redirectAfterLogin", "/start-assessment");
    }
    navigate("/login");
  };

  const handleStart = async () => {
    if (!attemptId) {
      console.error("❌ No attempt_id found");
      setError("Missing attempt ID");
      return;
    }

    if (!user || role !== "candidate") {
      console.error("❌ User not logged in as candidate");
      setError("Please login as a candidate first");
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

      // Clear stored attempt_id after successful start
      localStorage.removeItem("current_attempt_id");

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

  if (!authReady) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome to Quizilla!</h1>

      {/* Debug info - remove in production */}
      <div className="mb-4 p-4 bg-gray-100 rounded text-sm">
        <p>
          <strong>Debug Info:</strong>
        </p>
        <p>Full URL: {window.location.href}</p>
        <p>Search: {window.location.search}</p>
        <p>Attempt ID: {attemptId || "NOT FOUND"}</p>
        <p>User: {user ? user.email : "Not logged in"}</p>
        <p>Role: {role || "No role"}</p>
      </div>

      {attemptId ? (
        <>
          <p className="mb-4 text-gray-700">
            You've been invited to take an assessment.
          </p>
          <p className="mb-4 text-sm text-gray-500">
            Assessment ID: {attemptId}
          </p>

          {user && role === "candidate" ? (
            // User is logged in as candidate - show start button
            <button
              onClick={handleStart}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Starting..." : "Start Assessment"}
            </button>
          ) : (
            // User not logged in or wrong role - show login button
            <div>
              <p className="mb-4 text-amber-600 font-medium">
                Please login as a candidate to start your assessment.
              </p>
              <button
                onClick={handleLoginRedirect}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Login as Candidate
              </button>
            </div>
          )}
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
