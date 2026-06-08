(function attachShotFactory(namespace) {
  function createShot(title, duration, mode, prompt, imageSeed, status = "draft") {
    return {
      id: crypto.randomUUID(),
      title,
      duration,
      mode,
      prompt,
      imageSeed,
      status,
      candidates:
        status === "done"
          ? [
              createCandidate("V1", "未生成", imageSeed + 1),
              createCandidate("V2", "已選", imageSeed + 2),
              createCandidate("V3", "未生成", imageSeed + 3),
              createCandidate("V4", "未生成", imageSeed + 4),
            ]
          : [],
      selectedCandidateIndex: status === "done" ? 1 : null,
    };
  }

  function createCandidate(name, status, seed) {
    return {
      id: crypto.randomUUID(),
      name,
      status,
      seed,
    };
  }

  function randomSeed() {
    return Math.floor(Math.random() * 1000);
  }

  namespace.createShot = createShot;
  namespace.createCandidate = createCandidate;
  namespace.randomSeed = randomSeed;
})(window.MatryStudio = window.MatryStudio || {});
