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
    return questionSets
      .filter((set) => selectedSetIds.includes(set.id))
      .reduce((total, set) => total + set.time_limit, 0);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.set_ids.length === 0) {
      alert("Please select at least one question set");
      return;
    }

    setLoading(true);

    try {
      const submissionData = {
        ...formData,
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
  };

  const handleSelectAll = () => {
    let newSetIds;
    if (formData.set_ids.length === questionSets.length) {
      // Deselect all
      newSetIds = [];
    } else {
      // Select all
      newSetIds = questionSets.map((set) => set.id);
    }

    const newTotalTime = calculateTotalTime(newSetIds);

    setFormData({
      ...formData,
      set_ids: newSetIds,
      total_time: newTotalTime,
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "text-green-600 bg-green-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      case "HARD":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (fetchingQuestionSets) {
    return <div className="p-6">Loading question sets...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Create Assessment
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Enter assessment name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Question Sets *
              </label>
              {questionSets.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {formData.set_ids.length === questionSets.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              )}
            </div>

            {questionSets.length === 0 ? (
              <div className="border border-gray-300 rounded-lg p-4 text-center text-gray-500">
                <p>No question sets available.</p>
                <button
                  type="button"
                  onClick={() => navigate("/create-question-set")}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Create a question set first
                </button>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm text-gray-600">
                    Selected: {formData.set_ids.length} of {questionSets.length}{" "}
                    question sets
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {questionSets.map((set) => (
                    <div
                      key={set.id}
                      className="p-4 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`set-${set.id}`}
                          checked={formData.set_ids.includes(set.id)}
                          onChange={() => handleQuestionSetToggle(set.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <label
                            htmlFor={`set-${set.id}`}
                            className="text-sm font-medium text-gray-900 cursor-pointer"
                          >
                            {set.name}
                          </label>
                          <p className="text-xs text-gray-500">
                            {set.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                            set.difficulty
                          )}`}
                        >
                          {set.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          {set.question_count} questions • {set.time_limit} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Instructions (HTML)
            </label>
            <textarea
              value={formData.instruction}
              onChange={(e) =>
                setFormData({ ...formData, instruction: e.target.value })
              }
              placeholder="Enter assessment instructions in HTML format..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;,
              &lt;li&gt;, etc. Clear all content to let the backend use default
              instructions.
            </p>
          </div>

          {formData.set_ids.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Assessment Summary
              </h3>
              <div className="text-sm text-blue-700">
                <p>• {formData.set_ids.length} question sets selected</p>
                <p>• Total time: {formData.total_time} minutes</p>
                <p>
                  • Total questions:{" "}
                  {questionSets
                    .filter((set) => formData.set_ids.includes(set.id))
                    .reduce((total, set) => total + set.question_count, 0)}
                </p>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || formData.set_ids.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                  Creating...
                </>
              ) : (
                "Create Assessment"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/assessments")}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssessment;
