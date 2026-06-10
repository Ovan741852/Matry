# Matry Studio Architecture

## Current Stage

The current runnable Studio is a framework-free browser prototype in `apps/studio/`.

It uses TypeScript as the source of truth and compiles to a single browser script:

```text
apps/studio/
├─ index.html
├─ tsconfig.json
├─ styles/
│  └─ studio.css
├─ src-ts/
│  └─ studio.ts
└─ dist/
   └─ studio.js
```

Compile with:

```bash
tsc -p apps/studio/tsconfig.json
```

## Product Model

Matry is a vertical launch video testing studio.

The source of truth should be:

- Workspace: all local/cloud projects.
- Project: one product, campaign, or launch.
- Branch: one variant, channel angle, audience angle, or test round.
- Scene block: the main editing unit inside a branch.
- Channel package: export/publish metadata for one channel.
- Performance snapshot: channel results attributed back to project, branch, and block tags.

```text
Project
├─ Branch A
│  ├─ Scene Block: Hook
│  ├─ Scene Block: Demo
│  └─ Scene Block: CTA
├─ Branch B
└─ Channel Packages / Results
```

The default user-facing language should be "blocks" and "branches", not timeline-first film editing vocabulary.

## Scene Block Source Types

Scene blocks should support these sources:

- Upload image
- Upload video
- AI image
- AI video via provider
- HyperFrames render

The source type determines what inputs, provider capabilities, and validation rules apply, but every block still resolves to selected media for preview/export.

## Future App Structure

When moving to a bundled desktop or cloud-backed app, use this target structure:

```text
apps/
├─ studio/       # current browser-runnable Studio
└─ desktop/      # future Tauri/Electron shell, if needed
packages/
├─ project/      # Project, Branch, SceneBlock, channel package, metrics model
├─ generation/   # jobs, candidates, provider adapter interface
├─ providers/    # AI image/video providers and provider catalog
├─ hyperframes/  # HyperFrames render integration and templates
├─ media/        # AssetRef, import/upload, thumbnails, file references
├─ assembly/     # export readiness and final vertical render/export
├─ publishing/   # channel packages, metadata, scheduling/upload boundaries
├─ analytics/    # metrics ingestion, attribution, winner scoring
├─ settings/     # provider API keys, models, capability metadata
├─ ui/           # shared UI primitives
└─ lib/          # ids, time helpers, validation, storage utilities
```

## Boundaries

- `project` owns durable product data: projects, branches, scene blocks, assets, channel packages, and metrics references.
- `generation` owns jobs and provider-independent media candidate records.
- `providers` owns AI provider adapters. UI code should never call vendor APIs directly.
- `hyperframes` owns render requests and template-specific inputs.
- `media` owns uploaded/generated assets and thumbnail references.
- `assembly` validates and renders a selected branch into exportable vertical media.
- `publishing` owns per-channel captions, CTAs, hashtags, thumbnails, export presets, and upload/schedule status.
- `analytics` owns imported or manually entered performance snapshots and winner scoring.
- `settings` owns provider configuration and secrets; secrets must not be stored in project files.

## Provider Notes

Matry should support BYOK and multiple media providers.

Provider capability metadata should include:

- Supported block source types
- Supported durations
- Supported aspect ratios, with 9:16 as the default target
- Supported image-to-video, text-to-video, reference, and edit modes
- Model names
- Cost hints

The current browser Studio only stores provider settings locally and mocks generation. Real API calls should be routed through a backend/desktop boundary so API keys are not exposed in frontend code.

## Publishing And Analytics

Publishing is a product layer, not an afterthought.

The architecture should store:

- Channel package metadata per branch and channel
- Export readiness state
- Publish status
- Platform URLs
- Manual or imported metrics
- Attribution from metrics back to branch, channel, and block tags

MVP can use manual metrics entry before OAuth or platform APIs.

## BYOK

Rules:

- API keys must not be saved in project files.
- Browser prototype may use localStorage only for flow validation.
- Desktop app should store keys in OS-secure storage such as Keychain/Credential Manager/Secret Service.
- Project data may reference provider id/model/mode, but secrets live in app settings.

## Not In MVP

- Full professional multi-track editing
- Long-form video workflows
- Advanced audio mixing
- Direct OAuth publishing to every platform
- Team permissions
- Fully automated cross-platform attribution
