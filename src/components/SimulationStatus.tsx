import React from "react";
import { type InitializationProgress } from "../types/SimulationTypes";

interface SimulationStatusProps {
  error: string;
  initProgress: InitializationProgress | null;
}

export const SimulationStatus = React.memo<SimulationStatusProps>(
  ({ error, initProgress }) => (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-900 border border-red-700 rounded text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Initialization Progress */}
      {initProgress && (
        <div className="p-3 bg-blue-900 border border-blue-700 rounded text-blue-200">
          <strong>Initializing:</strong> {initProgress.stage} (
          {initProgress.progress}%)
        </div>
      )}
    </div>
  )
);

SimulationStatus.displayName = "SimulationStatus";
