# Verification · 2026-11-09

This edition was checked on Windows using Node.js 24.22.2 and npm 11.19.1. The official Expo SDK 58 template resolved Expo 58.0.23, React 19.3.0 and React Native 0.88.1; the server uses Claude Agent SDK 0.3.319. Earlier applications were preserved. Only named source, test and public asset files were adapted; no existing real environment file was read or copied, and no real environment file was created.

## Completed checks

- `npm run typecheck`: strict Expo client and separate backend TypeScript checks passed.
- `npm run lint`: required Expo ESLint check passed.
- `npm test`: 5 client transport/parser tests and 12 backend SDK/handler tests passed. SDK behavior is injected, with no provider call. Coverage includes trim/size/media/Origin rejection, missing credentials, explicit tool isolation, final result normalization, exact-key redaction, safe failures, missing final results, non-success subtypes and reader/request cancellation. Client tests cover JSON contracts, HTTP error details, premature EOF and split Unicode/CRLF SSE frames.
- `npx expo install --check`: dependencies match SDK 58.
- `npx expo-doctor`: 20/20 checks passed.
- `npm run build`: actual Node backend compiled to backend/dist and Expo web exported to dist.
- `npm run build:native`: final Android and iOS JavaScript/assets exported to dist-native, including Hermes bytecode bundles. These are compilation checks, not signed native application builds.
- The root `npm run dev` launcher started the tsx backend and Expo web together; both health and web HTTP checks succeeded. Test servers were stopped after verification.
- Repeated lesson generation produced identical hashes for generated JSON, diagram module, SVG and PlantUML. The generator validates all 16 consecutive SVG labels, matching PlantUML labels and actual source markers. The standalone root prompt and BUILD-PROMPT.txt are byte-identical.

## Real HTTP and browser verification

The API was run with credentials explicitly disabled and then with a deliberately missing placeholder key for the compiled-server checks. `verification/http-check.py` verifies real HTTP health, JSON/input/media/body-size rejection, foreign Origin rejection, allowed CORS, query 503 and SSE error without done. A guard refuses these no-key tests if health reports a configured key.

Headless installed Chrome was driven by Playwright. Checks ran against both the Expo development UI and the actual final static export served with `npm run preview`, alongside the compiled Node API. `verification/browser-check.py` verifies all five real Expo Router tabs, active selected state, prompt retention across navigation, all 16 source cards, actual keyword/string colors, both no-key request modes, persistent theme, 1440 px desktop and 430 px mobile layouts, and absence of horizontal page overflow, page exceptions and invalid ARIA errors.

`verification/result-check.py` intercepts agent requests with explicit browser fixtures. It verifies stream success after more than 500 messages, continued final-result handling, inert model HTML, native Markdown headings and colored code, answer retention across tabs, copy/download actions and a simple-mode error result that remains an error. These fixture checks do not demonstrate real Claude authentication or inference. Screenshots in verification are ignored build artifacts.

The optional QA scripts use Python and Playwright as development tools only. This session reused the already-installed QA environment from edition 08; the new application's install, backend, client, tests and builds depend solely on its own Node packages. For independent browser QA, install Playwright in a separate QA environment and point it at installed Chrome. Python is not an application runtime dependency.

## Limits and observed dependency findings

No paid model request was made. API-key validity, model entitlement and account billing were not verified. No phone, emulator or iOS/Android native runtime was exercised, and no EAS signing/build, store submission or deployment was triggered. Native clipboard, sharing, networking permissions and runtime accessibility still require device validation. Windows cannot locally compile an iOS application; the README explains development builds and EAS.

The root npm installation reported 12 moderate dependency advisories in the Expo/tooling dependency tree, with no high or critical findings. The separate backend installation reported zero advisories. SDK-compatible versions and lockfiles are retained. Dependency advisories should be reviewed when updating the SDK/toolchain.

This is a local teaching application. Before exposing its paid-inference backend publicly, add authentication and cost/rate limits and use HTTPS. Native requests may omit Origin, so CORS is not authentication. Health reports key presence only.

## UML rendering correction

The architecture SVG previously relied on embedded CSS classes, which SvgXml did not apply. This produced black-filled combined-fragment frames and missing arrows/lifelines. The template now assigns explicit SVG presentation attributes to every affected element. All generated SVG/XML assets and both build-prompt copies have been updated.

After the correction, TypeScript, Expo lint, 18 client/server tests (including the new portable-SVG regression) and the actual web build passed. verification/diagram-check.py checked the rendered static export in Chrome: all 16 arrows have the expected stroke and arrowhead markers, all five lifelines have the expected stroke, alternative frames compute to fill:none, labels use Arial, and the mobile page stays within its viewport. A focused diagram screenshot was also inspected. No agent prompt was submitted, and no existing real environment file was edited.
