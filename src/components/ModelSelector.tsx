import React from "react";
import { type ModelConfig } from "../types/SimulationTypes";

interface ModelSelectorProps {
  models: ModelConfig[];
  selectedModel: string;
  selectedData: string;
  onModelChange: (modelId: string) => void;
  onDataChange: (dataPath: string) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  selectedData,
  onModelChange,
  onDataChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-row mb-4">
      <div className="flex-1 mr-4">
        <label className="block mb-2 text-sm font-medium">
          <strong>Select Model:</strong>
        </label>
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={disabled}
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white disabled:opacity-50"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} - {model.description}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className="block mb-2 text-sm font-medium">
          <strong>Select Data:</strong>
        </label>
        <select
          value={selectedData}
          onChange={(e) => onDataChange(e.target.value)}
          disabled={disabled || !selectedModel}
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white disabled:opacity-50"
        >
          {models
            .find((model) => model.id === selectedModel)
            ?.datas?.map((data) => (
              <option key={data.path} value={data.path}>
                {data.name}
              </option>
            )) || (
            <option value="" disabled>
              No data available
            </option>
          )}
        </select>
      </div>
    </div>
  );
};
