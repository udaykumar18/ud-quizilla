// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user, role, authReady } = useAuth();

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
