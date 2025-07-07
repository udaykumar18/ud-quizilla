import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../services/api";

const InviteCandidate = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    assessment_id: "",
  });
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await api.getAssessments(); // res = full response
        console.log("📋 Invite Page Assessments Response:", res);
        setAssessments(res.data.assessments || []);
      } catch (err) {
        console.error("Failed to fetch assessments", err);
      }
    };

    fetchAssessments();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, assessment_id } = formData;

    if (!name || !email || !assessment_id) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await api.inviteCandidate(formData);
      toast.success("Candidate invited successfully");
      setFormData({ name: "", email: "", assessment_id: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to invite candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-opacity-95 border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              Invite Candidate
            </h2>
            <p className="text-indigo-100 text-sm">
              Send an assessment invitation to a candidate
            </p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  Candidate Name
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Enter candidate's full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="candidate@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  Assessment
                </label>
                <select
                  name="assessment_id"
                  value={formData.assessment_id}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none bg-white appearance-none cursor-pointer"
                >
                  <option value="" className="text-gray-500">
                    Select an assessment
                  </option>
                  {assessments.map((a) => (
                    <option key={a.id} value={a.id} className="text-gray-900">
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Sending Invitation...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Send Invitation
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            The candidate will receive an email with assessment instructions
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteCandidate;
