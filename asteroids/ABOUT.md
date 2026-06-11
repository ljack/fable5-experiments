# 🚀 Neon Asteroids — experiment log

Classic Asteroids in a single dependency-free HTML file. Canvas rendering,
Web Audio synth SFX, keyboard + touch controls, neon retro style.

**Play:** https://ljack.github.io/fable5-experiments/asteroids/

## Cost

| Metric | Value |
|---|---|
| Wall-clock time | ~10 min (idea → playable in browser) |
| Human prompts | 3 |
| Agent turns | 3 (1 with a clarifying question, 1 build, 1 launch) |
| Tokens (est.) | ~12k input / ~7k output — single-shot generation, no debugging iterations |
| Lines of code | ~560 (single HTML file) |
| Bugs fixed after generation | 0 — worked on first run |

*Token figures are estimates; the harness didn't expose exact per-session counts.*

## Prompts used (verbatim)

1. `create browser game. ask any questions.`
2. `go with default`
3. `open the game in my browser`

## Steps

1. **Clarify** — agent asked 4 questions (game type, tech, controls, style) and
   offered a default: *Asteroids, single HTML file, canvas, neon retro,
   keyboard + touch*.
2. **Accept default** — user said "go with default".
3. **Generate** — agent wrote the entire game in one `write` call:
   - game loop with delta-time updates
   - ship physics (thrust, inertia, friction, speed cap, screen wrap)
   - asteroids with randomized polygon shapes, 3 sizes, splitting on hit
   - collision detection (bullets↔asteroids, ship↔asteroids)
   - particle explosions, exhaust trail, screen shake, starfield
   - tiny Web Audio synth (fire/boom/thrust/death/level-up), no asset files
   - touch buttons that appear automatically on mobile
   - HUD, title/game-over overlays, lives, levels, scoring (20/50/100)
4. **Launch** — `open asteroids.html`, worked first try.

## Observations

- Asking the model to "ask any questions" + accepting its proposed default is a
  fast path: one round-trip of alignment, then a single-shot build.
- Zero-dependency single-file output made publish-to-GitHub-Pages trivial.
