// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // If no user or role — redirect to login
  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but not allowed
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
