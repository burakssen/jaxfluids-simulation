import React from 'react';
import { type ExecutionState, type InitializationProgress } from '../types/SimulationTypes';

interface SimulationStatusProps {
  executionState: ExecutionState;
  currentIteration: number;
  dataLength: number;
  time: number;
  error: string;
  initProgress: InitializationProgress | null;
}

export const SimulationStatus = React.memo<SimulationStatusProps>(({
  executionState,
  currentIteration,
  dataLength,
  time,
  error,
  initProgress,
}) => (
  <div className="space-y-4">
    {/* Status Display */}
    <div className="text-sm">
      <strong>Status:</strong> {executionState} | <strong>Iteration:</strong>{' '}
      {currentIteration} | <strong>Data Points:</strong> {dataLength} |{' '}
      <strong>Time:</strong> {time.toFixed(6)}
    </div>

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
));

SimulationStatus.displayName = 'SimulationStatus'; 