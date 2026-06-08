(function attachStore(namespace) {
  function createStore(project) {
    let state = {
      project,
      selectedShotId: project.shots[1]?.id ?? project.shots[0]?.id,
      playingShotId: null,
    };

    return {
      getState() {
        return state;
      },
      setPlayingShot(id) {
        state = { ...state, playingShotId: id };
      },
      selectShot(id) {
        state = { ...state, selectedShotId: id };
      },
      addShot() {
        const shot = namespace.createShot("新片段", 3, "text", "描述這一段會出現的畫面、動作和節奏。", namespace.randomSeed(), "draft");
        state = {
          ...state,
          selectedShotId: shot.id,
          project: { ...state.project, shots: [...state.project.shots, shot] },
        };
      },
      updateSelected(patch) {
        state = {
          ...state,
          project: {
            ...state.project,
            shots: state.project.shots.map((shot) => (shot.id === state.selectedShotId ? { ...shot, ...patch } : shot)),
          },
        };
      },
      adjustDuration(id, delta) {
        state = {
          ...state,
          selectedShotId: id,
          project: {
            ...state.project,
            shots: state.project.shots.map((shot) =>
              shot.id === id ? { ...shot, duration: Math.max(1, Math.min(20, Number(shot.duration) + delta)) } : shot,
            ),
          },
        };
      },
      moveShot(id, direction) {
        const index = state.project.shots.findIndex((shot) => shot.id === id);
        const nextIndex = index + direction;
        if (index < 0 || nextIndex < 0 || nextIndex >= state.project.shots.length) return;
        const shots = [...state.project.shots];
        const [shot] = shots.splice(index, 1);
        shots.splice(nextIndex, 0, shot);
        state = { ...state, selectedShotId: id, project: { ...state.project, shots } };
      },
      reorderShot(draggedId, targetId) {
        if (!draggedId || draggedId === targetId) return;
        const from = state.project.shots.findIndex((shot) => shot.id === draggedId);
        const to = state.project.shots.findIndex((shot) => shot.id === targetId);
        if (from < 0 || to < 0) return;
        const shots = [...state.project.shots];
        const [shot] = shots.splice(from, 1);
        const insertAt = from < to ? to - 1 : to;
        shots.splice(insertAt, 0, shot);
        state = { ...state, selectedShotId: draggedId, project: { ...state.project, shots } };
      },
    };
  }

  function selectedShot(state) {
    return state.project.shots.find((shot) => shot.id === state.selectedShotId) ?? state.project.shots[0];
  }

  function totalDuration(project) {
    return project.shots.reduce((sum, shot) => sum + Number(shot.duration || 0), 0);
  }

  namespace.createStore = createStore;
  namespace.selectedShot = selectedShot;
  namespace.totalDuration = totalDuration;
})(window.MatryStudio = window.MatryStudio || {});
