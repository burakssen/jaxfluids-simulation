import { useCallback, useEffect, useRef } from "react";
import {
  type ModelConfig,
  type ModelAdapter,
  type ExecutionState,
} from "../../types/SimulationTypes";
import { useSimulationModel } from "./useSimulationModel";
import { useSimulationLoop } from "./useSimulationLoops";

interface SimulationControllerProps {
  currentModel: ModelConfig;
  dataPath?: string;
  currentAdapter: ModelAdapter;
  timeStep: number;
  onDataUpdate: (data: any) => void;
  onError: (error: string) => void;
  onStateChange: (state: ExecutionState) => void;
  onInitProgress: (progress: any) => void;
}

export const useSimulationController = ({
  currentModel,
  dataPath,
  currentAdapter,
  timeStep,
  onDataUpdate,
  onError,
  onStateChange,
  onInitProgress,
}: SimulationControllerProps) => {
  const previousTimeStepRef = useRef<number>(timeStep);

  // Use the stateRef from useSimulationModel
  const { stateRef, initializeModel, runSingleIteration, cleanup } =
    useSimulationModel(currentModel, dataPath, currentAdapter, timeStep);

  const { startLoop, stopLoop } = useSimulationLoop(runSingleIteration);

  useEffect(() => {
    if (
      previousTimeStepRef.current !== timeStep &&
      stateRef.current.isInitialized
    ) {
      if (
        stateRef.current.shouldStop === false &&
        stateRef.current.isPaused === false
      ) {
        stateRef.current.shouldPause = true;
      }
    }
    previousTimeStepRef.current = timeStep;
  }, [timeStep, stateRef]);

  const handleRun = useCallback(async () => {
    if (!dataPath) {
      dataPath = currentModel.datas?.[0]?.path || "";
    }
    if (!currentModel || !currentAdapter) return;

    stopLoop();

    // Reset state
    onDataUpdate({
      iteration: 0,
      values: [],
      time: 0,
    });
    onError("");
    onInitProgress({ stage: "Starting initialization...", progress: 0 });

    try {
      const initialized = await initializeModel(onInitProgress);
      if (!initialized) return;

      setTimeout(() => onInitProgress(null), 1500);
    } catch (err) {
      onError(
        `Initialization failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      onInitProgress(null);
      return;
    }

    // Reset state flags
    if (stateRef.current) {
      stateRef.current.shouldStop = false;
      stateRef.current.shouldPause = false;
      stateRef.current.isPaused = false;
    }

    onStateChange("running");
    startLoop(stateRef, onDataUpdate, onError, onStateChange);
  }, [
    currentModel,
    currentAdapter,
    initializeModel,
    startLoop,
    stopLoop,
    onDataUpdate,
    onError,
    onStateChange,
    onInitProgress,
    stateRef,
  ]);

  const handlePause = useCallback(() => {
    if (stateRef.current) {
      stateRef.current.shouldPause = true;
    }
  }, [stateRef]);

  const handleStop = useCallback(() => {
    if (stateRef.current) {
      stateRef.current.shouldStop = true;
      stateRef.current.shouldPause = false;
      stateRef.current.isPaused = false;
    }

    stopLoop();
    cleanup();
    onStateChange("stopped");
  }, [stopLoop, cleanup, onStateChange, stateRef]);

  const handleResume = useCallback(() => {
    if (stateRef.current) {
      stateRef.current.shouldPause = false;
      stateRef.current.isPaused = false;
      onStateChange("running");
      startLoop(stateRef, onDataUpdate, onError, onStateChange);
    }
  }, [startLoop, onDataUpdate, onError, onStateChange, stateRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLoop();
      cleanup();
    };
  }, [stopLoop, cleanup]);

  return {
    handleRun,
    handlePause,
    handleStop,
    handleResume,
    stateRef,
  };
};
