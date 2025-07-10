// components/StatsCard.jsx
import React from "react";
import { Link } from "react-router-dom";

// Test

const StatsCard = ({ title, count, icon: Icon, color, linkTo }) => {
  const CardContent = () => (
    <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
        </div>
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo}>
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

export default StatsCard;
