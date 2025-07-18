export interface IterationData {
  iteration: number;
  values: Float64Array[];
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

interface Data {
  path: string;
  name: string;
  yAxisDomain?: [number, number];
}

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  modelPath: string;
  datas?: Data[];
  inputShape: number[];
  outputShape: number[];
  timeStepRange: [number, number];
  defaultTimeStep: number;
  spatialRange: [number, number];
  channels: number[];
  channelLabels?: string[];
  adapterType?: string; // NEW: type of adapter to use for this model
}

export interface ModelAdapter {
  initialize(
    config: ModelConfig,
    dataPath?: string,
    onProgress?: (progress: InitializationProgress) => void
  ): Promise<any>;
  runInference(
    session: any,
    data: Float64Array,
    time: number,
    timeStep: number,
    dims: number[]
  ): Promise<{
    newData: Float64Array;
    newTime: number;
    metadata?: Record<string, any>;
  }>;
  extractVisualizationData(
    data: Float64Array,
    channel: number,
    datasize: number
  ): Float64Array;
  cleanup?(session: any): void;
}
