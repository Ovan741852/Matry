(function attachPlayback(namespace) {
  function createPlayback(store, render) {
    let previewTimer = null;

    function play(startAtSeconds = 0, onlySelected = false) {
      clearTimeout(previewTimer);
      const state = store.getState();
      const selected = namespace.selectedShot(state);
      const sequence = onlySelected ? [selected] : state.project.shots;
      const total = onlySelected ? selected.duration : namespace.totalDuration(state.project);
      const start = Math.max(0, Math.min(total, Number(startAtSeconds || 0)));
      if (start >= total) return;

      let elapsed = 0;
      let index = sequence.findIndex((shot) => {
        const nextElapsed = elapsed + shot.duration;
        const found = start < nextElapsed;
        if (!found) elapsed = nextElapsed;
        return found;
      });
      const startIndex = index;
      if (index < 0) return;

      const next = () => {
        if (index >= sequence.length) {
          store.setPlayingShot(null);
          render();
          return;
        }

        const current = sequence[index];
        store.setPlayingShot(current.id);
        store.selectShot(current.id);
        render();

        const alreadyInsideShot = index === startIndex ? Math.max(0, start - elapsed) : 0;
        const remaining = Math.max(0.4, current.duration - alreadyInsideShot);
        previewTimer = setTimeout(() => {
          elapsed += current.duration;
          index += 1;
          next();
        }, Math.max(600, remaining * 420));
      };

      next();
    }

    return { play };
  }

  namespace.createPlayback = createPlayback;
})(window.MatryStudio = window.MatryStudio || {});
