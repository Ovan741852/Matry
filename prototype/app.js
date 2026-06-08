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

let shots = [
  createShot("瓶蓋打開", 2, "frames", "手指旋開冰涼可樂瓶蓋，瓶口冒出第一道氣泡。", 0, "done"),
  createShot("氣泡噴出", 4, "frames", "大量氣泡從瓶口噴出，慢動作，水珠飛濺，背景為深色攝影棚。", 1, "generating"),
  createShot("結尾標語", 3, "text", "可樂瓶站在冰塊上，畫面出現醒目標語，最後定格成廣告主視覺。", 2, "done"),
];

let selectedShotId = shots[1].id;
let playingShotId = null;
let previewTimer = null;

const els = {
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
            { id: crypto.randomUUID(), name: "V1", status: "未生成", seed: imageSeed + 1 },
            { id: crypto.randomUUID(), name: "V2", status: "已選", seed: imageSeed + 2 },
            { id: crypto.randomUUID(), name: "V3", status: "未生成", seed: imageSeed + 3 },
            { id: crypto.randomUUID(), name: "V4", status: "未生成", seed: imageSeed + 4 },
          ]
        : [],
    selectedCandidateIndex: status === "done" ? 1 : null,
  };
}

function selectedShot() {
  return shots.find((shot) => shot.id === selectedShotId) ?? shots[0];
}

function totalDuration() {
  return shots.reduce((sum, shot) => sum + Number(shot.duration || 0), 0);
}

function render() {
  const total = totalDuration();
  const current = selectedShot();

  els.totalDuration.textContent = `${total}s`;
  els.shotCount.textContent = `${shots.length} 個片段`;
  els.playFrom.max = total;
  els.shotRail.innerHTML = shots.map(renderShotCard).join("") + renderAddCard();
  els.stageImage.innerHTML = renderStage(current);
  els.stageTimecode.textContent = `00:01 / 00:${String(current.duration).padStart(2, "0")}`;
  els.rhythmTrack.innerHTML = renderScrubTrack(total);
  els.settingsTitle.textContent = `Shot ${shots.findIndex((shot) => shot.id === current.id) + 1} 設定`;
  els.shotTitle.value = current.title;
  els.shotDuration.value = current.duration;
  els.shotPrompt.value = current.prompt;
  els.promptCount.textContent = `${current.prompt.length} / 200`;
  els.storyboardPreview.innerHTML = shotSvg(current, "sketch");

  document.querySelectorAll("input[name='mode']").forEach((input) => {
    input.checked = input.value === current.mode;
  });

  renderCandidates(current);
  bindShotCards();
}

