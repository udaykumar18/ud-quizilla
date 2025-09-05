import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, HelpCircle, Check } from "lucide-react";
import api from "../services/api";

const Questions = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [questionSet, setQuestionSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    question: "",
    options: ["", "", "", ""],
    solution: "",
  });

  useEffect(() => {
    if (setId) {
      fetchQuestionSet();
    }
  }, [setId]);

  const fetchQuestionSet = async () => {
    try {
      const res = await api.getQuestionSet(setId);
      console.log("GET /question-set/:id response:", res);
      setQuestionSet(res.data);
      setQuestions(res.data?.questions || []);
    } catch (error) {
      console.error("Error fetching question set:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.createQuestion({
        set_id: setId,
        ...questionForm,
      });
      alert("Question created successfully!");
      setShowCreateForm(false);
      setQuestionForm({
        question: "",
        options: ["", "", "", ""],
        solution: "",
      });
      fetchQuestionSet();
    } catch (error) {
      console.error("Error creating question:", error);
      alert("Error creating question");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await api.deleteQuestion(id);
        fetchQuestionSet();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({
      ...questionForm,
      options: newOptions,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/question-sets")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Question Sets
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Questions</h1>
              <p className="text-gray-600 flex items-center">
                <HelpCircle className="h-4 w-4 mr-2" />
                {questionSet?.name || "Loading..."}
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Question</h2>
            
            <form onSubmit={handleCreateQuestion} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, question: e.target.value })
                  }
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your question here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Answer Options
                </label>
                <div className="space-y-3">
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="relative">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer
                </label>
                <input
                  type="text"
                  value={questionForm.solution}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, solution: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter the correct answer exactly as written in options"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Add Question
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {questions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
              <p className="text-gray-600 mb-6">Start building your question set by adding your first question.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Question
              </button>
            </div>
          ) : (
            questions.map((question, index) => (
              <div
                key={question.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mr-3">
                      Q{index + 1}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Delete question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-gray-900 font-medium mb-6 leading-relaxed">
                  {question.question}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`relative p-4 rounded-lg border transition-all ${
                        option === question.solution
                          ? "bg-green-50 border-green-200 text-green-900"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold mr-3 ${
                          option === question.solution
                            ? "bg-green-200 text-green-800"
                            : "bg-gray-200 text-gray-600"
                        }`}>
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {option === question.solution && (
                          <Check className="h-4 w-4 text-green-600 ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Questions;