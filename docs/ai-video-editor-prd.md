# Matry PRD Draft

## Product Intent

Matry is a mobile-first launch video testing studio for AI builders.

The product is centered on vertical videos, fast variant creation, channel-specific publishing, and performance tracking. It should help a builder turn product material into multiple short launch videos, publish the strongest versions to relevant channels, and learn which hooks, blocks, and branches perform best.

Matry is not a general long-form video editor. It should feel closer to a launch lab: create blocks, generate or import media, branch variants, compare, ship, and measure.

## Core Mental Model

```text
Workspace
├─ Project: Product or campaign
│  ├─ Branch A: X launch angle
│  │  ├─ Scene Block 1
│  │  ├─ Scene Block 2
│  │  └─ Scene Block 3
│  ├─ Branch B: Product Hunt angle
│  └─ Branch C: Feature demo angle
└─ Results by channel
```

Rules:

- A project represents a product, campaign, or launch.
- A branch represents one narrative or testing variant.
- A branch is made from ordered scene blocks.
- Scene blocks are the main editing unit.
- The default format is vertical 9:16.
- Exports are channel-aware, not just raw files.
- Performance data should feed the next round of branches.

## Scene Blocks

Each scene block can be created from one of these sources:

- Upload image
- Upload video
- AI image
- AI video via provider
- HyperFrames render

A scene block should support:

- Title
- Intent, such as hook, proof, demo, benefit, CTA, social proof, or closing
- Duration
- Prompt or human-facing notes
- Source type
- Input assets
- Rendered/generated candidates
- Selected media
- Caption text
- Voiceover/script text
- Generation/render status
- Performance tags, such as "strong opener" or "weak CTA"

## Multi-Project And Multi-Branch

Matry should support multiple projects from the beginning.

Project examples:

- "Ollama launch clips"
- "Developer tool Product Hunt launch"
- "Investor update shorts"
- "Feature demo retargeting"

Each project can contain multiple branches:

- Channel branches: X, Product Hunt, LinkedIn, TikTok, YouTube Shorts
- Audience branches: builder, founder, investor, developer, creator
- Hook branches: pain point, outcome, demo-first, proof-first, comparison
- Round branches: v1, v2, winner remix, next round

Branches should allow cloning from an existing branch so users can swap only the hook, CTA, caption, or a single scene block.

## Target Workflow

1. Create or open a project.
2. Add product context, such as URL, screenshots, product description, or existing media.
3. Generate or manually create branch ideas.
4. Build each branch as a vertical sequence of scene blocks.
5. Fill blocks from uploads, AI images, AI videos, or HyperFrames renders.
6. Preview, caption, and package the branch for one or more channels.
7. Export or publish.
8. Track views, clicks, signups, saves, comments, and channel-specific signals.
9. Generate the next round from performance winners and losers.

## MVP Scope

### Project Dashboard

- Create, open, duplicate, and archive projects.
- Show active branches per project.
- Show recent exports and performance summary.
- Keep product context attached to the project.

### Branch Editor

- Create, duplicate, rename, and delete branches.
- Compare branches side by side.
- Pick a winner.
- Generate a next round from a branch.
- Track branch status: draft, ready, exported, published, measuring, archived.

### Block Editor

- Add, delete, duplicate, reorder, and trim scene blocks.
- Use a block rail as the primary editing surface.
- Support block source types:
  - Upload image
  - Upload video
  - AI image
  - AI video via provider
  - HyperFrames render
- Keep generated candidates per block.
- Select the active candidate for export.

### Publishing Package

- Prepare channel-specific outputs for:
  - X
  - Product Hunt
  - LinkedIn
  - TikTok
  - YouTube Shorts
- Store captions, CTA, hashtags, thumbnail, and export preset per channel.
- Provide readiness checks before export or publish.

### Performance Tracking

- Track basic per-channel metrics:
  - Views
  - Clicks
  - Click-through rate
  - Signup rate
  - Saves
  - Comments
- Attribute metrics to project, branch, channel, and date range.
- Mark best-performing hooks, CTAs, and blocks.
- Use results to suggest the next branch round.

## Generation And Rendering

Matry should not assume one media provider.

The provider boundary should support:

- AI image providers
- AI video providers
- HyperFrames rendering
- User-uploaded media
- Future local rendering or scripted animation providers

Each provider should expose capability metadata such as supported source types, durations, aspect ratios, model names, and expected cost.

## Data Model Sketch

```ts
type SceneBlockSourceType =
  | "upload-image"
  | "upload-video"
  | "ai-image"
  | "ai-video-provider"
  | "hyperframes-render";

type SceneBlock = {
  id: string;
  title: string;
  intent: "hook" | "proof" | "demo" | "benefit" | "cta" | "closing" | "custom";
  durationSeconds: number;
  sourceType: SceneBlockSourceType;
  prompt: string;
  caption: string;
  inputAssetIds: string[];
  candidates: MediaCandidate[];
  selectedCandidateId: string | null;
  status: "draft" | "generating" | "rendering" | "ready" | "failed";
};

type Branch = {
  id: string;
  name: string;
  channelFocus: ChannelId[];
  blocks: SceneBlock[];
  status: "draft" | "ready" | "exported" | "published" | "measuring" | "archived";
};

type Project = {
  id: string;
  title: string;
  productUrl?: string;
  aspectRatio: "9:16";
  branches: Branch[];
  activeBranchId: string;
};
```

## Suggested Main Views

- Projects: multi-project overview with recent performance.
- Branches: variants, branches, winners, and next-round generation.
- Block editor: vertical preview plus ordered scene blocks.
- Source panel: upload image/video, AI image, AI video provider, HyperFrames.
- Compare: branch-by-branch scoring and preview.
- Export/results: channel packages, readiness checklist, and metrics.

## Recommended Build Phases

1. Retarget product model to projects, branches, scene blocks, channel packages, and metrics.
2. Update the runnable Studio prototype terminology and demo data.
3. Add branch duplication and branch comparison in the prototype.
4. Add asset/source handling for uploaded image/video, AI image, AI video, and HyperFrames placeholders.
5. Add export packages per channel.
6. Add manual metrics entry first, then platform integrations later.
7. Use performance winners to generate next-round branch suggestions.

## Out Of Scope Until Later

- Full professional timeline editing
- Long-form video editing
- Advanced audio mixing
- Direct multi-account OAuth publishing in the MVP
- Team permissions and collaborative editing
- Fully automated attribution across every platform
