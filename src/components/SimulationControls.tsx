import React from 'react';
import { type ExecutionState } from '../types/SimulationTypes';

interface SimulationControlsProps {
  executionState: ExecutionState;
  pauseRequested: boolean;
  timeStep: number;
  timeStepRange: [number, number];
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onTimeStepChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SimulationControls = React.memo<SimulationControlsProps>(({
  executionState,
  pauseRequested,
  timeStep,
  timeStepRange,
  onRun,
  onPause,
  onResume,
  onStop,
  onTimeStepChange,
}) => (
  <div className="space-y-4">
    {/* Control Buttons */}
    <div className="space-x-2">
      {executionState === 'stopped' && (
        <button
          onClick={onRun}
          className="bg-green-600 text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium"
        >
          Run
        </button>
      )}
      {executionState === 'running' && (
        <button
          onClick={onPause}
          className={`bg-yellow-500 text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium${
            pauseRequested ? ' opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={pauseRequested}
        >
          Pause
        </button>
      )}
      {executionState === 'paused' && (
        <button
          onClick={onResume}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium"
        >
          Resume
        </button>
      )}
      {(executionState === 'running' || executionState === 'paused') && (
        <button
          onClick={onStop}
          className="bg-red-600 text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium"
        >
          Stop
        </button>
      )}
    </div>

    {/* Time Step Control */}
    <div>
      <label className="block mb-2 text-sm">
        <strong>Time Step (dt):</strong> {timeStep.toFixed(6)}
      </label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={timeStepRange[0]}
          max={timeStepRange[1]}
          step={(timeStepRange[1] - timeStepRange[0]) / 100}
          value={timeStep}
          onChange={onTimeStepChange}
          disabled={executionState === 'running'}
          className={`w-full transition-opacity ${
            executionState === 'running'
              ? 'opacity-50 cursor-not-allowed'
              : 'opacity-100'
          }`}
        />
        <input
          type="number"
          min={timeStepRange[0]}
          max={timeStepRange[1]}
          step={(timeStepRange[1] - timeStepRange[0]) / 100}
          value={timeStep}
          onChange={onTimeStepChange}
          disabled={executionState === 'running'}
          className="w-28 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  </div>
));

SimulationControls.displayName = 'SimulationControls'; 