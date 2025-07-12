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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentSet = assessmentData?.set_ids[currentSetIndex];
  const questionId = currentSet?.question_ids[currentQuestionIndex];

  const isLastInSet =
    currentQuestionIndex === currentSet?.question_ids.length - 1;
  const isLastSet = currentSetIndex === assessmentData?.set_ids.length - 1;
  const isLast = isLastInSet && isLastSet;

  const fetchQuestion = async (prevAnswer = null, isFinal = false) => {
    try {
      setLoading(true);

      let payload;

      if (isFinal) {
        // Final submission payload
        payload = {
          previous: {
            attempt_id: attemptId,
            set_id: prevAnswer.set_id,
            question_id: prevAnswer.question_id,
            optedAnswer: prevAnswer.optedAnswer,
          },
          is_last_question: true,
        };
      } else {
        // Normal flow
        payload = {
          attempt_id: attemptId,
          set_id: currentSet.set_id,
          question_id: questionId,
          is_last_question: false,
        };

        if (prevAnswer) {
          payload.previous = {
            attempt_id: attemptId,
            set_id: prevAnswer.set_id,
            question_id: prevAnswer.question_id,
            optedAnswer: prevAnswer.optedAnswer,
          };
        }
      }

      console.log("📤 Sending request:", payload);
      const res = await api.questionFlow(payload);
      console.log("📥 Full API response:", res);

      if (isFinal) {
        console.log("✅ Assessment completed successfully!");
        toast.success("Assessment completed!");
        navigate("/results"); // Redirect to results page
      } else {
        console.log("📥 Received question data:", res.data);
        setQuestionData(res.data);
      }
    } catch (err) {
      console.error("❌ Failed to fetch question:", err);
      toast.error("Failed to load question. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load first question only once when component mounts
  useEffect(() => {
    console.log("🔄 useEffect triggered with:", {
      attemptId,
      currentSetIndex,
      currentQuestionIndex,
      hasQuestionData: !!questionData,
      currentSet: currentSet?.set_id,
      questionId,
    });

    if (attemptId && currentSet && questionId && !questionData) {
      console.log("✅ Conditions met, fetching question...");
      fetchQuestion();
    } else {
      console.log("❌ Conditions not met, skipping fetch");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, currentSetIndex, currentQuestionIndex]);

  const handleNext = async () => {
    if (!selectedOption) {
      toast.error("Please select an option.");
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    console.log("🔄 Starting handleNext...");
    console.log("Current state:", {
      currentSetIndex,
      currentQuestionIndex,
      selectedOption,
      isLast,
      isLastInSet,
      isLastSet,
    });

    setIsSubmitting(true);

    const prevAnswer = {
      set_id: currentSet.set_id,
      question_id: questionData.question_id,
      optedAnswer: selectedOption,
    };

    console.log("📝 Previous answer to submit:", prevAnswer);

    try {
      if (isLast) {
        console.log("🏁 This is the last question, submitting final answer...");
        // Final submission
        await fetchQuestion(prevAnswer, true);
      } else {
        console.log("➡️ Moving to next question...");
        // Move to next question first
        if (!isLastInSet) {
          console.log("📍 Moving to next question in same set");
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else if (!isLastSet) {
          console.log("📍 Moving to next set");
          setCurrentSetIndex(currentSetIndex + 1);
          setCurrentQuestionIndex(0);
        }

        // Clear current question data and selected option
        console.log("🧹 Clearing current question data...");
        setQuestionData(null);
        setSelectedOption(null);

        // Fetch next question
        console.log("🔄 Fetching next question...");
        await fetchQuestion(prevAnswer);
      }
    } catch (error) {
      console.error("❌ Error in handleNext:", error);
    } finally {
      setIsSubmitting(false);
      console.log("✅ handleNext completed");
    }
  };

  if (loading || !questionData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  const totalSets = assessmentData?.set_ids.length || 0;
  const totalQuestionsInSet = currentSet?.question_ids.length || 0;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            <span className="font-medium">Set:</span> {currentSetIndex + 1}/
            {totalSets}
          </div>
          <div>
            <span className="font-medium">Question:</span>{" "}
            {currentQuestionIndex + 1}/{totalQuestionsInSet}
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Set ID: {currentSet.set_id}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Question</h2>
        <p className="text-gray-800 leading-relaxed">{questionData.question}</p>
      </div>

      <div className="space-y-3 mb-6">
        {questionData.options.map((opt, idx) => (
          <div
            key={idx}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedOption === opt
                ? "bg-indigo-100 border-indigo-500 shadow-sm"
                : "hover:bg-gray-50 border-gray-200"
            }`}
            onClick={() => setSelectedOption(opt)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="question-option"
                checked={selectedOption === opt}
                onChange={() => setSelectedOption(opt)}
                className="mr-3"
              />
              <span className="text-gray-800">{opt}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={isSubmitting}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {isLast ? "Submitting..." : "Loading..."}
          </div>
        ) : isLast ? (
          "Submit Assessment"
        ) : (
          "Next Question"
        )}
      </button>
    </div>
  );
};

export default TakeAssessment;
