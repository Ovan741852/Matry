import type { ProviderCapabilities } from "@matry/generation";

export const videoProviderCatalog: ProviderCapabilities[] = [
  {
    providerId: "vidu",
    label: "Vidu",
    modes: { text: true, frames: true, reference: true, import: false },
    durationsSeconds: [4, 8],
    aspectRatios: ["9:16", "16:9", "1:1"],
  },
  {
    providerId: "google-veo",
    label: "Google Gemini / Veo",
    modes: { text: true, frames: true, reference: true, import: false },
    durationsSeconds: [4, 6, 8],
    aspectRatios: ["9:16", "16:9"],
  },
  {
    providerId: "openai-sora",
    label: "OpenAI Sora",
    modes: { text: true, frames: true, reference: true, import: false },
    durationsSeconds: [4, 8, 12],
    aspectRatios: ["9:16", "16:9", "1:1"],
  },
  {
    providerId: "runway",
    label: "Runway",
    modes: { text: true, frames: true, reference: true, import: true },
    durationsSeconds: [5, 10],
    aspectRatios: ["9:16", "16:9", "1:1"],
  },
  {
    providerId: "fal",
    label: "fal.ai",
    modes: { text: true, frames: true, reference: true, import: true },
    durationsSeconds: [4, 5, 8, 10],
    aspectRatios: ["9:16", "16:9", "1:1"],
  },
];
