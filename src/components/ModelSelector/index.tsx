import React, { useMemo } from "react";
import { type ModelConfig } from "../../types/SimulationTypes";

// Reusable SelectField component
interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  placeholder,
}) => (
  <div className="flex-1">
    <label className="block mb-2 text-sm font-medium text-gray-200">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                   transition-colors duration-200"
    >
      {options.length > 0 ? (
        options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))
      ) : (
        <option value="" disabled>
          {placeholder || "No options available"}
        </option>
      )}
    </select>
  </div>
);

interface ModelSelectorProps {
  models: ModelConfig[];
  selectedModel: string;
  selectedData: string;
  onModelChange: (modelId: string) => void;
  onDataChange: (dataPath: string) => void;
  onDataYAxisDomainChange: (yAxisDomain: [number, number]) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  selectedData,
  onModelChange,
  onDataChange,
  onDataYAxisDomainChange,
  disabled = false,
}) => {
  // Memoize the selected model to avoid repeated finds
  const currentModel = useMemo(
    () => models.find((model) => model.id === selectedModel),
    [models, selectedModel]
  );

  // Memoize available data options
  const dataOptions = useMemo(() => {
    return currentModel?.datas || [];
  }, [currentModel]);

  const handleDataChange = (dataPath: string) => {
    onDataChange(dataPath);
    // Find the selected data configuration and update Y-axis domain
    const selectedDataConfig = dataOptions.find(
      (data) => data.path === dataPath
    );
    if (selectedDataConfig) {
      onDataYAxisDomainChange(selectedDataConfig.yAxisDomain || [-0.25, 1.25]);
    }
  };

  const modelOptions = models.map((model) => ({
    value: model.id,
    label: `${model.name} - ${model.description}`,
  }));

  const dataSelectOptions = dataOptions.map((data) => ({
    value: data.path,
    label: data.name,
  }));

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <SelectField
        label="Select Model"
        value={selectedModel}
        onChange={onModelChange}
        options={modelOptions}
        disabled={disabled}
      />
      <div className="sm:ml-4">
        <SelectField
          label="Select Data"
          value={selectedData}
          onChange={handleDataChange}
          options={dataSelectOptions}
          disabled={disabled || !selectedModel}
          placeholder="Select a model first"
        />
      </div>
    </div>
  );
};
