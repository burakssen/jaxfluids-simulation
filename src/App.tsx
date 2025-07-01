// App.tsx - Complete optimized version
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import React from "react";
import {
  ChartLoadingPlaceholder,
  ModelInitializationProgress,
} from "./components/LoadingComponents";

// Lazy load heavy components
const SimulationChart = lazy(() => import("./components/SimulationChart"));

// Dynamic imports for heavy libraries
const loadONNXRuntime = () => import("onnxruntime-web");
const loadNpyjs = () => import("npyjs");

// Types
interface IterationData {
  iteration: number;
  values: Float64Array;
  time: number;
}

type ExecutionState = "stopped" | "running" | "paused";

interface SimulationState {
  session: any | null; // Use any to avoid importing ONNX types upfront
  currentData: Float64Array | null;
  currentTime: number;
  iteration: number;
  shouldStop: boolean;
  shouldPause: boolean;
  isInitialized: boolean;
  isPaused: boolean;
}

interface InitializationProgress {
  stage: string;
  progress: number;
}

// Custom Hooks
const useSimulationModel = (freq: number) => {
  const stateRef = useRef<SimulationState>({
    session: null,
    currentData: null,
    currentTime: 0,
    iteration: 0,
    shouldStop: false,
    shouldPause: false,
    isInitialized: false,
    isPaused: false,
  });

  const initializeModel = useCallback(
    async (
      onProgress?: (progress: InitializationProgress) => void
    ): Promise<boolean> => {
      try {
        onProgress?.({ stage: "Loading libraries...", progress: 10 });

        // Dynamic imports - only load when needed
        const [{ default: Npyjs }, ort] = await Promise.all([
          loadNpyjs(),
          loadONNXRuntime(),
        ]);

        onProgress?.({ stage: "Loading model data...", progress: 30 });

        const npy = new Npyjs();
        const npyBuffer = await (
          await fetch("/jaxfluids-feed-forward/feed_forward_data.npy")
        ).arrayBuffer();

        onProgress?.({ stage: "Parsing model data...", progress: 50 });

        const npyData = npy.parse(npyBuffer);
        const inputArray = new Float64Array(npyData.data);

        onProgress?.({ stage: "Creating ONNX session...", progress: 70 });

        const session = await ort.InferenceSession.create(
          "/jaxfluids-feed-forward/feed_forward.onnx"
        );

        onProgress?.({ stage: "Finalizing initialization...", progress: 90 });

        stateRef.current.session = session;
        stateRef.current.currentData = inputArray;
        stateRef.current.currentTime = 0;
        stateRef.current.iteration = 0;
        stateRef.current.isInitialized = true;
        stateRef.current.shouldStop = false;
        stateRef.current.shouldPause = false;
        stateRef.current.isPaused = false;

        onProgress?.({ stage: "Initialization complete!", progress: 100 });

        return true;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Unknown initialization error"
        );
      }
    },
    []
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
      // Load ONNX runtime only when needed for inference
      const ort = await loadONNXRuntime();

      const inputTensor = new ort.Tensor(
        "float64",
        state.currentData,
        [5, 256, 1, 1]
      );
      const timeTensor = new ort.Tensor(
        "float64",
        new Float64Array([state.currentTime]),
        [1]
      );
      const dtTensor = new ort.Tensor("float64", new Float64Array([freq]), [1]);

      const outputs = await state.session.run({
        var_0: inputTensor,
        var_1: timeTensor,
        var_2: dtTensor,
      });

      const newData = outputs["var_3"].data as Float64Array;
      const newTime = (outputs["var_4"].data as Float64Array)[0];

      if (state.currentData.length === newData.length) {
        state.currentData.set(newData);
      } else {
        state.currentData = new Float64Array(newData);
      }

      state.currentTime = newTime;
      state.iteration++;

      const firstChannelData = newData.subarray(0, 256);

      return {
        success: true,
        data: {
          iteration: state.iteration,
          values: new Float64Array(firstChannelData),
          time: newTime,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown inference error",
      };
    }
  }, [freq]);

  return {
    stateRef,
    initializeModel,
    runSingleIteration,
  };
};

