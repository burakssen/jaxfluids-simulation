import React, { useMemo, useCallback, useEffect, useRef } from "react";
import { ModelRegistry } from "./models/ModelRegistry";
import { FeedForwardAdapter } from "./models/adapters/FeedForwardAdapter";
import { useSimulationState } from "./hooks/useSimulationState";
import { useSimulationController } from "./hooks/useSimulationController";
import { useChartData } from "./hooks/useChartData";
import { ModelSelector } from "./components/ModelSelector";
import { SimulationControls } from "./components/SimulationControls";
import { SimulationResults } from "./components/SimulationResults";
import { MODEL_CONFIGS, DEFAULT_MODEL_ID } from "./config/models";

const modelRegistry = new ModelRegistry();

MODEL_CONFIGS.forEach((config) => {
  modelRegistry.registerModel(config, new FeedForwardAdapter());
});

export default function App() {
  const [state, actions] = useSimulationState(DEFAULT_MODEL_ID, 0.001);
  const userChangedTimeStep = useRef(false);
  const previousModelId = useRef(state.selectedModelId);
  const isInitialRender = useRef(true);

  React.useEffect(() => {
    if (!state.selectedDataPath) {
      const defaultModel = modelRegistry.getModel(DEFAULT_MODEL_ID);
      const firstData = defaultModel?.datas?.[0]?.path;
      if (firstData) {
        actions.setSelectedDataPath(firstData);
      }
    }
  }, []);

  const currentModel = useMemo(
    () => modelRegistry.getModel(state.selectedModelId),
    [state.selectedModelId]
  );
  const currentAdapter = useMemo(
    () => modelRegistry.getAdapter(state.selectedModelId),
    [state.selectedModelId]
  );

  const controller = useSimulationController({
    currentModel: currentModel!,
    dataPath: state.selectedDataPath,
    currentAdapter: currentAdapter!,
    timeStep: state.timeStep,
    onDataUpdate: actions.setData,
    onError: actions.setError,
    onStateChange: actions.setExecutionState,
    onInitProgress: actions.setInitProgress,
  });

  const chartData = useChartData(
    state.data.values,
    currentModel?.spatialRange || [0, 2]
  );

  const channelLabels = useMemo(() => {
    if (!currentModel) return [];

    return currentModel.channels.map((ch) => {
      const label = currentModel.channelLabels?.[ch];
      return label ? label : `Channel ${ch}`;
    });
  }, [currentModel]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      previousModelId.current = state.selectedModelId;
      return;
    }

    if (previousModelId.current !== state.selectedModelId) {
      console.log(
        `Model changed from ${previousModelId.current} to ${state.selectedModelId}`
      );

      if (currentModel) {
        const newTimeStep = currentModel.defaultTimeStep;
        console.log(`Setting time step to model default: ${newTimeStep}`);
        actions.setTimeStep(newTimeStep);
      }

      userChangedTimeStep.current = false;
      previousModelId.current = state.selectedModelId;
    }
  }, [state.selectedModelId, currentModel, actions]);

  const handleModelChange = useCallback(
    (modelId: string) => {
      console.log(`handleModelChange called with: ${modelId}`);

      if (modelId === state.selectedModelId) {
        console.log(`Model ${modelId} already selected`);
        return;
      }

      if (state.executionState !== "stopped") {
        controller.handleStop();
      }

      actions.resetData();

      actions.setSelectedModelId(modelId);

      const newModel = modelRegistry.getModel(modelId);
      const firstData = newModel?.datas?.[0]?.path || "";
      actions.setSelectedDataPath(firstData);
    },
    [state.selectedModelId, state.executionState, controller, actions]
  );

  const handleDataChange = useCallback(
    (dataPath: string) => {
      console.log(`handleDataChange called with: ${dataPath}`);

      if (dataPath === state.selectedDataPath) {
        console.log(`Data ${dataPath} already selected`);
        return;
      }

      if (state.executionState !== "stopped") {
        controller.handleStop();
      }

      actions.resetData();
      actions.setSelectedDataPath(dataPath);
    },
    [state.selectedDataPath, state.executionState, controller, actions]
  );

  // Handle time step change
  const handleTimeStepChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTimeStep = parseFloat(e.target.value);
      if (!isNaN(newTimeStep) && newTimeStep > 0) {
        console.log(`User manually changed time step to: ${newTimeStep}`);
        actions.setTimeStep(newTimeStep);
        userChangedTimeStep.current = true;
      }
    },
    [actions]
  );

  // Handle pause request
  const handlePause = useCallback(() => {
    actions.setPauseRequested(true);
    controller.handlePause();
  }, [actions, controller]);

  // Handle resume
  const handleResume = useCallback(() => {
    controller.handleResume();
  }, [controller]);

  // Handle stop
  const handleStop = useCallback(() => {
    controller.handleStop();
    actions.resetToStopped();
  }, [controller, actions]);

  if (!currentModel || !currentAdapter) {
    return <div>Error: Model not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">
          Modular Simulation Framework
        </h2>

        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
          <ModelSelector
            models={modelRegistry.getAllModels()}
            selectedModel={state.selectedModelId}
            selectedData={state.selectedDataPath || ""}
            onModelChange={handleModelChange}
            onDataChange={handleDataChange}
            disabled={state.executionState === "running"}
          />

          {state.error && (
            <div className="p-3 bg-red-900 border border-red-700 rounded text-red-200 mb-4">
              <strong>Error:</strong> {state.error}
            </div>
          )}

          <SimulationControls
            executionState={state.executionState}
            pauseRequested={state.pauseRequested}
            timeStep={state.timeStep}
            timeStepRange={currentModel.timeStepRange}
            onRun={controller.handleRun}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onTimeStepChange={handleTimeStepChange}
            currentIteration={state.currentIteration}
            dataLength={state.data.values.length}
            time={state.data.time}
            initProgress={state.initProgress}
          />
        </div>

        <SimulationResults
          chartData={chartData}
          channelLabels={channelLabels}
          hasData={state.data.values.length > 0}
        />
      </div>
    </div>
  );
}
