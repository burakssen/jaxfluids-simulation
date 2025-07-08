import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { ModelRegistry } from "./models/ModelRegistry";
import { FeedForwardAdapter } from "./models/adapters/FeedForwardAdapter";
import { useSimulationModel } from "./hooks/useSimulationModel";
import { useSimulationLoop } from "./hooks/useSimulationLoops";
import { useChartData } from "./hooks/useChartData";
import { ModelSelector } from "./components/ModelSelector";
import {
  type IterationData,
  type ExecutionState,
  type InitializationProgress,
} from "./types/SimulationTypes";

// Lazy load components
const SimulationChart = lazy(() => import("./components/SimulationChart"));
const ChartLoadingPlaceholder = () => <div>Loading chart...</div>;
const ModelInitializationProgress = ({
  stage,
  progress,
}: InitializationProgress) => (
  <div className="mb-4 p-3 bg-blue-900 border border-blue-700 rounded">
    <div>{stage}</div>
    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

// Initialize model registry
const modelRegistry = new ModelRegistry();

// Register available models
modelRegistry.registerModel(
  {
    id: "feedforward",
    name: "Feed Forward Neural Network",
    description: "ONNX-based neural network model",
    modelPath: "/jaxfluids-feed-forward/models/feed_forward_v1/model.onnx",
    dataPath: "/jaxfluids-feed-forward/models/feed_forward_v1/data.npy",
    inputShape: [5, 256, 1, 1],
    outputShape: [5, 256, 1, 1],
    timeStepRange: [0.0001, 0.005],
    defaultTimeStep: 0.001,
    parameters: {
      channels: 5,
      resolution: 256,
    },
  },
  new FeedForwardAdapter()
);

modelRegistry.registerModel(
  {
    id: "feedforward_v2",
    name: "Feed Forward Neural Network v2",
    description: "Updated ONNX-based neural network model",
    modelPath: "/jaxfluids-feed-forward/models/feed_forward_v2/model.onnx",
    dataPath: "/jaxfluids-feed-forward/models/feed_forward_v2/data.npy",
    inputShape: [5, 256, 1, 1],
    outputShape: [5, 256, 1, 1],
    timeStepRange: [0.0001, 0.001],
    defaultTimeStep: 0.0001,
    parameters: {
      channels: 5,
      resolution: 256,
    },
  },
  new FeedForwardAdapter()
);

export default function App() {
  const [selectedModelId, setSelectedModelId] = useState("feedforward");
  const [timeStep, setTimeStep] = useState(0.001);
  const [executionState, setExecutionState] =
    useState<ExecutionState>("stopped");
  const [currentIteration, setCurrentIteration] = useState(0);
  const [error, setError] = useState<string>("");
  const [initProgress, setInitProgress] =
    useState<InitializationProgress | null>(null);
  const [data, setData] = useState<IterationData>({
    iteration: 0,
    values: new Float64Array(256),
    time: 0,
  });

  // Get current model and adapter
  const currentModel = modelRegistry.getModel(selectedModelId);
  const currentAdapter = modelRegistry.getAdapter(selectedModelId);

  // Initialize hooks with current model
  const { stateRef, initializeModel, runSingleIteration, cleanup } =
    useSimulationModel(currentModel!, currentAdapter!, timeStep);

  const { startLoop, stopLoop } = useSimulationLoop(runSingleIteration);
  const chartData = useChartData(data.values);

  // Update time step when model changes
  useEffect(() => {
    if (currentModel) {
      setTimeStep(currentModel.defaultTimeStep);
    }
  }, [currentModel]);

  // Event handlers
  const handleModelChange = useCallback(
    (modelId: string) => {
      if (executionState !== "stopped") {
        handleStop();
      }
      setSelectedModelId(modelId);
      setError("");
    },
    [executionState]
  );

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
    if (!currentModel || !currentAdapter) return;

    stopLoop();

    if (executionState === "stopped") {
      // Reset state
      setData({
        iteration: 0,
        values: new Float64Array(
          currentModel.outputShape[currentModel.outputShape.length - 1] || 256
        ),
        time: 0,
      });
      setCurrentIteration(0);
      setError("");
      setInitProgress({ stage: "Starting initialization...", progress: 0 });

      try {
        const initialized = await initializeModel(handleInitProgress);
        if (!initialized) return;

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
    currentModel,
    currentAdapter,
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
    cleanup();
    setExecutionState("stopped");
    setCurrentIteration(0);
    setError("");
    setInitProgress(null);
  }, [stopLoop, cleanup, stateRef]);

  const handleResume = useCallback(() => {
    if (executionState === "paused") {
      stateRef.current.shouldPause = false;
      stateRef.current.isPaused = false;
      setExecutionState("running");
      startLoop(stateRef, handleDataUpdate, handleError, setExecutionState);
    }
  }, [executionState, startLoop, stateRef, handleDataUpdate, handleError]);

  const handleTimeStepChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTimeStep(parseFloat(e.target.value));
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLoop();
      cleanup();
    };
  }, [stopLoop, cleanup]);

  if (!currentModel || !currentAdapter) {
    return <div>Error: Model not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <h2 className="text-2xl font-bold mb-6">Modular Simulation Framework</h2>

      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <ModelSelector
          models={modelRegistry.getAllModels()}
          selectedModel={selectedModelId}
          onModelChange={handleModelChange}
          disabled={executionState !== "stopped"}
        />

        <div className="mb-4 text-sm">
          <strong>Status:</strong> {executionState} |
          <strong> Iteration:</strong> {currentIteration} |
          <strong> Data Points:</strong> {data.values.length} |
          <strong> Time:</strong> {data.time.toFixed(6)}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="mb-4 space-x-2">
          {executionState === "stopped" && (
            <button
              onClick={handleRun}
              className="bg-green-600 text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium"
            >
              Run
            </button>
          )}
          {executionState === "running" && (
            <button
              onClick={handlePause}
              className="bg-yellow-500 text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium"
            >
              Pause
            </button>
          )}
          {executionState === "paused" && (
            <button
              onClick={handleResume}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium"
            >
              Resume
            </button>
          )}
          {(executionState === "running" || executionState === "paused") && (
            <button
              onClick={handleStop}
              className="bg-red-600 text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium"
            >
              Stop
            </button>
          )}
        </div>

        <label className="block mb-2 text-sm">
          <strong>Time Step (dt):</strong> {timeStep.toFixed(6)}
        </label>
        <input
          type="range"
          min={currentModel.timeStepRange[0]}
          max={currentModel.timeStepRange[1]}
          step={currentModel.timeStepRange[0]}
          value={timeStep}
          onChange={handleTimeStepChange}
          disabled={executionState === "running"}
          className={`w-full transition-opacity ${
            executionState === "running"
              ? "opacity-50 cursor-not-allowed"
              : "opacity-100"
          }`}
        />
      </div>

      {initProgress && (
        <ModelInitializationProgress
          stage={initProgress.stage}
          progress={initProgress.progress}
        />
      )}

      <Suspense fallback={<ChartLoadingPlaceholder />}>
        <SimulationChart chartData={chartData} />
      </Suspense>

      <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h4 className="text-md font-semibold mb-2">Model Information</h4>
        <div className="text-sm text-gray-300">
          <p>
            <strong>Model:</strong> {currentModel.name}
          </p>
          <p>
            <strong>Description:</strong> {currentModel.description}
          </p>
          <p>
            <strong>Input Shape:</strong> [{currentModel.inputShape.join(", ")}]
          </p>
          <p>
            <strong>Output Shape:</strong> [
            {currentModel.outputShape.join(", ")}]
          </p>
          <p>
            <strong>Time Step Range:</strong> {currentModel.timeStepRange[0]} -{" "}
            {currentModel.timeStepRange[1]}
          </p>
          {data.metadata && (
            <p>
              <strong>Metadata:</strong> {JSON.stringify(data.metadata)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
