import { type ModelConfig, type ModelAdapter } from '../types/SimulationTypes';

export class ModelRegistry {
  private models: Map<string, ModelConfig> = new Map();
  private adapters: Map<string, ModelAdapter> = new Map();
  private adapterTypes: Map<string, new () => ModelAdapter> = new Map(); // NEW: registry of adapter types

  // Register an adapter class for a given type
  registerAdapterType(type: string, adapterClass: new () => ModelAdapter): void {
    this.adapterTypes.set(type, adapterClass);
  }

  // Register a model and its adapter (by instance or by type)
  registerModel(config: ModelConfig, adapter?: ModelAdapter): void {
    this.models.set(config.id, config);
    if (adapter) {
      this.adapters.set(config.id, adapter);
    } else if (config.adapterType && this.adapterTypes.has(config.adapterType)) {
      const AdapterClass = this.adapterTypes.get(config.adapterType)!;
      this.adapters.set(config.id, new AdapterClass());
    } else {
      throw new Error(`No adapter provided or registered for type: ${config.adapterType}`);
    }
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