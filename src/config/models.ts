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
        yAxisDomain: [0.0, 2.75],
      },
    ],
    inputShape: [5, 256, 1, 1],
    outputShape: [5, 256, 1, 1],
    timeStepRange: [0.0001, 0.005],
    defaultTimeStep: 0.001,
    spatialRange: [0, 2],
    channels: [0],
    channelLabels: ["Channel 0"],
    adapterType: "feedforward",
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
        yAxisDomain: [-0.25, 1.25],
      },
    ],
    inputShape: [5, 256, 1, 1],
    outputShape: [5, 256, 1, 1],
    timeStepRange: [0.0001, 0.001],
    defaultTimeStep: 0.0001,
    spatialRange: [0, 2],
    channels: [0],
    channelLabels: ["Channel 0"],
    adapterType: "feedforward",
  },
  {
    id: "sod_shock_tube",
    name: "Sod Shock Tube WENO5-Z",
    description: "Sod Shock Tube Model",
    modelPath:
      "/jaxfluids-feed-forward/models/sod_shock_tube/weno5-z/model_slim.onnx",
    datas: [
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v1.npy",
        name: "Sod Shock Tube Data v1",
        yAxisDomain: [-0.25, 1.25],
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v2.npy",
        name: "Sod Shock Tube Data v2",
        yAxisDomain: [-0.5, 2.5],
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v3.npy",
        name: "Sod Shock Tube Data v3",
        yAxisDomain: [-5.0, 105.0],
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v4.npy",
        name: "Sod Shock Tube Data v4",
        yAxisDomain: [-0.25, 1.25],
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v5.npy",
        name: "Sod Shock Tube Data v5",
        yAxisDomain: [-0.25, 1.25],
      },
    ],
    inputShape: [5, 200, 1, 1],
    outputShape: [5, 200, 1, 1],
    timeStepRange: [0.0001, 0.001],
    defaultTimeStep: 0.0001,
    spatialRange: [0, 1],
    channels: [0, 1, 4],
    channelLabels: ["Density", "Velocity", "", "", "Pressure"],
    adapterType: "feedforward",
  },
  {
    id: "sod_shock_tube_v2",
    name: "Sod Shock Tube WENO5-JS",
    description: "Sod Shock Tube Model",
    modelPath:
      "/jaxfluids-feed-forward/models/sod_shock_tube/weno5-js/model.onnx",
    datas: [
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v1.npy",
        name: "Sod Shock Tube Data v1",
        yAxisDomain: [-0.25, 1.25],
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v2.npy",
        name: "Sod Shock Tube Data v2",
        yAxisDomain: [-0.5, 2.5],
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v3.npy",
        name: "Sod Shock Tube Data v3",
        yAxisDomain: [-5.0, 105.0],
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v4.npy",
        name: "Sod Shock Tube Data v4",
        yAxisDomain: [-0.25, 1.25],
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v5.npy",
        name: "Sod Shock Tube Data v5",
        yAxisDomain: [-0.25, 1.25],
      },
    ],
    inputShape: [5, 200, 1, 1],
    outputShape: [5, 200, 1, 1],
    timeStepRange: [0.0001, 0.001],
    defaultTimeStep: 0.0001,
    spatialRange: [0, 1],
    channels: [0, 1, 4],
    channelLabels: ["Density", "Velocity", "", "", "Pressure"],
    adapterType: "feedforward",
  },
  {
    id: "sod_shock_tube_v3",
    name: "Sod Shock Tube WENO3-JS",
    description: "Sod Shock Tube Model",
    modelPath:
      "/jaxfluids-feed-forward/models/sod_shock_tube/weno3-js/model.onnx",
    datas: [
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v1.npy",
        name: "Sod Shock Tube Data v1",
        yAxisDomain: [-0.25, 1.25],
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v2.npy",
        name: "Sod Shock Tube Data v2",
        yAxisDomain: [-0.5, 2.5],
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v3.npy",
        name: "Sod Shock Tube Data v3",
        yAxisDomain: [-5.0, 105.0],
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v4.npy",
        name: "Sod Shock Tube Data v4",
        yAxisDomain: [-0.25, 1.25],
      },
      {
        path: "/jaxfluids-feed-forward/models/sod_shock_tube/data/data_v5.npy",
        name: "Sod Shock Tube Data v5",
        yAxisDomain: [-0.25, 1.25],
      },
    ],
    inputShape: [5, 200, 1, 1],
    outputShape: [5, 200, 1, 1],
    timeStepRange: [0.0001, 0.001],
    defaultTimeStep: 0.0001,
    spatialRange: [0, 1],
    channels: [0, 1, 4],
    channelLabels: ["Density", "Velocity", "", "", "Pressure"],
    adapterType: "feedforward",
  },
];

export const DEFAULT_MODEL_ID = "linear_advection_v1";
