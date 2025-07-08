// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userData, error } = await supabase
          .schema("quizilla")
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (error || !userData) {
          console.error("Error fetching user role or no role found:", error);
          setRole(null);
        } else {
          setUser(user);
          setRole(userData?.role || null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const value = { user, role, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
