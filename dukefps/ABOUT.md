# ☢️ Toxic Sector — experiment log

A Duke Nukem-style 3D FPS in the browser. One ~5 minute level: keycard hunt,
secret room, loot, 3 weapons, 3 monster types, an NPC janitor, a boss fight,
and voice-synthesized one-liners.

**Play:** https://ljack.github.io/fable5-experiments/dukefps/ (desktop only, WASD + mouse)

## Tech

- **Three.js 0.160** (CDN import map, no build step)
- **GLSL shader** for the animated toxic sludge floor
- **CC0 PBR textures** from [ambientCG](https://ambientcg.com) (7 materials ×
  color/normal/roughness, downscaled to 512px → 1.1 MB total)
- **Web Audio** procedural SFX + **speechSynthesis** for Duke-style one-liners
- **AI-generated sprites** (Gemini 2.5 Flash Image aka Nano Banana) for all
  monsters, the NPC, barrels, wall decals, and the skybox — classic Doom-style
  Y-axis billboards with idle/walk/attack/die frames
- **Post-processing**: UnrealBloomPass + film grain/vignette/chromatic-
  aberration shader pass, PCF soft shadows, MSAA HDR render target
  (press **P** to toggle low-quality mode)
- Level defined in a shared `level.js` grid module; `validate.mjs` flood-fills
  it in Node to prove every monster/item/door is reachable from spawn
- Headless **Playwright** smoke tests: JS-error check, screenshot review, and
  scripted gameplay (shoot grunt, open door, kill boss) via a `?test=1` hook

## Cost

| Metric | Value |
|---|---|
| Wall-clock time | ~45 min (questions → validated, tested, deployed) |
| Human prompts | 3 (initial ask, answers to questions, implicit go) |
| Agent turns | ~12 (asset hunt, level+validator, main build, 2 lighting fix rounds, 3 test rounds) |
| Tokens (est.) | ~60k input / ~35k output — screenshots reviewed in-loop add input weight |
| Lines of code | ~1,100 (index.html ~950, level.js ~120, validate.mjs ~60) |
| Assets | 21 JPG textures (CC0), 1.1 MB |
| Bugs fixed after generation | 2 — leftover refs to undeclared arrays (caught immediately); too-dark lighting (caught via headless screenshots, 2 iterations) |

*Token figures are estimates.*

## Prompts used (verbatim)

1. `ok, next expirement. create 3d dukenukem style game, but with better graphics. make one level, that's about 5 minutes of playtime. add loot, treasure, wwweapons, monsters, npc etc. ask any questions?`
2. `1. three.js or/and glsx  2. if you can find and pull aassests use them, either generate them using e.g nanobanana. 3. ok, need the oneliners. 4. desktop browser only with wsad.`

## Steps

1. **Clarify** — agent asked about renderer, assets, Duke-isms, controls, scope.
2. **Asset hunt** — verified ambientCG CC0 zips downloadable via curl; pulled 7
   PBR materials, extracted color/normal/roughness, downscaled 1K→512px with
   `sips` to keep the repo at ~1 MB.
3. **Level first, as data** — wrote `level.js` (grid, rooms, doors, monsters,
   items, lights) plus `validate.mjs`, a Node flood-fill test that proves every
   entity is on a floor cell and reachable from spawn. Passed on first run.
4. **Main build** — single-shot ~950-line `index.html`: grid-collision player
   controller (WASD, jump, pointer lock), 3 weapons with viewmodels (hitscan
   pistol/shotgun, projectile plasma), grunt/spitter/boss AI with line-of-sight
   aggro, sliding doors + locked keycard door + secret wall, pickups, NPC
   dialog, gibs, muzzle flash, flickering lights, GLSL sludge, HUD, quips.
5. **Fix** — removed two stray references to arrays from an abandoned refactor
   (would have thrown at startup).
6. **Headless test loop** — Playwright: load page, click through intro,
   screenshot. First screenshots showed near-black scenes → raised ambient
   light, exposure, point-light intensity over 2 rounds, judging each by
   screenshot.
7. **Gameplay verification** — added `?test=1` hook exposing game state;
   scripted: damage/heal player, pick up shotgun & keycard, shoot a grunt dead
   (6 blaster rounds, +100 score), door auto-open, plasma-kill the boss, exit
   activation. All passed, zero JS errors.
8. **Deploy** — pushed to GitHub Pages.

## Observations

- **Validate level data in Node before building the renderer.** The flood-fill
  test cost ~60 lines and removed a whole class of "item stuck in wall" bugs.
- **Headless screenshots are essential for graphics work** — "no JS errors"
  said nothing about the scene being nearly pitch black. Lighting needed two
  rounds of screenshot-judged tuning.
- A `?test=1` escape hatch around pointer lock (which headless browsers refuse)
  made real gameplay scriptable: actual kills, doors, and boss logic verified
  without a human in the loop.
- CC0 texture pipeline (ambientCG → sips downscale) gives "better graphics"
  fast; PBR normal maps + colored point lights do most of the visual work.

## v2: AI sprites + post-processing

A follow-up session replaced the procedural-geometry monsters/NPC with
AI-generated sprite billboards and added a post-processing stack.

- **Sprite pipeline**: `tools/nanobanana.sh` (Gemini 2.5 Flash Image, key in
  git-ignored `.env`) generates magenta-background sprite sheets;
  `tools/process_sprites.py` splits frames, chroma-keys magenta → alpha,
  trims, and exports per-frame PNGs (17 assets, ~3.5 MB).
- **Billboards**: monsters (grunt/spitter/boss × idle/walk/attack/die), the
  janitor NPC (idle/talk swap while speaking), and exploding barrels are
  Y-axis-billboarded planes with `alphaTest` cutout.
- **Lighting fix that mattered**: pre-lit painted sprites went near-black
  under pure Lambert shading in dark halls — fixed by reusing the sprite map
  as an `emissiveMap` with intensity ~0.3, so sprites stay readable while
  still picking up colored room light.
- **Post stack**: EffectComposer with bloom, grain/vignette/chromatic
  aberration, soft shadows, and a 4× MSAA half-float render target (the
  default composer target has no MSAA and shimmered on metal textures).
  `P` toggles a low-quality mode.
- Verified again with headless Playwright: screenshot review of every monster
  type, NPC, decals, and a scripted blaster kill — zero JS errors.
