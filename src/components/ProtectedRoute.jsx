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
    // Store the current location (including query params) for redirect after login
    const redirectPath = `${location.pathname}${location.search}`;
    console.log("ProtectedRoute → Storing redirect path:", redirectPath);

    // Store in both localStorage and sessionStorage for reliability
    localStorage.setItem("redirectAfterLogin", redirectPath);
    sessionStorage.setItem("redirectAfterLogin", redirectPath);

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
        replace
      />
    );
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
