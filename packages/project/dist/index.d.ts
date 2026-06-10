export type GenerationMode = "text" | "frames" | "reference" | "import";
export type SceneBlockSourceType = "upload-image" | "upload-video" | "ai-image" | "ai-video-provider" | "hyperframes-render";
export type SceneBlockIntent = "hook" | "proof" | "demo" | "benefit" | "cta" | "closing" | "custom";
export type SceneBlockStatus = "draft" | "generating" | "rendering" | "ready" | "done" | "failed";
export type ChannelId = "x" | "product-hunt" | "linkedin" | "tiktok" | "youtube-shorts" | "instagram-reels";
export type BranchStatus = "draft" | "ready" | "exported" | "published" | "measuring" | "archived";
export type AssetRef = {
    id: string;
    kind: "input-image" | "input-video" | "ai-image" | "video" | "thumbnail" | "hyperframes-render" | "storyboard" | "reference";
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
export declare function getActiveBranch(project: Project): Branch | undefined;
export declare function getProjectDurationSeconds(project: Project, branchId?: string): number;
export declare function getSceneBlockById(project: Project, blockId: string, branchId?: string): SceneBlock | undefined;
export declare function getShotById(project: Project, shotId: string): Shot | undefined;
export declare function reorderSceneBlock(project: Project, draggedBlockId: string, targetBlockId: string, branchId?: string): Project;
export declare function reorderShot(project: Project, draggedShotId: string, targetShotId: string): Project;
export declare function duplicateBranch(project: Project, branchId: string, nextBranchId: string, nextName: string): Project;
export declare function getClickThroughRate(snapshot: PerformanceSnapshot): number;
