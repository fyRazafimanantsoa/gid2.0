# Run and deploy 

This contains everything you need to run your app locally.


## Run Locally

**Prerequisites:**  Node.js

## Build, Test & Deploy (Cloudflare Pages)

1. Install dependencies (recommended clean install):

```bash
npm install --legacy-peer-deps
```

2. Run tests (basic smoke tests added):

```bash
npm test
```

3. Build for production:

```bash
npm run build
```

The build outputs to `dist/`. A `postbuild` step copies `sw.js` into `dist/sw.js` so the service worker is served at the site root.

4. Deploy to Cloudflare Pages

- The repository includes a GitHub Actions workflow `.github/workflows/deploy-cloudflare-pages.yml` that builds and deploys `dist/` to Cloudflare Pages.
- You must add the repository secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_PROJECT_NAME` in GitHub Settings → Secrets.

CI/Playwright notes:

- The CI workflow now runs unit tests (`npm test`) and Playwright E2E before deploying. Ensure you add these GitHub secrets to the repository settings:
	- `CLOUDFLARE_API_TOKEN`
	- `CLOUDFLARE_ACCOUNT_ID`
	- `CLOUDFLARE_PROJECT_NAME`

If you prefer to let Cloudflare Pages build directly, you can instead connect the repo in the Pages UI and set the build command to `npm run build` and output directory to `dist`.

Alternatively, connect the repo directly in the Cloudflare Pages UI and set the build command to `npm run build` and the output directory to `dist`.

## What I changed for deployment readiness

- Added `postbuild` script in `package.json` to ensure `sw.js` is copied into `dist/` (service worker must be at `/sw.js`).
- Updated `sw.js` to avoid pre-caching large WASM/CDN assets (pyodide, sql.js). Wasm assets are now fetched network-first and not aggressively cached; fonts/CDN use stale-while-revalidate with cache trimming.
- Debounced persistence in `App.tsx` using `settings.autoSaveInterval` and added `beforeunload` attempt to persist pages on close.
- Improved textarea autosize, focus scroll and dragstart handling in `BlockItem.tsx` and `Editor.tsx` to fix expand/shrink and drag interactions.
- Hardened `LinkSelector.tsx` to handle empty titles/contents and close the selector after selection.
- Added a simple smoke test `test/templates.test.ts` and configured `vitest` in `package.json`.
- Added GitHub Actions workflow for Cloudflare Pages deployment (requires secrets).

## PWA & Offline notes

- `manifest.json` and `sw.js` are present. Ensure `sw.js` is served at `/sw.js` (the `postbuild` script handles this).
- `sw.js` now pre-caches only the application shell (`/`, `/index.html`, `/manifest.json`) and uses runtime strategies for large WASM/CDN assets to avoid large install caches.

## Environment & OAuth

- `utils/drive.ts` contains a Google OAuth client ID used for client-side Drive backups. Configure the authorized origins in Google Cloud Console for production.
- If `GEMINI_API_KEY` is sensitive, avoid bundling it client-side; prefer a server-side proxy or restrict the key by origin where supported.

## Next recommended steps before public release

1. Add end-to-end tests and broader unit coverage.
2. Add CI linting and test steps to the workflow.
3. Review CSP and security headers (Netlify/_headers or nginx config) to allow required CDNs and sandboxed execution.
4. Move Pyodide initialization into a Web Worker for better UX (optional but recommended).


