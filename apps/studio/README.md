# Matry Studio

Open `apps/studio/index.html` directly in a browser to try the current Studio prototype.

Current structure:

- `src-ts/studio.ts`: TypeScript source of truth
- `dist/studio.js`: compiled browser script
- `styles/studio.css`: current Studio layout
- `src/`: earlier split-JS architecture reference, kept temporarily while TS structure settles

Compile after editing TypeScript:

```bash
tsc -p apps/studio/tsconfig.json
```

Provider status:

- Vidu is the first provider option in API settings.
- API key and base URL can be saved locally for prototype flow validation.
- Actual Vidu network calls should be implemented in the future desktop/backend layer, not directly from the browser UI.

Monorepo build from repository root:

```bash
tsc -b packages/project packages/generation packages/providers apps/studio
```

The older `prototype/` folder is kept as the design reference snapshot.
