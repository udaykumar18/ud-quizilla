import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-hot-toast";

import { useAssessment } from "../context/AssessmentContext";

const StartAssessment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, role, authReady } = useAuth();

  const {
    setAttemptId: setCtxAttemptId,
    setAssessmentData,
    setCurrentSetIndex,
    setCurrentQuestionIndex,
    setTimeRemaining,
    setIsTimerActive,
  } = useAssessment();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [assessmentPreview, setAssessmentPreview] = useState(null);

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
      console.log("StartAssessment → Storing attempt_id for redirect:", attemptId);
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

      // Store assessment data with time limits
      const assessmentData = response.data;
      setAssessmentPreview(assessmentData);

      // Store in context
      setCtxAttemptId(attemptId);
      setAssessmentData(assessmentData);
      setCurrentSetIndex(0);
      setCurrentQuestionIndex(0);
      
      // Initialize timer with first set's time limit (convert minutes to seconds)
      if (assessmentData.set_ids && assessmentData.set_ids.length > 0) {
        const firstSetTimeLimit = assessmentData.set_ids[0].time_limit * 60; // Convert to seconds
        setTimeRemaining(firstSetTimeLimit);
        setIsTimerActive(false); // Will be activated when assessment actually starts
      }

      // Clear stored attempt_id after successful start
      localStorage.removeItem("current_attempt_id");

      toast.success("Assessment started successfully!");
      navigate("/take-assessment");
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotalTime = (setIds) => {
    if (!setIds) return 0;
    return setIds.reduce((total, set) => total + set.time_limit, 0);
  };

  const calculateTotalQuestions = (setIds) => {
    if (!setIds) return 0;
    return setIds.reduce((total, set) => total + set.question_ids.length, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to Quizilla!</h1>
            <p className="text-lg text-gray-600">You're about to begin your assessment journey</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {attemptId ? (
              <>
                {/* Assessment Info Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Assessment Ready</h2>
                      <p className="text-blue-100 mt-1">You've been invited to take an assessment</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-xs text-blue-100 uppercase tracking-wide">Assessment ID</p>
                      <p className="text-white font-mono text-sm">{attemptId.slice(0, 8)}...</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {user && role === "candidate" ? (
                    <>
                      {/* Assessment Overview */}
                      {assessmentPreview && (
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Assessment Overview</h3>
                          <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-blue-600">{assessmentPreview.set_ids.length}</div>
                              <div className="text-sm text-gray-600">Question Sets</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-green-600">{calculateTotalQuestions(assessmentPreview.set_ids)}</div>
                              <div className="text-sm text-gray-600">Total Questions</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-orange-600">{calculateTotalTime(assessmentPreview.set_ids)} min</div>
                              <div className="text-sm text-gray-600">Total Time</div>
                            </div>
                          </div>

                          {/* Set Details */}
                          <div className="space-y-3">
                            {assessmentPreview.set_ids.map((set, index) => (
                              <div key={set.set_id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-800">Set {index + 1}</h4>
                                    <p className="text-sm text-gray-600">{set.question_ids.length} questions</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">{set.time_limit} min</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Instructions */}
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h4 className="text-sm font-medium text-blue-800 mb-1">Important Notes:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Each question set has a specific time limit</li>
                              <li>• Once you start, the timer cannot be paused</li>
                              <li>• Make sure you have a stable internet connection</li>
                              <li>• Read each question carefully before answering</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Start Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={handleStart}
                          disabled={loading}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                                   disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-4 rounded-xl 
                                   shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none 
                                   transition-all duration-200 flex items-center space-x-3"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Starting Assessment...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Start Assessment</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Login Required */
                    <div className="text-center">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h3>
                      <p className="text-gray-600 mb-6">Please login as a candidate to start your assessment.</p>
                      <button
                        onClick={handleLoginRedirect}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg 
                                 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 
                                 flex items-center space-x-2 mx-auto"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>Login as Candidate</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Invalid Link */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.262 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Invalid Assessment Link</h3>
                <p className="text-gray-600">The assessment link appears to be invalid or missing the attempt ID.</p>
              </div>
            )}

            {error && (
              <div className="mx-8 mb-8 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Debug Panel - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 bg-gray-100 rounded-lg p-4 text-xs">
              <details>
                <summary className="font-medium cursor-pointer">Debug Information</summary>
                <div className="mt-2 space-y-1 text-gray-700">
                  <p><strong>Full URL:</strong> {window.location.href}</p>
                  <p><strong>Search:</strong> {window.location.search}</p>
                  <p><strong>Attempt ID:</strong> {attemptId || "NOT FOUND"}</p>
                  <p><strong>User:</strong> {user ? user.email : "Not logged in"}</p>
                  <p><strong>Role:</strong> {role || "No role"}</p>
                  {assessmentPreview && (
                    <p><strong>Assessment Data:</strong> {JSON.stringify(assessmentPreview, null, 2)}</p>
                  )}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartAssessment;