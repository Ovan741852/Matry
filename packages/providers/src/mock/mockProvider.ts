import type {
  GenerationJob,
  GenerationRequest,
  ProviderCapabilities,
  ProviderSecretRef,
  ProviderSettings,
  VideoProviderAdapter,
} from "@matry/generation";

export const mockProvider: VideoProviderAdapter = {
  id: "mock",
  label: "Mock Provider",
  getCapabilities(): ProviderCapabilities {
    return {
      providerId: "mock",
      label: "Mock Provider",
      modes: {
        text: true,
        frames: true,
        reference: true,
        import: true,
      },
      durationsSeconds: [2, 3, 4, 5, 6, 8],
      aspectRatios: ["9:16", "16:9", "1:1"],
    };
  },
  async createVideo(_request: GenerationRequest): Promise<GenerationJob> {
    return {
      id: crypto.randomUUID(),
      providerId: "mock",
      status: "done",
      providerTaskId: `mock-${Date.now()}`,
    };
  },
  async getJob(providerTaskId: string, _settings: ProviderSettings, _secret: ProviderSecretRef): Promise<GenerationJob> {
    return {
      id: crypto.randomUUID(),
      providerId: "mock",
      status: "done",
      providerTaskId,
    };
  },
};
