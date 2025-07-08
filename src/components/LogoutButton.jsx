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
      className="text-red-600 hover:underline px-4 py-2 w-full text-left"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
