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
        status !== "ALL" ? status : undefined
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
    fetchCandidates(1);
  }, [assessmentId, selectedStatus]);

  const handleViewResult = (candidateId) => {
    navigate(`/candidate/${candidateId}/result/${assessmentId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "ABANDONED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Assessment Candidates
          </h1>
          <p className="text-gray-600">
            Manage and review candidate submissions for this assessment
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {statusTabs.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    selectedStatus === status
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-600">Loading candidates...</span>
              </div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-500">
                {selectedStatus === "ALL" 
                  ? "There are no candidates for this assessment yet." 
                  : `No candidates with ${selectedStatus.toLowerCase().replace("_", " ")} status.`
                }
              </p>
            </div>
          ) : (
            <>
              {/* Candidates List */}
              <div className="divide-y divide-gray-100">
                {candidates.map((candidateWrapper) => {
                  const { id, candidate_id, status, start_time } = candidateWrapper;
                  const { name, email } = candidateWrapper.candidate || {};

                  return (
                    <div
                      key={id}
                      className="p-6 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {name || candidate_id}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                              {status.replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>{email || "No email provided"}</span>
                            </span>
                            {start_time && (
                              <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Started {new Date(start_time).toLocaleString()}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-6">
                          <button
                            onClick={() => handleViewResult(candidate_id)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Result
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.page}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                    {pagination.total > 0 && (
                      <span className="ml-2">
                        (<span className="font-medium">{pagination.total}</span> total candidates)
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchCandidates(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchCandidates(pagination.page + 1)}
                      disabled={pagination.page === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentCandidates;