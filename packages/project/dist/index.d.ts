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
export declare function getProjectDurationSeconds(project: Project): number;
export declare function getShotById(project: Project, shotId: string): Shot | undefined;
export declare function reorderShot(project: Project, draggedShotId: string, targetShotId: string): Project;
