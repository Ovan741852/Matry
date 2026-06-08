# AI Video Editor PRD Draft

## Product Intent

Build a standalone desktop application for planning, generating, selecting, and assembling AI-generated short videos.

The primary UX target is videos up to about 15 minutes. This is not a hard technical duration limit; it is a product focus. Matry should feel best for ads, reels, shorts, explainers, product demos, and social posts rather than long-form film editing.

The editor is storyboard-first rather than timeline-first. The primary interaction should feel like arranging a film strip: users see the whole story as a sequence of visual shots, each with a duration, short intent, storyboard image, generation mode, and selected/generated video.

The internal model may still support grouping and derived durations, but the default user-facing concept should be "shots in a story flow", not "parent/child segment trees". This matters because the target user may have little or no video production experience.

## Core Mental Model

```text
Project video
├─ Shot 1
├─ Shot 2
├─ Shot 3
└─ Shot 4
```

Rules:

- A video is primarily presented as an ordered storyboard / film strip.
- Each shot can have its own duration.
- Final assembly uses the ordered shots.
- Optional grouping can exist later for chapters/scenes, but it should not be required for the basic workflow.
- Initial assembly focuses on video only. Audio, subtitles, transitions, music, and color work are later concerns.

Example:

```text
Cola advertisement 9s
├─ Bottle cap opens 2s
├─ Many bubbles burst from the mouth of the bottle 4s
└─ Ending shot 3s
```

## Target Form

Standalone desktop application.

The app should allow users to configure AI providers through API settings. The product should not assume a single video generation vendor. Provider integration should be replaceable through adapter-like boundaries.

## MVP Scope

### Project and Storyboard Structure

- Create/open/save a video project.
- Create and edit a storyboard-like sequence of shots.
- Add, delete, duplicate, and reorder shots.
- Show total duration as the sum of all shots.
- Let users set duration per shot.
- Make the full story flow scannable as a film strip.
- Support optional grouping later, but do not require it in the MVP UI.

### Shot Fields

Each shot should support:

- Title
- Human-facing note
- AI-facing prompt text
- Duration in seconds
- Storyboard/reference images
- Attached or selected video media
- Generation status
- Generation candidates
- Selected candidate for final assembly
- Generation mode

### Storyboard Inputs

Storyboard design is required, not optional. The product direction should support all of these, though MVP can implement the simplest useful subset:

- User-uploaded storyboard images
- AI-generated storyboard images
- Frames extracted from existing video

### Shot Creation and Splitting Modes

Long-term target:

- Manual shot creation: user creates shots directly.
- Text-assisted split: user writes a story description and AI proposes shots.
- Image-assisted split: user uploads or pastes images and AI proposes shots/story beats.

MVP should support manual shot creation first and design the data model so text-assisted and image-assisted splitting can be added without rewriting core shot logic.

### Generation Modes

Each shot should let the user choose the generation mode based on what they have:

- Text to video: prompt-only generation.
- First frame to last frame: user defines or generates starting and ending frames, then generates motion between them.
- Reference to video: user provides one or more reference images and generates a video matching the subject/style/context.

The UI should make these feel like plain choices, not technical model modes.

### AI Video Generation

MVP may use mock generation or local placeholder state, but the architecture should prepare for:

- User-configurable API keys and provider settings.
- Multiple AI providers.
- Per-provider capability metadata such as supported durations, image-to-video support, text-to-video support, aspect ratios, and model names.
- Per-shot generation requests.
- Multiple generated candidates per shot.
- Selecting one candidate as the active final media.

### Assembly

MVP assembly can focus on ordering and validation first.

The first real assembly implementation should:

- Gather selected video media from all shots in order.
- Concatenate video tracks.
- Export a final video file.
- Ignore audio until explicitly added to scope.

## Suggested Main Views

- Story film strip: ordered shots with thumbnails, durations, and generation status.
- Shot inspector: edit the selected shot's fields, generation mode, and media.
- Storyboard/media panel: manage images, generated candidates, and uploaded videos.
- Assembly preview: final ordered shots and export readiness.
- Settings: AI provider configuration and API keys.

## Data Model Sketch

```ts
type Shot = {
  id: string;
  title: string;
  note: string;
  prompt: string;
  durationSeconds: number;
  generationMode: "text-to-video" | "first-last-frame" | "reference-to-video";
  storyboardAssets: AssetRef[];
  videoCandidates: VideoCandidate[];
  selectedVideoCandidateId: string | null;
  status: "draft" | "ready" | "generating" | "generated" | "failed";
};
```

Total project duration should be derived from ordered shots.

Optional future grouping can be modeled separately, but groups should not complicate the MVP shot workflow.

## Open Questions

- Which desktop stack should be used: Tauri, Electron, or another option?
- Should projects be local files, a local database, or both?
- Which AI providers should be supported first?
- Should the first MVP include actual video concatenation through FFmpeg?
- What media storage policy should be used: copy assets into project folder, reference external paths, or ask per asset?
- Should grouping/scenes exist in v1, or should v1 stay as a flat film strip?

## Recommended Build Phases

1. Product skeleton: desktop app shell, project file format, storyboard shot model, manual film-strip editing UI.
2. Media skeleton: image/video asset attachment, generation candidate records, selected candidate state.
3. Provider architecture: settings UI, provider adapter interface, mock provider.
4. Real generation: integrate the first text-to-video/image-to-video provider.
5. Assembly: concatenate selected shot videos and export a single video file.
6. AI-assisted planning: text-to-shots split, then image-to-shots split.

## Roadmap

### Product Layers

1. Storyboard planning
   - Break an idea into shots.
   - Generate or attach storyboard images.
   - Confirm visual rhythm before generating video.

2. AI generation
   - Generate each shot with provider adapters.
   - Support BYOK provider settings.
   - Keep multiple generated candidates per shot.
   - Track waiting, success, and failure states.

3. Short-video timeline
   - Main video track from storyboard shots.
   - Music tracks, possibly multiple.
   - Subtitle tracks, possibly multiple.
   - Shared playhead and simple trim controls.

4. Export
   - Validate that each video shot has selected media.
   - Export video for platform-specific aspect ratios and presets.

5. Publish planning
   - Prepare title, description, hashtags, cover, and platform-specific metadata.
   - This comes before direct platform upload.

6. Schedule publishing
   - Schedule uploads to social platforms.
   - Treat as a later workflow after export and publish planning are stable.

### MVP

MVP should focus on making a short AI video:

- Storyboard/shot planning
- Storyboard image workflow
- Provider settings with BYOK
- Mock provider plus first real provider adapter
- Per-shot generation jobs and candidates
- Three-track short-video timeline:
  - Video
  - Music
  - Subtitles
- Basic trim and playhead controls
- Export readiness validation

Direct social platform scheduling is not part of MVP.

### Phase 2

Add production readiness around export and publishing:

- Real video assembly/export
- Platform presets:
  - YouTube Shorts
  - TikTok
  - Instagram Reels
  - Facebook Reels
  - X video
- Caption/description/hashtag assistant
- Cover image selection
- Publish checklist
- Better subtitle editing
- Music import and timing controls

### Phase 3

Add scheduling and platform integration:

- OAuth account connections
- Scheduled publish jobs
- Platform upload status
- Retry and failure handling
- Draft publishing
- Per-platform metadata variants

### Out Of Scope Until Later

- Full professional multi-track video editing
- Long-form documentary/film editing workflows
- Advanced audio mixing
- Color grading
- Keyframes and motion graphics
- Multi-user collaboration
- Cloud sync and team accounts
