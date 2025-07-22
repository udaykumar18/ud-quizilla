import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const statusTabs = ["ALL", "COMPLETED", "IN_PROGRESS", "PENDING", "ABANDONED"];

const AssessmentCandidates = () => {
  const { id: assessmentId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 5 });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const fetchCandidates = async (page = 1, status = selectedStatus) => {
    setLoading(true);
    try {
      const response = await api.getAssessmentCandidates(
        assessmentId,
        page,
        pagination.limit,
        status !== "ALL" ? status : undefined // Only pass if filtering
      );

      setCandidates(response.data.results || []);
      setPagination({
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
      });
    } catch (err) {
      console.error("Error fetching candidates", err);
      alert("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(1); // Reset to page 1 when status changes
  }, [assessmentId, selectedStatus]);

  const handleViewResult = (candidateId) => {
    navigate(`/candidate/${candidateId}/result/${assessmentId}`);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Candidates for Assessment</h1>

      {/* Status Tabs */}
      <div className="flex space-x-3 mb-4">
        {statusTabs.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : candidates.length === 0 ? (
        <p>No candidates found.</p>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidateWrapper) => {
            const { id, candidate_id, status, start_time } = candidateWrapper;
            const { name, email } = candidateWrapper.candidate || {};

            return (
              <div
                key={id}
                className="bg-white p-4 rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{name || candidate_id}</p>
                  <p className="text-sm text-gray-500">
                    {email || "No email provided"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Status: {status} | Started:{" "}
                    {start_time ? new Date(start_time).toLocaleString() : "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => handleViewResult(candidate_id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Result
                </button>
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => fetchCandidates(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {pagination.page} of {totalPages}
            </span>
            <button
              onClick={() => fetchCandidates(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentCandidates;
