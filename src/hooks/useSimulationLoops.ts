import { useRef, useCallback } from "react";
import {
  type SimulationState,
  type IterationData,
  type ExecutionState,
} from "../types/SimulationTypes";

export const useSimulationLoop = (runSingleIteration: () => Promise<any>) => {
  const animationFrameRef = useRef<number>(0);

  const animationLoop = useCallback(
    async (
      stateRef: React.MutableRefObject<SimulationState>,
      onUpdate: (data: IterationData) => void,
      onError: (error: string) => void,
      onStateChange: (state: ExecutionState) => void
    ) => {
      const state = stateRef.current;

      if (state.shouldStop) {
        onStateChange("stopped");
        return;
      }

      if (state.shouldPause && !state.isPaused) {
        state.isPaused = true;
        onStateChange("paused");
        return;
      }

      if (state.isPaused) {
        animationFrameRef.current = requestAnimationFrame(() =>
          animationLoop(stateRef, onUpdate, onError, onStateChange)
        );
        return;
      }

      const result = await runSingleIteration();
      if (!result.success) {
        onError(result.error || "Unknown error");
        onStateChange("stopped");
        return;
      }

      if (result.data) {
        onUpdate(result.data);
      }

      animationFrameRef.current = requestAnimationFrame(() =>
        animationLoop(stateRef, onUpdate, onError, onStateChange)
      );
    },
    [runSingleIteration]
  );

  const startLoop = useCallback(
    (
      stateRef: React.MutableRefObject<SimulationState>,
      onUpdate: (data: IterationData) => void,
      onError: (error: string) => void,
      onStateChange: (state: ExecutionState) => void
    ) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() =>
        animationLoop(stateRef, onUpdate, onError, onStateChange)
      );
    },
    [animationLoop]
  );

  const stopLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  return { startLoop, stopLoop };
};
