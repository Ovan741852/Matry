const modeLabels = {
  text: "只用文字",
  frames: "起點到終點",
  reference: "參考圖生成",
};

const palette = [
  ["#3157d8", "#e8752c"],
  ["#b91c52", "#1ba7d8"],
  ["#4338ca", "#78a22f"],
  ["#0f766e", "#ca8a04"],
  ["#7c3aed", "#0f766e"],
  ["#b45309", "#2563eb"],
];

let scenes = [
  {
    id: crypto.randomUUID(),
    title: "開場吸引",
    purpose: "讓觀眾立刻知道主角是冰涼可樂。",
    shots: [
      shot("瓶蓋打開", 2, "frames", "可樂瓶近拍，瓶蓋被打開，瓶口有第一道氣泡衝出。", 1, true),
      shot("氣泡噴出", 4, "reference", "無數氣泡從瓶口噴出，畫面有清涼、刺激、慢動作的感覺。", 2, false),
    ],
  },
  {
    id: crypto.randomUUID(),
    title: "結尾記憶",
    purpose: "把商品停在最好看的主視覺。",
    shots: [
      shot("結尾定格", 3, "text", "可樂瓶站在冰塊上，背景明亮，最後定格成廣告主視覺。", 3, true),
    ],
  },
];

let activeSceneId = scenes[0].id;
let activeShotId = scenes[0].shots[0].id;
let playingShotId = null;
let previewTimer = null;
let activeTab = "content";

const els = {
  sceneCount: document.querySelector("#sceneCount"),
  shotCount: document.querySelector("#shotCount"),
  totalDuration: document.querySelector("#totalDuration"),
  sceneList: document.querySelector("#sceneList"),
  activeSceneLabel: document.querySelector("#activeSceneLabel"),
  activeSceneTitle: document.querySelector("#activeSceneTitle"),
  shotRail: document.querySelector("#shotRail"),
  stageImage: document.querySelector("#stageImage"),
  stageKicker: document.querySelector("#stageKicker"),
  stageTitle: document.querySelector("#stageTitle"),
  stagePrompt: document.querySelector("#stagePrompt"),
  rhythmTrack: document.querySelector("#rhythmTrack"),
  shotTitle: document.querySelector("#shotTitle"),
  shotDuration: document.querySelector("#shotDuration"),
  shotPrompt: document.querySelector("#shotPrompt"),
  storyboardPreview: document.querySelector("#storyboardPreview"),
  candidateList: document.querySelector("#candidateList"),
  addScene: document.querySelector("#addScene"),
  addShot: document.querySelector("#addShot"),
  playPreview: document.querySelector("#playPreview"),
  generateStoryboard: document.querySelector("#generateStoryboard"),
  replaceStoryboard: document.querySelector("#replaceStoryboard"),
  mockGenerateVideo: document.querySelector("#mockGenerateVideo"),
  deleteShot: document.querySelector("#deleteShot"),
};

function shot(title, duration, mode, prompt, imageSeed, done) {
  return {
    id: crypto.randomUUID(),
    title,
    duration,
    mode,
    prompt,
    purpose: "",
    imageSeed,
    candidates: done ? ["版本 A"] : [],
    selectedCandidate: done ? 0 : null,
  };
}

function activeScene() {
  return scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0];
}

function activeShot() {
  return activeScene().shots.find((item) => item.id === activeShotId) ?? activeScene().shots[0];
}

function allShots() {
  return scenes.flatMap((scene) => scene.shots.map((item) => ({ ...item, sceneTitle: scene.title })));
}

function totalDuration() {
  return allShots().reduce((sum, item) => sum + Number(item.duration || 0), 0);
}

function sceneDuration(scene) {
  return scene.shots.reduce((sum, item) => sum + Number(item.duration || 0), 0);
}

function render() {
  const scene = activeScene();
  const item = activeShot();
  const total = totalDuration();
  const shotCount = allShots().length;

  els.sceneCount.textContent = scenes.length;
  els.shotCount.textContent = shotCount;
  els.totalDuration.textContent = `${total}s`;
  els.activeSceneLabel.textContent = `${scene.shots.length} 格 / ${sceneDuration(scene)}s`;
  els.activeSceneTitle.textContent = scene.title;

  renderScenes();
  renderShots(scene);
  renderStage(item);
  renderInspector(item);
  renderRhythm(total);
  bindTabs();
}

