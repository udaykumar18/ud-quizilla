import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.warn("AuthContext → No Supabase user session.");
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: userData, error: fetchError } = await supabase
        .schema("quizilla")
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (fetchError || !userData?.role) {
        console.warn("AuthContext → User found but no DB role. Signing out.");
        await supabase.auth.signOut(); // Force logout if user has no role in DB
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(user);
      setRole(userData.role);
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
