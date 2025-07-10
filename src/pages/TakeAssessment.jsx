import React, { useEffect, useState } from "react";
import { useAssessment } from "../context/AssessmentContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-hot-toast";

const TakeAssessment = () => {
  const navigate = useNavigate();
  const {
    attemptId,
    assessmentData,
    currentSetIndex,
    setCurrentSetIndex,
    currentQuestionIndex,
    setCurrentQuestionIndex,
  } = useAssessment();

  const [questionData, setQuestionData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentSet = assessmentData?.set_ids[currentSetIndex];
  const questionId = currentSet?.question_ids[currentQuestionIndex];

  const isLastQuestion = () => {
    const isLastInSet =
      currentQuestionIndex === currentSet.question_ids.length - 1;
    const isLastSet = currentSetIndex === assessmentData.set_ids.length - 1;
    return isLastInSet && isLastSet;
  };

  const fetchQuestion = async (prevAnswer = null) => {
    try {
      setLoading(true);
      const payload = {
        attempt_id: attemptId,
        set_id: currentSet.set_id,
        question_id: questionId,
      };

      if (prevAnswer) {
        payload.previous = {
          attempt_id: attemptId,
          set_id: currentSet.set_id,
          question_id: prevAnswer.question_id,
          optedAnswer: prevAnswer.optedAnswer,
        };
      }

      if (isLastQuestion()) {
        payload.isLast = true;
      }

      const res = await api.questionFlow(payload);
      setQuestionData(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch question:", err);
      toast.error("Failed to load question. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (attemptId && currentSet && questionId) {
      fetchQuestion(); // First load
    }
  }, [attemptId, currentSetIndex, currentQuestionIndex]);

  const handleNext = () => {
    if (!selectedOption) {
      toast.error("Please select an option.");
      return;
    }

    const prevAnswer = {
      question_id: questionData.question_id,
      optedAnswer: selectedOption,
    };

    // Navigate to next question
    const isLastInSet =
      currentQuestionIndex === currentSet.question_ids.length - 1;

    if (!isLastInSet) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSetIndex < assessmentData.set_ids.length - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Last question: Show completion page or result
      toast.success("Assessment completed!");
      navigate("/"); // You can replace with results page
      return;
    }

    setSelectedOption(null);
    fetchQuestion(prevAnswer);
  };

  if (loading || !questionData) {
    return <div className="p-8 text-center">Loading question...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Question</h2>
      <p className="mb-4">{questionData.question}</p>
      <div className="space-y-3">
        {questionData.options.map((opt, idx) => (
          <div
            key={idx}
            className={`p-3 border rounded cursor-pointer ${
              selectedOption === opt
                ? "bg-indigo-100 border-indigo-500"
                : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedOption(opt)}
          >
            {opt}
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
      >
        {isLastQuestion() ? "Submit" : "Next"}
      </button>
    </div>
  );
};

export default TakeAssessment;
