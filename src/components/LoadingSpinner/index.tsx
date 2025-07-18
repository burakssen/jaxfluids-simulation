import React from "react";

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center">
    <span className="inline-block h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
  </div>
);
