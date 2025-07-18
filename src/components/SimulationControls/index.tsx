import React from "react";
import { type ExecutionState } from "../../types/SimulationTypes";
import { LoadingSpinner } from "../LoadingSpinner";

// SimulationControlButtons component
interface SimulationControlButtonsProps {
  executionState: ExecutionState;
  pauseRequested: boolean;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}
const SimulationControlButtons: React.FC<SimulationControlButtonsProps> = ({
  executionState,
  pauseRequested,
  onRun,
  onPause,
  onResume,
  onStop,
}) => (
  <>
    {executionState === "stopped" && (
      <button
        onClick={onRun}
        className="bg-green-600 text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium"
      >
        Run
      </button>
    )}
    {executionState === "running" && (
      <button
        onClick={onPause}
        className={`bg-yellow-500 text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium${
          pauseRequested ? " opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={pauseRequested}
      >
        Pause
      </button>
    )}
    {executionState === "paused" && (
      <button
        onClick={onResume}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium"
      >
        Resume
      </button>
    )}
    {(executionState === "running" || executionState === "paused") && (
      <button
        onClick={onStop}
        className="bg-red-600 text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium"
      >
        Stop
      </button>
    )}
  </>
);

// SimulationStatus component
interface SimulationStatusProps {
  executionState: ExecutionState;
  currentIteration: number;
  dataLength: number;
  time: number;
  initProgress?: { stage: string; progress: number } | null;
}
const SimulationStatus: React.FC<SimulationStatusProps> = ({
  executionState,
  currentIteration,
  dataLength,
  time,
  initProgress,
}) => (
  <div className="flex items-center ml-4 min-w-[180px]">
    {initProgress ? (
      <>
        <LoadingSpinner />
        <span className="ml-2 text-blue-200 text-sm">
          <strong>Initializing:</strong> {initProgress.stage} (
          {initProgress.progress}%)
        </span>
      </>
    ) : (
      (executionState === "running" || executionState === "paused") && (
        <span className="ml-2 text-sm text-gray-200">
          <strong>Status:</strong> {executionState} |{" "}
          <strong>Iteration:</strong> {currentIteration} |{" "}
          <strong>Data Points:</strong> {dataLength} | <strong>Time:</strong>{" "}
          {time.toFixed(6)}
        </span>
      )
    )}
  </div>
);

// TimeStepSlider component
interface TimeStepSliderProps {
  timeStep: number;
  timeStepRange: [number, number];
  onTimeStepChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  executionState: ExecutionState;
}
const TimeStepSlider: React.FC<TimeStepSliderProps> = ({
  timeStep,
  timeStepRange,
  onTimeStepChange,
  executionState,
}) => (
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
        disabled={executionState === "running"}
        className={`w-full transition-opacity ${
          executionState === "running"
            ? "opacity-50 cursor-not-allowed"
            : "opacity-100"
        }`}
      />
    </div>
  </div>
);

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
  currentIteration: number;
  dataLength: number;
  time: number;
  initProgress?: { stage: string; progress: number } | null;
}

export const SimulationControls = React.memo<SimulationControlsProps>(
  ({
    executionState,
    pauseRequested,
    timeStep,
    timeStepRange,
    onRun,
    onPause,
    onResume,
    onStop,
    onTimeStepChange,
    currentIteration,
    dataLength,
    time,
    initProgress,
  }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <SimulationControlButtons
          executionState={executionState}
          pauseRequested={pauseRequested}
          onRun={onRun}
          onPause={onPause}
          onResume={onResume}
          onStop={onStop}
        />
        <SimulationStatus
          executionState={executionState}
          currentIteration={currentIteration}
          dataLength={dataLength}
          time={time}
          initProgress={initProgress}
        />
      </div>
      <TimeStepSlider
        timeStep={timeStep}
        timeStepRange={timeStepRange}
        onTimeStepChange={onTimeStepChange}
        executionState={executionState}
      />
    </div>
  )
);

SimulationControls.displayName = "SimulationControls";
