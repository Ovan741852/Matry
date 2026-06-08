(function attachInteractions(namespace) {
  function bindInteractions(els, store, playback, render) {
    els.playPreview.addEventListener("click", () => playback.play(0, false));
    els.playSelected.addEventListener("click", () => playback.play(0, true));
    els.playFromTime.addEventListener("click", () => playback.play(els.playFrom.value, false));
    els.rhythmTrack.addEventListener("click", (event) => locateTime(event, els, store, render));

    els.shotTitle.addEventListener("input", () => {
      store.updateSelected({ title: els.shotTitle.value });
      render();
    });
    els.shotDuration.addEventListener("input", () => {
      store.updateSelected({ duration: Math.max(1, Math.min(20, Number(els.shotDuration.value || 1))) });
      render();
    });
    els.shotPrompt.addEventListener("input", () => {
      store.updateSelected({ prompt: els.shotPrompt.value });
      render();
    });
    els.trimShorter.addEventListener("click", () => {
      store.adjustDuration(store.getState().selectedShotId, -1);
      render();
    });
    els.trimLonger.addEventListener("click", () => {
      store.adjustDuration(store.getState().selectedShotId, 1);
      render();
    });

    document.querySelectorAll("input[name='mode']").forEach((input) => {
      input.addEventListener("change", () => {
        store.updateSelected({ mode: input.value });
        render();
      });
    });

    document.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".chip").forEach((item) => item.classList.remove("active"));
        chip.classList.add("active");
      });
    });

    els.generateStoryboard.addEventListener("click", () => {
      store.updateSelected({ imageSeed: namespace.randomSeed() });
      render();
    });
    els.mockGenerateVideo.addEventListener("click", () => {
      const shot = namespace.selectedShot(store.getState());
      store.updateSelected(namespace.mockVideoProvider.generateCandidates(shot));
      render();
    });
  }

  function bindDynamicInteractions(els, store, render) {
    els.shotRail.querySelectorAll(".storyboard-card[data-shot]").forEach((card) => {
      card.draggable = true;
      card.addEventListener("click", (event) => {
        if (event.target.closest("[data-action]")) return;
        store.selectShot(card.dataset.shot);
        render();
      });
      card.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", card.dataset.shot);
        event.dataTransfer.effectAllowed = "move";
        card.classList.add("dragging");
      });
      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        clearDropMarkers(els);
      });
      card.addEventListener("dragover", (event) => {
        event.preventDefault();
        card.classList.add("drop-before");
      });
      card.addEventListener("dragleave", () => card.classList.remove("drop-before"));
      card.addEventListener("drop", (event) => {
        event.preventDefault();
        const draggedId = event.dataTransfer.getData("text/plain");
        card.classList.remove("drop-before");
        store.reorderShot(draggedId, card.dataset.shot);
        render();
      });
    });

    els.shotRail.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.shot;
        const action = button.dataset.action;
        if (action === "shorter") store.adjustDuration(id, -1);
        if (action === "longer") store.adjustDuration(id, 1);
        if (action === "left") store.moveShot(id, -1);
        if (action === "right") store.moveShot(id, 1);
        render();
      });
    });

    document.querySelector("#addShotCard").addEventListener("click", () => {
      store.addShot();
      render();
    });

    els.candidateList.querySelectorAll("[data-version]").forEach((button) => {
      button.addEventListener("click", () => {
        store.updateSelected({ selectedCandidateIndex: Number(button.dataset.version), status: "done" });
        render();
      });
    });
  }

  function locateTime(event, els, store, render) {
    const rect = els.rhythmTrack.getBoundingClientRect();
    const ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
    const target = Math.max(0, Math.min(namespace.totalDuration(store.getState().project), namespace.totalDuration(store.getState().project) * ratio));
    let elapsed = 0;
    const found = store.getState().project.shots.find((shot) => {
      const nextElapsed = elapsed + shot.duration;
      const isInside = target < nextElapsed;
      if (!isInside) elapsed = nextElapsed;
      return isInside;
    });
    if (!found) return;
    store.selectShot(found.id);
    els.playFrom.value = Math.round(target);
    render();
  }

  function clearDropMarkers(els) {
    els.shotRail.querySelectorAll(".drop-before").forEach((item) => item.classList.remove("drop-before"));
  }

  namespace.bindInteractions = bindInteractions;
  namespace.bindDynamicInteractions = bindDynamicInteractions;
})(window.MatryStudio = window.MatryStudio || {});
