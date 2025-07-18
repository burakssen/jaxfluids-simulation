import { create } from "zustand";
import {
  type ExecutionState,
  type IterationData,
  type InitializationProgress,
} from "../../types/SimulationTypes";

interface SimulationState {
  selectedModelId: string;
  selectedDataPath?: string;
  timeStep: number;
  executionState: ExecutionState;
  currentIteration: number;
  error: string;
  initProgress: InitializationProgress | null;
  pauseRequested: boolean;
  data: IterationData;
  yAxisDomain: [number, number];
}

interface SimulationActions {
  setSelectedModelId: (id: string) => void;
  setSelectedDataPath: (path: string) => void;
  setSelectedDataYAxisDomain: (yAxisDomain: [number, number]) => void;
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

interface SimulationStore extends SimulationState, SimulationActions {}

export const createSimulationStore = (defaultModelId: string, defaultTimeStep: number) =>
  create<SimulationStore>((set) => ({
    selectedModelId: defaultModelId,
    timeStep: defaultTimeStep,
    executionState: "stopped",
    currentIteration: 0,
    error: "",
    initProgress: null,
    pauseRequested: false,
    data: {
      iteration: 0,
      values: [],
      time: 0,
    },
    yAxisDomain: [-0.25, 1.25],
    setSelectedModelId: (id) => set((state) => ({ ...state, selectedModelId: id, error: "", pauseRequested: false })),
    setSelectedDataPath: (path) => set((state) => ({ ...state, selectedDataPath: path, error: "", pauseRequested: false })),
    setSelectedDataYAxisDomain: (yAxisDomain) => set((state) => ({ ...state, yAxisDomain })),
    setTimeStep: (step) => set((state) => ({ ...state, timeStep: step })),
    setExecutionState: (executionState) => set((state) => ({
      ...state,
      executionState,
      pauseRequested: executionState === "running" || executionState === "stopped" ? false : state.pauseRequested,
    })),
    setCurrentIteration: (iteration) => set((state) => ({ ...state, currentIteration: iteration })),
    setError: (error) => set((state) => ({
      ...state,
      error,
      executionState: error ? "stopped" : state.executionState,
      pauseRequested: false,
    })),
    setInitProgress: (initProgress) => set((state) => ({ ...state, initProgress })),
    setPauseRequested: (pauseRequested) => set((state) => ({ ...state, pauseRequested })),
    setData: (data) => set((state) => ({ ...state, data, currentIteration: data.iteration })),
    reset: () => set((state) => ({
      ...state,
      executionState: "stopped",
      currentIteration: 0,
      error: "",
      initProgress: null,
      pauseRequested: false,
      data: {
        iteration: 0,
        values: [],
        time: 0,
      },
    })),
    resetData: () => set((state) => ({
      ...state,
      data: {
        iteration: 0,
        values: [],
        time: 0,
      },
      currentIteration: 0,
    })),
    resetToStopped: () => set((state) => ({
      ...state,
      executionState: "stopped",
      error: "",
      initProgress: null,
      pauseRequested: false,
    })),
  }));

// Usage: const simulationStore = createSimulationStore(defaultModelId, defaultTimeStep);
//        const { selectedModelId, setSelectedModelId, ... } = simulationStore();
