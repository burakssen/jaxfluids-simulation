import {
  type ModelAdapter,
  type ModelConfig,
  type InitializationProgress,
} from "../../types/SimulationTypes";

const loadONNXRuntime = () => import("onnxruntime-web");
const loadNpyjs = () => import("npyjs");

export class FeedForwardAdapter implements ModelAdapter {
  async initialize(
    config: ModelConfig,
    onProgress?: (progress: InitializationProgress) => void
  ): Promise<any> {
    try {
      onProgress?.({ stage: "Loading libraries...", progress: 10 });

      const [{ default: Npyjs }, ort] = await Promise.all([
        loadNpyjs(),
        loadONNXRuntime(),
      ]);

      onProgress?.({ stage: "Loading model data...", progress: 30 });

      let inputArray: Float64Array;

      if (config.dataPath) {
        const npy = new Npyjs();
        const npyBuffer = await (await fetch(config.dataPath)).arrayBuffer();
        onProgress?.({ stage: "Parsing model data...", progress: 50 });
        const npyData = npy.parse(npyBuffer);
        inputArray = new Float64Array(npyData.data);
        

      } else {
        // Generate default data based on input shape
        const totalSize = config.inputShape.reduce((a, b) => a * b, 1);
        inputArray = new Float64Array(totalSize).fill(0);
      }

      onProgress?.({ stage: "Creating ONNX session...", progress: 70 });
      const session = await ort.InferenceSession.create(config.modelPath);

      onProgress?.({ stage: "Finalizing initialization...", progress: 90 });

      return {
        session,
        initialData: inputArray,
      };
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Unknown initialization error"
      );
    }
  }

  async runInference(
    session: any,
    data: Float64Array,
    time: number,
    timeStep: number,
    dims: number[]
  ): Promise<{
    newData: Float64Array;
    newTime: number;
    metadata?: Record<string, any>;
  }> {
    const ort = await loadONNXRuntime();

    const inputTensor = new ort.Tensor("float64", data, dims);
    const timeTensor = new ort.Tensor("float64", new Float64Array([time]), [1]);
    const dtTensor = new ort.Tensor("float64", new Float64Array([timeStep]), [
      1,
    ]);

    const outputs = await session.run({
      var_0: inputTensor,
      var_1: timeTensor,
      var_2: dtTensor,
    });

    const newData = outputs["var_3"].data as Float64Array;
    const newTime = (outputs["var_4"].data as Float64Array)[0];



    return {
      newData,
      newTime,
      metadata: {
        outputKeys: Object.keys(outputs),
        tensorShapes: Object.entries(outputs).map(([key, tensor]) => ({
          key,
          shape: (tensor as any).dims,
        })),
      },
    };
  }

  extractVisualizationData(
    data: Float64Array,
    channel: number,
    dataSize: number
  ): Float64Array {
    if (channel < 0 || channel >= 5) {
      throw new Error("Channel index out of bounds");
    }

    const channelData = new Float64Array(dataSize);
    for (let i = 0; i < dataSize; i++) {
      channelData[i] = data[channel * dataSize + i];
    }
    

    
    return channelData;
  }

  cleanup(session: any): void {
    // ONNX runtime cleanup if needed
    session?.close?.();
  }
}
