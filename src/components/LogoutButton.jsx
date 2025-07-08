import React from "react";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      // Clear localStorage first
      localStorage.clear();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        toast.error("Failed to logout");
      } else {
        toast.success("Logged out");
        // Don't navigate manually - let AuthContext handle the redirect
        // The PrivateRoutes component will automatically redirect to /login
        // when it detects the user is null
      }
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
