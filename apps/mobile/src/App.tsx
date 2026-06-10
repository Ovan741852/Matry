import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type BlockStatus = "draft" | "generating" | "ready";
type ViewMode = "projects" | "editor";

type SceneBlock = {
  id: string;
  title: string;
  intent: "Hook" | "Demo" | "Benefit" | "Proof" | "CTA";
  duration: number;
  prompt: string;
  status: BlockStatus;
  mediaLabel: string;
  versions: string[];
};

type Project = {
  id: string;
  title: string;
  goal: string;
  branch: string;
  blocks: SceneBlock[];
};

const initialProjects: Project[] = [
  {
    id: "ollama",
    title: "Ollama Launch Clips",
    goal: "Clicks",
    branch: "X Launch A",
    blocks: [
      createBlock("Hook: run local models", "Hook", 3, "Run AI models locally, your machine.", "ready"),
      createBlock("Demo: install to chat", "Demo", 5, "Show install, model start, and chat.", "generating"),
      createBlock("CTA: download", "CTA", 4, "Download and ship your first local AI workflow.", "ready"),
    ],
  },
  {
    id: "product-hunt",
    title: "Product Hunt Round",
    goal: "Signups",
    branch: "PH Launch B",
    blocks: [
      createBlock("Problem hook", "Hook", 3, "Stop paying for hosted inference.", "draft"),
      createBlock("Feature demo", "Demo", 5, "Show product workflow in one screen.", "draft"),
      createBlock("CTA", "CTA", 3, "Try it today.", "draft"),
    ],
  },
];

function createBlock(
  title: string,
  intent: SceneBlock["intent"],
  duration: number,
  prompt: string,
  status: BlockStatus,
): SceneBlock {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    intent,
    duration,
    prompt,
    status,
    mediaLabel: status === "ready" ? "Selected video" : "No video selected",
    versions: status === "ready" ? ["Variant A", "Variant B"] : [],
  };
}

