// services/api.js

const API_BASE = "https://3rifcujaxl.execute-api.us-east-1.amazonaws.com/dev"; //Self Stack
// const API_BASE = "https://xv87726mp0.execute-api.ap-south-1.amazonaws.com/dev";

const api = {
  // Question Sets
  createQuestionSet: async (data) => {
    const response = await fetch(`${API_BASE}/question-set`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getQuestionSets: async () => {
    const response = await fetch(`${API_BASE}/question-sets`);
    return response.json();
  },

  getQuestionSet: async (id) => {
    const response = await fetch(`${API_BASE}/question-set/${id}`);
    return response.json();
  },

  deleteQuestionSet: async (id) => {
    const response = await fetch(`${API_BASE}/question-set/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  updateQuestionSet: async (id, data) => {
    console.log("[API] PUT /question-set", id, data);
    const response = await fetch(`${API_BASE}/question-set/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) {
      console.error("Update failed:", json);
      throw new Error(json?.error || "Update failed");
    }

    return json;
  },

  // Questions
  createQuestion: async (data) => {
    const response = await fetch(`${API_BASE}/question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // removed it in backend
  // getQuestions: async (setId) => {
  //   const response = await fetch(`${API_BASE}/questions?set_id=${setId}`);
  //   return response.json();
  // },

  deleteQuestion: async (id) => {
    const response = await fetch(`${API_BASE}/question/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Assessments
  createAssessment: async (data) => {
    const response = await fetch(`${API_BASE}/assessment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getAssessmentById: async (id) => {
    const response = await fetch(`${API_BASE}/assessment/${id}`);
    return response.json();
  },

  updateAssessment: async (id, data) => {
    const response = await fetch(`${API_BASE}/assessment/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) {
      console.error("Update failed:", json);
      throw new Error(json?.error || "Update failed");
    }
    return json;
  },

  getAssessments: async () => {
    const response = await fetch(`${API_BASE}/assessments`);
    return response.json();
  },

  getAssessmentCandidates: async (
    assessmentId,
    page = 1,
    limit = 5,
    status
  ) => {
    let url = `${API_BASE}/assessment-candidates?assessment_id=${assessmentId}&page=${page}&limit=${limit}`;
    if (status && status !== "ALL") {
      url += `&status=${status}`;
    }
    const res = await fetch(url);
    return await res.json();
  },

  getCandidateResult: async (candidateId, assessmentId) => {
    const res = await fetch(
      `${API_BASE}/candidate-result?candidate_id=${candidateId}&assessment_id=${assessmentId}`
    );
    return await res.json();
  },

  inviteCandidate: async (data) => {
    const response = await fetch(`${API_BASE}/invite-candidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) {
      console.error("Invite failed:", json);
      throw new Error(json?.error || "Invite failed");
    }

    return json;
  },
  startAssessment: async (payload) => {
    console.log("[API] POST /start-assessments", payload);

    const response = await fetch(`${API_BASE}/start-assessment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    console.log("[API Response]", response.status, json);

    if (!response.ok) {
      throw new Error(json?.error || "Failed to start assessment");
    }

    return json;
  },

  questionFlow: async (body) => {
    const response = await fetch(`${API_BASE}/question-flow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch next question");
    }

    return await response.json();
  },
};

export default api;
