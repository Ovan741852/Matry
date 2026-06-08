import type { AssetRef, GenerationMode, Shot } from "@matry/project";

export type ProviderId = "mock" | "vidu";

export type ProviderSecretRef = {
  providerId: ProviderId;
  secretKey: string;
};

export type ProviderSettings = {
  providerId: ProviderId;
  baseUrl: string;
  model?: string;
};

export type ProviderCapabilities = {
  providerId: ProviderId;
  label: string;
  modes: Record<GenerationMode, boolean>;
  durationsSeconds: number[];
  aspectRatios: string[];
};

export type GenerationRequest = {
  shot: Shot;
  assets: AssetRef[];
  settings: ProviderSettings;
  secret: ProviderSecretRef;
};

export type GenerationJob = {
  id: string;
  providerId: ProviderId;
  status: "queued" | "generating" | "done" | "failed";
  providerTaskId?: string;
  candidateId?: string;
  error?: string;
};

export interface VideoProviderAdapter {
  id: ProviderId;
  label: string;
  getCapabilities(): ProviderCapabilities;
  createVideo(request: GenerationRequest): Promise<GenerationJob>;
  getJob(providerTaskId: string, settings: ProviderSettings, secret: ProviderSecretRef): Promise<GenerationJob>;
}
