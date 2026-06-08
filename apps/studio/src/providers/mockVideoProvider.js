(function attachMockVideoProvider(namespace) {
  namespace.mockVideoProvider = {
    generateCandidates() {
      return {
        status: "done",
        candidates: Array.from({ length: 4 }, (_, index) => ({
          id: crypto.randomUUID(),
          name: `V${index + 1}`,
          status: index === 1 ? "已選" : "未生成",
          seed: namespace.randomSeed(),
        })),
        selectedCandidateIndex: 1,
      };
    },
  };
})(window.MatryStudio = window.MatryStudio || {});
