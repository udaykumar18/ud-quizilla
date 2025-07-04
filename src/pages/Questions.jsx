import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
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
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          <p className="text-gray-600">
            Question Set: {questionSet?.name || "Loading..."}
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Question
          </button>
          <button
            onClick={() => navigate("/question-sets")}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Back to Question Sets
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Add New Question
          </h2>
          <form onSubmit={handleCreateQuestion} className="space-y-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {questionForm.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Add Question
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {questions.length === 0 ? (
          <p className="text-gray-600">No questions found in this set.</p>
        ) : (
          questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Question {index + 1}
                </h3>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="text-gray-700 mb-4">{question.question}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-2 rounded border ${
                      option === question.solution
                        ? "bg-green-100 border-green-300 text-green-800"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    {option}
                    {option === question.solution && (
                      <span className="ml-2 text-xs font-medium">
                        (Correct)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Questions;
