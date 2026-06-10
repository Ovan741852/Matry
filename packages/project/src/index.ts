export type GenerationMode = "text" | "frames" | "reference" | "import";

export type SceneBlockSourceType =
  | "upload-image"
  | "upload-video"
  | "ai-image"
  | "ai-video-provider"
  | "hyperframes-render";

export type SceneBlockIntent = "hook" | "proof" | "demo" | "benefit" | "cta" | "closing" | "custom";

export type SceneBlockStatus = "draft" | "generating" | "rendering" | "ready" | "done" | "failed";

export type ChannelId = "x" | "product-hunt" | "linkedin" | "tiktok" | "youtube-shorts" | "instagram-reels";

export type BranchStatus = "draft" | "ready" | "exported" | "published" | "measuring" | "archived";

export type AssetRef = {
  id: string;
  kind:
    | "input-image"
    | "input-video"
    | "ai-image"
    | "video"
    | "thumbnail"
    | "hyperframes-render"
    | "storyboard"
    | "reference";
  uri: string;
  label?: string;
};

export type MediaCandidate = {
  id: string;
  providerId: string;
  status: "draft" | "queued" | "generating" | "rendering" | "done" | "failed";
  label: string;
  videoAssetId?: string;
  imageAssetId?: string;
  thumbnailAssetId?: string;
  error?: string;
};

export type GenerationJobRecord = {
  id: string;
  providerId: string;
  status: "waiting" | "queued" | "generating" | "rendering" | "done" | "failed";
  requestedCount: number;
  message: string;
  createdAt: string;
  providerTaskId?: string;
  error?: string;
};

export type SceneBlock = {
  id: string;
  title: string;
  intent: SceneBlockIntent;
  durationSeconds: number;
  prompt: string;
  caption: string;
  sourceType: SceneBlockSourceType;
  generationMode: GenerationMode;
  status: SceneBlockStatus;
  inputAssetIds: string[];
  candidates: MediaCandidate[];
  selectedCandidateId: string | null;
  generationJobs: GenerationJobRecord[];
  performanceTags: string[];
};

export type ChannelPackage = {
  id: string;
  branchId: string;
  channelId: ChannelId;
  caption: string;
  cta: string;
  hashtags: string[];
  thumbnailAssetId?: string;
  exportPreset: "vertical-9-16" | "square-1-1" | "landscape-16-9";
  status: "draft" | "ready" | "exported" | "published" | "failed";
  platformUrl?: string;
};

export type PerformanceSnapshot = {
  id: string;
  branchId: string;
  channelId: ChannelId;
  capturedAt: string;
  dateRangeLabel: string;
  views: number;
  clicks: number;
  signups?: number;
  saves?: number;
  comments?: number;
};

export type Branch = {
  id: string;
  name: string;
  status: BranchStatus;
  channelFocus: ChannelId[];
  blocks: SceneBlock[];
  forkedFromBranchId?: string;
  notes?: string;
};

export type Project = {
  id: string;
  title: string;
  productUrl?: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  style: string;
  branches: Branch[];
  activeBranchId: string;
  assets: AssetRef[];
  channelPackages: ChannelPackage[];
  performanceSnapshots: PerformanceSnapshot[];

  /**
   * Transitional compatibility for the current Studio prototype and early
   * provider adapters. New code should use branches[].blocks.
   */
  shots?: SceneBlock[];
  timelineTracks?: TimelineTrack[];
};

export type TimelineTrackKind = "video" | "music" | "subtitle";

export type TimelineClip = {
  id: string;
  title: string;
  startSeconds: number;
  durationSeconds: number;
  sourceBlockId?: string;
  sourceShotId?: string;
  assetId?: string;
};

export type TimelineTrack = {
  id: string;
  kind: TimelineTrackKind;
  label: string;
  clips: TimelineClip[];
};

export type ShotStatus = SceneBlockStatus;
export type VideoCandidate = MediaCandidate;
export type Shot = SceneBlock;

export function getActiveBranch(project: Project): Branch | undefined {
  return project.branches.find((branch) => branch.id === project.activeBranchId) ?? project.branches[0];
}

export function getProjectDurationSeconds(project: Project, branchId = project.activeBranchId): number {
  return getBranchBlocks(project, branchId).reduce((sum, block) => sum + block.durationSeconds, 0);
}

export function getSceneBlockById(project: Project, blockId: string, branchId = project.activeBranchId): SceneBlock | undefined {
  return getBranchBlocks(project, branchId).find((block) => block.id === blockId);
}

export function getShotById(project: Project, shotId: string): Shot | undefined {
  return getSceneBlockById(project, shotId);
}

export function reorderSceneBlock(project: Project, draggedBlockId: string, targetBlockId: string, branchId = project.activeBranchId): Project {
  if (draggedBlockId === targetBlockId) return project;

  const activeBranch = getActiveBranchById(project, branchId);
  if (!activeBranch) return project;

  const from = activeBranch.blocks.findIndex((block) => block.id === draggedBlockId);
  const to = activeBranch.blocks.findIndex((block) => block.id === targetBlockId);
  if (from < 0 || to < 0) return project;

  const blocks = [...activeBranch.blocks];
  const [block] = blocks.splice(from, 1);
  const insertAt = from < to ? to - 1 : to;
  blocks.splice(insertAt, 0, block);

  return updateBranch(project, branchId, { blocks });
}

export function reorderShot(project: Project, draggedShotId: string, targetShotId: string): Project {
  return reorderSceneBlock(project, draggedShotId, targetShotId);
}

export function duplicateBranch(project: Project, branchId: string, nextBranchId: string, nextName: string): Project {
  const branch = getActiveBranchById(project, branchId);
  if (!branch) return project;

  const cloned: Branch = {
    ...branch,
    id: nextBranchId,
    name: nextName,
    status: "draft",
    forkedFromBranchId: branch.id,
    blocks: branch.blocks.map((block) => ({
      ...block,
      id: `${nextBranchId}-${block.id}`,
      status: block.status === "failed" ? "draft" : block.status,
      generationJobs: [],
    })),
  };

  return {
    ...project,
    activeBranchId: cloned.id,
    branches: [...project.branches, cloned],
  };
}

export function getClickThroughRate(snapshot: PerformanceSnapshot): number {
  return snapshot.views > 0 ? snapshot.clicks / snapshot.views : 0;
}

function getBranchBlocks(project: Project, branchId: string): SceneBlock[] {
  const branch = getActiveBranchById(project, branchId);
  return branch?.blocks ?? project.shots ?? [];
}

function getActiveBranchById(project: Project, branchId: string): Branch | undefined {
  return project.branches.find((branch) => branch.id === branchId);
}

function updateBranch(project: Project, branchId: string, patch: Partial<Branch>): Project {
  return {
    ...project,
    branches: project.branches.map((branch) => (branch.id === branchId ? { ...branch, ...patch } : branch)),
  };
}
