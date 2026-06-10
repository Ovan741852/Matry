# Matry iOS Wrapper

This is a minimal iOS wrapper for the current Matry Studio web prototype.

It uses UIKit + `WKWebView` and loads bundled static files from `Matry/Web`.

## Test In Browser

From the repo root:

```bash
npm run build:studio
python3 -m http.server 4173 --directory apps/studio
```

Open:

```text
http://localhost:4173
```

For phone testing on the same Wi-Fi, use the Mac's local IP address instead of `localhost`.

## Build For iOS Simulator

From the repo root:

```bash
npm run ios:build:sim
```

The simulator app is generated at:

```text
apps/ios/Matry/DerivedData/Build/Products/Debug-iphonesimulator/Matry.app
```

## Open In Xcode

```bash
npm run ios:open
```

Choose the `Matry` scheme, pick an iPhone simulator, then run.

## Real Device Notes

To run on an iPhone, open the project in Xcode and set:

- `PRODUCT_BUNDLE_IDENTIFIER` to your own bundle id.
- `DEVELOPMENT_TEAM` to your Apple Developer team.

Then select your connected iPhone and run. A distributable `.ipa` or TestFlight build requires normal Apple signing and provisioning.

## Updating Bundled Web Assets

After editing `apps/studio`, run:

```bash
npm run ios:sync
```

This rebuilds the Studio script and refreshes the files under `Matry/Web`.
