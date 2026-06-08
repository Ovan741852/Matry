(function attachDom(namespace) {
  function getElements() {
    return {
      totalDuration: document.querySelector("#totalDuration"),
      shotCount: document.querySelector("#shotCount"),
      shotRail: document.querySelector("#shotRail"),
      stageImage: document.querySelector("#stageImage"),
      stageTimecode: document.querySelector("#stageTimecode"),
      rhythmTrack: document.querySelector("#rhythmTrack"),
      playPreview: document.querySelector("#playPreview"),
      playSelected: document.querySelector("#playSelected"),
      playFrom: document.querySelector("#playFrom"),
      playFromTime: document.querySelector("#playFromTime"),
      settingsTitle: document.querySelector("#settingsTitle"),
      shotTitle: document.querySelector("#shotTitle"),
      shotDuration: document.querySelector("#shotDuration"),
      shotPrompt: document.querySelector("#shotPrompt"),
      promptCount: document.querySelector("#promptCount"),
      storyboardPreview: document.querySelector("#storyboardPreview"),
      candidateList: document.querySelector("#candidateList"),
      generateStoryboard: document.querySelector("#generateStoryboard"),
      mockGenerateVideo: document.querySelector("#mockGenerateVideo"),
      trimShorter: document.querySelector("#trimShorter"),
      trimLonger: document.querySelector("#trimLonger"),
    };
  }

  namespace.getElements = getElements;
})(window.MatryStudio = window.MatryStudio || {});
