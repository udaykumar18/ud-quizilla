import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Trash2, FileText, Pencil, Calendar, Users } from "lucide-react";
import api from "../services/api";
import UpdateAssessmentModal from "../components/UpdateAssessmentModal";

const Assessments = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); 

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const data = await api.getAssessments();
      setAssessments(data.data.assessments || []);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssessment = async (id) => {
    if (window.confirm("Are you sure you want to delete this assessment?")) {
      try {
        await api.deleteAssessment(id);
        fetchAssessments();
      } catch (error) {
        console.error("Error deleting assessment:", error);
        alert("Error deleting assessment");
      }
    }
  };

  const handleViewAssessment = (id) => {
    console.log("View assessment:", id);
    navigate(`/assessment/${id}/candidates`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 font-medium">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Assessments
              </h1>
              <p className="mt-2 text-slate-600">Manage and track all your assessments in one place</p>
            </div>
            <button
              onClick={() => navigate("/create-assessment")}
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center sm:justify-start"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create Assessment
              </div>
            </button>
          </div>
        </div>

        {assessments.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                No assessments yet
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Get started by creating your first assessment. Design questions, set parameters, and begin evaluating candidates.
              </p>
              <button
                onClick={() => navigate("/create-assessment")}
                className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 inline-flex items-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Assessment
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            {/* Table Header - Hidden on mobile, shown as cards instead */}
            <div className="hidden lg:block">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-4">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Assessment Name</h3>
                  </div>
                  <div className="col-span-3">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Created Date
                    </h3>
                  </div>
                  <div className="col-span-3">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Candidates
                    </h3>
                  </div>
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Actions</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
              {assessments.map((assessment, index) => (
                <div key={assessment.id} className={`px-8 py-6 hover:bg-blue-50/50 transition-colors duration-150 ${index !== assessments.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="grid grid-cols-12 gap-6 items-center">
                    <div className="col-span-4">
                      <h4 className="text-lg font-semibold text-slate-900 mb-1">{assessment.name}</h4>
                      <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center text-slate-600">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="font-medium">{new Date(assessment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {assessment.total_candidates || 0}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewAssessment(assessment.id)}
                          className="group p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 transition-all duration-200 hover:scale-110"
                          title="View Assessment"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(assessment.id)}
                          className="group p-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-600 hover:text-amber-700 transition-all duration-200 hover:scale-110"
                          title="Edit Assessment"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssessment(assessment.id)}
                          className="group p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 transition-all duration-200 hover:scale-110"
                          title="Delete Assessment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">{assessment.name}</h4>
                      <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-3"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center text-slate-600 mb-1">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500 uppercase">Created</span>
                      </div>
                      <p className="font-semibold text-slate-900">{new Date(assessment.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center text-slate-600 mb-1">
                        <Users className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500 uppercase">Candidates</span>
                      </div>
                      <p className="font-semibold text-slate-900">{assessment.total_candidates || 0}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleViewAssessment(assessment.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </button>
                    <button
                      onClick={() => setEditingId(assessment.id)}
                      className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-600 hover:text-amber-700 rounded-lg transition-colors duration-200"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAssessment(assessment.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-lg transition-colors duration-200"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {editingId && (
          <UpdateAssessmentModal
            assessmentId={editingId}
            onClose={() => setEditingId(null)}
            onUpdated={fetchAssessments}
          />
        )}
      </div>
    </div>
  );
};

export default Assessments;