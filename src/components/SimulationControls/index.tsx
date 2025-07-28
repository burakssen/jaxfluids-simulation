import React from "react";
import { type ExecutionState } from "../../types/SimulationTypes";
import { LoadingSpinner } from "../LoadingSpinner";
import { HiPlay, HiPause, HiPlayCircle, HiStop } from 'react-icons/hi2';

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
        className="bg-green-600 text-white py-1 px-2 rounded-md shadow-sm hover:bg-green-500 focus-visible:ring-2 focus-visible:ring-green-300 transition duration-150 text-sm font-medium flex items-center gap-1"
      >
        <HiPlay className="w-4 h-4" /> Run
      </button>
    )}
    {executionState === "running" && (
      <button
        onClick={onPause}
        className={`bg-yellow-500 text-white py-1 px-2 rounded-md shadow-sm hover:bg-yellow-400 focus-visible:ring-2 focus-visible:ring-yellow-200 transition duration-150 text-sm font-medium flex items-center gap-1${
          pauseRequested ? " opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={pauseRequested}
      >
        <HiPause className="w-4 h-4" /> Pause
      </button>
    )}
    {executionState === "paused" && (
      <button
        onClick={onResume}
        className="bg-blue-600 text-white py-1 px-2 rounded-md shadow-sm hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300 transition duration-150 text-sm font-medium flex items-center gap-1"
      >
        <HiPlayCircle className="w-4 h-4" /> Resume
      </button>
    )}
    {(executionState === "running" || executionState === "paused") && (
      <button
        onClick={onStop}
        className="bg-red-600 text-white py-1 px-2 rounded-md shadow-sm hover:bg-red-500 focus-visible:ring-2 focus-visible:ring-red-300 transition duration-150 text-sm font-medium flex items-center gap-1"
      >
        <HiStop className="w-4 h-4" /> Stop
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
  <div className="flex items-center ml-2 min-w-[120px]">
    {initProgress ? (
      <>
        <LoadingSpinner />
        <span className="ml-1 text-blue-200 text-xs">
          <strong>Initializing:</strong> {initProgress.stage} (
          {initProgress.progress}%)
        </span>
      </>
    ) : (
      (executionState === "running" || executionState === "paused") && (
        <span className="ml-1 text-xs text-gray-200">
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
    <label className="block mb-1 text-xs text-gray-300">
      <strong>Time Step (dt):</strong> {timeStep.toFixed(6)}
    </label>
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={timeStepRange[0]}
        max={timeStepRange[1]}
        step={(timeStepRange[1] - timeStepRange[0]) / 100}
        value={timeStep}
        onChange={onTimeStepChange}
        disabled={executionState === "running"}
        className={`w-full transition-opacity h-2 rounded-md bg-gray-700 accent-blue-500 ${
          executionState === "running"
            ? "opacity-50 cursor-not-allowed"
            : "opacity-100"
        }`}
        style={{ fontFamily: 'inherit' }}
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
    <div className="space-y-2">
      <div className="flex items-center space-x-1">
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
