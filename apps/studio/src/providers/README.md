# Providers

Provider adapters live here. The current studio uses `mockVideoProvider` so the UI can validate the storyboard, generation, and version-selection workflow before any real AI video API is connected.

Future adapters should expose plain operations such as:

- `generateVideo(shot, providerSettings)`
- `generateStoryboardImage(shot, providerSettings)`
- `getCapabilities()`
