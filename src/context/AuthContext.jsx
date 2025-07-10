import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const loadUserAndRole = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("🔐 Supabase user:", user);

    if (!user || authError) {
      setUser(null);
      setRole(null);
      setAuthReady(true);
      console.log("⚠️ No user or auth error:", authError);
      return;
    }

    const { data: userData, error } = await supabase
      .schema("quizilla")
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    console.log("📥 Role fetched:", userData?.role);
    console.log("⚠️ Supabase role fetch error:", error);

    setUser(user);
    setRole(userData?.role || null); // even if role is null
    setAuthReady(true); // ALWAYS run this
  };

  // Add this function to manually refresh role
  const refreshUserRole = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      setUser(null);
      setRole(null);
      return;
    }

    const { data: userData, error } = await supabase
      .schema("quizilla")
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && userData) {
      setRole(userData.role);
    }
  };

  useEffect(() => {
    console.log("AuthContext useEffect → running");
    // Ensure Supabase session restoration before checking user
    const restoreSessionAndLoadUser = async () => {
      try {
        const sessionResult = await supabase.auth.getSession();
        console.log("restoreSessionAndLoadUser → sessionResult:", sessionResult);
        await loadUserAndRole();
      } catch (e) {
        console.error("restoreSessionAndLoadUser → error:", e);
      }
    };
    restoreSessionAndLoadUser();

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
            window.location.replace(redirectPath); // redirect with full path/query
          }
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, authReady, refreshUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