function renderScenes() {
  els.sceneList.innerHTML = scenes
    .map((scene, index) => {
      const activeClass = scene.id === activeSceneId ? " active" : "";
      return `
        <button class="scene-item${activeClass}" data-scene="${scene.id}" type="button">
          <strong>${index + 1}. ${escapeHtml(scene.title)}</strong>
          <span>${scene.shots.length} 格分鏡 · ${sceneDuration(scene)}s</span>
        </button>
      `;
    })
    .join("");

  els.sceneList.querySelectorAll("[data-scene]").forEach((button) => {
    button.addEventListener("click", () => {
      activeSceneId = button.dataset.scene;
      activeShotId = activeScene().shots[0].id;
      render();
    });
  });
}

function renderShots(scene) {
  els.shotRail.innerHTML = scene.shots
    .map((item, index) => {
      const activeClass = item.id === activeShotId ? " active" : "";
      const playingClass = item.id === playingShotId ? " playing" : "";
      return `
        <article class="shot-card${activeClass}${playingClass}" data-shot="${item.id}">
          <div class="shot-thumb">${shotSvg(item)}</div>
          <div class="shot-row">
            <div class="shot-name">${index + 1}. ${escapeHtml(item.title)}</div>
            <div class="duration">${item.duration}s</div>
          </div>
          <div class="mode">${modeLabels[item.mode]}</div>
          <div class="mini-actions">
            <button data-action="left" data-shot="${item.id}" type="button">←</button>
            <button data-action="duplicate" data-shot="${item.id}" type="button">複</button>
            <button data-action="right" data-shot="${item.id}" type="button">→</button>
          </div>
        </article>
      `;
    })
    .join("");

  els.shotRail.querySelectorAll(".shot-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      activeShotId = card.dataset.shot;
      render();
    });
  });

  els.shotRail.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.shot;
      const action = button.dataset.action;
      if (action === "left") moveShot(id, -1);
      if (action === "right") moveShot(id, 1);
      if (action === "duplicate") duplicateShot(id);
    });
  });
}

function renderStage(item) {
  els.stageImage.innerHTML = shotSvg(item, true);
  els.stageKicker.textContent =
    item.id === playingShotId ? `播放中 · ${item.duration}s` : `${modeLabels[item.mode]} · ${item.duration}s`;
  els.stageTitle.textContent = item.title;
  els.stagePrompt.textContent = item.prompt;
  els.storyboardPreview.innerHTML = shotSvg(item, true);
}

function renderInspector(item) {
  els.shotTitle.value = item.title;
  els.shotDuration.value = item.duration;
  els.shotPrompt.value = item.prompt;

  document.querySelectorAll("input[name='mode']").forEach((input) => {
    input.checked = input.value === item.mode;
  });

  renderCandidates(item);
}

function renderCandidates(item) {
  if (item.candidates.length === 0) {
    els.candidateList.innerHTML = `<div class="candidate">尚未產生影片草稿</div>`;
    return;
  }

  els.candidateList.innerHTML = item.candidates
    .map((name, index) => {
      const selectedClass = item.selectedCandidate === index ? " selected" : "";
      const label = item.selectedCandidate === index ? "使用中" : "選用";
      return `
        <div class="candidate${selectedClass}">
          <span>${escapeHtml(name)}</span>
          <button data-candidate="${index}" type="button">${label}</button>
        </div>
      `;
    })
    .join("");

  els.candidateList.querySelectorAll("[data-candidate]").forEach((button) => {
    button.addEventListener("click", () => {
      updateActiveShot({ selectedCandidate: Number(button.dataset.candidate) });
    });
  });
}

function renderRhythm(total) {
  els.rhythmTrack.innerHTML = allShots()
    .map((item) => {
      const width = total > 0 ? Math.max(5, (item.duration / total) * 100) : 0;
      const playingClass = item.id === playingShotId ? " playing" : "";
      return `<div class="rhythm-segment${playingClass}" style="width:${width}%">${item.duration}s</div>`;
    })
    .join("");
}

function bindTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === activeTab);
    tab.addEventListener("click", () => {
      activeTab = tab.dataset.tab;
      document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("active", item.dataset.tab === activeTab));
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.panel === activeTab);
      });
    });
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === activeTab);
  });
}

function addScene() {
  const newScene = {
    id: crypto.randomUUID(),
    title: `新段落 ${scenes.length + 1}`,
    purpose: "",
    shots: [shot("新分鏡", 3, "text", "描述這一格畫面要發生什麼。", randomSeed(), false)],
  };
  scenes = [...scenes, newScene];
  activeSceneId = newScene.id;
  activeShotId = newScene.shots[0].id;
  render();
}

function addShot() {
  const scene = activeScene();
  const newShot = shot(`新分鏡 ${scene.shots.length + 1}`, 3, "text", "描述這一格畫面要發生什麼。", randomSeed(), false);
  scenes = scenes.map((item) => (item.id === scene.id ? { ...item, shots: [...item.shots, newShot] } : item));
  activeShotId = newShot.id;
  render();
}

