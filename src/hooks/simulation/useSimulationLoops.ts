import { useRef, useCallback, useEffect } from "react";
import {
  type SimulationState,
  type IterationData,
  type ExecutionState,
} from "../../types/SimulationTypes";

export const useSimulationLoop = (runSingleIteration: () => Promise<any>) => {
  const animationFrameRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const lastUpdateTimeRef = useRef<number>(0);

  // Performance throttling - limit updates to ~60fps max
  const UPDATE_INTERVAL = 1000 / 60; // 16.67ms

  const animationLoop = useCallback(
    async (
      stateRef: React.RefObject<SimulationState>,
      onUpdate: (data: IterationData) => void,
      onError: (error: string) => void,
      onStateChange: (state: ExecutionState) => void
    ) => {
      const state = stateRef.current;
      if (!state) return;

      // Check state conditions BEFORE running iteration
      if (state.shouldStop) {
        isRunningRef.current = false;
        onStateChange("stopped");
        return;
      }

      if (state.shouldPause && !state.isPaused) {
        state.isPaused = true;
        isRunningRef.current = false;
        onStateChange("paused");
        return;
      }

      if (state.isPaused) {
        // Don't schedule next frame when paused
        return;
      }

      // Performance optimization: throttle updates
      const currentTime = performance.now();
      const timeSinceLastUpdate = currentTime - lastUpdateTimeRef.current;

      if (timeSinceLastUpdate < UPDATE_INTERVAL) {
        // Schedule next frame without running iteration
        animationFrameRef.current = requestAnimationFrame(() =>
          animationLoop(stateRef, onUpdate, onError, onStateChange)
        );
        return;
      }

      try {
        const result = await runSingleIteration();

        if (!result.success) {
          isRunningRef.current = false;
          onError(result.error || "Unknown error");
          onStateChange("stopped");
          return;
        }

        if (result.data) {
          lastUpdateTimeRef.current = currentTime;
          onUpdate(result.data);
        }

        // Check again after iteration in case pause/stop was requested during iteration
        if (state.shouldStop) {
          isRunningRef.current = false;
          onStateChange("stopped");
          return;
        }
        
        if (state.shouldPause && !state.isPaused) {
          state.isPaused = true;
          isRunningRef.current = false;
          onStateChange("paused");
          return;
        }
        
        // Continue loop if still running and not paused/stopped
        if (isRunningRef.current && !state.shouldStop && !state.shouldPause && !state.isPaused) {
          animationFrameRef.current = requestAnimationFrame(() =>
            animationLoop(stateRef, onUpdate, onError, onStateChange)
          );
        }
      } catch (error) {
        isRunningRef.current = false;
        onError(error instanceof Error ? error.message : "Unknown error");
        onStateChange("stopped");
      }
    },
    [runSingleIteration]
  );

  const startLoop = useCallback(
    (
      stateRef: React.RefObject<SimulationState>,
      onUpdate: (data: IterationData) => void,
      onError: (error: string) => void,
      onStateChange: (state: ExecutionState) => void
    ) => {
      if (isRunningRef.current) {
        return;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      isRunningRef.current = true;
      lastUpdateTimeRef.current = performance.now();

      animationFrameRef.current = requestAnimationFrame(() =>
        animationLoop(stateRef, onUpdate, onError, onStateChange)
      );
    },
    [animationLoop]
  );

  const stopLoop = useCallback(() => {
    isRunningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  return { startLoop, stopLoop };
};
