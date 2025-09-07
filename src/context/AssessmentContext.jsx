import React, { createContext, useContext, useState } from "react";

const AssessmentContext = createContext(null);

export const AssessmentProvider = ({ children }) => {
  const [attemptId, setAttemptId] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null); // For current set's time limit
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Helper function to get current set data
  const getCurrentSet = () => {
    if (!assessmentData?.set_ids || currentSetIndex >= assessmentData.set_ids.length) {
      return null;
    }
    return assessmentData.set_ids[currentSetIndex];
  };

  // Helper function to get current set's time limit
  const getCurrentSetTimeLimit = () => {
    const currentSet = getCurrentSet();
    return currentSet?.time_limit || null;
  };

  // Helper function to get current question ID
  const getCurrentQuestionId = () => {
    const currentSet = getCurrentSet();
    if (!currentSet?.question_ids || currentQuestionIndex >= currentSet.question_ids.length) {
      return null;
    }
    return currentSet.question_ids[currentQuestionIndex];
  };

  // Helper function to check if there are more questions in current set
  const hasMoreQuestionsInCurrentSet = () => {
    const currentSet = getCurrentSet();
    return currentSet?.question_ids && currentQuestionIndex < currentSet.question_ids.length - 1;
  };

  // Helper function to check if there are more sets
  const hasMoreSets = () => {
    return assessmentData?.set_ids && currentSetIndex < assessmentData.set_ids.length - 1;
  };

  return (
    <AssessmentContext.Provider
      value={{
        attemptId,
        setAttemptId,
        assessmentData,
        setAssessmentData,
        currentSetIndex,
        setCurrentSetIndex,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        timeRemaining,
        setTimeRemaining,
        isTimerActive,
        setIsTimerActive,
        // Helper functions
        getCurrentSet,
        getCurrentSetTimeLimit,
        getCurrentQuestionId,
        hasMoreQuestionsInCurrentSet,
        hasMoreSets,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => useContext(AssessmentContext);