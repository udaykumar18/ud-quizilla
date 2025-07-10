import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, BookOpen, FileText } from "lucide-react";
import StatsCard from "../components/StatsCard";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [stats, setStats] = useState({
    questionSets: null,
    assessments: null,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const { user, role, authReady } = useAuth();
  console.log("Admin Dashboard - Auth State:", { user: !!user, role, authReady });

  const fetchStats = async () => {
    try {
      const [questionSetsData, assessmentsData] = await Promise.all([
        api.getQuestionSets(),
        api.getAssessments(),
      ]);

      console.log("📊 Question Sets Response:", questionSetsData);
      console.log("📋 Assessments Response:", assessmentsData);

      setStats({
        questionSets: questionSetsData.data?.question_sets?.length || 0,
        assessments: assessmentsData.data?.assessments?.length || 0,
      });
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
    }
  };

  const statsCards = [
    {
      title: "Question Sets",
      count: stats.questionSets,
      icon: BookOpen,
      color: "bg-blue-500",
      linkTo: "/question-sets",
    },
    {
      title: "Assessments",
      count: stats.assessments,
      icon: FileText,
      color: "bg-green-500",
      linkTo: "/assessments",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Quizilla Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            count={
              card.count === null ? (
                <span className="text-sm text-gray-400">Loading...</span>
              ) : (
                card.count
              )
            }
            icon={card.icon}
            color={card.color}
            linkTo={card.linkTo}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/create-question-set"
              className="w-full flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-5 w-5 mr-3" />
              Create Question Set
            </Link>
            <Link
              to="/create-assessment"
              className="w-full flex items-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Plus className="h-5 w-5 mr-3" />
              Create Assessment
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-gray-500">
            <p>No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
