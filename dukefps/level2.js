// Level 2: THE REACTOR CORE. TOXIC SECTOR.
// Grid-based: 1 = solid wall, 0 = floor. Shared by index.html + validate.mjs.

export const meta = {
  id: 2, name: 'THE REACTOR CORE',
  intro: 'Deeper in. The reactor that powers the whole plant has gone critical \u2014 and something huge is nesting in the core.',
  objective: 'Grab the BLUE KEYCARD. Drop the REACTOR PRIME. Ride the exit lift out.',
  bossName: 'REACTOR PRIME', parTime: 270, next: null,
  keyColor: 0x33aaff, keyName: 'BLUE KEYCARD',
};

export const CELL = 4;
export const WALL_H = 4.5;
export const GRID_W = 46;
export const GRID_H = 40;

const g = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(1));

function carve(x1, y1, x2, y2) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++) g[y][x] = 0;
}

// --- Entry & west wing ---
carve(2, 2, 7, 7);          // entry / drop room
carve(8, 4, 11, 4);         // corridor E (door 8,4)
carve(12, 2, 22, 9);        // west pump hall (shotgun, grunts)
carve(4, 8, 4, 11);         // corridor S to coolant labs (door 4,10)
carve(2, 12, 10, 18);       // coolant labs (cells, drones)
carve(11, 15, 13, 15);      // corridor E (door 12,15)

// --- Central reactor chamber (big, ring-shaped catwalk over sludge) ---
carve(14, 11, 32, 29);      // reactor chamber outer
// sludge moat is the inner ring; catwalk = the carved border around a solid-ish core
// (we keep it all floor; sludge is cosmetic + damage zone, the core column is a crate cluster)

// --- East wing ---
carve(33, 13, 35, 13);      // corridor E from chamber (door 34,13)
carve(36, 6, 44, 16);       // east reactor controls (plasma, blue keycard area)
carve(40, 17, 40, 21);      // corridor S (door 40,19)
carve(33, 22, 44, 31);      // east overflow (gold, pipebombs)
carve(31, 30, 33, 30);      // corridor W back toward boss approach

// --- South boss approach + arena ---
carve(20, 30, 20, 33);      // corridor S to boss (BLUE door 20,32)
carve(8, 34, 36, 39);       // boss arena (open to toxic sky)

// --- Secret 1: hidden vault off entry (W wall) ---
carve(1, 4, 1, 4);          // secret door cell
carve(0, 3, 0, 6);          // (clamp) — actually keep inside grid:
// re-carve a proper secret room inside bounds:
g[3][1] = 0; g[4][1] = 0; g[5][1] = 0; g[6][1] = 0; // thin vault column (treasure)

// --- Secret 2: hidden cache off east overflow (N wall of overflow) ---
carve(43, 23, 44, 27);      // secret room (east edge, beside overflow)
// secret door at (42,25): overflow side (41,25) is floor, room side (43,25) is floor

export const grid = g;

export const playerStart = { x: 4, y: 4 };

export const doors = [
  { x: 8,  y: 4,  axis: 'x' },                    // entry -> west hall
  { x: 4,  y: 10, axis: 'y' },                    // west hall -> coolant labs
  { x: 12, y: 15, axis: 'x' },                    // labs -> reactor chamber
  { x: 34, y: 13, axis: 'x' },                    // chamber -> east controls
  { x: 40, y: 19, axis: 'y' },                    // east controls -> overflow
  { x: 20, y: 32, axis: 'y', locked: true },      // BLUE keycard door -> boss
  { x: 1,  y: 4,  axis: 'y', secret: true },      // secret vault (entry W wall)
  { x: 42, y: 25, axis: 'x', secret: true },      // secret cache (east overflow)
];

export const monsters = [
  { type: 'grunt',   x: 14, y: 3 },
  { type: 'grunt',   x: 19, y: 5 },
  { type: 'drone',   x: 21, y: 4 },
  { type: 'spitter', x: 17, y: 8 },
  { type: 'drone',   x: 5,  y: 13 },
  { type: 'grunt',   x: 4,  y: 16 },
  { type: 'spitter', x: 8,  y: 17 },
  { type: 'drone',   x: 18, y: 14 },
  { type: 'grunt',   x: 28, y: 14 },
  { type: 'spitter', x: 24, y: 24 },
  { type: 'drone',   x: 30, y: 26 },
  { type: 'grunt',   x: 39, y: 9 },
  { type: 'grunt',   x: 42, y: 12 },
  { type: 'drone',   x: 41, y: 8 },
  { type: 'spitter', x: 37, y: 26 },
  { type: 'grunt',   x: 42, y: 29 },
  { type: 'drone',   x: 35, y: 24 },
  { type: 'boss',    x: 22, y: 37 },
];

