import React, { useMemo } from "react";
import {
  MODEL_FAMILIES,
  getModelFamilies,
  getModelVariantsByFamily,
  getModelDataByFamily,
} from "../../config/models";
import {
  HiCubeTransparent,
  HiDocumentDuplicate,
  HiChevronDown,
  HiCog6Tooth,
} from "react-icons/hi2";

// Reusable SelectField component
interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps & { icon?: React.ReactNode }> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  placeholder,
  icon,
}) => (
  <div className="flex-1 relative">
    <label className="flex items-center gap-1 mb-1 text-xs font-medium text-gray-300 tracking-tight">
      {icon}
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full pr-8 pl-2 py-1 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-md text-white text-sm shadow-sm
           disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400
           focus-visible:ring-2 focus-visible:ring-blue-400 focus:border-blue-500 focus:outline-none
           transition duration-150 appearance-none`}
        style={{ fontFamily: "inherit" }}
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
      <HiChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  </div>
);

interface ModelSelectorProps {
  selectedModel: string;
  selectedData: string;
  onModelChange: (modelId: string) => void;
  onDataChange: (dataPath: string) => void;
  onDataYAxisDomainChange: (yAxisDomain: [number, number]) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  selectedData,
  onModelChange,
  onDataChange,
  onDataYAxisDomainChange,
  disabled = false,
}) => {
  // Determine which family the current model belongs to
  const currentFamily = useMemo(() => {
    for (const [familyId, family] of Object.entries(MODEL_FAMILIES)) {
      if (family.variants.some((variant) => variant.id === selectedModel)) {
        return familyId;
      }
    }
    return getModelFamilies()[0]; // Default to first family if not found
  }, [selectedModel]);

  // Get available data options for the current family
  const dataOptions = useMemo(() => {
    if (!currentFamily) return [];
    return getModelDataByFamily(currentFamily);
  }, [currentFamily]);

  // Handle family change
  const handleFamilyChange = (familyId: string) => {
    const variants = getModelVariantsByFamily(familyId);
    if (variants.length > 0) {
      // Select the first variant of the new family
      onModelChange(variants[0].id);
    }
  };

  // Handle model variant change
  const handleModelVariantChange = (modelId: string) => {
    onModelChange(modelId);
  };

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

  // Create family options
  const familyOptions = useMemo(() => {
    return getModelFamilies().map((familyId) => {
      const family = MODEL_FAMILIES[familyId];
      return {
        value: familyId,
        label: family.config.name,
      };
    });
  }, []);

  // Create model variant options for the current family
  const modelVariantOptions = useMemo(() => {
    if (!currentFamily) return [];
    return getModelVariantsByFamily(currentFamily).map((variant) => ({
      value: variant.id,
      label: variant.name,
    }));
  }, [currentFamily]);

  // Create data options for the current family
  const dataSelectOptions = useMemo(() => {
    return dataOptions.map((data) => ({
      value: data.path,
      label: data.name,
    }));
  }, [dataOptions]);

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-2">
      <SelectField
        label="Model Family"
        value={currentFamily || ""}
        onChange={handleFamilyChange}
        options={familyOptions}
        disabled={disabled}
        icon={<HiCubeTransparent className="w-4 h-4 text-blue-400" />}
      />
      <SelectField
        label="Model Variant"
        value={selectedModel}
        onChange={handleModelVariantChange}
        options={modelVariantOptions}
        disabled={disabled || !currentFamily}
        placeholder="Select a family first"
        icon={<HiCog6Tooth className="w-4 h-4 text-purple-400" />}
      />
      <SelectField
        label="Select Data"
        value={selectedData}
        onChange={handleDataChange}
        options={dataSelectOptions}
        disabled={disabled || !selectedModel}
        placeholder="Select a model first"
        icon={<HiDocumentDuplicate className="w-4 h-4 text-green-400" />}
      />
    </div>
  );
};
