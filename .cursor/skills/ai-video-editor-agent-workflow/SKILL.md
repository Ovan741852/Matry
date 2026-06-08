---
name: ai-video-editor-agent-workflow
description: >-
  Use when designing, implementing, reviewing, or planning the Matry standalone
  AI video editor. Enforces a main-agent-first workflow: confirm product specs,
  split work for subagents when useful, then have the main agent inspect and
  validate results against the storyboard-first video generation model.
---

# AI Video Editor Agent Workflow

## When this applies

Use this skill for Matry product planning, architecture, UI, data model, AI provider integration, media handling, video assembly, and code review related to the standalone AI video editor.

## Required workflow

1. Main agent confirms the relevant product requirement before implementation.
2. Main agent checks `docs/ai-video-editor-prd.md` and `.cursor/rules/ai-video-editor-product-direction.mdc`.
3. If the task is broad, main agent splits it into subagent-sized work:
   - Product/data model
   - Desktop shell
   - Storyboard film-strip UI
   - Media/storyboard handling
   - AI provider adapters
   - Video assembly/export
   - Tests and verification
4. Subagents may implement or investigate scoped pieces.
5. Main agent reviews subagent output, reconciles conflicts, and validates the final behavior.
6. Main agent reports what changed, what was verified, and what remains open.

## Product invariants to check

- Storyboard shots are the primary user-facing source of truth.
- The main UI should feel like a film strip, not a professional timeline or tree editor.
- Each shot duration is editable and total duration is derived from ordered shots.
- Final assembly uses ordered shots.
- AI providers are replaceable adapters.
- MVP video assembly is video-only unless scope changes.

## Before coding

If requirements are still being discussed, do not start production code. Create or update planning docs/rules instead, then ask only the next useful questions.

## During code review

Prioritize:

- Broken total duration derivation.
- UI that exposes parent/child segment complexity too early.
- UI that treats this as a generic timeline editor too early.
- Missing storyboard-first affordances: thumbnail, duration, short prompt, generation mode, selected result.
- Provider-specific code leaking into generic project, segment, or UI layers.
- Media paths or generated assets that cannot survive project reload.
- Missing tests around shot ordering, total duration sums, generation mode changes, and selected candidate behavior.