export const items = [
  { kind: 'shotgun',  x: 20, y: 3 },
  { kind: 'plasma',   x: 42, y: 8 },
  { kind: 'keycard',  x: 38, y: 14 },   // blue keycard, deep in east controls
  { kind: 'pipebomb', x: 6,  y: 15 },
  { kind: 'pipebomb', x: 35, y: 28 },
  { kind: 'pipebomb', x: 27, y: 20 },
  { kind: 'health',   x: 3,  y: 6 },
  { kind: 'health',   x: 21, y: 8 },
  { kind: 'health',   x: 3,  y: 17 },
  { kind: 'health',   x: 30, y: 13 },
  { kind: 'health',   x: 42, y: 24 },
  { kind: 'health',   x: 12, y: 37 },
  { kind: 'health',   x: 32, y: 37 },
  { kind: 'shells',   x: 16, y: 3 },
  { kind: 'shells',   x: 13, y: 8 },
  { kind: 'shells',   x: 8,  y: 13 },
  { kind: 'shells',   x: 28, y: 27 },
  { kind: 'shells',   x: 20, y: 31 },
  { kind: 'cells',    x: 5,  y: 17 },
  { kind: 'cells',    x: 43, y: 10 },
  { kind: 'cells',    x: 38, y: 29 },
  { kind: 'cells',    x: 18, y: 37 },
  { kind: 'gold',     x: 15, y: 2 },
  { kind: 'gold',     x: 22, y: 2 },
  { kind: 'gold',     x: 9,  y: 14 },
  { kind: 'gold',     x: 29, y: 24 },
  { kind: 'gold',     x: 43, y: 26 },
  { kind: 'gold',     x: 34, y: 30 },
  { kind: 'gold',     x: 10, y: 37 },
  { kind: 'treasure', x: 1,  y: 4 },    // secret vault
  { kind: 'treasure', x: 1,  y: 5 },
  { kind: 'treasure', x: 1,  y: 6 },
  { kind: 'treasure', x: 43, y: 24 },   // secret cache
  { kind: 'treasure', x: 44, y: 24 },
  { kind: 'treasure', x: 44, y: 26 },
];

export const npcs = [
  { name: 'JOE THE JANITOR', x: 16, y: 6 },
];

export const crates = [
  { x: 14, y: 2 }, { x: 21, y: 7 }, { x: 3, y: 14 }, { x: 9, y: 16 },
  { x: 38, y: 8 }, { x: 43, y: 14 }, { x: 36, y: 24 }, { x: 42, y: 30 },
  { x: 11, y: 36 }, { x: 33, y: 36 },
  // reactor core column — solid cluster in the middle of the chamber
  { x: 22, y: 19 }, { x: 23, y: 19 }, { x: 24, y: 19 },
  { x: 22, y: 20 }, { x: 24, y: 20 },
  { x: 22, y: 21 }, { x: 23, y: 21 }, { x: 24, y: 21 },
];

export const barrels = [
  { x: 18, y: 4 }, { x: 16, y: 7 }, { x: 6, y: 13 }, { x: 4, y: 17 },
  { x: 19, y: 14 }, { x: 27, y: 16 }, { x: 20, y: 26 }, { x: 28, y: 26 },
  { x: 40, y: 10 }, { x: 37, y: 25 }, { x: 41, y: 28 }, { x: 14, y: 36 },
  { x: 30, y: 37 },
];

export const sludge = [
  // moat ring around the reactor core column
  { x1: 16, y1: 13, x2: 30, y2: 17 },
  { x1: 16, y1: 23, x2: 30, y2: 27 },
  { x1: 16, y1: 18, x2: 20, y2: 22 },
  { x1: 26, y1: 18, x2: 30, y2: 22 },
];

// Point lights: [gx, gy, colorHex, intensity, flicker?]
export const lights = [
  [4, 4,   0x66ffff, 26, false],   // entry - cyan
  [17, 5,  0xffaa55, 40, false],   // west hall - warm
  [5, 15,  0x33ff66, 30, true],    // coolant labs - green flicker
  [23, 14, 0x44aaff, 45, true],    // reactor chamber N - electric blue flicker
  [23, 25, 0x44aaff, 45, true],    // reactor chamber S
  [23, 18, 0xff5522, 55, true],    // reactor core glow - hot orange flicker
  [40, 10, 0x5588ff, 42, false],   // east controls - blue
  [38, 27, 0xff8833, 45, false],   // east overflow - orange
  [22, 37, 0x33ddff, 60, false],   // boss arena - radioactive cyan
  [12, 36, 0x8844ff, 35, false],
  [1, 5,   0xffcc33, 24, false],   // secret vault - gold
  [43, 25, 0xffcc33, 24, false],   // secret cache - gold
  [8, 4,   0xffffff, 10, false],   // door corridors
  [34, 13, 0xffffff, 10, false],
  [20, 32, 0xffffff, 10, false],
];

export const exit = { x: 22, y: 36 };
export const bossArena = { x1: 8, y1: 34, x2: 36, y2: 39 };
