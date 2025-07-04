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
      setResult(response.data);
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

  if (loading) return <div className="p-6">Loading result...</div>;

  if (!result)
    return (
      <div className="p-6 text-red-500">
        No result found for this candidate.
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Candidate Result</h1>
      <p className="text-lg font-medium mb-2">Name: {result.name}</p>
      <p className="text-md text-gray-600 mb-4">Email: {result.email}</p>

      <div className="bg-white p-4 rounded shadow">
        <p className="font-semibold">Score: {result.score}</p>
        <p>Attempted: {result.attempted}</p>
        <p>Correct: {result.correct}</p>
        <p>Wrong: {result.wrong}</p>
        <p>Submitted At: {new Date(result.submitted_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default CandidateResult;
