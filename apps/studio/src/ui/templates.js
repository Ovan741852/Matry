(function attachTemplates(namespace) {
  function renderShotCard(shot, index, state) {
    const active = shot.id === state.selectedShotId ? " active" : "";
    const playing = shot.id === state.playingShotId ? " playing" : "";
    const statusClass = shot.status === "generating" ? " generating" : "";
    const statusText = shot.status === "generating" ? "⟳ 生成中" : shot.status === "done" ? "✓ 已生成" : "○ 草稿";

    return `
      <article class="storyboard-card${active}${playing}" data-shot="${shot.id}">
        <div class="shot-image">
          ${namespace.shotSvg(shot, "card")}
          <span class="status-badge${statusClass}">${statusText}</span>
          <span class="shot-number">Shot ${index + 1}</span>
        </div>
        <div class="card-title-row">
          <strong>${namespace.escapeHtml(shot.title)}</strong>
          <span class="duration">◷ ${shot.duration} 秒</span>
        </div>
        <div class="quick-edits">
          <button data-action="shorter" data-shot="${shot.id}" type="button">-1s</button>
          <button data-action="left" data-shot="${shot.id}" type="button">←</button>
          <button data-action="right" data-shot="${shot.id}" type="button">→</button>
          <button data-action="longer" data-shot="${shot.id}" type="button">+1s</button>
        </div>
      </article>
    `;
  }

  function renderAddCard() {
    return `
      <button id="addShotCard" class="storyboard-card add-card" type="button">
        <strong>+</strong>
        <span>新增片段</span>
      </button>
    `;
  }

  function renderStage(shot, index) {
    return `
      ${namespace.shotSvg(shot, "stage")}
      <div class="stage-overlay">
        <span>Shot ${index + 1}</span>
        <strong>${namespace.escapeHtml(shot.title)}</strong>
      </div>
    `;
  }

  function renderScrubTrack(shots, total, playingShotId) {
    return shots
      .map((shot) => {
        const width = total > 0 ? Math.max(6, (shot.duration / total) * 100) : 0;
        const playing = shot.id === playingShotId ? " playing" : "";
        return `<div class="scrub-segment${playing}" style="width:${width}%"></div>`;
      })
      .join("");
  }

  function renderCandidates(shot) {
    if (shot.candidates.length === 0) {
      return `
        <button class="version-card empty-version" type="button">
          <div class="version-thumb">${namespace.shotSvg(shot, "version")}</div>
          <div class="version-meta"><span>尚未生成</span><span>草稿</span></div>
        </button>
      `;
    }

    return shot.candidates
      .map((candidate, index) => {
        const selected = shot.selectedCandidateIndex === index ? " selected" : "";
        return `
          <button class="version-card${selected}" data-version="${index}" type="button">
            <div class="version-thumb">${namespace.shotSvg({ ...shot, imageSeed: candidate.seed }, "version")}</div>
            <div class="version-meta">
              <span>${candidate.name}</span>
              <span>${shot.selectedCandidateIndex === index ? "已選" : candidate.status}</span>
            </div>
          </button>
        `;
      })
      .join("");
  }

  function renderStudio(els, store) {
    const state = store.getState();
    const shot = namespace.selectedShot(state);
    const total = namespace.totalDuration(state.project);
    const shotIndex = state.project.shots.findIndex((item) => item.id === shot.id);

    els.totalDuration.textContent = `${total}s`;
    els.shotCount.textContent = `${state.project.shots.length} 個片段`;
    els.playFrom.max = total;
    els.shotRail.innerHTML = state.project.shots.map((item, index) => renderShotCard(item, index, state)).join("") + renderAddCard();
    els.stageImage.innerHTML = renderStage(shot, shotIndex);
    els.stageTimecode.textContent = `00:01 / 00:${String(shot.duration).padStart(2, "0")}`;
    els.rhythmTrack.innerHTML = renderScrubTrack(state.project.shots, total, state.playingShotId);
    els.settingsTitle.textContent = `Shot ${shotIndex + 1} 設定`;
    els.shotTitle.value = shot.title;
    els.shotDuration.value = shot.duration;
    els.shotPrompt.value = shot.prompt;
    els.promptCount.textContent = `${shot.prompt.length} / 200`;
    els.storyboardPreview.innerHTML = namespace.shotSvg(shot, "sketch");
    els.candidateList.innerHTML = renderCandidates(shot);

    document.querySelectorAll("input[name='mode']").forEach((input) => {
      input.checked = input.value === shot.mode;
    });
  }

  namespace.renderStudio = renderStudio;
})(window.MatryStudio = window.MatryStudio || {});
