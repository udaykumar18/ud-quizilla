import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, HelpCircle, BookOpen, Layers } from "lucide-react";
import { toast } from "react-hot-toast";
import QuestionSetTable from "../components/QuestionSetTable";
import Loading from "../components/Loading";
import api from "../services/api";

const QuestionSets = () => {
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestionSets();
  }, []);

  const fetchQuestionSets = async () => {
    try {
      const response = await api.getQuestionSets();
      const sets = response.data?.question_sets;

      if (Array.isArray(sets)) {
        setQuestionSets(sets);
      } else {
        console.error("Invalid format:", response);
        setQuestionSets([]);
      }
    } catch (error) {
      console.error("Error fetching question sets:", error);
      toast.error("Failed to fetch question sets");
      setQuestionSets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteQuestionSet(id);
      toast.success("Question set deleted successfully");
      fetchQuestionSets();
    } catch (error) {
      console.error("Error deleting question set:", error);
      toast.error("Error deleting question set");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-slate-600 font-medium">Loading question sets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center mb-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                  Question Sets
                </h1>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Create and manage reusable question collections for your assessments
              </p>
            </div>
            <Link
              to="/create-question-set"
              className="group relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center sm:justify-start"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create Question Set
              </div>
            </Link>
          </div>
        </div>

        

        {/* Main Content */}
        {questionSets.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                No question sets found
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Start building your question library by creating your first question set. Organize questions by topic, difficulty, or any other criteria that works for you.
              </p>
              <Link
                to="/create-question-set"
                className="group relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 inline-flex items-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Question Set
                </div>
              </Link>
              
              {/* Feature highlights */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                    <Layers className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">Organize Questions</h4>
                  <p className="text-sm text-slate-600">Group related questions together for easy management and reuse.</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mb-3">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">Reusable Sets</h4>
                  <p className="text-sm text-slate-600">Use the same question sets across multiple assessments.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-slate-50 to-purple-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Your Question Sets</h2>
                  <p className="text-slate-600 mt-1">Manage and organize your question collections</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">{questionSets.length} sets</span>
                </div>
              </div>
            </div>
            <QuestionSetTable
              questionSets={questionSets}
              onDelete={handleDelete}
              onUpdated={fetchQuestionSets}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionSets;