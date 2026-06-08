# Matry Studio Architecture

## Current Stage

The current runnable Studio is a framework-free browser prototype in `apps/studio/`.

It now uses TypeScript as the source of truth and compiles to a single browser script:

```text
apps/studio/
├─ index.html
├─ tsconfig.json
├─ styles/
│  └─ studio.css
├─ src-ts/
│  └─ studio.ts
├─ dist/
│  └─ studio.js
└─ src/
   └─ ...            # earlier split-JS architecture reference, temporary
```

This is not the final desktop app structure. It is a stepping stone that preserves the validated Studio feel while making the next migration easier.

Compile with:

```bash
tsc -p apps/studio/tsconfig.json
```

## Product Model

Matry is a storyboard-first AI video studio.

The MVP source of truth is a flat ordered list of shots:

- Shot title
- Duration
- Human-facing description
- Generation mode
- Storyboard image/reference
- Generated video candidates
- Selected candidate
- Status

Total duration is derived from shot durations.

## Future App Structure

When moving to a bundled desktop app, use this target structure:

```text
apps/
├─ studio/       # current browser-runnable Studio
└─ desktop/      # future Tauri/Electron shell
packages/
├─ project/      # Project and Shot domain model, ordering, duration logic
├─ generation/   # jobs, candidates, provider adapter interface
├─ providers/    # mock, Vidu, and future provider adapters
├─ media/        # AssetRef, import/upload, thumbnails, file references
├─ assembly/     # export readiness and video-only assembly
├─ settings/     # provider API keys, models, capability metadata
├─ ui/           # shared UI primitives
└─ lib/          # ids, time helpers, validation, storage utilities
```

## Transport Decision

Use monorepo + shared TypeScript packages first.

tRPC is deferred until the desktop/backend transport is chosen:

- If the backend is Node/Electron, tRPC is a good fit.
- If the backend is Tauri/Rust, prefer Tauri commands and shared generated/request types.

Do not introduce tRPC before the provider/backend boundary is real.

## Boundaries

- `project` must not know about UI or provider APIs.
- `studio` composes screens and user flows; it should call project/media/generation services instead of embedding business rules.
- `generation` owns provider adapters. UI buttons should never directly call vendor-specific APIs.
- `media` owns file references and generated assets. Shots should reference assets by stable IDs/refs.
- `assembly` starts as validation: every shot needs a selected video candidate before export.
- `settings` owns provider configuration and capability metadata.

## Provider Notes

Vidu is the first provider target. Based on the official Vidu API docs, the current Studio generation modes map to:

- Text to video: `/ent/v2/text2video`
- Image to video / image-based generation: `/ent/v2/img2video`
- Start-end frame video: `/ent/v2/start-end2video`
- Reference to video: `/ent/v2/reference2video`

The current browser Studio only stores provider settings locally and mocks generation. Real API calls should be routed through the future desktop/backend layer so API keys are not exposed in frontend code.

## BYOK

Matry should support BYOK: users can bring their own provider API keys.

Rules:

- API keys must not be saved in project files.
- Browser prototype may use localStorage only for flow validation.
- Desktop app should store keys in OS-secure storage such as Keychain/Credential Manager/Secret Service.
- Project data may reference provider id/model/mode, but secrets live in app settings.

## Not In MVP

- Multi-track timeline editing
- Audio, subtitles, transitions, color grading
- Scene/group/chapter hierarchy
- Cloud sync, accounts, multiplayer collaboration
- Real provider lock-in before adapter boundaries are stable
