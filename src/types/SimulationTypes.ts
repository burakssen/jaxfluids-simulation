export interface IterationData {
  iteration: number;
  values: Float64Array;
  time: number;
  metadata?: Record<string, any>;
}

export type ExecutionState = "stopped" | "running" | "paused";

export interface SimulationState {
  session: any | null;
  currentData: Float64Array | null;
  currentTime: number;
  iteration: number;
  shouldStop: boolean;
  shouldPause: boolean;
  isInitialized: boolean;
  isPaused: boolean;
  modelMetadata?: Record<string, any>;
}

export interface InitializationProgress {
  stage: string;
  progress: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  modelPath: string;
  dataPath?: string;
  inputShape: number[];
  outputShape: number[];
  timeStepRange: [number, number];
  defaultTimeStep: number;
  parameters?: Record<string, any>;
}

export interface ModelAdapter {
  initialize(config: ModelConfig, onProgress?: (progress: InitializationProgress) => void): Promise<any>;
  runInference(session: any, data: Float64Array, time: number, timeStep: number): Promise<{
    newData: Float64Array;
    newTime: number;
    metadata?: Record<string, any>;
  }>;
  extractVisualizationData(data: Float64Array): Float64Array;
  cleanup?(session: any): void;
}