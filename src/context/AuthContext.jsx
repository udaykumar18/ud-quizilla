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

    if (!user || authError) {
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

    setUser(user);
    setRole(userData?.role || null);
    setAuthReady(true);
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
    // Initial load
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
    <AuthContext.Provider value={{ user, role, authReady, refreshUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
