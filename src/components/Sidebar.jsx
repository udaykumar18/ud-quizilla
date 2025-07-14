import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, FileText, Users, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

const UserInfo = () => {
  const { user, role } = useAuth();
  return (
    <div className="px-6 pt-4 pb-2 text-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {(user?.user_metadata?.full_name || "User").charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-gray-800 font-medium">
            {user?.user_metadata?.full_name || "User"}
          </div>
          <div className="text-xs text-gray-500 capitalize bg-blue-50 px-2 py-1 rounded-full inline-block">
            {role}
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { role } = useAuth();

  const adminNavigation = [
    { path: "/", label: "Dashboard", icon: BookOpen },
    { path: "/question-sets", label: "Question Sets", icon: FileText },
    { path: "/assessments", label: "Assessments", icon: Users },
    { path: "/invite-candidate", label: "Invite Candidate", icon: UserPlus },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  if (role !== "admin") return null;

  return (
    <div className="w-64 bg-gradient-to-b from-gray-50 to-white shadow-xl h-screen flex flex-col justify-between relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Quizilla
            </h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {adminNavigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative w-full flex items-center px-4 py-3 mb-1 text-left rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-[1.02]"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:transform hover:scale-[1.01]"
              }`}
            >
              {/* Active indicator */}
              {isActive(item.path) && (
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-full"></div>
              )}

              <item.icon
                className={`h-5 w-5 mr-3 transition-all duration-200 ${
                  isActive(item.path)
                    ? "text-white"
                    : "text-gray-500 group-hover:text-gray-700"
                }`}
              />

              <span
                className={`font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? "text-white"
                    : "text-gray-700 group-hover:text-gray-900"
                }`}
              >
                {item.label}
              </span>

              {/* Hover effect */}
              {!isActive(item.path) && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="relative z-10 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
        <UserInfo />
        <div className="px-6 pb-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
