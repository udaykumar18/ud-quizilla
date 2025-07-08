// components/CandidateSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const UserInfo = () => {
  const { user, role } = useAuth();
  return (
    <div className="px-6 py-4 border-t text-sm text-gray-600">
      <div>{user?.user_metadata?.full_name || "User"}</div>
      <div className="text-xs text-gray-500">{role}</div>
    </div>
  );
};

const CandidateSidebar = () => {
  const location = useLocation();

  const navigationItems = [
    { path: "/start-assessment", label: "Start Assessment", icon: BookOpen },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white shadow-md flex flex-col justify-between">
      <div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Quizilla</h2>
        </div>

        <nav className="mt-6">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 ${
                isActive(item.path)
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-700"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <UserInfo />
    </div>
  );
};

export default CandidateSidebar;
