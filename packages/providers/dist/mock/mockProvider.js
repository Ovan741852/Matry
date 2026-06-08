export const mockProvider = {
    id: "mock",
    label: "Mock Provider",
    getCapabilities() {
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
    async createVideo(_request) {
        return {
            id: crypto.randomUUID(),
            providerId: "mock",
            status: "done",
            providerTaskId: `mock-${Date.now()}`,
        };
    },
    async getJob(providerTaskId, _settings, _secret) {
        return {
            id: crypto.randomUUID(),
            providerId: "mock",
            status: "done",
            providerTaskId,
        };
    },
};
