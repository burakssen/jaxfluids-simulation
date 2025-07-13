import { useRef, useCallback, useEffect } from "react";
import {
  type SimulationState,
  type IterationData,
  type ModelConfig,
  type ModelAdapter,
  type InitializationProgress,
} from "../types/SimulationTypes";

export const useSimulationModel = (
  config: ModelConfig,
  dataPath: string | undefined,
  adapter: ModelAdapter,
  timeStep: number
) => {
  const stateRef = useRef<SimulationState>({
    session: null,
    currentData: null,
    currentTime: 0,
    iteration: 0,
    shouldStop: false,
    shouldPause: false,
    isInitialized: false,
    isPaused: false,
    modelMetadata: {},
  });

  // Update time step when it changes
  useEffect(() => {
    // Time step changes are handled by the controller
    // This effect ensures the model state is aware of time step changes
  }, [timeStep]);

  const initializeModel = useCallback(
    async (
      onProgress?: (progress: InitializationProgress) => void
    ): Promise<boolean> => {
      try {
        const result = await adapter.initialize(config, dataPath, onProgress);

        stateRef.current.session = result.session;
        stateRef.current.currentData = result.initialData;
        stateRef.current.currentTime = 0;
        stateRef.current.iteration = 0;
        stateRef.current.isInitialized = true;
        stateRef.current.shouldStop = false;
        stateRef.current.shouldPause = false;
        stateRef.current.isPaused = false;
        stateRef.current.modelMetadata = result.metadata || {};

        onProgress?.({ stage: "Initialization complete!", progress: 100 });
        return true;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Unknown initialization error"
        );
      }
    },
    [config, adapter, dataPath]
  );

  const runSingleIteration = useCallback(async (): Promise<{
    success: boolean;
    data?: IterationData;
    error?: string;
  }> => {
    const state = stateRef.current;

    if (!state.session || !state.currentData || !state.isInitialized) {
      return { success: false, error: "Model not initialized" };
    }

    try {
      const result = await adapter.runInference(
        state.session,
        state.currentData,
        state.currentTime,
        timeStep,
        config.inputShape
      );

      // Update state
      if (state.currentData.length === result.newData.length) {
        state.currentData.set(result.newData);
      } else {
        state.currentData = new Float64Array(result.newData);
      }

      state.currentTime = result.newTime;
      state.iteration++;

      // Extract visualization data
      const visualizationData = config.channels.map((ch) =>
        adapter.extractVisualizationData(
          result.newData,
          ch,
          config.outputShape[1]
        )
      );

      return {
        success: true,
        data: {
          iteration: state.iteration,
          values: visualizationData,
          time: result.newTime,
          metadata: result.metadata,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown inference error",
      };
    }
  }, [adapter, timeStep, config]);

  const cleanup = useCallback(() => {
    if (stateRef.current.session && adapter.cleanup) {
      adapter.cleanup(stateRef.current.session);
    }
    // Reset state after cleanup
    stateRef.current = {
      session: null,
      currentData: null,
      currentTime: 0,
      iteration: 0,
      shouldStop: false,
      shouldPause: false,
      isInitialized: false,
      isPaused: false,
      modelMetadata: {},
    };
  }, [adapter]);

  return {
    stateRef,
    initializeModel,
    runSingleIteration,
    cleanup,
  };
};
