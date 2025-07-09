// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user, role, authReady } = useAuth();

  const location = useLocation();

  console.log(
    "ProtectedRoute → user:",
    user,
    "role:",
    role,
    "authReady:",
    authReady
  );

  if (!authReady) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user || !role) {
    // storing candidate email path
    const currentUrl = new URL(window.location.href);
    localStorage.setItem(
      "redirectAfterLogin",
      currentUrl.pathname + currentUrl.search
    );
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="p-8 text-center text-red-600 font-medium">
        Access Denied
      </div>
    );
  }

  return element;
};

export default ProtectedRoute;
