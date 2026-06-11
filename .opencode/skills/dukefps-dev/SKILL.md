---
name: dukefps-dev
description: Development workflow, asset pipeline, and hard-won lessons for the dukefps (Toxic Sector) browser FPS in this repo. Use when editing dukefps/, generating game sprites with nanobanana, tuning Three.js lighting/post, or running the validate + Playwright test loop.
---

# dukefps development workflow

Toxic Sector: a Three.js FPS in a single `dukefps/index.html` (no build step),
level data in `dukefps/level*.js` shared with `dukefps/validate.mjs`.

## Test loop (always run before committing)

1. `node validate.mjs` (in `dukefps/`) — flood-fill proves every entity reachable.
2. Serve: `nohup python3 -m http.server 8123 --directory dukefps >/dev/null 2>&1 &`
   (background server dies when the spawning bash tool call ends unless nohup'd).
3. Playwright headless (`playwright` npm pkg in the temp dir works; install
   `npx playwright install chromium-headless-shell` if launch fails):
   load `?test=1`, click `#intro`, then drive `window.__game`
   (`{player, monsters, weapons, doorObjs, pickups, locked, fire, takePickup, hurtPlayer}`).
   `?test=1` bypasses pointer lock (headless refuses it).
4. **Judge screenshots visually** — "no JS errors" says nothing about lighting.
   Compare against a screenshot of the committed version (extract via
   `git show HEAD:dukefps/index.html` + symlink `assets/`, copy `level*.js`).

## Sprite pipeline (Nano Banana / Gemini)

- `tools/nanobanana.sh "prompt" out.png [input_img] [aspect]` — key in git-ignored `.env`.
- Always request a **solid magenta (#FF00FF) background**; sheets as 2x2 grids.
- Process: `tools/process_sprites.py` (chroma-key magenta→alpha, trim, ≤512px)
  — copy its functions for new asset types.
- After processing, read the **actual PNG dimensions** (`sips -g pixelWidth -g pixelHeight`)
  and hardcode aspect ratios into `index.html` defs (ITEM_DEFS / MON_ASPECT / VM_DEFS).

## Lessons that cost iterations

- Pre-lit painted sprites go near-black under Lambert in dark halls → reuse the
  sprite map as `emissiveMap`, intensity ~0.3 (`spriteMat()` does this).
- EffectComposer's default render target has no MSAA → metal textures shimmer.
  Pass a `WebGLRenderTarget` with `samples: 4, type: HalfFloatType`.
- Viewmodel sprites: `MeshBasicMaterial`, `depthTest:false`, `renderOrder:999`,
  `toneMapped:false` — never clips into walls, ignores scene exposure.
- Additive glow sprites + bloom blow out fast; keep opacities ≤0.7 and judge by screenshot.
- Validate level data in Node *before* touching renderer code.
- Keep the `?test=1` hook updated when adding systems — it's the only way to
  script gameplay headlessly.
- **Headless rAF runs ~3× slower than wall clock** (dt is capped at 0.05 s and
  frames come at ~10 fps). Timing-based tests (fuses, animations) must wait
  about 3–4× the sim duration, or poll game state instead of sleeping.
- **Entities on solid grid cells (barrels/crates) can't be hit by sphere checks**:
  rays break at the cell boundary (2 units out) before reaching the entity
  centre. Resolve solid-cell hits through a `cellKey → entity` map instead.
- Unlit GLSL emissive floors (sludge) must stay below the bloom threshold
  (~0.85 with exposure 0.95) over large areas or they wash the whole frame.
- `THREE.Object3D.position.set(x, undefined, z)` silently produces NaN —
  never branch a coordinate inline; handle flying/grounded separately.
- Dynamic level import: `await import('./'+file+'.js')` at module top level
  works fine with an import-map page; sanitize the URL param.
