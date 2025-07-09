// src/pages/Login.jsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const Login = () => {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  const handleLogin = async (selectedRole) => {
    // Save selected role before redirecting to Google OAuth
    localStorage.setItem("selectedRole", selectedRole);

    // Store redirect path if it exists
    if (redirectPath) {
      localStorage.setItem("redirectAfterLogin", redirectPath);
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://ud-quizilla.vercel.app/auth/callback",
      },
    });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Quizilla</h1>
      {redirectPath && redirectPath.includes("start-assessment") && (
        <p className="text-sm text-gray-600 mb-4">
          Please sign in as a candidate to start your assessment
        </p>
      )}
      <button
        onClick={() => handleLogin("admin")}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Sign in as Admin
      </button>
      <button
        onClick={() => handleLogin("candidate")}
        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Sign in as Candidate
      </button>
    </div>
  );
};

export default Login;
