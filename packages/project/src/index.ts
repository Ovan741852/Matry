export type GenerationMode = "text" | "frames" | "reference" | "import";

export type ShotStatus = "draft" | "generating" | "done" | "failed";

export type AssetRef = {
  id: string;
  kind: "storyboard" | "reference" | "video";
  uri: string;
  label?: string;
};

export type VideoCandidate = {
  id: string;
  providerId: string;
  status: "draft" | "queued" | "generating" | "done" | "failed";
  label: string;
  videoAssetId?: string;
  thumbnailAssetId?: string;
  error?: string;
};

export type GenerationJobRecord = {
  id: string;
  providerId: string;
  status: "waiting" | "queued" | "generating" | "done" | "failed";
  requestedCount: number;
  message: string;
  createdAt: string;
  providerTaskId?: string;
  error?: string;
};

export type Shot = {
  id: string;
  title: string;
  durationSeconds: number;
  prompt: string;
  generationMode: GenerationMode;
  status: ShotStatus;
  storyboardAssetIds: string[];
  referenceAssetIds: string[];
  candidates: VideoCandidate[];
  selectedCandidateId: string | null;
  generationJobs: GenerationJobRecord[];
};

export type Project = {
  id: string;
  title: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  style: string;
  shots: Shot[];
  assets: AssetRef[];
  timelineTracks: TimelineTrack[];
};

export type TimelineTrackKind = "video" | "music" | "subtitle";

export type TimelineClip = {
  id: string;
  title: string;
  startSeconds: number;
  durationSeconds: number;
  sourceShotId?: string;
  assetId?: string;
};

export type TimelineTrack = {
  id: string;
  kind: TimelineTrackKind;
  label: string;
  clips: TimelineClip[];
};

export function getProjectDurationSeconds(project: Project): number {
  return project.shots.reduce((sum, shot) => sum + shot.durationSeconds, 0);
}

export function getShotById(project: Project, shotId: string): Shot | undefined {
  return project.shots.find((shot) => shot.id === shotId);
}

export function reorderShot(project: Project, draggedShotId: string, targetShotId: string): Project {
  if (draggedShotId === targetShotId) return project;
  const from = project.shots.findIndex((shot) => shot.id === draggedShotId);
  const to = project.shots.findIndex((shot) => shot.id === targetShotId);
  if (from < 0 || to < 0) return project;

  const shots = [...project.shots];
  const [shot] = shots.splice(from, 1);
  const insertAt = from < to ? to - 1 : to;
  shots.splice(insertAt, 0, shot);
  return { ...project, shots };
}
