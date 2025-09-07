import React, { useEffect, useState, useCallback } from "react";
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
    timeRemaining,
    setTimeRemaining,
    isTimerActive,
    setIsTimerActive,
    getCurrentSet,
    getCurrentSetTimeLimit,
    hasMoreQuestionsInCurrentSet,
    hasMoreSets,
  } = useAssessment();

  const [questionData, setQuestionData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentSet = getCurrentSet();
  const questionId = currentSet?.question_ids[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            // Time's up for this set
            handleTimeUp();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeRemaining]);

  const handleTimeUp = useCallback(() => {
    setIsTimerActive(false);
    toast.error("Time's up for this set!");
    
    // Auto-submit current answer or move to next set
    if (hasMoreSets()) {
      // Move to next set
      const nextSetIndex = currentSetIndex + 1;
      const nextSetTimeLimit = assessmentData.set_ids[nextSetIndex].time_limit * 60;
      
      setCurrentSetIndex(nextSetIndex);
      setCurrentQuestionIndex(0);
      setTimeRemaining(nextSetTimeLimit);
      setQuestionData(null);
      setSelectedOption(null);
      
      // Fetch first question of next set
      fetchFirstQuestion();
    } else {
      // End assessment
      navigate("/results");
    }
  }, [currentSetIndex, hasMoreSets, assessmentData]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!assessmentData?.set_ids) return 0;
    
    let totalQuestions = 0;
    let completedQuestions = 0;
    
    assessmentData.set_ids.forEach((set, setIdx) => {
      totalQuestions += set.question_ids.length;
      if (setIdx < currentSetIndex) {
        completedQuestions += set.question_ids.length;
      } else if (setIdx === currentSetIndex) {
        completedQuestions += currentQuestionIndex;
      }
    });
    
    return Math.round((completedQuestions / totalQuestions) * 100);
  };

  const fetchFirstQuestion = async () => {
    try {
      setLoading(true);
      const payload = {
        attempt_id: attemptId,
        set_id: currentSet.set_id,
        question_id: questionId,
        is_last_question: false,
        next: {
          attempt_id: attemptId,
          set_id: currentSet.set_id,
          question_id: questionId,
        }
      };

      console.log("📤 Fetching first question:", payload);
      const res = await api.questionFlow(payload);
      console.log("📥 Received question data:", res.data);

      setQuestionData(res.data);
      
      // Start timer for this set
      if (!isTimerActive) {
        setIsTimerActive(true);
      }
    } catch (err) {
      console.error("❌ Failed to fetch first question:", err);
      toast.error("Failed to load question. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBetweenQuestion = async (prevAnswer, nextSetIdx, nextQuestionIdx) => {
    try {
      setLoading(true);
      
      const nextSet = assessmentData.set_ids[nextSetIdx];
      const nextQuestionId = nextSet.question_ids[nextQuestionIdx];

      const payload = {
        attempt_id: attemptId,
        set_id: nextSet.set_id,
        question_id: nextQuestionId,
        is_last_question: false,
        previous: {
          attempt_id: attemptId,
          set_id: prevAnswer.set_id,
          question_id: prevAnswer.question_id,
          optedAnswer: prevAnswer.optedAnswer,
        },
        next: {
          attempt_id: attemptId,
          set_id: nextSet.set_id,
          question_id: nextQuestionId,
        }
      };

      console.log("📤 Fetching between question:", payload);
      const res = await api.questionFlow(payload);
      console.log("📥 Received question data:", res.data);

      setQuestionData(res.data);
      
      // Update timer for new set if changed
      if (nextSetIdx !== currentSetIndex) {
        const newSetTimeLimit = nextSet.time_limit * 60;
        setTimeRemaining(newSetTimeLimit);
        setIsTimerActive(true);
      }
      
    } catch (err) {
      console.error("❌ Failed to fetch between question:", err);
      toast.error("Failed to load next question. Try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitLastQuestion = async (prevAnswer) => {
    try {
      setLoading(true);
      
      const payload = {
        is_last_question: true,
        previous: {
          attempt_id: attemptId,
          set_id: prevAnswer.set_id,
          question_id: prevAnswer.question_id,
          optedAnswer: prevAnswer.optedAnswer,
        }
      };

      console.log("📤 Submitting last question:", payload);
      const res = await api.questionFlow(payload);
      console.log("✅ Assessment completed:", res);

      setIsTimerActive(false);
      toast.success("Assessment completed successfully!");
      navigate("/results");
      
    } catch (err) {
      console.error("❌ Failed to submit last question:", err);
      toast.error("Failed to submit assessment. Try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load first question when component mounts
  useEffect(() => {
    if (attemptId && currentSet && questionId && !questionData && !loading && !isSubmitting) {
      console.log("✅ Loading first question...");
      fetchFirstQuestion();
    }
  }, [attemptId, currentSetIndex, currentQuestionIndex]);

  const handleNext = async () => {
    if (!selectedOption) {
      toast.error("Please select an option.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const prevAnswer = {
      set_id: currentSet.set_id,
      question_id: questionData.question_id,
      optedAnswer: selectedOption,
    };

    try {
      const isLastQuestionInSet = !hasMoreQuestionsInCurrentSet();
      const isLastQuestionOverall = isLastQuestionInSet && !hasMoreSets();

      if (isLastQuestionOverall) {
        // Case 3: Last question in assessment
        console.log("🏁 Submitting final answer...");
        await submitLastQuestion(prevAnswer);
      } else {
        // Case 2: Between questions
        console.log("➡️ Moving to next question...");
        
        // Clear current state
        setQuestionData(null);
        setSelectedOption(null);

        // Calculate next indices
        let nextSetIndex = currentSetIndex;
        let nextQuestionIndex = currentQuestionIndex;

        if (!isLastQuestionInSet) {
          nextQuestionIndex = currentQuestionIndex + 1;
        } else {
          nextSetIndex = currentSetIndex + 1;
          nextQuestionIndex = 0;
        }

        // Fetch next question
        await fetchBetweenQuestion(prevAnswer, nextSetIndex, nextQuestionIndex);

        // Update state after successful fetch
        setCurrentSetIndex(nextSetIndex);
        setCurrentQuestionIndex(nextQuestionIndex);
      }
    } catch (error) {
      console.error("❌ Error in handleNext:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !questionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-center text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  const totalSets = assessmentData?.set_ids.length || 0;
  const totalQuestionsInSet = currentSet?.question_ids.length || 0;
  const progressPercentage = getProgressPercentage();
  
  const isLastQuestionInSet = !hasMoreQuestionsInCurrentSet();
  const isLastQuestionOverall = isLastQuestionInSet && !hasMoreSets();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress: {progressPercentage}%</span>
              <span>
                Set {currentSetIndex + 1} of {totalSets} • Question{" "}
                {currentQuestionIndex + 1} of {totalQuestionsInSet}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Assessment in Progress</span>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              timeRemaining <= 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Time Remaining: {formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Question Header */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-800">Question {currentQuestionIndex + 1}</h1>
              <div className="text-sm text-gray-500">
                Set ID: {currentSet.set_id.slice(0, 8)}...
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-8">
            <div className="mb-8">
              <p className="text-lg text-gray-800 leading-relaxed font-medium">
                {questionData.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {questionData.options.map((option, idx) => (
                <div
                  key={idx}
                  className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedOption === option
                      ? "bg-blue-50 border-blue-500 shadow-md"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedOption(option)}
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedOption === option
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300 group-hover:border-gray-400"
                    }`}>
                      {selectedOption === option && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-gray-800 font-medium ${
                      selectedOption === option ? "text-blue-900" : ""
                    }`}>
                      {option}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={isSubmitting || !selectedOption}
                className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center space-x-3 ${
                  isSubmitting || !selectedOption
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{isLastQuestionOverall ? "Submitting..." : "Loading..."}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isLastQuestionOverall ? "Submit Assessment" : "Next Question"}
                    </span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d={isLastQuestionOverall ? "M5 13l4 4L19 7" : "M9 5l7 7-7 7"} />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Set Information */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Set Information</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-600">Questions in Set</div>
              <div className="text-xl font-bold text-blue-600">{totalQuestionsInSet}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-600">Time Limit</div>
              <div className="text-xl font-bold text-green-600">{Math.ceil(timeRemaining / 60)} min</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-600">Remaining Questions</div>
              <div className="text-xl font-bold text-orange-600">
                {totalQuestionsInSet - (currentQuestionIndex + 1)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeAssessment;