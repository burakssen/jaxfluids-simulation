import { useState, useCallback } from 'react';
import { type ExecutionState, type IterationData, type InitializationProgress } from '../types/SimulationTypes';

interface SimulationState {
  selectedModelId: string;
  timeStep: number;
  executionState: ExecutionState;
  currentIteration: number;
  error: string;
  initProgress: InitializationProgress | null;
  pauseRequested: boolean;
  data: IterationData;
}

interface SimulationActions {
  setSelectedModelId: (id: string) => void;
  setTimeStep: (step: number) => void;
  setExecutionState: (state: ExecutionState) => void;
  setCurrentIteration: (iteration: number) => void;
  setError: (error: string) => void;
  setInitProgress: (progress: InitializationProgress | null) => void;
  setPauseRequested: (requested: boolean) => void;
  setData: (data: IterationData) => void;
  reset: () => void;
  resetData: () => void;
  resetToStopped: () => void;
}

export const useSimulationState = (defaultModelId: string, defaultTimeStep: number) => {
  const [state, setState] = useState<SimulationState>({
    selectedModelId: defaultModelId,
    timeStep: defaultTimeStep,
    executionState: 'stopped',
    currentIteration: 0,
    error: '',
    initProgress: null,
    pauseRequested: false,
    data: {
      iteration: 0,
      values: [],
      time: 0,
    },
  });

  const setSelectedModelId = useCallback((id: string) => {
    setState(prev => ({ 
      ...prev, 
      selectedModelId: id, 
      error: '',
      pauseRequested: false 
    }));
  }, []);

  const setTimeStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, timeStep: step }));
  }, []);

  const setExecutionState = useCallback((executionState: ExecutionState) => {
    setState(prev => ({ 
      ...prev, 
      executionState,
      // Clear pause request when transitioning to running or stopped
      pauseRequested: executionState === 'running' || executionState === 'stopped' ? false : prev.pauseRequested
    }));
  }, []);

  const setCurrentIteration = useCallback((iteration: number) => {
    setState(prev => ({ ...prev, currentIteration: iteration }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ 
      ...prev, 
      error,
      // Reset execution state to stopped on error
      executionState: error ? 'stopped' : prev.executionState,
      pauseRequested: false
    }));
  }, []);

  const setInitProgress = useCallback((initProgress: InitializationProgress | null) => {
    setState(prev => ({ ...prev, initProgress }));
  }, []);

  const setPauseRequested = useCallback((pauseRequested: boolean) => {
    setState(prev => ({ ...prev, pauseRequested }));
  }, []);

  const setData = useCallback((data: IterationData) => {
    setState(prev => ({ 
      ...prev, 
      data,
      currentIteration: data.iteration 
    }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      executionState: 'stopped',
      currentIteration: 0,
      error: '',
      initProgress: null,
      pauseRequested: false,
      data: {
        iteration: 0,
        values: [],
        time: 0,
      },
    }));
  }, []);

  const resetData = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: {
        iteration: 0,
        values: [],
        time: 0,
      },
      currentIteration: 0,
    }));
  }, []);

  const resetToStopped = useCallback(() => {
    setState(prev => ({
      ...prev,
      executionState: 'stopped',
      error: '',
      initProgress: null,
      pauseRequested: false,
    }));
  }, []);

  const actions: SimulationActions = {
    setSelectedModelId,
    setTimeStep,
    setExecutionState,
    setCurrentIteration,
    setError,
    setInitProgress,
    setPauseRequested,
    setData,
    reset,
    resetData,
    resetToStopped,
  };

  return [state, actions] as const;
}; 