export default function App() {
  const [view, setView] = useState<ViewMode>("projects");
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState(initialProjects[0].id);
  const [selectedBlockId, setSelectedBlockId] = useState(initialProjects[0].blocks[0].id);
  const [playingBlockId, setPlayingBlockId] = useState<string | null>(null);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectGoal, setProjectGoal] = useState("");

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0],
    [activeProjectId, projects],
  );
  const selectedBlock =
    activeProject.blocks.find((block) => block.id === selectedBlockId) ?? activeProject.blocks[0];
  const totalDuration = activeProject.blocks.reduce((sum, block) => sum + block.duration, 0);

  function updateActiveProject(nextProject: Project) {
    setProjects((current) => current.map((project) => (project.id === nextProject.id ? nextProject : project)));
  }

  function openProject(project: Project) {
    setActiveProjectId(project.id);
    setSelectedBlockId(project.blocks[0]?.id ?? "");
    setPlayingBlockId(null);
    setView("editor");
  }

  function openProjectModal(project?: Project) {
    setEditingProjectId(project?.id ?? null);
    setProjectTitle(project?.title ?? "");
    setProjectGoal(project?.goal ?? "");
    setProjectModalVisible(true);
  }

  function saveProject() {
    const title = projectTitle.trim();
    if (!title) return;
    const goal = projectGoal.trim() || "Clicks";

    if (editingProjectId) {
      setProjects((current) =>
        current.map((project) => (project.id === editingProjectId ? { ...project, title, goal } : project)),
      );
    } else {
      const project: Project = {
        id: `${Date.now()}`,
        title,
        goal,
        branch: "Launch A",
        blocks: [
          createBlock("Hook", "Hook", 3, "Open with the strongest launch angle.", "draft"),
          createBlock("Demo", "Demo", 5, "Show the core product workflow.", "draft"),
          createBlock("CTA", "CTA", 3, "Tell viewers what to do next.", "draft"),
        ],
      };
      setProjects((current) => [project, ...current]);
      setActiveProjectId(project.id);
    }

    setProjectModalVisible(false);
  }

  function deleteProject(project: Project) {
    Alert.alert("刪除專案", `刪除「${project.title}」？`, [
      { text: "取消", style: "cancel" },
      {
        text: "刪除",
        style: "destructive",
        onPress: () => {
          setProjects((current) => {
            const next = current.filter((item) => item.id !== project.id);
            if (next.length > 0 && activeProjectId === project.id) setActiveProjectId(next[0].id);
            return next.length > 0 ? next : initialProjects;
          });
        },
      },
    ]);
  }

  function moveBlock(blockId: string, direction: -1 | 1) {
    const index = activeProject.blocks.findIndex((block) => block.id === blockId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= activeProject.blocks.length) return;
    const blocks = [...activeProject.blocks];
    const [block] = blocks.splice(index, 1);
    blocks.splice(target, 0, block);
    updateActiveProject({ ...activeProject, blocks });
  }

  function watchBlock(blockId: string) {
    setSelectedBlockId(blockId);
    setPlayingBlockId(blockId);
  }

  function applyMedia(action: "ai" | "hyperframes" | "existing" | "upload") {
    const labelByAction = {
      ai: "AI Video draft",
      hyperframes: "HyperFrames render",
      existing: selectedBlock.versions[0] ?? "Existing video",
      upload: "Uploaded video",
    };
    const nextBlock: SceneBlock = {
      ...selectedBlock,
      status: action === "ai" ? "generating" : "ready",
      mediaLabel: labelByAction[action],
      versions: selectedBlock.versions.length ? selectedBlock.versions : ["Variant A"],
    };
    updateActiveProject({
      ...activeProject,
      blocks: activeProject.blocks.map((block) => (block.id === nextBlock.id ? nextBlock : block)),
    });
    setMediaModalVisible(false);
  }

  if (view === "projects") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Matry</Text>
            <Text style={styles.title}>Projects</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={() => openProjectModal()}>
            <Text style={styles.primaryButtonText}>新增專案</Text>
          </Pressable>
        </View>

        <FlatList
          contentContainerStyle={styles.projectList}
          data={projects}
          keyExtractor={(project) => project.id}
          renderItem={({ item }) => (
            <View style={styles.projectCard}>
              <View style={styles.projectPreview}>
                <Text style={styles.previewMark}>M</Text>
              </View>
              <View style={styles.projectBody}>
                <Text style={styles.eyebrow}>{item.branch}</Text>
                <Text style={styles.projectTitle}>{item.title}</Text>
                <View style={styles.statRow}>
                  <Text style={styles.stat}>{item.blocks.length} blocks</Text>
                  <Text style={styles.stat}>{item.blocks.reduce((sum, block) => sum + block.duration, 0)}s</Text>
                  <Text style={styles.stat}>{item.goal}</Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                <Pressable style={styles.primarySmallButton} onPress={() => openProject(item)}>
                  <Text style={styles.primarySmallButtonText}>編輯</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => openProjectModal(item)}>
                  <Text style={styles.secondaryButtonText}>改名</Text>
                </Pressable>
                <Pressable style={styles.dangerButton} onPress={() => deleteProject(item)}>
                  <Text style={styles.dangerButtonText}>刪除</Text>
                </Pressable>
              </View>
            </View>
          )}
        />

        <ProjectModal
          visible={projectModalVisible}
          title={projectTitle}
          goal={projectGoal}
          isEditing={Boolean(editingProjectId)}
          onChangeTitle={setProjectTitle}
          onChangeGoal={setProjectGoal}
          onClose={() => setProjectModalVisible(false)}
          onSave={saveProject}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.editorHeader}>
        <Pressable style={styles.backButton} onPress={() => setView("projects")}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View style={styles.editorTitleWrap}>
          <Text style={styles.editorTitle}>{activeProject.title}</Text>
          <Text style={styles.editorMeta}>
            {activeProject.branch} · {totalDuration}s · {activeProject.goal}
          </Text>
        </View>
        <Pressable style={styles.secondaryButton} onPress={() => setMediaModalVisible(true)}>
          <Text style={styles.secondaryButtonText}>媒體</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.editorContent}>
        <View style={styles.phonePreview}>
          <View style={styles.previewTopBar} />
          <Text style={styles.previewBlockLabel}>{playingBlockId ? "Now watching" : "Selected block"}</Text>
          <Text style={styles.previewHeadline}>{selectedBlock.title}</Text>
          <Text style={styles.previewPrompt}>{selectedBlock.prompt}</Text>
          <Text style={styles.previewTime}>{selectedBlock.duration}s · {selectedBlock.mediaLabel}</Text>
        </View>

        <Text style={styles.sectionHeading}>Scene Blocks</Text>
        {activeProject.blocks.map((block, index) => {
          const selected = block.id === selectedBlock.id;
          const playing = block.id === playingBlockId;
          return (
            <Pressable
              key={block.id}
              style={[styles.blockCard, selected && styles.blockCardSelected, playing && styles.blockCardPlaying]}
              onPress={() => setSelectedBlockId(block.id)}
            >
              <View style={styles.blockIndex}>
                <Text style={styles.blockIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.blockBody}>
                <View style={styles.blockTitleRow}>
                  <Text style={styles.blockTitle}>{block.title}</Text>
                  <Text style={styles.blockDuration}>{block.duration}s</Text>
                </View>
                <Text style={styles.blockMeta}>{block.intent} · {block.status} · {block.mediaLabel}</Text>
                <View style={styles.blockActions}>
                  <Pressable style={styles.blockButton} onPress={() => watchBlock(block.id)}>
                    <Text style={styles.blockButtonText}>觀看</Text>
                  </Pressable>
                  <Pressable style={styles.blockButton} onPress={() => moveBlock(block.id, -1)}>
                    <Text style={styles.blockButtonText}>上移</Text>
                  </Pressable>
                  <Pressable style={styles.blockButton} onPress={() => moveBlock(block.id, 1)}>
                    <Text style={styles.blockButtonText}>下移</Text>
                  </Pressable>
                  <Pressable
                    style={styles.blockButton}
                    onPress={() => {
                      setSelectedBlockId(block.id);
                      setMediaModalVisible(true);
                    }}
                  >
                    <Text style={styles.blockButtonText}>媒體</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <MediaModal visible={mediaModalVisible} block={selectedBlock} onClose={() => setMediaModalVisible(false)} onApply={applyMedia} />
    </SafeAreaView>
  );
}

function ProjectModal(props: {
  visible: boolean;
  title: string;
  goal: string;
  isEditing: boolean;
  onChangeTitle: (value: string) => void;
  onChangeGoal: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={props.visible}>
      <View style={styles.modalScrim}>
        <View style={styles.modalCard}>
          <Text style={styles.eyebrow}>Project</Text>
          <Text style={styles.modalTitle}>{props.isEditing ? "編輯專案" : "新增專案"}</Text>
          <TextInput
            style={styles.input}
            placeholder="專案名稱"
            value={props.title}
            onChangeText={props.onChangeTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="目標，例如 Clicks 或 Signups"
            value={props.goal}
            onChangeText={props.onChangeGoal}
          />
          <View style={styles.modalActions}>
            <Pressable style={styles.secondaryButton} onPress={props.onClose}>
              <Text style={styles.secondaryButtonText}>取消</Text>
            </Pressable>
            <Pressable style={styles.primarySmallButton} onPress={props.onSave}>
              <Text style={styles.primarySmallButtonText}>儲存</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MediaModal(props: {
  visible: boolean;
  block: SceneBlock;
  onClose: () => void;
  onApply: (action: "ai" | "hyperframes" | "existing" | "upload") => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={props.visible}>
      <View style={styles.modalScrim}>
        <View style={styles.modalCard}>
          <Text style={styles.eyebrow}>Scene Block</Text>
          <Text style={styles.modalTitle}>{props.block.title}</Text>
          <Text style={styles.modalSubtitle}>選擇怎麼生成影片，或使用舊影片。</Text>
          <View style={styles.mediaGrid}>
            <Pressable style={styles.mediaChoice} onPress={() => props.onApply("ai")}>
              <Text style={styles.mediaChoiceTitle}>AI Video</Text>
              <Text style={styles.mediaChoiceText}>透過 provider 生成影片</Text>
            </Pressable>
            <Pressable style={styles.mediaChoice} onPress={() => props.onApply("hyperframes")}>
              <Text style={styles.mediaChoiceTitle}>HyperFrames</Text>
              <Text style={styles.mediaChoiceText}>用模板渲染影片</Text>
            </Pressable>
            <Pressable style={styles.mediaChoice} onPress={() => props.onApply("existing")}>
              <Text style={styles.mediaChoiceTitle}>選擇舊影片</Text>
              <Text style={styles.mediaChoiceText}>{props.block.versions.length || 0} 個版本可用</Text>
            </Pressable>
            <Pressable style={styles.mediaChoice} onPress={() => props.onApply("upload")}>
              <Text style={styles.mediaChoiceTitle}>Upload Video</Text>
              <Text style={styles.mediaChoiceText}>使用上傳影片</Text>
            </Pressable>
          </View>
          <Pressable style={styles.secondaryButton} onPress={props.onClose}>
            <Text style={styles.secondaryButtonText}>關閉</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f9fc",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
  },
  eyebrow: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    color: "#111827",
    fontSize: 34,
    fontWeight: "900",
  },
  projectList: {
    gap: 14,
    padding: 18,
    paddingTop: 0,
  },
  projectCard: {
    backgroundColor: "#fff",
    borderColor: "#d9dee8",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  projectPreview: {
    alignItems: "center",
    aspectRatio: 16 / 9,
    backgroundColor: "#1459ff",
    justifyContent: "center",
  },
  previewMark: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "900",
  },
  projectBody: {
    gap: 10,
    padding: 14,
  },
  projectTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "900",
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  stat: {
    backgroundColor: "#f1f4f8",
    borderRadius: 999,
    color: "#667085",
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    padding: 14,
    paddingTop: 0,
  },
  primaryButton: {
    backgroundColor: "#1459ff",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "900",
  },
  primarySmallButton: {
    backgroundColor: "#1459ff",
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  primarySmallButtonText: {
    color: "#fff",
    fontWeight: "900",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderColor: "#d9dee8",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "800",
    textAlign: "center",
  },
  dangerButton: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecaca",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  dangerButtonText: {
    color: "#b42318",
    fontWeight: "800",
    textAlign: "center",
  },
  editorHeader: {
    alignItems: "center",
    borderBottomColor: "#d9dee8",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  backButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  backButtonText: {
    fontSize: 26,
  },
  editorTitleWrap: {
    flex: 1,
  },
  editorTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
  },
  editorMeta: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "700",
  },
  editorContent: {
    gap: 14,
    padding: 14,
  },
  phonePreview: {
    backgroundColor: "#080808",
    borderRadius: 18,
    minHeight: 360,
    overflow: "hidden",
    padding: 18,
    justifyContent: "flex-end",
  },
  previewTopBar: {
    backgroundColor: "#fff",
    borderRadius: 999,
    height: 5,
    left: "40%",
    opacity: 0.35,
    position: "absolute",
    right: "40%",
    top: 12,
  },
  previewBlockLabel: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  previewHeadline: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },
  previewPrompt: {
    color: "rgba(255,255,255,.76)",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  previewTime: {
    color: "rgba(255,255,255,.72)",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 14,
  },
  sectionHeading: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
  },
  blockCard: {
    backgroundColor: "#fff",
    borderColor: "#d9dee8",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  blockCardSelected: {
    borderColor: "#1459ff",
  },
  blockCardPlaying: {
    borderColor: "#f59e0b",
  },
  blockIndex: {
    alignItems: "center",
    backgroundColor: "#eef4ff",
    borderRadius: 10,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  blockIndexText: {
    color: "#1459ff",
    fontWeight: "900",
  },
  blockBody: {
    flex: 1,
    gap: 8,
  },
  blockTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  blockTitle: {
    color: "#111827",
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
  },
  blockDuration: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "800",
  },
  blockMeta: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "700",
  },
  blockActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  blockButton: {
    backgroundColor: "#f8fafc",
    borderColor: "#d9dee8",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  blockButtonText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800",
  },
  modalScrim: {
    backgroundColor: "rgba(15,23,42,.36)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    gap: 12,
    padding: 18,
  },
  modalTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
  },
  modalSubtitle: {
    color: "#667085",
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    borderColor: "#d9dee8",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  modalActions: {
    flexDirection: "row",
    gap: 8,
  },
  mediaGrid: {
    gap: 9,
  },
  mediaChoice: {
    backgroundColor: "#f8fafc",
    borderColor: "#d9dee8",
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  mediaChoiceTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },
  mediaChoiceText: {
    color: "#667085",
    fontSize: 13,
    fontWeight: "700",
  },
});