const useSimulationLoop = (runSingleIteration: () => Promise<any>) => {
  const animationFrameRef = useRef<number>(0);

  const animationLoop = useCallback(
    async (
      stateRef: React.RefObject<SimulationState>,
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

const useChartData = (values: Float64Array) => {
  return useMemo(() => {
    const data = new Array(values.length);
    for (let i = 0; i < values.length; i++) {
      data[i] = { index: i, value: values[i] };
    }
    return data;
  }, [values]);
};

// UI Components
const Button = React.memo<{
  onClick: () => void;
  color: string;
  label: string;
  disabled?: boolean;
}>(({ onClick, color, label, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`${color} text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {label}
  </button>
));

const StatusDisplay = React.memo<{
  executionState: ExecutionState;
  currentIteration: number;
  dataLength: number;
  time: number;
}>(({ executionState, currentIteration, dataLength, time }) => (
  <div className="mb-4 text-sm">
    <strong>Status:</strong> {executionState} | <strong>Iteration:</strong>{" "}
    {currentIteration} | <strong>Data Points:</strong> {dataLength} |{" "}
    <strong>Time:</strong> {time.toFixed(4)}
  </div>
));

const ErrorDisplay = React.memo<{ error: string }>(({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200">
      <strong>Error:</strong> {error}
    </div>
  );
});

const SimulationControls = React.memo<{
  executionState: ExecutionState;
  freq: number;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onFrequencyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}>(
  ({
    executionState,
    freq,
    onRun,
    onPause,
    onResume,
    onStop,
    onFrequencyChange,
  }) => (
    <>
      <div className="mb-4 space-x-2">
        {executionState === "stopped" && (
          <Button onClick={onRun} color="bg-green-600" label="Run" />
        )}
        {executionState === "running" && (
          <Button onClick={onPause} color="bg-yellow-500" label="Pause" />
        )}
        {executionState === "paused" && (
          <Button onClick={onResume} color="bg-blue-600" label="Resume" />
        )}
        {(executionState === "running" || executionState === "paused") && (
          <Button onClick={onStop} color="bg-red-600" label="Stop" />
        )}
      </div>

      <label className="block mb-2 text-sm">
        <strong>Time Step (dt):</strong> {freq.toFixed(4)}
      </label>
      <input
        type="range"
        min="0.0001"
        max="0.005"
        step="0.0001"
        value={freq}
        onChange={onFrequencyChange}
        disabled={executionState === "running"}
        className={`w-full transition-opacity ${
          executionState === "running"
            ? "opacity-50 cursor-not-allowed"
            : "opacity-100"
        }`}
      />
    </>
  )
);

const CurrentStateDisplay = React.memo<{
  stateRef: React.RefObject<SimulationState>;
}>(({ stateRef }) => (
  <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
    <h4 className="text-md font-semibold mb-2">Current State</h4>
    <div className="text-sm text-gray-300">
      <p>
        <strong>Current Time:</strong> {stateRef.current.currentTime.toFixed(6)}
      </p>
      <p>
        <strong>Initialized:</strong>{" "}
        {stateRef.current.isInitialized ? "Yes" : "No"}
      </p>
      <p>
        <strong>Is Paused:</strong> {stateRef.current.isPaused ? "Yes" : "No"}
      </p>
      {stateRef.current.currentData && (
        <p>
          <strong>Data Shape:</strong> [5, 256] (
          {stateRef.current.currentData.length} elements)
        </p>
      )}
    </div>
  </div>
));

// Main App Component
export default function App() {
  const [data, setData] = useState<IterationData>({
    iteration: 0,
    values: new Float64Array(256),
    time: 0,
  });

  const [freq, setFreq] = useState(0.001);
  const [executionState, setExecutionState] =
    useState<ExecutionState>("stopped");
  const [currentIteration, setCurrentIteration] = useState(0);
  const [error, setError] = useState<string>("");
  const [initProgress, setInitProgress] =
    useState<InitializationProgress | null>(null);

  const { stateRef, initializeModel, runSingleIteration } =
    useSimulationModel(freq);
  const { startLoop, stopLoop } = useSimulationLoop(runSingleIteration);

  const chartData = useChartData(data.values);

  // Event Handlers
  const handleDataUpdate = useCallback((newData: IterationData) => {
    setCurrentIteration(newData.iteration);
    setData(newData);
  }, []);

  const handleError = useCallback((errorMsg: string) => {
    setError(`Inference failed: ${errorMsg}`);
  }, []);

  const handleInitProgress = useCallback((progress: InitializationProgress) => {
    setInitProgress(progress);
  }, []);

  const handleRun = useCallback(async () => {
    stopLoop();

    if (executionState === "stopped") {
      stateRef.current = {
        session: null,
        currentData: null,
        currentTime: 0,
        iteration: 0,
        shouldStop: false,
        shouldPause: false,
        isInitialized: false,
        isPaused: false,
      };

      setData({
        iteration: 0,
        values: new Float64Array(256),
        time: 0,
      });
      setCurrentIteration(0);
      setError("");
      setInitProgress({ stage: "Starting initialization...", progress: 0 });

      try {
        const initialized = await initializeModel(handleInitProgress);
        if (!initialized) {
          return;
        }

        // Clear progress after a short delay
        setTimeout(() => setInitProgress(null), 1500);
      } catch (err) {
        setError(
          `Initialization failed: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setInitProgress(null);
        return;
      }
    }

    stateRef.current.shouldStop = false;
    stateRef.current.shouldPause = false;
    stateRef.current.isPaused = false;
    setExecutionState("running");
    startLoop(stateRef, handleDataUpdate, handleError, setExecutionState);
  }, [
    executionState,
    initializeModel,
    startLoop,
    stopLoop,
    stateRef,
    handleDataUpdate,
    handleError,
    handleInitProgress,
  ]);

  const handlePause = useCallback(() => {
    if (executionState === "running") {
      stateRef.current.shouldPause = true;
    }
  }, [executionState, stateRef]);

  const handleStop = useCallback(() => {
    stateRef.current.shouldStop = true;
    stateRef.current.shouldPause = false;
    stateRef.current.isPaused = false;

    stopLoop();
    setExecutionState("stopped");
    setCurrentIteration(0);
    setError("");
    setInitProgress(null);
  }, [stopLoop, stateRef]);

  const handleResume = useCallback(() => {
    if (executionState === "paused") {
      stateRef.current.shouldPause = false;
      stateRef.current.isPaused = false;
      setExecutionState("running");
      startLoop(stateRef, handleDataUpdate, handleError, setExecutionState);
    }
  }, [executionState, startLoop, stateRef, handleDataUpdate, handleError]);

  const handleFrequencyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFreq(parseFloat(e.target.value));
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <h2 className="text-2xl font-bold mb-6">
        ONNX Inference Results (Optimized)
      </h2>

      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <StatusDisplay
          executionState={executionState}
          currentIteration={currentIteration}
          dataLength={data.values.length}
          time={data.time}
        />

        <ErrorDisplay error={error} />

        <SimulationControls
          executionState={executionState}
          freq={freq}
          onRun={handleRun}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
          onFrequencyChange={handleFrequencyChange}
        />
      </div>

      {/* Model initialization progress */}
      {initProgress && (
        <ModelInitializationProgress
          stage={initProgress.stage}
          progress={initProgress.progress}
        />
      )}

      {/* Lazy loaded chart with suspense */}
      <Suspense fallback={<ChartLoadingPlaceholder />}>
        <SimulationChart chartData={chartData} />
      </Suspense>

      <CurrentStateDisplay stateRef={stateRef} />
    </div>
  );
}
