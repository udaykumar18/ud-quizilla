import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../services/api";

const CreateQuestionSet = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "", // Changed back to description to match backend
    question_type: "MULTIPLE_CHOICE", // Added question_type field
    difficulty: "EASY", // Changed to uppercase to match backend
    time_limit: 30, // Changed default to 30 minutes
    default_questions_limit: 8, // Changed default to 8
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send time_limit in minutes as per backend requirement
      await api.createQuestionSet(formData);
      toast.success("Question set created successfully!");
      navigate("/question-sets");
    } catch (error) {
      console.error("Error creating question set:", error);
      toast.error("Failed to create question set");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "time_limit" || name === "default_questions_limit"
          ? parseInt(value) || 0
          : value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Question Set
          </h1>
          <p className="text-lg text-gray-600">
            Build a new question set for your assessments
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white">
              Question Set Details
            </h2>
            <p className="text-blue-100 mt-1">
              Fill in the information below to create your question set
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                Basic Information
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Question Set Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., JavaScript Fundamentals"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe what this question set covers..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Configuration Settings */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-indigo-600 font-bold text-sm">2</span>
                </div>
                Configuration Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Question Type *
                  </label>
                  <select
                    name="question_type"
                    value={formData.question_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                  >
                    <option value="MULTIPLE_CHOICE">📝 Multiple Choice</option>
                    <option value="SHORT_ANSWER">✍️ Short Answer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Difficulty Level *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                  >
                    <option value="EASY">🟢 Easy</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="HARD">🔴 Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Time Limit (minutes) *
                  </label>
                  <input
                    type="number"
                    name="time_limit"
                    value={formData.time_limit}
                    onChange={handleChange}
                    min="1"
                    max="180"
                    placeholder="30"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum 180 minutes
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Default Questions Limit *
                  </label>
                  <input
                    type="number"
                    name="default_questions_limit"
                    value={formData.default_questions_limit}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    placeholder="8"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of questions to show by default (1-50)
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Question Type:</span>
                  <p className="font-semibold text-gray-900">
                    {formData.question_type.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Difficulty:</span>
                  <p className="font-semibold text-gray-900 capitalize">
                    {formData.difficulty.toLowerCase()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Time Limit:</span>
                  <p className="font-semibold text-gray-900">
                    {formData.time_limit} min
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Questions:</span>
                  <p className="font-semibold text-gray-900">
                    {formData.default_questions_limit}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Question Set...
                  </div>
                ) : (
                  "Create Question Set"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/question-sets")}
                className="flex-1 sm:flex-none bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestionSet;
