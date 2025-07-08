// src/pages/AuthCallback.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth error:", authError);
        toast.error("Authentication failed");
        return navigate("/login");
      }

      const selectedRole = localStorage.getItem("selectedRole");
      if (!selectedRole) {
        toast.error("No role selected. Please login again.");
        return navigate("/login");
      }

      const email = user.email;
      if (selectedRole === "admin" && !email.endsWith("@antstack.io")) {
        toast.error("Only @antstack.io emails can be admins");
        await supabase.auth.signOut();
        return navigate("/login");
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .schema("quizilla")
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingUser) {
        await supabase.schema("quizilla").from("users").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name,
          role: selectedRole,
        });
      }

      localStorage.removeItem("selectedRole");

      if (selectedRole === "admin") navigate("/");
      else navigate("/start-assessment");
    };

    handleAuth();
  }, [navigate]);

  return <div className="p-8 text-center">Signing you in...</div>;
};

export default AuthCallback;
