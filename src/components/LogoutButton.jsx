// src/components/LogoutButton.jsx
import React from "react";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      localStorage.clear(); // Still needed
      await supabase.auth.signOut(); // This will trigger the onAuthStateChange in AuthContext
      toast.success("Logged out");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="group relative w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
    >
      {/* Logout Icon */}
      <svg
        className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>

      <span className="relative z-10">Logout</span>

      {/* Hover effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
    </button>
  );
};

export default LogoutButton;
