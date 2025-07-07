// components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, FileText, Users, UserPlus } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const navigationItems = [
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

  return (
    <div className="w-64 bg-white shadow-md">
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
  );
};

export default Sidebar;
