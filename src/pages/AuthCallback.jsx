import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { refreshUserRole } = useAuth(); // Add this line

  useEffect(() => {
    const handleAuth = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("AuthCallback → Auth error:", authError);
        toast.error("Authentication failed");
        return navigate("/login");
      }

      const selectedRole = localStorage.getItem("selectedRole");
      if (!selectedRole) {
        toast.error("No role selected. Please login again.");
        return navigate("/login");
      }

      if (selectedRole === "admin" && !user.email.endsWith("@antstack.io")) {
        toast.error("Only @antstack.io emails can be admins");
        await supabase.auth.signOut();
        return navigate("/login");
      }

      // Check or insert user in DB
      const { data: existingUser, error: fetchError } = await supabase
        .schema("quizilla")
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("AuthCallback → Error checking user:", fetchError);
        toast.error("Internal error. Try again later.");
        return navigate("/login");
      }

      if (!existingUser) {
        const { error: insertError } = await supabase
          .schema("quizilla")
          .from("users")
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
            role: selectedRole,
          });

        if (insertError) {
          console.error("AuthCallback → Insert error:", insertError);
          toast.error("Error saving user info");
          return navigate("/login");
        }

        // Add this: Refresh the role in AuthContext after inserting new user
        await refreshUserRole();
      }

      localStorage.removeItem("selectedRole");

      navigate(selectedRole === "admin" ? "/" : "/start-assessment");
    };

    handleAuth();
  }, [navigate, refreshUserRole]); // Add refreshUserRole to dependencies

  return <div className="p-8 text-center">Signing you in...</div>;
};

export default AuthCallback;