function updateActiveShot(patch) {
  scenes = scenes.map((scene) => {
    if (scene.id !== activeSceneId) return scene;
    return {
      ...scene,
      shots: scene.shots.map((item) => (item.id === activeShotId ? { ...item, ...patch } : item)),
    };
  });
  render();
}

function moveShot(id, direction) {
  const scene = activeScene();
  const index = scene.shots.findIndex((item) => item.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= scene.shots.length) return;
  const nextShots = [...scene.shots];
  const [item] = nextShots.splice(index, 1);
  nextShots.splice(nextIndex, 0, item);
  scenes = scenes.map((candidate) => (candidate.id === scene.id ? { ...candidate, shots: nextShots } : candidate));
  activeShotId = id;
  render();
}

function duplicateShot(id) {
  const scene = activeScene();
  const index = scene.shots.findIndex((item) => item.id === id);
  if (index < 0) return;
  const copy = {
    ...scene.shots[index],
    id: crypto.randomUUID(),
    title: `${scene.shots[index].title} 複製`,
    imageSeed: scene.shots[index].imageSeed + 7,
    candidates: [],
    selectedCandidate: null,
  };
  const nextShots = [...scene.shots.slice(0, index + 1), copy, ...scene.shots.slice(index + 1)];
  scenes = scenes.map((candidate) => (candidate.id === scene.id ? { ...candidate, shots: nextShots } : candidate));
  activeShotId = copy.id;
  render();
}

function deleteActiveShot() {
  const scene = activeScene();
  if (scene.shots.length <= 1) return;
  const index = scene.shots.findIndex((item) => item.id === activeShotId);
  const nextShots = scene.shots.filter((item) => item.id !== activeShotId);
  scenes = scenes.map((candidate) => (candidate.id === scene.id ? { ...candidate, shots: nextShots } : candidate));
  activeShotId = nextShots[Math.max(0, index - 1)].id;
  render();
}

function playPreview() {
  clearTimeout(previewTimer);
  const sequence = allShots();
  let index = 0;

  const next = () => {
    if (index >= sequence.length) {
      playingShotId = null;
      render();
      return;
    }

    const current = sequence[index];
    const owner = scenes.find((scene) => scene.shots.some((item) => item.id === current.id));
    playingShotId = current.id;
    activeSceneId = owner.id;
    activeShotId = current.id;
    render();

    previewTimer = setTimeout(() => {
      index += 1;
      next();
    }, Math.max(600, current.duration * 420));
  };

  next();
}

function shotSvg(item, large = false) {
  const [start, end] = palette[item.imageSeed % palette.length];
  const title = escapeHtml(item.title);
  const prompt = escapeHtml(item.prompt.split("，")[0] || item.prompt);
  const titleSize = large ? 32 : 24;
  const promptSize = large ? 18 : 13;

  return `
    <svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="g-${item.id}" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#g-${item.id})" />
      <circle cx="${120 + (item.imageSeed % 6) * 62}" cy="110" r="54" fill="rgba(255,255,255,.28)" />
      <rect x="44" y="238" width="552" height="72" rx="12" fill="rgba(0,0,0,.34)" />
      <text x="68" y="272" fill="white" font-size="${titleSize}" font-weight="850" font-family="Inter, sans-serif">${title}</text>
      <text x="68" y="296" fill="rgba(255,255,255,.8)" font-size="${promptSize}" font-family="Inter, sans-serif">${prompt}</text>
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

els.addScene.addEventListener("click", addScene);
els.addShot.addEventListener("click", addShot);
els.playPreview.addEventListener("click", playPreview);
els.deleteShot.addEventListener("click", deleteActiveShot);

els.shotTitle.addEventListener("input", () => updateActiveShot({ title: els.shotTitle.value }));
els.shotPrompt.addEventListener("input", () => updateActiveShot({ prompt: els.shotPrompt.value }));
els.shotDuration.addEventListener("input", () => {
  updateActiveShot({ duration: Math.max(1, Math.min(20, Number(els.shotDuration.value || 1))) });
});

document.querySelectorAll("input[name='mode']").forEach((input) => {
  input.addEventListener("change", () => updateActiveShot({ mode: input.value }));
});

els.generateStoryboard.addEventListener("click", () => updateActiveShot({ imageSeed: activeShot().imageSeed + 1 }));
els.replaceStoryboard.addEventListener("click", () => updateActiveShot({ imageSeed: randomSeed() }));
els.mockGenerateVideo.addEventListener("click", () => {
  const item = activeShot();
  updateActiveShot({
    candidates: [...item.candidates, `版本 ${String.fromCharCode(65 + item.candidates.length)}`],
    selectedCandidate: item.candidates.length,
  });
});

render();
