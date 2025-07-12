import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const CandidateResult = () => {
  const { candidateId, assessmentId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchResult = async () => {
    try {
      const response = await api.getCandidateResult(candidateId, assessmentId);
      console.log("candidate Result:", response);
      setResult(response.data.result);
    } catch (err) {
      console.error("Error fetching result", err);
      alert("Failed to fetch result");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [candidateId, assessmentId]);

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "NOT_STARTED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading result...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Result Not Found
          </h2>
          <p className="text-red-600">No result found for this candidate.</p>
        </div>
      </div>
    );
  }

  const totalQuestions = result.score.reduce((total, set) => {
    return total + Object.keys(set.answers).length;
  }, 0);

  const totalDuration = calculateDuration(result.start_time, result.end_time);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Assessment Result
            </h1>
            <p className="text-lg font-medium text-gray-700">{result.name}</p>
            <p className="text-gray-600">{result.email}</p>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                result.status
              )}`}
            >
              {result.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              Overall Score
            </h3>
            <p className="text-2xl font-bold text-blue-900">
              {result.overall_score}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-1">
              Total Questions
            </h3>
            <p className="text-2xl font-bold text-green-900">
              {totalQuestions}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800 mb-1">
              Duration
            </h3>
            <p className="text-2xl font-bold text-purple-900">
              {totalDuration}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Assessment Timeline</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Started:</span>
            <span className="font-medium">
              {formatDateTime(result.start_time)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Completed:</span>
            <span className="font-medium">
              {formatDateTime(result.end_time)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Duration:</span>
            <span className="font-medium">{totalDuration}</span>
          </div>
        </div>
      </div>

      {/* Set-wise Results */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Set-wise Performance</h2>

        {result.score.map((setResult, index) => {
          const setDuration = calculateDuration(
            setResult.start_time,
            setResult.end_time
          );
          const questionsInSet = Object.keys(setResult.answers).length;

          return (
            <div
              key={setResult.set_id}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Set {index + 1}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Set ID: {setResult.set_id}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                    Score: {setResult.score}
                  </div>
                  <p className="text-sm text-gray-600">
                    {questionsInSet} questions
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{setDuration}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Questions Answered</p>
                  <p className="font-medium">{questionsInSet}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Answers Given
                </h4>
                <div className="space-y-2">
                  {Object.entries(setResult.answers).map(
                    ([questionId, answer], qIndex) => (
                      <div
                        key={questionId}
                        className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-3">
                            Q{qIndex + 1}
                          </span>
                          <span className="text-sm text-gray-600 font-mono">
                            {questionId}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 bg-white px-3 py-1 rounded border">
                          {answer}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-600 mt-4">
                <span>Started: {formatDateTime(setResult.start_time)}</span>
                <span>Completed: {formatDateTime(setResult.end_time)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          Assessment Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-900">
              {result.overall_score}
            </p>
            <p className="text-sm text-blue-700">Overall Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-900">
              {result.score.length}
            </p>
            <p className="text-sm text-blue-700">Sets Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-900">{totalQuestions}</p>
            <p className="text-sm text-blue-700">Total Questions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-900">{totalDuration}</p>
            <p className="text-sm text-blue-700">Time Taken</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateResult;
