// components/LoadingComponents.tsx
import React from "react";

// Loading spinner component
export const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    <span className="ml-2 text-gray-300">{message}</span>
  </div>
);

// Chart loading placeholder
export const ChartLoadingPlaceholder: React.FC = () => (
  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
    <h3 className="text-lg font-semibold mb-4">Simulation Results</h3>
    <div className="w-full h-[500px] bg-gray-700 rounded flex items-center justify-center">
      <LoadingSpinner message="Loading chart components..." />
    </div>
  </div>
);

// Model initialization progress
export const ModelInitializationProgress: React.FC<{
  stage: string;
  progress?: number;
}> = ({ stage, progress }) => (
  <div className="mt-4 p-4 bg-blue-900 border border-blue-700 rounded">
    <div className="flex items-center justify-between mb-2">
      <span className="text-blue-200 font-medium">Initializing Model...</span>
      {progress !== undefined && (
        <span className="text-blue-300 text-sm">{Math.round(progress)}%</span>
      )}
    </div>
    <div className="text-blue-300 text-sm mb-2">{stage}</div>
    {progress !== undefined && (
      <div className="w-full bg-blue-800 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
    <div className="flex items-center mt-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
      <span className="text-blue-300 text-xs">Please wait...</span>
    </div>
  </div>
);

export default {
  LoadingSpinner,
  ChartLoadingPlaceholder,
  ModelInitializationProgress,
};
