import React, { createContext, useContext, useState } from "react";

const AssessmentContext = createContext(null);

export const AssessmentProvider = ({ children }) => {
  const [attemptId, setAttemptId] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => useContext(AssessmentContext);
