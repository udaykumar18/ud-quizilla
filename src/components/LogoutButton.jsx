// src/components/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    } else {
      // Clear localStorage to remove selectedRole or stale values
      localStorage.clear();

      toast.success("Logged out");
      navigate("/login", { replace: true });
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
