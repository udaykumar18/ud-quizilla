import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
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
    return <Loading message="Loading question sets..." />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Question Sets</h1>
        <Link
          to="/create-question-set"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Question Set
        </Link>
      </div>

      {questionSets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">No question sets found</p>
          <Link
            to="/create-question-set"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Question Set
          </Link>
        </div>
      ) : (
        <QuestionSetTable
          questionSets={questionSets}
          onDelete={handleDelete}
          onUpdated={fetchQuestionSets}
        />
      )}
    </div>
  );
};

export default QuestionSets;
