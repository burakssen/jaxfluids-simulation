import {
  type ModelFamily,
  type ModelConfig,
  type ModelData,
  type ModelVariant,
} from "../types/SimulationTypes";

// Model families organized by type
export const MODEL_FAMILIES: Record<string, ModelFamily> = {
  linear_advection: {
    config: {
      id: "linear_advection",
      name: "Linear Advection",
      description: "Basic linear advection equation models",
      spatialRange: [0, 2],
      channels: [0],
      channelLabels: ["Channel 0"],
      adapterType: "feedforward",
    },
    variants: [
      {
        id: "linear_advection_v1",
        name: "Model v1",
        description: "Basic model",
        modelPath: "/models/linear_advection_v1/model_slim.onnx",
        inputShape: [5, 256, 1, 1],
        outputShape: [5, 256, 1, 1],
        timeStepRange: [0.0001, 0.005],
        defaultTimeStep: 0.001,
      },
      {
        id: "linear_advection_v2",
        name: "Model v2",
        description: "Basic Linear Advection Model",
        modelPath: "/models/linear_advection_v2/model_slim.onnx",
        inputShape: [5, 256, 1, 1],
        outputShape: [5, 256, 1, 1],
        timeStepRange: [0.0001, 0.001],
        defaultTimeStep: 0.0001,
      },
    ],
    data: [
      {
        path: "/models/linear_advection_v1/data.npy",
        name: "Data v1",
        yAxisDomain: [0.0, 2.75],
      },
      {
        path: "/models/linear_advection_v2/data.npy",
        name: "Data v2",
        yAxisDomain: [-0.25, 1.25],
      },
    ],
  },

  sod_shock_tube: {
    config: {
      id: "sod_shock_tube",
      name: "Sod Shock Tube",
      description:
        "Sod shock tube simulation models with different WENO schemes",
      spatialRange: [0, 1],
      channels: [0, 1, 4],
      channelLabels: ["Density", "Velocity", "", "", "Pressure"],
      adapterType: "feedforward",
    },
    variants: [
      {
        id: "sod_shock_tube_weno5z",
        name: "WENO5-Z",
        description: "WENO5-Z scheme implementation",
        modelPath: "/models/sod_shock_tube/weno5-z/model_slim.onnx",
        inputShape: [5, 200, 1, 1],
        outputShape: [5, 200, 1, 1],
        timeStepRange: [0.0001, 0.001],
        defaultTimeStep: 0.0001,
      },
      {
        id: "sod_shock_tube_weno5js",
        name: "WENO5-JS",
        description: "WENO5-JS scheme implementation",
        modelPath: "/models/sod_shock_tube/weno5-js/model.onnx",
        inputShape: [5, 200, 1, 1],
        outputShape: [5, 200, 1, 1],
        timeStepRange: [0.0001, 0.001],
        defaultTimeStep: 0.0001,
      },
      {
        id: "sod_shock_tube_weno3js",
        name: "WENO3-JS",
        description: "WENO3-JS scheme implementation",
        modelPath: "/models/sod_shock_tube/weno3-js/model.onnx",
        inputShape: [5, 200, 1, 1],
        outputShape: [5, 200, 1, 1],
        timeStepRange: [0.0001, 0.001],
        defaultTimeStep: 0.0001,
      },
    ],
    data: [
      {
        path: "/models/sod_shock_tube/data/data_v1.npy",
        name: "Data v1",
        yAxisDomain: [-0.25, 1.25],
      },
      {
        path: "/models/sod_shock_tube/data/data_v2.npy",
        name: "Data v2",
        yAxisDomain: [-0.5, 2.5],
      },
      {
        path: "/models/sod_shock_tube/data/data_v3.npy",
        name: "Data v3",
        yAxisDomain: [-5.0, 105.0],
      },
      {
        path: "/models/sod_shock_tube/data/data_v4.npy",
        name: "Data v4",
        yAxisDomain: [-0.25, 1.25],
      },
      {
        path: "/models/sod_shock_tube/data/data_v5.npy",
        name: "Data v5",
        yAxisDomain: [-0.25, 1.25],
      },
    ],
  },
};

// Helper functions to work with the new structure
export function getAllModelConfigs(): ModelConfig[] {
  const configs: ModelConfig[] = [];

  Object.values(MODEL_FAMILIES).forEach((family) => {
    family.variants.forEach((variant) => {
      const config: ModelConfig = {
        id: variant.id,
        name: variant.name,
        description: variant.description,
        modelPath: variant.modelPath,
        datas: family.data,
        inputShape: variant.inputShape,
        outputShape: variant.outputShape,
        timeStepRange: variant.timeStepRange,
        defaultTimeStep: variant.defaultTimeStep,
        spatialRange: family.config.spatialRange,
        channels: family.config.channels,
        channelLabels: family.config.channelLabels,
        adapterType: family.config.adapterType,
      };
      configs.push(config);
    });
  });

  return configs;
}

export function getModelFamilies(): string[] {
  return Object.keys(MODEL_FAMILIES);
}

export function getModelVariantsByFamily(familyId: string): ModelVariant[] {
  return MODEL_FAMILIES[familyId]?.variants || [];
}

export function getModelDataByFamily(familyId: string): ModelData[] {
  return MODEL_FAMILIES[familyId]?.data || [];
}

export function getModelConfigById(modelId: string): ModelConfig | undefined {
  return getAllModelConfigs().find((config) => config.id === modelId);
}

// Backward compatibility - exports the same structure as before
export const MODEL_CONFIGS: ModelConfig[] = getAllModelConfigs();

export const DEFAULT_MODEL_ID = "linear_advection_v1";
