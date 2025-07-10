import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  // const loadingRef = useRef(false);

  const loadUserAndRole = async () => {
    // Prevent multiple simultaneous calls
    // if (loadingRef.current) {
    //   console.log("🔁 loadUserAndRole already in progress, skipping");
    //   return;
    // }

    // loadingRef.current = true;
    // console.log("🔁 loadUserAndRole called");
    
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
    } finally {
      // loadingRef.current = false;
    }
  };

  useEffect(() => {
    console.log("🔄 AuthContext useEffect running");
    
    // Initial load
    loadUserAndRole();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🧭 Auth event:", event, "Session:", !!session);

        if (event === "SIGNED_OUT") {
          setUser(null);
          setRole(null);
          setAuthReady(true);
          return;
        }

        // Only handle these specific events to avoid infinite loops
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          console.log("🔄 Handling auth event:", event);
          await loadUserAndRole();
          
          // Handle redirect only for SIGNED_IN
          if (event === "SIGNED_IN") {
            const redirectPath = localStorage.getItem("redirectAfterLogin");
            if (redirectPath) {
              localStorage.removeItem("redirectAfterLogin");
              window.location.replace(redirectPath);
            }
          }
        }

        // For INITIAL_SESSION, only load if we don't have a user yet
        if (event === "INITIAL_SESSION" && !user) {
          console.log("🔄 Initial session - loading user");
          await loadUserAndRole();
        }
      }
    );

    return () => {
      console.log("🧹 Cleaning up auth listener");
      listener.subscription.unsubscribe();
    };
  }, []); // Remove user dependency to prevent infinite loops

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