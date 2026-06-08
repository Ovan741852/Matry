export const viduEndpoints = {
    text: "/ent/v2/text2video",
    frames: "/ent/v2/start-end2video",
    reference: "/ent/v2/reference2video",
    image: "/ent/v2/img2video",
};
export const viduProvider = {
    id: "vidu",
    label: "Vidu",
    getCapabilities() {
        return {
            providerId: "vidu",
            label: "Vidu",
            modes: {
                text: true,
                frames: true,
                reference: true,
                import: false,
            },
            durationsSeconds: [4, 8],
            aspectRatios: ["9:16", "16:9", "1:1"],
        };
    },
    async createVideo(request) {
        const endpoint = getViduEndpointForMode(request.shot.generationMode);
        const payload = createViduPayload(request);
        // Browser UI should not call this directly. Route through desktop/backend
        // so BYOK secrets can be stored and used safely.
        return {
            id: crypto.randomUUID(),
            providerId: "vidu",
            status: "queued",
            providerTaskId: `${endpoint}:${hashPreview(JSON.stringify(payload))}`,
        };
    },
    async getJob(providerTaskId, _settings, _secret) {
        return {
            id: crypto.randomUUID(),
            providerId: "vidu",
            status: "queued",
            providerTaskId,
        };
    },
};
export function getViduEndpointForMode(mode) {
    if (mode === "text")
        return viduEndpoints.text;
    if (mode === "frames")
        return viduEndpoints.frames;
    if (mode === "reference")
        return viduEndpoints.reference;
    return viduEndpoints.image;
}
export function createViduPayload(request) {
    const imageUris = request.assets
        .filter((asset) => asset.kind === "storyboard" || asset.kind === "reference")
        .map((asset) => asset.uri);
    return {
        model: request.settings.model ?? "viduq1",
        prompt: request.shot.prompt,
        duration: request.shot.durationSeconds,
        aspect_ratio: "9:16",
        images: imageUris.length > 0 ? imageUris : undefined,
    };
}
function hashPreview(value) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(index);
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
}
