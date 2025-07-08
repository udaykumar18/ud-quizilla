import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Clear localStorage first
      localStorage.clear();

      await supabase.auth.signOut();

      toast.success("Logged out");

      // Add a small delay to ensure auth state change is processed
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 100);
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
