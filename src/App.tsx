import { useState, useRef } from 'react';
import * as ort from 'onnxruntime-web';
import Npyjs from 'npyjs';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from 'recharts';

interface IterationData {
  iteration: number;
  var_3: number;
  var_4: number;
}

type ExecutionState = 'stopped' | 'running' | 'paused';

export default function App() {
  const [data, setData] = useState<IterationData[]>([]);
  const [freq, setFreq] = useState(0.001);
  const [executionState, setExecutionState] = useState<ExecutionState>('stopped');
  const [currentIteration, setCurrentIteration] = useState(0);

  const stateRef = useRef({
    session: null as ort.InferenceSession | null,
    var_0: null as ort.TypedTensor<'float64'> | null,
    var_1: null as ort.TypedTensor<'float64'> | null,
    var_2: null as ort.TypedTensor<'float64'> | null,
    iteration: 0,
    shouldStop: false,
    shouldPause: false,
  });

  const initializeModel = async (): Promise<boolean> => {
    try {
      const npy = new Npyjs();
      const npyBuffer = await (await fetch('/feed_forward_data.npy')).arrayBuffer();
      const npyData = await npy.parse(npyBuffer);
      const inputArray = new Float64Array(npyData.data);

      stateRef.current.var_0 = new ort.Tensor('float64', inputArray, npyData.shape);
      stateRef.current.var_1 = new ort.Tensor('float64', new Float64Array([0.0]), [1]);
      stateRef.current.session = await ort.InferenceSession.create('/feed_forward.onnx');

      return true;
    } catch (err) {
      console.error('Initialization error:', err);
      return false;
    }
  };

  const runInference = async () => {
    const state = stateRef.current;

    if (!state.session || !state.var_0 || !state.var_1) {
      if (!(await initializeModel())) return;
    }

    state.var_2 = new ort.Tensor('float64', new Float64Array([freq]), [1]);
    state.shouldStop = false;
    state.shouldPause = false;

    while (!state.shouldStop) {
      if (state.shouldPause) {
        setExecutionState('paused');
        return;
      }

      try {
        const output = await state.session!.run({
          var_0: state.var_0!,
          var_1: state.var_1!,
          var_2: state.var_2!,
        });

        const var_3 = (output['var_3'].data as Float64Array)[0];
        const var_4 = (output['var_4'].data as Float64Array)[0];

        setData(prev => [...prev.slice(-49), {
          iteration: state.iteration + 1,
          var_3,
          var_4,
        }]);

        state.var_0 = output['var_3'] as ort.TypedTensor<'float64'>;
        state.var_1 = output['var_4'] as ort.TypedTensor<'float64'>;
        state.iteration++;

        setCurrentIteration(state.iteration);
        await new Promise(res => setTimeout(res, 50));
      } catch (err) {
        console.error('Inference error:', err);
        break;
      }
    }

    setExecutionState('stopped');
  };

  const handleRun = async () => {
    if (executionState === 'stopped') {
      Object.assign(stateRef.current, {
        var_0: null,
        var_1: null,
        session: null,
        iteration: 0,
      });
      setData([]);
      setCurrentIteration(0);
    }

    setExecutionState('running');
    await runInference();
  };

  const handlePause = () => executionState === 'running' && (stateRef.current.shouldPause = true);

  const handleStop = () => {
    Object.assign(stateRef.current, {
      shouldStop: true,
      shouldPause: false,
      iteration: 0,
    });
    setExecutionState('stopped');
    setCurrentIteration(0);
  };

  const handleResume = async () => {
    if (executionState === 'paused') {
      stateRef.current.var_2 = new ort.Tensor('float64', new Float64Array([freq]), [1]);
      setExecutionState('running');
      await runInference();
    }
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFreq = parseFloat(e.target.value);
    setFreq(newFreq);

    if (executionState === 'paused') {
      stateRef.current.var_2 = new ort.Tensor('float64', new Float64Array([newFreq]), [1]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <h2 className="text-2xl font-bold mb-6">ONNX Inference Results (Step-by-Step in Browser)</h2>

      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="mb-4 text-sm">
          <strong>Status:</strong> {executionState} | <strong>Iteration:</strong> {currentIteration}
        </div>

        <div className="mb-4 space-x-2">
          {executionState === 'stopped' && <Button onClick={handleRun} color="bg-green-600" label="Run" />}
          {executionState === 'running' && <Button onClick={handlePause} color="bg-yellow-500" label="Pause" />}
          {executionState === 'paused' && <Button onClick={handleResume} color="bg-blue-600" label="Resume" />}
          {(executionState === 'running' || executionState === 'paused') &&
            <Button onClick={handleStop} color="bg-red-600" label="Stop" />}
        </div>

        <label className="block mb-2 text-sm">
          <strong>Frequency:</strong> {freq}
          {executionState === 'running' && ' (change takes effect on next run)'}
        </label>
        <input
          type="range"
          min="0.0001"
          max="0.005"
          step="0.0001"
          value={freq}
          onChange={handleFrequencyChange}
          disabled={executionState === 'running'}
          className={`w-full transition-opacity ${executionState === 'running' ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
        />
      </div>

      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="iteration" stroke="#e0e0e0" tick={{ fill: '#e0e0e0' }} />
            <YAxis stroke="#e0e0e0" tick={{ fill: '#e0e0e0' }} />
            <Tooltip contentStyle={{ backgroundColor: '#3d3d3d', border: 'none', borderRadius: 4, color: '#fff' }} />
            <Legend wrapperStyle={{ color: '#e0e0e0' }} />
            <Line type="monotone" dataKey="var_3" name="var_3[0]" stroke="#8884d8" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const Button = ({ onClick, color, label }: { onClick: () => void; color: string; label: string }) => (
  <button
    onClick={onClick}
    className={`${color} text-white py-2 px-4 rounded hover:opacity-90 transition-colors`}
  >
    {label}
  </button>
);
