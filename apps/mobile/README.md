# Matry Mobile

React Native + Expo app for Matry.

This is the native mobile direction. It does not use the old `apps/ios` WKWebView wrapper.

## Requirements

- Node.js `>=20.19.4` is recommended by React Native / Expo SDK 56.
- Xcode with iOS Simulator for local iOS testing.

The current machine can build with Node `20.11.0`, but Expo prints an unsupported Node warning.

## Scripts

From the repo root:

```bash
npm run mobile:typecheck
npm run mobile:ios
npm run mobile:start
```

From this folder:

```bash
npm run typecheck
npm run ios
npm run start
```

## Current Flow

- Project management home screen.
- Add, rename, and delete projects.
- Open a project into the Scene Block editor.
- Reorder Scene Blocks with up/down controls.
- Watch a Scene Block quickly.
- Select Scene Block media source:
  - AI Video
  - HyperFrames
  - Existing video
  - Uploaded video

## Notes

`apps/studio` remains as the earlier web prototype reference.

`apps/ios` remains as the earlier WKWebView experiment, but new mobile work should happen here in `apps/mobile`.
