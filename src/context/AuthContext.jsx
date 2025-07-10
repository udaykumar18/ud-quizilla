import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Remove useCallback and define as a regular async function
  const loadUserAndRole = async () => {
    console.log("🔁 loadUserAndRole called");
    
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      console.log("🔐 Supabase data:", user, authError);

      console.log("✅ supabase.auth.getUser →", user);

      if (!user || authError) {
        console.warn("⚠️ No user or auth error:", authError);
        setUser(null);
        setRole(null);
        setAuthReady(true);
        return;
      }

      const { data: userData, error } = await supabase
        .schema("quizilla")
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      console.log("📥 Role fetched:", userData?.role);
      if (error) console.error("❌ Role fetch error:", error);

      setUser(user);
      setRole(userData?.role || null);
      setAuthReady(true);
    } catch (e) {
      console.error("❌ loadUserAndRole exception:", e);
      setUser(null);
      setRole(null);
      setAuthReady(true);
    }
  };

  useEffect(() => {
    console.log("🔄 AuthContext useEffect running");
    loadUserAndRole();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🧭 Auth event:", event);

        if (event === "SIGNED_OUT") {
          setUser(null);
          setRole(null);
          setAuthReady(true);
          return;
        }

        if (event === "SIGNED_IN") {
          await loadUserAndRole();
          const redirectPath = localStorage.getItem("redirectAfterLogin");
          if (redirectPath) {
            localStorage.removeItem("redirectAfterLogin");
            window.location.replace(redirectPath);
          }
        }

        // Handle initial session and token refresh
        if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
          console.log("🔄 Initial session or token refreshed");
          await loadUserAndRole();
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const value = {
    user,
    role,
    authReady,
    refreshUserRole: loadUserAndRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};