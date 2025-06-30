// App.tsx

import { useState, useRef, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import * as ort from "onnxruntime-web";
import Npyjs from "npyjs";

interface IterationData {
  iteration: number;
  values: Float64Array;
  time: number;
}

type ExecutionState = "stopped" | "running" | "paused";

interface SimulationState {
  session: ort.InferenceSession | null;
  currentData: Float64Array | null;
  currentTime: number;
  iteration: number;
  shouldStop: boolean;
  shouldPause: boolean;
  isInitialized: boolean;
}

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
  const animationFrameRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stateRef = useRef<SimulationState>({
    session: null,
    currentData: null,
    currentTime: 0,
    iteration: 0,
    shouldStop: false,
    shouldPause: false,
    isInitialized: false,
  });

  useEffect(() => {
    if (executionState === "running") {
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [executionState]);

  const initializeModel = useCallback(async (): Promise<boolean> => {
    try {
      setError("");

      const npy = new Npyjs();
      const npyBuffer = await (
        await fetch("/jaxfluids-feed-forward/feed_forward_data.npy")
      ).arrayBuffer();
      const npyData = npy.parse(npyBuffer);
      const inputArray = new Float64Array(npyData.data);

      const session = await ort.InferenceSession.create(
        "/jaxfluids-feed-forward/feed_forward.onnx"
      );

      stateRef.current.session = session;
      stateRef.current.currentData = inputArray;
      stateRef.current.currentTime = 0;
      stateRef.current.iteration = 0;
      stateRef.current.isInitialized = true;

      return true;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Unknown initialization error";
      setError(`Initialization failed: ${errorMsg}`);
      console.error("Initialization error:", err);
      return false;
    }
  }, []);

  const runSingleIteration = useCallback(async (): Promise<boolean> => {
    const state = stateRef.current;

    if (!state.session || !state.currentData || !state.isInitialized) {
      setError("Model not initialized");
      return false;
    }

    try {
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

      state.currentData = new Float64Array(newData);
      state.currentTime = newTime;
      state.iteration++;

      const firstChannelData = newData.slice(0, 256);

      setCurrentIteration(state.iteration);
      setData({
        iteration: state.iteration,
        values: firstChannelData,
        time: newTime,
      });

      return true;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Unknown inference error";
      setError(`Inference failed: ${errorMsg}`);
      console.error("Inference error:", err);
      return false;
    }
  }, [freq]);

  const runSimulationLoop = useCallback(async () => {
    const state = stateRef.current;

    const iterate = async () => {
      if (state.shouldStop) {
        setExecutionState("stopped");
        return;
      }

      if (state.shouldPause) {
        setExecutionState("paused");
        return;
      }

      const success = await runSingleIteration();
      if (!success) {
        setExecutionState("stopped");
        return;
      }

      timeoutRef.current = setTimeout(iterate, 10);
    };

    await iterate();
  }, [runSingleIteration]);

  const handleRun = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (executionState === "stopped") {
      stateRef.current = {
        session: null,
        currentData: null,
        currentTime: 0,
        iteration: 0,
        shouldStop: false,
        shouldPause: false,
        isInitialized: false,
      };
      setData({
        iteration: 0,
        values: new Float64Array(256),
        time: 0,
      });
      setCurrentIteration(0);
      setError("");

      const initialized = await initializeModel();
      if (!initialized) {
        return;
      }
    }

    stateRef.current.shouldStop = false;
    stateRef.current.shouldPause = false;
    setExecutionState("running");
    await runSimulationLoop();
  };

  const handlePause = () => {
    if (executionState === "running") {
      stateRef.current.shouldPause = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const handleStop = () => {
    stateRef.current.shouldStop = true;
    stateRef.current.shouldPause = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setExecutionState("stopped");
    setCurrentIteration(0);
    setError("");
  };

  const handleResume = async () => {
    if (executionState === "paused") {
      stateRef.current.shouldPause = false;
      setExecutionState("running");
      await runSimulationLoop();
    }
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFreq(parseFloat(e.target.value));
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const chartData = Array.from(data.values).map((v, i) => ({
    index: i,
    value: v,
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <h2 className="text-2xl font-bold mb-6">
        ONNX Inference Results (TypeScript)
      </h2>

      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="mb-4 text-sm">
          <strong>Status:</strong> {executionState} |{" "}
          <strong>Iteration:</strong> {currentIteration} |{" "}
          <strong>Data Points:</strong> {data.values.length}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="mb-4 space-x-2">
          {executionState === "stopped" && (
            <Button onClick={handleRun} color="bg-green-600" label="Run" />
          )}
          {executionState === "running" && (
            <Button onClick={handlePause} color="bg-yellow-500" label="Pause" />
          )}
          {executionState === "paused" && (
            <Button onClick={handleResume} color="bg-blue-600" label="Resume" />
          )}
          {(executionState === "running" || executionState === "paused") && (
            <Button onClick={handleStop} color="bg-red-600" label="Stop" />
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
          onChange={handleFrequencyChange}
          disabled={executionState === "running"}
          className={`w-full transition-opacity ${
            executionState === "running"
              ? "opacity-50 cursor-not-allowed"
              : "opacity-100"
          }`}
        />
      </div>

      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Simulation Results</h3>
        <ResponsiveContainer width="100%" height={500}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis
              dataKey="index"
              stroke="#e0e0e0"
              tick={{ fill: "#e0e0e0", fontSize: 12 }}
              interval={9} // Show every 10th tick (assuming sequential indices)
              tickFormatter={(value) => value.toString()}
              tickLine={false}
              axisLine={{ stroke: "#777" }}
              angle={-45}
              textAnchor="end"
              height={60}
              label={{
                value: "Index",
                position: "insideBottom",
                offset: -40,
                fill: "#e0e0e0",
                fontSize: 14,
              }}
            />
            <YAxis
              stroke="#e0e0e0"
              tick={{ fill: "#e0e0e0" }}
              label={{
                value: "Value",
                angle: -90,
                position: "insideLeft",
                fill: "#e0e0e0",
                fontSize: 14,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#3d3d3d",
                border: "none",
                borderRadius: 4,
                color: "#fff",
              }}
              formatter={(value: number) => value.toFixed(6)}
              labelFormatter={(label) => `Index: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#82ca9d"
              dot={false}
              strokeWidth={2}
            />
            <Legend wrapperStyle={{ color: "#e0e0e0" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h4 className="text-md font-semibold mb-2">Current State</h4>
        <div className="text-sm text-gray-300">
          <p>
            <strong>Current Time:</strong>{" "}
            {stateRef.current.currentTime.toFixed(6)}
          </p>
          <p>
            <strong>Initialized:</strong>{" "}
            {stateRef.current.isInitialized ? "Yes" : "No"}
          </p>
          {stateRef.current.currentData && (
            <p>
              <strong>Data Shape:</strong> [5, 256] (
              {stateRef.current.currentData.length} elements)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const Button: React.FC<{
  onClick: () => void;
  color: string;
  label: string;
}> = ({ onClick, color, label }) => (
  <button
    onClick={onClick}
    className={`${color} text-white py-2 px-4 rounded hover:opacity-90 transition-colors font-medium`}
  >
    {label}
  </button>
);
