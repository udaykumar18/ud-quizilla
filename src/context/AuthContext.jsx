import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // TODO: For best robustness, consider migrating to Supabase Auth Helpers for React:
  // https://supabase.com/docs/guides/auth/auth-helpers/react

  const loadUserAndRole = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
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
      setRole(userData?.role || null);
      setAuthReady(true);
    } catch (e) {
      setUser(null);
      setRole(null);
      setAuthReady(true);
      console.error("AuthContext → loadUserAndRole error:", e);
    }
  };

  useEffect(() => {
    console.log("AuthContext useEffect → running");
    loadUserAndRole();
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
    <AuthContext.Provider value={{ user, role, authReady, refreshUserRole: loadUserAndRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
