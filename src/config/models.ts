import { type ModelConfig } from "../types/SimulationTypes";

export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: "linear_advection_v1",
    name: "Liner Advection Model v1",
    description: "Basic model",
    modelPath:
      "/jaxfluids-feed-forward/models/linear_advection_v1/model_slim.onnx",
    datas: [
      {
        path: "/jaxfluids-feed-forward/models/linear_advection_v1/data.npy",
        name: "Linear Advection Data",
      },
    ],
    inputShape: [5, 256, 1, 1],
    outputShape: [5, 256, 1, 1],
    timeStepRange: [0.0001, 0.005],
    defaultTimeStep: 0.001,
    spatialRange: [0, 2],
    channels: [0],
    channelLabels: ["Channel 0"],
  },
  {
    id: "linear_advection_v2",
    name: "Liner Advection Model v2",
    description: "Basic Linear Advection Model",
    modelPath:
      "/jaxfluids-feed-forward/models/linear_advection_v2/model_slim.onnx",
    datas: [
      {
        path: "/jaxfluids-feed-forward/models/linear_advection_v2/data.npy",
        name: "Linear Advection Data",
      },
    ],
    inputShape: [5, 256, 1, 1],
    outputShape: [5, 256, 1, 1],
    timeStepRange: [0.0001, 0.001],
    defaultTimeStep: 0.0001,
    spatialRange: [0, 2],
    channels: [0],
    channelLabels: ["Channel 0"],
  },
  {
    id: "sod_shock_tube",
    name: "Sod Shock Tube",
    description: "Sod Shock Tube Model",
    modelPath: "/jaxfluids-feed-forward/models/sod_shock_tube/model_slim.onnx",
    datas: [
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v1.npy",
        name: "Sod Shock Tube Data v1",
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v2.npy",
        name: "Sod Shock Tube Data v2",
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v3.npy",
        name: "Sod Shock Tube Data v3",
      },
    ],
    inputShape: [5, 200, 1, 1],
    outputShape: [5, 200, 1, 1],
    timeStepRange: [0.0001, 0.001],
    defaultTimeStep: 0.0001,
    spatialRange: [0, 1],
    channels: [0, 1, 4],
    channelLabels: ["Density", "Velocity", "", "", "Pressure"],
  },
];

export const DEFAULT_MODEL_ID = "linear_advection_v1";