function renderShotCard(shot, index) {
  const active = shot.id === selectedShotId ? " active" : "";
  const playing = shot.id === playingShotId ? " playing" : "";
  const statusClass = shot.status === "generating" ? " generating" : "";
  const statusText = shot.status === "generating" ? "⟳ 生成中" : shot.status === "done" ? "✓ 已生成" : "○ 草稿";

  return `
    <article class="storyboard-card${active}${playing}" data-shot="${shot.id}">
      <div class="shot-image">
        ${shotSvg(shot, "card")}
        <span class="status-badge${statusClass}">${statusText}</span>
        <span class="shot-number">Shot ${index + 1}</span>
      </div>
      <div class="card-title-row">
        <strong>${escapeHtml(shot.title)}</strong>
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

function renderStage(shot) {
  return `
    ${shotSvg(shot, "stage")}
    <div class="stage-overlay">
      <span>Shot ${shots.findIndex((item) => item.id === shot.id) + 1}</span>
      <strong>${escapeHtml(shot.title)}</strong>
    </div>
  `;
}

function renderScrubTrack(total) {
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
    els.candidateList.innerHTML = `
      <button class="version-card empty-version" type="button">
        <div class="version-thumb">${shotSvg(shot, "version")}</div>
        <div class="version-meta"><span>尚未生成</span><span>草稿</span></div>
      </button>
    `;
    return;
  }

  els.candidateList.innerHTML = shot.candidates
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

  els.candidateList.querySelectorAll("[data-version]").forEach((button) => {
    button.addEventListener("click", () => {
      updateSelected({ selectedCandidateIndex: Number(button.dataset.version), status: "done" });
    });
  });
}

function bindShotCards() {
  els.shotRail.querySelectorAll(".storyboard-card[data-shot]").forEach((card) => {
    card.draggable = true;
    card.addEventListener("click", (event) => {
      if (event.target.closest("[data-action]")) return;
      selectedShotId = card.dataset.shot;
      render();
    });
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", card.dataset.shot);
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
      const draggedId = event.dataTransfer.getData("text/plain");
      card.classList.remove("drop-before");
      reorderShot(draggedId, card.dataset.shot);
    });
  });

  els.shotRail.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.shot;
      const action = button.dataset.action;
      if (action === "shorter") adjustDuration(id, -1);
      if (action === "longer") adjustDuration(id, 1);
      if (action === "left") moveShot(id, -1);
      if (action === "right") moveShot(id, 1);
    });
  });

  document.querySelector("#addShotCard").addEventListener("click", addShot);
}

function clearDropMarkers() {
  els.shotRail.querySelectorAll(".drop-before").forEach((item) => item.classList.remove("drop-before"));
}

function addShot() {
  const newShot = createShot("新片段", 3, "text", "描述這一段會出現的畫面、動作和節奏。", randomSeed(), "draft");
  shots = [...shots, newShot];
  selectedShotId = newShot.id;
  render();
}

function updateSelected(patch) {
  shots = shots.map((shot) => (shot.id === selectedShotId ? { ...shot, ...patch } : shot));
  render();
}

function adjustDuration(id, delta) {
  shots = shots.map((shot) =>
    shot.id === id ? { ...shot, duration: Math.max(1, Math.min(20, Number(shot.duration) + delta)) } : shot,
  );
  selectedShotId = id;
  render();
}

function moveShot(id, direction) {
  const index = shots.findIndex((shot) => shot.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= shots.length) return;
  const nextShots = [...shots];
  const [shot] = nextShots.splice(index, 1);
  nextShots.splice(nextIndex, 0, shot);
  shots = nextShots;
  selectedShotId = id;
  render();
}

function reorderShot(draggedId, targetId) {
  if (!draggedId || draggedId === targetId) return;
  const from = shots.findIndex((shot) => shot.id === draggedId);
  const to = shots.findIndex((shot) => shot.id === targetId);
  if (from < 0 || to < 0) return;
  const nextShots = [...shots];
  const [shot] = nextShots.splice(from, 1);
  const insertAt = from < to ? to - 1 : to;
  nextShots.splice(insertAt, 0, shot);
  shots = nextShots;
  selectedShotId = draggedId;
  render();
}

function playPreview(startAtSeconds = 0, onlySelected = false) {
  clearTimeout(previewTimer);
  const sequence = onlySelected ? [selectedShot()] : shots;
  const total = onlySelected ? selectedShot().duration : totalDuration();
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
      playingShotId = null;
      render();
      return;
    }

    const current = sequence[index];
    playingShotId = current.id;
    selectedShotId = current.id;
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

function locateTime(seconds) {
  const target = Math.max(0, Math.min(totalDuration(), Number(seconds || 0)));
  let elapsed = 0;
  const found = shots.find((shot) => {
    const nextElapsed = elapsed + shot.duration;
    const isInside = target < nextElapsed;
    if (!isInside) elapsed = nextElapsed;
    return isInside;
  });
  if (!found) return;
  selectedShotId = found.id;
  els.playFrom.value = Math.round(target);
  render();
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
els.playFromTime.addEventListener("click", () => playPreview(els.playFrom.value, false));
els.rhythmTrack.addEventListener("click", (event) => {
  const rect = els.rhythmTrack.getBoundingClientRect();
  const ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
  locateTime(totalDuration() * ratio);
});

els.shotTitle.addEventListener("input", () => updateSelected({ title: els.shotTitle.value }));
els.shotDuration.addEventListener("input", () => {
  updateSelected({ duration: Math.max(1, Math.min(20, Number(els.shotDuration.value || 1))) });
});
els.shotPrompt.addEventListener("input", () => updateSelected({ prompt: els.shotPrompt.value }));
els.trimShorter.addEventListener("click", () => adjustDuration(selectedShotId, -1));
els.trimLonger.addEventListener("click", () => adjustDuration(selectedShotId, 1));

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
  const shot = selectedShot();
  updateSelected({
    status: "done",
    candidates: Array.from({ length: 4 }, (_, index) => ({
      id: crypto.randomUUID(),
      name: `V${index + 1}`,
      status: index === 1 ? "已選" : "未生成",
      seed: randomSeed(),
    })),
    selectedCandidateIndex: 1,
  });
});

render();
