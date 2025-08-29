import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CreateAssessment = () => {
  const navigate = useNavigate();

  const defaultInstructions = `<h2>Assessment Instructions</h2>
<ul>
  <li>Ensure you are in a quiet environment with a stable internet connection.</li>
  <li>Do not refresh or close the browser tab during the assessment.</li>
  <li>Each question must be answered before moving to the next.</li>
  <li>You cannot go back to previous questions once submitted.</li>
  <li>Use only the options provided — no external help is allowed.</li>
  <li>The assessment is time-bound. Complete it within the allotted duration.</li>
  <li>Your answers will be auto-submitted when time is up or upon completion.</li>
</ul>`;

  const [formData, setFormData] = useState({
    name: "",
    status: "ACTIVE",
    set_ids: [],
    total_time: 0,
    instruction: defaultInstructions,
  });

  // State to track questions per set, time limit per set, and weight per set
  const [questionsPerSet, setQuestionsPerSet] = useState({});
  const [timeLimitPerSet, setTimeLimitPerSet] = useState({});
  const [weightPerSet, setWeightPerSet] = useState({});

  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingQuestionSets, setFetchingQuestionSets] = useState(true);

  useEffect(() => {
    fetchQuestionSets();
  }, []);

  const fetchQuestionSets = async () => {
    try {
      const data = await api.getQuestionSets();
      setQuestionSets(
        Array.isArray(data?.data?.question_sets) ? data.data.question_sets : []
      );
    } catch (error) {
      console.error("Error fetching question sets:", error);
      alert("Error fetching question sets");
    } finally {
      setFetchingQuestionSets(false);
    }
  };

  const calculateTotalTime = (selectedSetIds) => {
    return selectedSetIds.reduce((total, setId) => {
      // Use custom time limit if provided, otherwise use question set's default
      const customTimeLimit = timeLimitPerSet[setId];
      if (customTimeLimit && customTimeLimit > 0) {
        return total + customTimeLimit;
      }

      const questionSet = questionSets.find((set) => set.id === setId);
      return total + (questionSet?.time_limit || 0);
    }, 0);
  };

  const getTotalWeight = () => {
    return formData.set_ids.reduce((total, setId) => {
      return total + (weightPerSet[setId] || 0);
    }, 0);
  };

  // Helper function to check if content is empty
  const isContentEmpty = (html) => {
    if (!html || html.trim() === "") return true;

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Get the text content without HTML tags
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    // Check if text content is empty (only whitespace)
    return textContent.trim() === "";
  };

  const validateWeights = () => {
    const totalWeight = getTotalWeight();
    if (totalWeight !== 100) {
      return `Total weight must equal 100%. Current total: ${totalWeight}%`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.set_ids.length === 0) {
      alert("Please select at least one question set");
      return;
    }

    // Validate weights
    const weightError = validateWeights();
    if (weightError) {
      alert(weightError);
      return;
    }

    // Validate questions per set (if provided)
    for (const setId of formData.set_ids) {
      const questionsCount = questionsPerSet[setId];
      if (questionsCount && questionsCount > 0) {
        const maxQuestions =
          questionSets.find((set) => set.id === setId)?.question_count || 0;
        if (questionsCount > maxQuestions) {
          const setName =
            questionSets.find((set) => set.id === setId)?.name || "Unknown";
          alert(
            `Number of questions for "${setName}" cannot exceed ${maxQuestions}`
          );
          return;
        }
      }
    }

    // Validate that all selected sets have weights
    for (const setId of formData.set_ids) {
      if (!weightPerSet[setId] || weightPerSet[setId] <= 0) {
        const setName =
          questionSets.find((set) => set.id === setId)?.name || "Unknown";
        alert(`Please provide a weight for "${setName}"`);
        return;
      }
    }

    setLoading(true);

    try {
      // Transform set_ids to the new format with optional questions_per_set, time_limit, and required weight
      const transformedSetIds = formData.set_ids.map((setId) => {
        const setData = { set_id: setId };

        // Only include questions_per_set if provided and > 0
        if (questionsPerSet[setId] && questionsPerSet[setId] > 0) {
          setData.questions_per_set = questionsPerSet[setId];
        }

        // Only include time_limit if provided and > 0
        if (timeLimitPerSet[setId] && timeLimitPerSet[setId] > 0) {
          setData.time_limit = timeLimitPerSet[setId];
        }

        // Include weight (required)
        setData.weight = weightPerSet[setId];

        return setData;
      });

      const submissionData = {
        ...formData,
        set_ids: transformedSetIds,
        total_time: calculateTotalTime(formData.set_ids),
      };

      // Don't send instructions if empty - let backend use default
      if (isContentEmpty(formData.instruction)) {
        delete submissionData.instruction;
      } else {
        submissionData.instruction = formData.instruction;
      }

      await api.createAssessment(submissionData);
      alert("Assessment created successfully!");
      navigate("/assessments");
    } catch (error) {
      console.error("Error creating assessment:", error);
      alert("Error creating assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSetToggle = (setId) => {
    const newSetIds = formData.set_ids.includes(setId)
      ? formData.set_ids.filter((id) => id !== setId)
      : [...formData.set_ids, setId];

    const newTotalTime = calculateTotalTime(newSetIds);

    setFormData({
      ...formData,
      set_ids: newSetIds,
      total_time: newTotalTime,
    });

    // If deselecting, remove from questionsPerSet, timeLimitPerSet, and weightPerSet
    if (!newSetIds.includes(setId)) {
      const newQuestionsPerSet = { ...questionsPerSet };
      const newTimeLimitPerSet = { ...timeLimitPerSet };
      const newWeightPerSet = { ...weightPerSet };
      delete newQuestionsPerSet[setId];
      delete newTimeLimitPerSet[setId];
      delete newWeightPerSet[setId];
      setQuestionsPerSet(newQuestionsPerSet);
      setTimeLimitPerSet(newTimeLimitPerSet);
      setWeightPerSet(newWeightPerSet);
    }
  };

  const handleQuestionsPerSetChange = (setId, value) => {
    const numValue = parseInt(value) || 0;
    setQuestionsPerSet({
      ...questionsPerSet,
      [setId]: numValue > 0 ? numValue : undefined,
    });
  };

  const handleTimeLimitPerSetChange = (setId, value) => {
    const numValue = parseInt(value) || 0;
    const newTimeLimitPerSet = {
      ...timeLimitPerSet,
      [setId]: numValue > 0 ? numValue : undefined,
    };
    setTimeLimitPerSet(newTimeLimitPerSet);

    // Update total time when individual time limits change
    const newTotalTime = calculateTotalTime(formData.set_ids);
    setFormData({
      ...formData,
      total_time: newTotalTime,
    });
  };

  const handleWeightPerSetChange = (setId, value) => {
    const numValue = parseInt(value) || 0;
    setWeightPerSet({
      ...weightPerSet,
      [setId]: numValue > 0 ? numValue : 0,
    });
  };

  const distributeWeightsEvenly = () => {
    if (formData.set_ids.length === 0) return;
    
    const evenWeight = Math.floor(100 / formData.set_ids.length);
    const remainder = 100 % formData.set_ids.length;
    
    const newWeightPerSet = {};
    formData.set_ids.forEach((setId, index) => {
      newWeightPerSet[setId] = evenWeight + (index < remainder ? 1 : 0);
    });
    
    setWeightPerSet(newWeightPerSet);
  };

  const handleSelectAll = () => {
    let newSetIds;
    let newQuestionsPerSet = {};
    let newTimeLimitPerSet = {};
    let newWeightPerSet = {};

    if (formData.set_ids.length === questionSets.length) {
      // Deselect all
      newSetIds = [];
      newQuestionsPerSet = {};
      newTimeLimitPerSet = {};
      newWeightPerSet = {};
    } else {
      // Select all
      newSetIds = questionSets.map((set) => set.id);
      // Keep existing values for questions, time limits, and weights
      questionSets.forEach((set) => {
        if (questionsPerSet[set.id]) {
          newQuestionsPerSet[set.id] = questionsPerSet[set.id];
        }
        if (timeLimitPerSet[set.id]) {
          newTimeLimitPerSet[set.id] = timeLimitPerSet[set.id];
        }
        if (weightPerSet[set.id]) {
          newWeightPerSet[set.id] = weightPerSet[set.id];
        }
      });
    }

    const newTotalTime = calculateTotalTime(newSetIds);

    setFormData({
      ...formData,
      set_ids: newSetIds,
      total_time: newTotalTime,
    });

    setQuestionsPerSet(newQuestionsPerSet);
    setTimeLimitPerSet(newTimeLimitPerSet);
    setWeightPerSet(newWeightPerSet);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "MEDIUM":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "HARD":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  const getTotalSelectedQuestions = () => {
    return formData.set_ids.reduce((total, setId) => {
      const customQuestions = questionsPerSet[setId];
      if (customQuestions && customQuestions > 0) {
        return total + customQuestions;
      }
      // Use default from question set if no custom value
      const questionSet = questionSets.find((set) => set.id === setId);
      return total + (questionSet?.question_count || 0);
    }, 0);
  };

  if (fetchingQuestionSets) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-slate-600">Loading question sets...</span>
        </div>
      </div>
    );
  }

  const totalWeight = getTotalWeight();
  const isWeightValid = totalWeight === 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Create Assessment
          </h1>
          <p className="text-slate-600">
            Design a comprehensive assessment by selecting question sets and
            configuring parameters
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <h2 className="text-xl font-semibold text-white">
              Assessment Configuration
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Assessment Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Enter a descriptive assessment name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50 focus:bg-white"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Question Sets Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Select Question Sets *
                  </label>
                  <p className="text-sm text-slate-500 mt-1">
                    Choose question sets and configure questions count, time limits, and weights
                  </p>
                </div>
                {questionSets.length > 0 && (
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={distributeWeightsEvenly}
                      disabled={formData.set_ids.length === 0}
                      className="px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Distribute Weights Evenly
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {formData.set_ids.length === questionSets.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>
                )}
              </div>

              {/* Weight Total Indicator */}
              {formData.set_ids.length > 0 && (
                <div className={`p-4 rounded-lg border-2 ${
                  isWeightValid 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      isWeightValid ? 'text-emerald-800' : 'text-red-800'
                    }`}>
                      Total Weight: {totalWeight}%
                    </span>
                    {!isWeightValid && (
                      <span className="text-xs text-red-600">
                        Must equal 100%
                      </span>
                    )}
                  </div>
                </div>
              )}

              {questionSets.length === 0 ? (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No question sets available
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Create your first question set to get started
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/create-question-set")}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Question Set
                  </button>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">
                        Selected: {formData.set_ids.length} of{" "}
                        {questionSets.length} question sets
                      </p>
                      {formData.set_ids.length > 0 && (
                        <div className="text-sm text-slate-600">
                          Total: {getTotalSelectedQuestions()} questions •{" "}
                          {formData.total_time ||
                            calculateTotalTime(formData.set_ids)}{" "}
                          minutes • {totalWeight}% weight
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    <div className="divide-y divide-slate-100">
                      {questionSets.map((set) => (
                        <div
                          key={set.id}
                          className="p-6 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-start space-x-4">
                            <input
                              type="checkbox"
                              id={`set-${set.id}`}
                              checked={formData.set_ids.includes(set.id)}
                              onChange={() => handleQuestionSetToggle(set.id)}
                              className="mt-1 h-5 w-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-offset-0"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <label
                                    htmlFor={`set-${set.id}`}
                                    className="text-lg font-semibold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                                  >
                                    {set.name}
                                  </label>
                                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                    {set.description}
                                  </p>
                                </div>

                                <div className="flex items-center space-x-3 ml-4">
                                  <span
                                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${getDifficultyColor(
                                      set.difficulty
                                    )}`}
                                  >
                                    {set.difficulty}
                                  </span>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-slate-900">
                                      {set.question_count} questions
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {set.time_limit} min default
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Custom Configuration - only show when selected */}
                              {formData.set_ids.includes(set.id) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <h4 className="text-sm font-semibold text-blue-900 mb-3">
                                    Configuration
                                  </h4>
                                  <div className="grid sm:grid-cols-3 gap-4">
                                    <div>
                                      <label className="block text-xs font-medium text-blue-800 mb-2">
                                        Number of Questions
                                      </label>
                                      <div className="relative">
                                        <input
                                          type="number"
                                          min="1"
                                          max={set.question_count}
                                          value={questionsPerSet[set.id] || ""}
                                          onChange={(e) =>
                                            handleQuestionsPerSetChange(
                                              set.id,
                                              e.target.value
                                            )
                                          }
                                          placeholder={`Default: ${set.question_count}`}
                                          className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                          <span className="text-xs text-blue-500">
                                            Max: {set.question_count}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-blue-800 mb-2">
                                        Time Limit (minutes)
                                      </label>
                                      <div className="relative">
                                        <input
                                          type="number"
                                          min="1"
                                          value={timeLimitPerSet[set.id] || ""}
                                          onChange={(e) =>
                                            handleTimeLimitPerSetChange(
                                              set.id,
                                              e.target.value
                                            )
                                          }
                                          placeholder={`Default: ${set.time_limit}`}
                                          className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                          <span className="text-xs text-blue-500">
                                            min
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-blue-800 mb-2">
                                        Weight (%) *
                                      </label>
                                      <div className="relative">
                                        <input
                                          type="number"
                                          min="1"
                                          max="100"
                                          value={weightPerSet[set.id] || ""}
                                          onChange={(e) =>
                                            handleWeightPerSetChange(
                                              set.id,
                                              e.target.value
                                            )
                                          }
                                          placeholder="Enter weight %"
                                          className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                          required
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                          <span className="text-xs text-blue-500">
                                            %
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-xs text-blue-600 mt-2">
                                    Weight is required for scoring. Questions and time limit are optional - leave empty to use defaults.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Assessment Instructions */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Assessment Instructions
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  Provide instructions for test takers. You can use HTML
                  formatting.
                </p>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <span className="font-mono bg-slate-200 px-2 py-1 rounded">
                      &lt;h2&gt;
                    </span>
                    <span className="font-mono bg-slate-200 px-2 py-1 rounded">
                      &lt;ul&gt;
                    </span>
                    <span className="font-mono bg-slate-200 px-2 py-1 rounded">
                      &lt;li&gt;
                    </span>
                    <span className="text-slate-400">HTML supported</span>
                  </div>
                </div>
                <textarea
                  value={formData.instruction}
                  onChange={(e) =>
                    setFormData({ ...formData, instruction: e.target.value })
                  }
                  placeholder="Enter assessment instructions using HTML tags..."
                  rows={10}
                  className="w-full px-4 py-4 border-0 focus:ring-0 font-mono text-sm bg-white resize-none"
                />
              </div>
              <p className="text-xs text-slate-500">
                Clear all content to use backend default instructions
              </p>
            </div>

            {/* Assessment Summary */}
            {formData.set_ids.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Assessment Summary
                </h3>

                <div className="grid sm:grid-cols-4 gap-6 mb-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {calculateTotalTime(formData.set_ids)}
                    </div>
                    <div className="text-sm text-blue-800">Total Minutes</div>
                  </div>
                  <div className={`bg-white rounded-lg p-4 border ${
                    isWeightValid ? 'border-blue-200' : 'border-red-200'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      isWeightValid ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {totalWeight}%
                    </div>
                    <div className={`text-sm ${
                      isWeightValid ? 'text-blue-800' : 'text-red-800'
                    }`}>Total Weight</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">
                    Question Set Breakdown
                  </h4>
                  <div className="space-y-2">
                    {formData.set_ids.map((setId) => {
                      const set = questionSets.find((s) => s.id === setId);
                      const customQuestions = questionsPerSet[setId];
                      const customTimeLimit = timeLimitPerSet[setId];
                      const weight = weightPerSet[setId];
                      const questionCount =
                        customQuestions || set?.question_count || 0;
                      const timeLimit = customTimeLimit || set?.time_limit || 0;

                      return (
                        <div
                          key={setId}
                          className="flex justify-between items-center py-2 border-b border-blue-100 last:border-b-0"
                        >
                          <span className="font-medium text-blue-900">
                            {set?.name}
                          </span>
                          <div className="text-sm text-blue-700 flex items-center space-x-4">
                            <span>
                              {questionCount} questions • {timeLimit} min • {weight || 0}%
                            </span>
                            {(customQuestions || customTimeLimit) && (
                              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                                Custom
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading || formData.set_ids.length === 0 || !isWeightValid}
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Assessment...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Assessment
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/assessments")}
                className="flex-1 sm:flex-none bg-slate-200 text-slate-700 px-8 py-3 rounded-xl hover:bg-slate-300 font-semibold transition-colors"
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

export default CreateAssessment;