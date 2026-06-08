import type { GenerationRequest, VideoProviderAdapter } from "@matry/generation";
import type { GenerationMode } from "@matry/project";
export declare const viduEndpoints: Record<Exclude<GenerationMode, "import"> | "image", string>;
type ViduPayload = {
    model: string;
    prompt?: string;
    duration?: number;
    aspect_ratio?: string;
    images?: string[];
};
export declare const viduProvider: VideoProviderAdapter;
export declare function getViduEndpointForMode(mode: GenerationMode): string;
export declare function createViduPayload(request: GenerationRequest): ViduPayload;
export {};
