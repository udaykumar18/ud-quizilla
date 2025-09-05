import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../services/api";

const CreateQuestionSet = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    question_type: "MULTIPLE_CHOICE",
    difficulty: "EASY",
    time_limit: 30,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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
      [name]: name === "time_limit" ? parseInt(value) || 0 : value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <span className="text-3xl">📝</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
            Create Question Set
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Build a new question set for your assessments with our modern interface
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-2">
                Question Set Configuration
              </h2>
              <p className="text-blue-100 text-lg">
                Fill in the information below to create your question set
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            {/* Basic Information */}
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Basic Information</h3>
                  <p className="text-gray-600">Set up the fundamental details</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
                    Question Set Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., JavaScript Fundamentals"
                      className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-400 group-hover:border-gray-300 shadow-sm hover:shadow-md"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe what this question set covers..."
                      className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-400 resize-none group-hover:border-gray-300 shadow-sm hover:shadow-md"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration Settings */}
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Configuration Settings</h3>
                  <p className="text-gray-600">Set question type, difficulty, and timing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Question Type */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
                    Question Type *
                  </label>
                  <div className="space-y-3">
                    <label className={`relative flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] ${
                      formData.question_type === "MULTIPLE_CHOICE"
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="question_type"
                        value="MULTIPLE_CHOICE"
                        checked={formData.question_type === "MULTIPLE_CHOICE"}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-start space-x-4 flex-1">
                        <span className="text-3xl">📝</span>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">Multiple Choice</div>
                          <div className="text-sm text-gray-600">Select from options</div>
                        </div>
                      </div>
                      {formData.question_type === "MULTIPLE_CHOICE" && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>

                    <label className={`relative flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] ${
                      formData.question_type === "SHORT_ANSWER"
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="question_type"
                        value="SHORT_ANSWER"
                        checked={formData.question_type === "SHORT_ANSWER"}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-start space-x-4 flex-1">
                        <span className="text-3xl">✍️</span>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">Short Answer</div>
                          <div className="text-sm text-gray-600">Written responses</div>
                        </div>
                      </div>
                      {formData.question_type === "SHORT_ANSWER" && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Difficulty Level */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
                    Difficulty Level *
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: "EASY", label: "Easy", icon: "🟢", color: "text-green-600", bg: "bg-green-50 border-green-200" },
                      { value: "MEDIUM", label: "Medium", icon: "🟡", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
                      { value: "HARD", label: "Hard", icon: "🔴", color: "text-red-600", bg: "bg-red-50 border-red-200" }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] ${
                          formData.difficulty === option.value
                            ? `${option.bg} border-current ${option.color} shadow-lg`
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="difficulty"
                          value={option.value}
                          checked={formData.difficulty === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-4 flex-1">
                          <span className="text-3xl">{option.icon}</span>
                          <span className="font-bold text-gray-900 text-lg">{option.label}</span>
                        </div>
                        {formData.difficulty === option.value && (
                          <div className="w-6 h-6 bg-current rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Time Limit */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
                    Time Limit (minutes) *
                  </label>
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-gray-300 transition-colors hover:shadow-md">
                    <div className="text-center mb-4">
                      <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        {formData.time_limit}
                      </div>
                      <div className="text-gray-600 font-semibold">minutes</div>
                    </div>
                    <input
                      type="number"
                      name="time_limit"
                      value={formData.time_limit}
                      onChange={handleChange}
                      min="1"
                      max="180"
                      placeholder="30"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 text-center font-semibold text-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center font-medium">
                      Maximum 180 minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-2xl p-8 border-2 border-gray-100 shadow-inner">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Question Type</span>
                  <p className="font-bold text-gray-900 text-lg mt-2">
                    {formData.question_type.replace("_", " ")}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Difficulty</span>
                  <p className="font-bold text-gray-900 text-lg mt-2 capitalize">
                    {formData.difficulty.toLowerCase()}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Time Limit</span>
                  <p className="font-bold text-gray-900 text-lg mt-2">
                    {formData.time_limit} min
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 pt-8 border-t-2 border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Creating Question Set...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create Question Set
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/question-sets")}
                className="sm:w-auto bg-white text-gray-700 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Cancel
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestionSet;