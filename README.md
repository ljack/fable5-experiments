# Fable 5 Experiments

A collection of experiments built with Fable 5 — browser games, utils, whatever.
Each experiment lives in its own directory and includes an `ABOUT.md` documenting
**how much it cost** (time, tokens, prompts) and **how it was made** (steps, verbatim prompts).

**Live:** https://ljack.github.io/fable5-experiments/

## Experiments

| Experiment | Description | Time | Prompts | Tokens (est.) | Play | Log |
|---|---|---|---|---|---|---|
| 🚀 Neon Asteroids | Classic asteroids, neon retro, canvas + Web Audio, keyboard & touch | ~10 min | 3 | ~19k | [play](https://ljack.github.io/fable5-experiments/asteroids/) | [ABOUT](asteroids/ABOUT.md) |
| ☢️ Toxic Sector | Duke-style 3D FPS — Three.js + GLSL, CC0 PBR textures, monsters, NPC, boss, one-liners (desktop) | ~45 min | 3 | ~95k | [play](https://ljack.github.io/fable5-experiments/dukefps/) | [ABOUT](dukefps/ABOUT.md) |

## Structure

```
.
├── index.html          # landing page (GitHub Pages root)
└── <experiment>/
    ├── index.html      # the experiment itself
    └── ABOUT.md        # cost, prompts, steps, observations
```

## Adding a new experiment

1. Create `<experiment>/` with an `index.html`.
2. Write `<experiment>/ABOUT.md` — copy the structure from
   [asteroids/ABOUT.md](asteroids/ABOUT.md): cost table, verbatim prompts,
   steps, observations.
3. Add a card to the root `index.html` and a row to the table above.
4. Push to `main` — GitHub Pages deploys automatically.

## Running locally

Everything is dependency-free static HTML — just open the files in a browser:

```bash
open asteroids/index.html
```
