import { type ModelConfig, type ModelAdapter } from '../types/SimulationTypes';

export class ModelRegistry {
  private models: Map<string, ModelConfig> = new Map();
  private adapters: Map<string, ModelAdapter> = new Map();

  registerModel(config: ModelConfig, adapter: ModelAdapter): void {
    this.models.set(config.id, config);
    this.adapters.set(config.id, adapter);
  }

  getModel(id: string): ModelConfig | undefined {
    return this.models.get(id);
  }

  getAdapter(id: string): ModelAdapter | undefined {
    return this.adapters.get(id);
  }

  getAllModels(): ModelConfig[] {
    return Array.from(this.models.values());
  }

  unregisterModel(id: string): void {
    this.models.delete(id);
    this.adapters.delete(id);
  }
}