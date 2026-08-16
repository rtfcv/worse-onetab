# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

tab-attic is a Chrome Manifest V3 extension: a minimalist, open-source tool for stashing and restoring browser tabs. It's a React app (three independent entry points) driven by a service worker that owns all state via `chrome.storage.local`.

## Commands

```bash
npm install
npm run build         # dev build -> ./dist  (unpacked extension you load into Chrome)
npm run prod-build     # production build -> ./dist (minified)
npm run prod-build-win # same, for Windows shells (uses `set` instead of env var prefix)
npm run release        # production build -> ./release, then zips it to tab-attic.zip (Linux/mac, needs 7z)
npm run release-win    # same, for Windows shells
```

There is no test suite (`npm test` is a stub) and no linter configured — there's nothing to run beyond the build.

To manually verify a change: `npm run build`, then load `./dist` as an unpacked extension in Chrome (`chrome://extensions` -> Developer mode -> Load unpacked). `dist/` and `release/` are gitignored build outputs — never hand-edit files under them; edit `src/` or `public/` and rebuild.

Node version is pinned via `.tool-versions` (nodejs 22.9.0, asdf/mise format).

## Architecture

**Three independent webpack entry points**, each its own HTML page + React root, all sharing `src/style.css` (Tailwind v4 + daisyUI):
- `src/popup/popup.jsx` — the toolbar-button popup
- `src/tablist/tablist.jsx` — the main "list of saved tab groups" page (opened as a pinned tab)
- `src/options/options.jsx` — a raw-JSON config editor (CodeMirror with a JSON extension, optional vim keybindings)

Webpack (`webpack.config.js`, extended by `webpack.config.prod.js` for the minified/`release` build) builds these plus `src/service_worker.js` as a separate `service_worker.js` bundle, and copies `public/manifest.json` + `public/icons/icon.png` into the output. All three HTML pages come from the same `public/template.html` shell (just `<div id="root">`).

**The service worker (`src/service_worker.js`) is the sole source of truth.** All state (saved tabs, config) lives in `chrome.storage.local`; pages never touch storage directly. Pages talk to it exclusively through `chrome.runtime.sendMessage({msg: '<name>', payload: ...}, callback)`, dispatched by a big `switch (msgMap.msg)` in the worker's `onMessage` listener. When adding a new capability, the pattern is: add a handler function in one of the `src/*Funcs.js` modules, export it, wire it into the switch in `service_worker.js`, and call it from a page via `chrome.runtime.sendMessage`.

Logic modules (all imported into `service_worker.js`):
- `src/tabSaveFuncs.js` — saving/loading/deleting saved tab data (`chrome.storage.local` key `"tabs"`, an array of tab-groups, each an array of tab objects). Also handles reopening saved tabs and re-discarding them after load (`chrome.tabs.discard` via a one-shot `chrome.tabs.onUpdated` listener) if `restoreTabsDiscarded` is on. `openAndDeleteATab` is marked deprecated in favor of the batch `openAndDeleteTabs`, but both are still wired up (tablist UI still uses per-tab open/delete via the singular one).
- `src/configFunc.js` — reads/writes the `"config"` storage key. `sanitizeConfigMap` is the single source of truth for the config schema and defaults (documented in README.md); always route config values through it rather than trusting raw storage/input. `reloadConfigs()` also re-binds the toolbar action button's behavior (popup vs. opening the tab list vs. immediately saving+closing current-window tabs) based on `config.actionButton`.
- `src/actionButtonFunc.js` — toggles whether the extension icon shows a popup (`chrome.action.setPopup`) or fires a `chrome.action.onClicked` listener instead.
- `src/openView.js` — opens the tablist/options pages as pinned tabs.

**Message contract note:** worker message handlers must call `sendResponse()` (even empty) for every case, including no-op ones like `tabDataChanged` broadcasts — see the comment referencing Chromium bug 1304272 in `service_worker.js`. Follow this pattern for any new message type or `chrome.runtime.onMessage` listener added on the page side (see the same pattern in `tablist.jsx` and `options.jsx`).

**tablist.jsx's DOM wiring is manual, not React-idiomatic**: `TablistList` renders rows via `dangerouslySetInnerHTML`-free JSX but then walks `document.getElementById`/`children` in a `useEffect` to attach click listeners (open/delete per tab, open/delete per tab-group), using `ijloc`/`tabid`/`tablistkey` HTML attributes as data carriers instead of React event handlers or refs. Any change to the rendered row/list markup structure must keep the child-index assumptions in that `useEffect` in sync, or the listener wiring breaks silently.

**Config values** (`theme`, `editMode`, `actionButton`, `restoreTabsDiscarded`, `storePinned`) are documented with accepted values in README.md — keep that in sync with `sanitizeConfigMap` in `src/configFunc.js` if the schema changes.

**Tailwind setup is mid-migration**: `tailwind.config.js` uses the old v3-style JS config (theme/plugins/daisyui list), but `src/style.css` uses v4's CSS-native `@import "tailwindcss"` / `@plugin` directives and the build script invokes the v4 `@tailwindcss/cli` directly on `src/style.css` — the JS config file's plugin/theme list is not actually consumed by that CLI invocation.
