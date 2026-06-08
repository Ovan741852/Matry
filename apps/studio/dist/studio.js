"use strict";
const modeLabels = {
    text: "用文字生成",
    frames: "首幀到尾幀生成",
    reference: "參考圖生成",
    import: "匯入影片",
};
const palette = [
    ["#27150e", "#b45309"],
    ["#080808", "#b7791f"],
    ["#111827", "#d4a017"],
    ["#0f172a", "#be123c"],
    ["#123026", "#e8752c"],
];
const providerCapabilities = {
    vidu: {
        id: "vidu",
        label: "Vidu",
        endpoints: {
            text: "/ent/v2/text2video",
            frames: "/ent/v2/start-end2video",
            reference: "/ent/v2/reference2video",
            import: "/ent/v2/img2video",
        },
        pricingHint: "Vidu API 使用 credits。可能有活動或試用額度，但不要假設永久免費。",
    },
    "google-veo": {
        id: "google-veo",
        label: "Google Gemini / Veo",
        endpoints: {
            text: "Gemini API / Veo generate",
            frames: "Vertex AI Veo advanced controls",
            reference: "Gemini API / Veo image prompt",
            import: null,
        },
        pricingHint: "Google 官方 Gemini API 文件標示 Veo 影片在 paid tier，影片 free tier 不可用。",
    },
    "openai-sora": {
        id: "openai-sora",
        label: "OpenAI Sora",
        endpoints: {
            text: "/v1/videos",
            frames: "/v1/videos with image/reference workflow",
            reference: "/v1/videos with image/reference workflow",
            import: null,
        },
        pricingHint: "OpenAI Sora API 依影片秒數/模型計價；ChatGPT 方案與 API 計費分開。",
    },
    runway: {
        id: "runway",
        label: "Runway",
        endpoints: {
            text: "Runway video generation task",
            frames: "Runway image/video generation task",
            reference: "Runway image-to-video/reference task",
            import: "Runway video-to-video/edit task",
        },
        pricingHint: "Runway API 使用 credits，官方文件列出每秒 credits 成本。",
    },
    fal: {
        id: "fal",
        label: "fal.ai",
        endpoints: {
            text: "model-dependent endpoint",
            frames: "model-dependent endpoint",
            reference: "model-dependent endpoint",
            import: "model-dependent endpoint",
        },
        pricingHint: "fal.ai 是模型平台，通常預付 credits；是否有新用戶試用額度會變動。",
    },
};
const defaultProviderSettings = {
    provider: "vidu",
    apiKey: "",
    baseUrl: "https://api.vidu.com",
};
const providerStorageKey = "matry.studio.providerSettings";
function createShot(title, duration, mode, prompt, imageSeed, status = "draft") {
    return {
        id: crypto.randomUUID(),
        title,
        duration,
        mode,
        prompt,
        imageSeed,
        status,
        candidates: status === "done"
            ? [
                createCandidate("V1", "未生成", imageSeed + 1),
                createCandidate("V2", "已選", imageSeed + 2),
                createCandidate("V3", "未生成", imageSeed + 3),
                createCandidate("V4", "未生成", imageSeed + 4),
            ]
            : [],
        selectedCandidateIndex: status === "done" ? 1 : null,
        generationJobs: [],
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
function createDemoProject() {
    return {
        id: crypto.randomUUID(),
        title: "可樂短廣告",
        aspectRatio: "9:16",
        style: "商業廣告",
        shots: [
            createShot("瓶蓋打開", 2, "frames", "手指旋開冰涼可樂瓶蓋，瓶口冒出第一道氣泡。", 0, "done"),
            createShot("氣泡噴出", 4, "frames", "大量氣泡從瓶口噴出，慢動作，水珠飛濺，背景為深色攝影棚。", 1, "generating"),
            createShot("結尾標語", 3, "text", "可樂瓶站在冰塊上，畫面出現醒目標語，最後定格成廣告主視覺。", 2, "done"),
        ],
        timeline: [
            {
                id: crypto.randomUUID(),
                kind: "music",
                label: "音樂 1",
                clips: [{ id: crypto.randomUUID(), title: "清爽廣告配樂", startSeconds: 0, durationSeconds: 9 }],
            },
            {
                id: crypto.randomUUID(),
                kind: "subtitle",
                label: "字幕 1",
                clips: [
                    { id: crypto.randomUUID(), title: "冰涼開場", startSeconds: 0.4, durationSeconds: 2.2 },
                    { id: crypto.randomUUID(), title: "氣泡爆發", startSeconds: 3, durationSeconds: 2.6 },
                    { id: crypto.randomUUID(), title: "暢爽時刻", startSeconds: 6.2, durationSeconds: 2.4 },
                ],
            },
        ],
    };
}
let state = (() => {
    const project = createDemoProject();
    return {
        project,
        selectedShotId: project.shots[1]?.id ?? project.shots[0].id,
        playingShotId: null,
        providerSettings: loadProviderSettings(),
    };
})();
let previewTimer = null;
let playheadSeconds = 0;
let activeTrim = null;
const els = getElements();
function getElements() {
    return {
        totalDuration: mustElement("#totalDuration", HTMLElement),
        shotCount: mustElement("#shotCount", HTMLElement),
        shotRail: mustElement("#shotRail", HTMLElement),
        openStoryboardDialog: mustElement("#openStoryboardDialog", HTMLButtonElement),
        closeStoryboardDialog: mustElement("#closeStoryboardDialog", HTMLButtonElement),
        storyboardDialog: mustElement("#storyboardDialog", HTMLDialogElement),
        stageImage: mustElement("#stageImage", HTMLElement),
        stageTimecode: mustElement("#stageTimecode", HTMLElement),
        rhythmTrack: mustElement("#rhythmTrack", HTMLElement),
        playPreview: mustElement("#playPreview", HTMLButtonElement),
        playSelected: mustElement("#playSelected", HTMLButtonElement),
        playFrom: mustElement("#playFrom", HTMLInputElement),
        playFromTime: mustElement("#playFromTime", HTMLButtonElement),
        settingsTitle: mustElement("#settingsTitle", HTMLElement),
        shotTitle: mustElement("#shotTitle", HTMLInputElement),
        shotDuration: mustElement("#shotDuration", HTMLInputElement),
        shotPrompt: mustElement("#shotPrompt", HTMLTextAreaElement),
        promptCount: mustElement("#promptCount", HTMLElement),
        storyboardPreview: mustElement("#storyboardPreview", HTMLElement),
        candidateList: mustElement("#candidateList", HTMLElement),
        generateStoryboard: mustElement("#generateStoryboard", HTMLButtonElement),
        mockGenerateVideo: mustElement("#mockGenerateVideo", HTMLButtonElement),
        mockCreditError: mustElement("#mockCreditError", HTMLButtonElement),
        generationCount: mustElement("#generationCount", HTMLInputElement),
        generationNotice: mustElement("#generationNotice", HTMLElement),
        generationJobs: mustElement("#generationJobs", HTMLElement),
        trimShorter: mustElement("#trimShorter", HTMLButtonElement),
        trimLonger: mustElement("#trimLonger", HTMLButtonElement),
        openApiSettings: mustElement("#openApiSettings", HTMLButtonElement),
        openApiSettingsInline: mustElement("#openApiSettingsInline", HTMLButtonElement),
        apiSettingsDialog: mustElement("#apiSettingsDialog", HTMLDialogElement),
        providerSelect: mustElement("#providerSelect", HTMLSelectElement),
        providerApiKey: mustElement("#providerApiKey", HTMLInputElement),
        providerBaseUrl: mustElement("#providerBaseUrl", HTMLInputElement),
        providerStatus: mustElement("#providerStatus", HTMLElement),
        saveApiSettings: mustElement("#saveApiSettings", HTMLButtonElement),
        providerCapabilityTitle: mustElement("#providerCapabilityTitle", HTMLElement),
        providerCapabilityList: mustElement("#providerCapabilityList", HTMLElement),
        providerPricingHint: mustElement("#providerPricingHint", HTMLElement),
    };
}
function mustElement(selector, ctor) {
    const element = document.querySelector(selector);
    if (!(element instanceof ctor)) {
        throw new Error(`Missing element: ${selector}`);
    }
    return element;
}
function selectedShot() {
    return state.project.shots.find((shot) => shot.id === state.selectedShotId) ?? state.project.shots[0];
}
function totalDuration() {
    return state.project.shots.reduce((sum, shot) => sum + Number(shot.duration || 0), 0);
}
function render() {
    const total = totalDuration();
    const current = selectedShot();
    const shotIndex = state.project.shots.findIndex((shot) => shot.id === current.id);
    playheadSeconds = clamp(playheadSeconds, 0, total);
    els.totalDuration.textContent = `${total}s`;
    els.shotCount.textContent = `${state.project.shots.length} 個片段`;
    els.playFrom.max = String(total);
    els.shotRail.innerHTML = state.project.shots.map(renderShotCard).join("") + renderAddCard();
    els.stageImage.innerHTML = renderStage(current, shotIndex);
    els.stageTimecode.textContent = `00:01 / 00:${String(current.duration).padStart(2, "0")}`;
    els.rhythmTrack.innerHTML = renderScrubTrack(total);
    els.settingsTitle.textContent = `Shot ${shotIndex + 1} 設定`;
    els.shotTitle.value = current.title;
    els.shotDuration.value = String(current.duration);
    els.shotPrompt.value = current.prompt;
    els.promptCount.textContent = `${current.prompt.length} / 200`;
    els.storyboardPreview.innerHTML = shotSvg(current, "sketch");
    els.candidateList.innerHTML = renderCandidates(current);
    renderGenerationState(current);
    document.querySelectorAll("input[name='mode']").forEach((input) => {
        input.checked = input.value === current.mode;
    });
    renderProviderSettings();
    bindDynamicInteractions();
}
function renderGenerationState(shot) {
    const latestJob = shot.generationJobs[0];
    els.generationCount.value = String(Math.max(1, Math.min(4, shot.candidates.length || 4)));
    if (!latestJob) {
        els.generationNotice.className = "generation-notice idle";
        els.generationNotice.textContent = "尚未送出生成工作";
    }
    else {
        const noticeClass = latestJob.status === "failed"
            ? "error"
            : latestJob.status === "done"
                ? "success"
                : latestJob.status === "waiting"
                    ? "waiting"
                    : "waiting";
        els.generationNotice.className = `generation-notice ${noticeClass}`;
        els.generationNotice.textContent = latestJob.message;
    }
    els.generationJobs.innerHTML =
        shot.generationJobs.length === 0
            ? ""
            : shot.generationJobs
                .map((job) => `
              <div class="generation-job">
                <strong>${generationJobLabel(job.status)}</strong>
                <span>${job.requestedCount} 部 · ${job.createdAt}</span>
              </div>
            `)
                .join("");
}
function generationJobLabel(status) {
    if (status === "waiting")
        return "等待回應";
    if (status === "generating")
        return "生成中";
    if (status === "done")
        return "完成";
    return "錯誤";
}
function renderShotCard(shot, index) {
    const active = shot.id === state.selectedShotId ? " active" : "";
    const playing = shot.id === state.playingShotId ? " playing" : "";
    const statusClass = shot.status === "generating" ? " generating" : "";
    const statusText = shot.status === "generating" ? "⟳ 生成中" : shot.status === "done" ? "✓ 已生成" : "○ 草稿";
    const cardWidth = getShotCardWidth(shot.duration);
    return `
    <article class="storyboard-card${active}${playing}" data-shot="${shot.id}" style="--shot-card-width: ${cardWidth}px">
      <div class="shot-image">
        ${shotSvg(shot, "card")}
        <span class="status-badge${statusClass}">${statusText}</span>
        <span class="shot-number">Shot ${index + 1}</span>
      </div>
      <div class="card-title-row">
        <strong>${escapeHtml(shot.title)}</strong>
        <span class="duration">◷ ${shot.duration} 秒</span>
      </div>
      <div class="trim-bar" aria-label="拖拉調整片段長度">
        <div class="trim-fill"></div>
        <button class="trim-handle" data-trim-handle="${shot.id}" type="button" aria-label="拖拉片段長度"></button>
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
function getShotCardWidth(duration) {
    return Math.max(184, Math.min(360, 150 + duration * 22));
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
    ${shotSvg(shot, "stage")}
    <div class="stage-overlay">
      <span>Shot ${index + 1}</span>
      <strong>${escapeHtml(shot.title)}</strong>
    </div>
  `;
}
function renderScrubTrack(total) {
    const videoClips = state.project.shots
        .map((shot, index) => {
        const width = total > 0 ? Math.max(6, (shot.duration / total) * 100) : 0;
        const playing = shot.id === state.playingShotId ? " playing" : "";
        const selected = shot.id === state.selectedShotId ? " selected" : "";
        return `
        <div class="timeline-clip video-clip${playing}${selected}" style="width:${width}%" data-timeline-shot="${shot.id}">
          <button class="timeline-trim-handle left" data-timeline-left-handle="${shot.id}" type="button" aria-label="片段起點"></button>
          <div class="timeline-thumb">${shotSvg(shot, "version")}</div>
          <div class="timeline-clip-label">
            <strong>${index + 1}. ${escapeHtml(shot.title)}</strong>
            <span>${shot.duration}s</span>
          </div>
          <button class="timeline-trim-handle right" data-timeline-right-handle="${shot.id}" type="button" aria-label="拖拉調整片段終點"></button>
        </div>
      `;
    })
        .join("");
    const left = total > 0 ? (playheadSeconds / total) * 100 : 0;
    const extraTracks = state.project.timeline.map((track) => renderTimelineTrack(track, total)).join("");
    return `
    <div class="timeline-header">
      <span>時間線</span>
      <strong>${Math.round(playheadSeconds)}s / ${total}s</strong>
    </div>
    <div class="timeline-body">
      <div class="timeline-ruler">${renderTimelineTicks(total)}</div>
      <div class="timeline-track">
        <div class="track-label">影片</div>
        <div class="track-lane video-lane">${videoClips}</div>
      </div>
      ${extraTracks}
      <button class="playhead" data-playhead type="button" style="--playhead-left:${left}%" aria-label="拖曳播放頭"></button>
    </div>
  `;
}
function renderTimelineTrack(track, total) {
    const clips = track.clips
        .map((clip) => {
        const left = total > 0 ? (clip.startSeconds / total) * 100 : 0;
        const width = total > 0 ? Math.max(4, (clip.durationSeconds / total) * 100) : 0;
        return `
        <div class="timeline-clip ${track.kind}-clip" style="left:${left}%; width:${width}%">
          <strong>${escapeHtml(clip.title)}</strong>
          <span>${clip.durationSeconds}s</span>
        </div>
      `;
    })
        .join("");
    return `
    <div class="timeline-track">
      <div class="track-label">${escapeHtml(track.label)}</div>
      <div class="track-lane ${track.kind}-lane">${clips}</div>
    </div>
  `;
}
function renderTimelineTicks(total) {
    const tickCount = Math.max(2, Math.ceil(total / 2) + 1);
    return Array.from({ length: tickCount }, (_, index) => {
        const second = Math.min(total, index * 2);
        const left = total > 0 ? (second / total) * 100 : 0;
        return `<span style="left:${left}%">${second}s</span>`;
    }).join("");
}
function renderCandidates(shot) {
    if (shot.candidates.length === 0) {
        return `
      <button class="version-card empty-version" type="button">
        <div class="version-thumb">${shotSvg(shot, "version")}</div>
        <div class="version-meta"><span>尚未生成</span><span>草稿</span></div>
      </button>
    `;
    }
    return shot.candidates
        .map((candidate, index) => {
        const selected = shot.selectedCandidateIndex === index ? " selected" : "";
        return `
        <button class="version-card${selected}" data-version="${index}" type="button">
          <div class="version-thumb">${shotSvg({ ...shot, imageSeed: candidate.seed }, "version")}</div>
          <div class="version-meta">
            <span>${candidate.name}</span>
            <span>${shot.selectedCandidateIndex === index ? "已選" : candidate.status}</span>
          </div>
        </button>
      `;
    })
        .join("");
}
function renderProviderSettings() {
    els.providerSelect.value = state.providerSettings.provider;
    els.providerApiKey.value = state.providerSettings.apiKey;
    els.providerBaseUrl.value = state.providerSettings.baseUrl;
    const capability = providerCapabilities[state.providerSettings.provider];
    els.providerStatus.textContent = state.providerSettings.apiKey ? `${capability.label} 已設定` : "尚未儲存";
    els.providerCapabilityTitle.textContent = `${capability.label} 對應模式`;
    els.providerCapabilityList.innerHTML = Object.entries(capability.endpoints)
        .map(([mode, endpoint]) => `<span>${modeLabels[mode]} → ${endpoint ?? "暫不支援"}</span>`)
        .join("");
    els.providerPricingHint.textContent = capability.pricingHint;
}
function bindDynamicInteractions() {
    els.rhythmTrack.querySelectorAll("[data-timeline-right-handle]").forEach((handle) => {
        handle.addEventListener("click", (event) => event.stopPropagation());
        handle.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const shotId = handle.dataset.timelineRightHandle ?? "";
            const shot = state.project.shots.find((item) => item.id === shotId);
            if (!shot)
                return;
            activeTrim = {
                shotId,
                startX: event.clientX,
                startDuration: shot.duration,
            };
            handle.setPointerCapture(event.pointerId);
            state = { ...state, selectedShotId: shotId };
        });
        handle.addEventListener("pointermove", (event) => {
            if (!activeTrim)
                return;
            event.preventDefault();
            const deltaSeconds = Math.round((event.clientX - activeTrim.startX) / 34);
            const nextDuration = Math.max(1, Math.min(20, activeTrim.startDuration + deltaSeconds));
            setShotDuration(activeTrim.shotId, nextDuration, false);
            updateTimelineDurationPreview(activeTrim.shotId, nextDuration);
        });
        handle.addEventListener("pointerup", (event) => {
            if (!activeTrim)
                return;
            event.preventDefault();
            activeTrim = null;
            render();
        });
        handle.addEventListener("pointercancel", () => {
            activeTrim = null;
            render();
        });
    });
    els.rhythmTrack.querySelectorAll("[data-timeline-left-handle]").forEach((handle) => {
        handle.addEventListener("click", (event) => {
            event.stopPropagation();
            state = { ...state, selectedShotId: handle.dataset.timelineLeftHandle ?? state.selectedShotId };
            render();
        });
    });
    const playhead = els.rhythmTrack.querySelector("[data-playhead]");
    playhead?.addEventListener("click", (event) => event.stopPropagation());
    playhead?.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        playhead.setPointerCapture(event.pointerId);
        updatePlayheadFromClientX(event.clientX, false);
    });
    playhead?.addEventListener("pointermove", (event) => {
        if (!playhead.hasPointerCapture(event.pointerId))
            return;
        event.preventDefault();
        updatePlayheadFromClientX(event.clientX, false);
    });
    playhead?.addEventListener("pointerup", (event) => {
        if (!playhead.hasPointerCapture(event.pointerId))
            return;
        playhead.releasePointerCapture(event.pointerId);
        updatePlayheadFromClientX(event.clientX, true);
    });
    els.shotRail.querySelectorAll("[data-trim-handle]").forEach((handle) => {
        handle.addEventListener("click", (event) => event.stopPropagation());
        handle.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const shotId = handle.dataset.trimHandle ?? "";
            const shot = state.project.shots.find((item) => item.id === shotId);
            if (!shot)
                return;
            activeTrim = {
                shotId,
                startX: event.clientX,
                startDuration: shot.duration,
            };
            handle.setPointerCapture(event.pointerId);
            state = { ...state, selectedShotId: shotId };
        });
        handle.addEventListener("pointermove", (event) => {
            if (!activeTrim)
                return;
            event.preventDefault();
            const deltaSeconds = Math.round((event.clientX - activeTrim.startX) / 34);
            const nextDuration = Math.max(1, Math.min(20, activeTrim.startDuration + deltaSeconds));
            setShotDuration(activeTrim.shotId, nextDuration, false);
        });
        handle.addEventListener("pointerup", (event) => {
            if (!activeTrim)
                return;
            event.preventDefault();
            activeTrim = null;
            render();
        });
        handle.addEventListener("pointercancel", () => {
            activeTrim = null;
            render();
        });
    });
    els.shotRail.querySelectorAll(".storyboard-card[data-shot]").forEach((card) => {
        card.draggable = true;
        card.addEventListener("click", (event) => {
            if (event.target.closest("[data-action]"))
                return;
            state = { ...state, selectedShotId: card.dataset.shot ?? state.selectedShotId };
            render();
        });
        card.addEventListener("dragstart", (event) => {
            event.dataTransfer?.setData("text/plain", card.dataset.shot ?? "");
            if (event.dataTransfer)
                event.dataTransfer.effectAllowed = "move";
            card.classList.add("dragging");
        });
        card.addEventListener("dragend", () => {
            card.classList.remove("dragging");
            clearDropMarkers();
        });
        card.addEventListener("dragover", (event) => {
            event.preventDefault();
            card.classList.add("drop-before");
        });
        card.addEventListener("dragleave", () => card.classList.remove("drop-before"));
        card.addEventListener("drop", (event) => {
            event.preventDefault();
            const draggedId = event.dataTransfer?.getData("text/plain") ?? "";
            card.classList.remove("drop-before");
            reorderShot(draggedId, card.dataset.shot ?? "");
        });
    });
    els.shotRail.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const id = button.dataset.shot ?? "";
            const action = button.dataset.action;
            if (action === "shorter")
                adjustDuration(id, -1);
            if (action === "longer")
                adjustDuration(id, 1);
            if (action === "left")
                moveShot(id, -1);
            if (action === "right")
                moveShot(id, 1);
        });
    });
    document.querySelector("#addShotCard")?.addEventListener("click", addShot);
    els.candidateList.querySelectorAll("[data-version]").forEach((button) => {
        button.addEventListener("click", () => {
            updateSelected({ selectedCandidateIndex: Number(button.dataset.version), status: "done" });
        });
    });
}
function clearDropMarkers() {
    els.shotRail.querySelectorAll(".drop-before").forEach((item) => item.classList.remove("drop-before"));
}
function addShot() {
    const shot = createShot("新片段", 3, "text", "描述這一段會出現的畫面、動作和節奏。", randomSeed(), "draft");
    state = {
        ...state,
        selectedShotId: shot.id,
        project: { ...state.project, shots: [...state.project.shots, shot] },
    };
    render();
}
function updateSelected(patch) {
    state = {
        ...state,
        project: {
            ...state.project,
            shots: state.project.shots.map((shot) => (shot.id === state.selectedShotId ? { ...shot, ...patch } : shot)),
        },
    };
    render();
}
function updateShotById(shotId, patch) {
    state = {
        ...state,
        project: {
            ...state.project,
            shots: state.project.shots.map((shot) => (shot.id === shotId ? { ...shot, ...patch } : shot)),
        },
    };
    render();
}
function adjustDuration(id, delta) {
    const shot = state.project.shots.find((item) => item.id === id);
    if (!shot)
        return;
    setShotDuration(id, Math.max(1, Math.min(20, Number(shot.duration) + delta)));
}
function setShotDuration(id, duration, shouldRender = true) {
    state = {
        ...state,
        selectedShotId: id,
        project: {
            ...state.project,
            shots: state.project.shots.map((shot) => (shot.id === id ? { ...shot, duration } : shot)),
        },
    };
    if (shouldRender)
        render();
    if (!shouldRender) {
        const card = els.shotRail.querySelector(`.storyboard-card[data-shot="${CSS.escape(id)}"]`);
        const durationLabel = card?.querySelector(".duration");
        if (card)
            card.style.setProperty("--shot-card-width", `${getShotCardWidth(duration)}px`);
        if (durationLabel)
            durationLabel.textContent = `◷ ${duration} 秒`;
        els.totalDuration.textContent = `${totalDuration()}s`;
        els.shotDuration.value = String(duration);
    }
}
function updateTimelineDurationPreview(id, duration) {
    const clip = els.rhythmTrack.querySelector(`.timeline-clip[data-timeline-shot="${CSS.escape(id)}"]`);
    const durationText = clip?.querySelector(".timeline-clip-label span");
    if (durationText)
        durationText.textContent = `${duration}s`;
}
function moveShot(id, direction) {
    const index = state.project.shots.findIndex((shot) => shot.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= state.project.shots.length)
        return;
    const shots = [...state.project.shots];
    const [shot] = shots.splice(index, 1);
    shots.splice(nextIndex, 0, shot);
    state = { ...state, selectedShotId: id, project: { ...state.project, shots } };
    render();
}
function reorderShot(draggedId, targetId) {
    if (!draggedId || draggedId === targetId)
        return;
    const from = state.project.shots.findIndex((shot) => shot.id === draggedId);
    const to = state.project.shots.findIndex((shot) => shot.id === targetId);
    if (from < 0 || to < 0)
        return;
    const shots = [...state.project.shots];
    const [shot] = shots.splice(from, 1);
    const insertAt = from < to ? to - 1 : to;
    shots.splice(insertAt, 0, shot);
    state = { ...state, selectedShotId: draggedId, project: { ...state.project, shots } };
    render();
}
function playPreview(startAtSeconds = 0, onlySelected = false) {
    if (previewTimer !== null)
        window.clearTimeout(previewTimer);
    const selected = selectedShot();
    const sequence = onlySelected ? [selected] : state.project.shots;
    const total = onlySelected ? selected.duration : totalDuration();
    const start = Math.max(0, Math.min(total, Number(startAtSeconds || 0)));
    playheadSeconds = onlySelected ? getShotStartSeconds(selected.id) : start;
    if (start >= total)
        return;
    let elapsed = 0;
    const firstIndex = sequence.findIndex((shot) => {
        const nextElapsed = elapsed + shot.duration;
        const found = start < nextElapsed;
        if (!found)
            elapsed = nextElapsed;
        return found;
    });
    if (firstIndex < 0)
        return;
    let index = firstIndex;
    const next = () => {
        if (index >= sequence.length) {
            state = { ...state, playingShotId: null };
            render();
            return;
        }
        const current = sequence[index];
        playheadSeconds = onlySelected ? getShotStartSeconds(current.id) : elapsed;
        state = { ...state, playingShotId: current.id, selectedShotId: current.id };
        render();
        const alreadyInsideShot = index === firstIndex ? Math.max(0, start - elapsed) : 0;
        const remaining = Math.max(0.4, current.duration - alreadyInsideShot);
        previewTimer = window.setTimeout(() => {
            elapsed += current.duration;
            index += 1;
            next();
        }, Math.max(600, remaining * 420));
    };
    next();
}
function locateTime(event) {
    updatePlayheadFromClientX(event.clientX, true);
}
function updatePlayheadFromClientX(clientX, shouldRender) {
    const rect = els.rhythmTrack.getBoundingClientRect();
    const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
    const target = Math.max(0, Math.min(totalDuration(), totalDuration() * ratio));
    playheadSeconds = target;
    let elapsed = 0;
    const found = state.project.shots.find((shot) => {
        const nextElapsed = elapsed + shot.duration;
        const isInside = target < nextElapsed;
        if (!isInside)
            elapsed = nextElapsed;
        return isInside;
    });
    if (!found)
        return;
    state = { ...state, selectedShotId: found.id };
    els.playFrom.value = String(Math.round(target));
    if (shouldRender) {
        render();
    }
    else {
        const total = totalDuration();
        const playhead = els.rhythmTrack.querySelector("[data-playhead]");
        if (playhead && total > 0)
            playhead.style.setProperty("--playhead-left", `${(target / total) * 100}%`);
        els.rhythmTrack.querySelectorAll(".timeline-clip[data-timeline-shot]").forEach((segment) => {
            segment.classList.toggle("selected", segment.dataset.timelineShot === found.id);
        });
    }
}
function getShotStartSeconds(shotId) {
    let elapsed = 0;
    for (const shot of state.project.shots) {
        if (shot.id === shotId)
            return elapsed;
        elapsed += shot.duration;
    }
    return 0;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function saveProviderSettings() {
    const provider = els.providerSelect.value;
    const nextSettings = {
        provider,
        apiKey: els.providerApiKey.value.trim(),
        baseUrl: els.providerBaseUrl.value.trim() || defaultProviderSettings.baseUrl,
    };
    state = { ...state, providerSettings: nextSettings };
    window.localStorage.setItem(providerStorageKey, JSON.stringify(nextSettings));
    renderProviderSettings();
}
function addGenerationJob(shot, status, requestedCount, message) {
    return {
        id: crypto.randomUUID(),
        provider: state.providerSettings.provider,
        status,
        requestedCount,
        message,
        createdAt: new Date().toLocaleTimeString("zh-Hant", { hour: "2-digit", minute: "2-digit" }),
    };
}
function loadProviderSettings() {
    try {
        const raw = window.localStorage.getItem(providerStorageKey);
        if (!raw)
            return defaultProviderSettings;
        const parsed = JSON.parse(raw);
        return {
            provider: isProviderId(parsed.provider) ? parsed.provider : "vidu",
            apiKey: parsed.apiKey ?? "",
            baseUrl: parsed.baseUrl ?? defaultProviderSettings.baseUrl,
        };
    }
    catch {
        return defaultProviderSettings;
    }
}
function isProviderId(value) {
    return typeof value === "string" && value in providerCapabilities;
}
function createMockCandidates(count) {
    return Array.from({ length: count }, (_, index) => ({
        id: crypto.randomUUID(),
        name: `V${index + 1}`,
        status: index === 0 ? "已選" : "未生成",
        seed: randomSeed(),
    }));
}
function startMockGeneration(forceError = false) {
    const shot = selectedShot();
    const requestedCount = Math.max(1, Math.min(4, Number(els.generationCount.value || 1)));
    if (!state.providerSettings.apiKey) {
        const job = addGenerationJob(shot, "failed", requestedCount, "請先到 Provider 設定填入 Vidu API Key。");
        updateSelected({ status: "draft", generationJobs: [job, ...shot.generationJobs] });
        return;
    }
    if (forceError) {
        const job = addGenerationJob(shot, "failed", requestedCount, "Vidu 回應：Credit 不足，請儲值或降低生成數量。");
        updateSelected({ status: "draft", generationJobs: [job, ...shot.generationJobs] });
        return;
    }
    const waitingJob = addGenerationJob(shot, "waiting", requestedCount, `已送出 ${requestedCount} 部影片生成，等待 Vidu 回應中。`);
    updateSelected({
        status: "generating",
        generationJobs: [waitingJob, ...shot.generationJobs],
    });
    window.setTimeout(() => {
        const currentShot = state.project.shots.find((item) => item.id === shot.id);
        if (!currentShot)
            return;
        const doneJob = {
            ...waitingJob,
            status: "done",
            message: `生成完成，已收到 ${requestedCount} 個版本。`,
        };
        const jobs = currentShot.generationJobs.map((job) => (job.id === waitingJob.id ? doneJob : job));
        updateShotById(shot.id, {
            status: "done",
            candidates: createMockCandidates(requestedCount),
            selectedCandidateIndex: 0,
            generationJobs: jobs,
        });
    }, 1200);
}
function createMockCandidatesPatch(count) {
    return {
        status: "done",
        candidates: createMockCandidates(count),
        selectedCandidateIndex: 0,
    };
}
function shotSvg(shot, size) {
    const [start, end] = palette[shot.imageSeed % palette.length];
    const title = escapeHtml(shot.title);
    const prompt = escapeHtml(shot.prompt.split("，")[0] || shot.prompt);
    const titleSize = size === "stage" ? 34 : size === "card" ? 18 : 14;
    const promptSize = size === "stage" ? 18 : 10;
    return `
    <svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="g-${shot.id}-${shot.imageSeed}" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
        <radialGradient id="spark-${shot.id}-${shot.imageSeed}" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="rgba(255,255,255,.92)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="640" height="360" fill="url(#g-${shot.id}-${shot.imageSeed})" />
      <circle cx="320" cy="140" r="118" fill="url(#spark-${shot.id}-${shot.imageSeed})" opacity=".55" />
      <rect x="270" y="106" width="100" height="170" rx="24" fill="rgba(15,23,42,.62)" />
      <rect x="286" y="76" width="68" height="42" rx="10" fill="rgba(255,255,255,.28)" />
      <g fill="rgba(255,255,255,.7)">
        <circle cx="210" cy="92" r="7" />
        <circle cx="246" cy="62" r="5" />
        <circle cx="410" cy="82" r="8" />
        <circle cx="438" cy="128" r="4" />
        <circle cx="188" cy="152" r="4" />
        <circle cx="454" cy="198" r="6" />
      </g>
      <rect x="34" y="260" width="572" height="72" rx="12" fill="rgba(0,0,0,.42)" />
      <text x="58" y="293" fill="white" font-size="${titleSize}" font-weight="850" font-family="Inter, sans-serif">${title}</text>
      <text x="58" y="318" fill="rgba(255,255,255,.78)" font-size="${promptSize}" font-family="Inter, sans-serif">${prompt}</text>
    </svg>
  `;
}
function randomSeed() {
    return Math.floor(Math.random() * 1000);
}
function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}
els.playPreview.addEventListener("click", () => playPreview(0, false));
els.playSelected.addEventListener("click", () => playPreview(0, true));
els.playFromTime.addEventListener("click", () => playPreview(Number(els.playFrom.value), false));
els.rhythmTrack.addEventListener("click", locateTime);
els.openStoryboardDialog.addEventListener("click", () => els.storyboardDialog.showModal());
els.closeStoryboardDialog.addEventListener("click", () => els.storyboardDialog.close());
function openProviderSettings() {
    renderProviderSettings();
    els.apiSettingsDialog.showModal();
}
els.openApiSettings.addEventListener("click", openProviderSettings);
els.openApiSettingsInline.addEventListener("click", openProviderSettings);
els.saveApiSettings.addEventListener("click", saveProviderSettings);
els.shotTitle.addEventListener("input", () => updateSelected({ title: els.shotTitle.value }));
els.shotDuration.addEventListener("input", () => {
    updateSelected({ duration: Math.max(1, Math.min(20, Number(els.shotDuration.value || 1))) });
});
els.shotPrompt.addEventListener("input", () => updateSelected({ prompt: els.shotPrompt.value }));
els.trimShorter.addEventListener("click", () => adjustDuration(state.selectedShotId, -1));
els.trimLonger.addEventListener("click", () => adjustDuration(state.selectedShotId, 1));
document.querySelectorAll("input[name='mode']").forEach((input) => {
    input.addEventListener("change", () => updateSelected({ mode: input.value }));
});
document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
        document.querySelectorAll(".chip").forEach((item) => item.classList.remove("active"));
        chip.classList.add("active");
    });
});
els.generateStoryboard.addEventListener("click", () => updateSelected({ imageSeed: randomSeed() }));
els.mockGenerateVideo.addEventListener("click", () => {
    const capability = providerCapabilities[state.providerSettings.provider];
    const endpoint = capability.endpoints[selectedShot().mode];
    if (!endpoint && selectedShot().mode !== "import")
        return;
    startMockGeneration(false);
});
els.mockCreditError.addEventListener("click", () => startMockGeneration(true));
render();
