// Level definition for TOXIC SECTOR.
// Grid-based: 1 = solid wall, 0 = floor. Carved from solid rock.
// Shared by the game (index.html) and validate.mjs (node connectivity test).

export const CELL = 4;          // world units per grid cell
export const WALL_H = 4.5;      // wall height
export const GRID_W = 44;
export const GRID_H = 36;

const g = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(1));

function carve(x1, y1, x2, y2) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++) g[y][x] = 0;
}

// --- Rooms & corridors ---
carve(2, 2, 8, 8);        // spawn room
carve(9, 5, 12, 5);       // corridor -> arena1 (door at 10,5)
carve(13, 2, 24, 12);     // arena 1 (shotgun, grunts)
carve(25, 7, 27, 7);      // corridor -> NPC lounge (door at 26,7)
carve(28, 2, 40, 12);     // NPC lounge (treasure)
carve(18, 13, 18, 15);    // corridor -> spitter hall (door at 18,14)
carve(8, 16, 28, 22);     // spitter hall (keycard)
carve(29, 19, 29, 19);    // arch -> big hall
carve(30, 16, 41, 26);    // big hall (plasma rifle)
carve(14, 23, 14, 26);    // corridor -> boss (RED door at 14,25)
carve(6, 27, 28, 33);     // boss arena
carve(4, 9, 4, 9);        // secret door cell
carve(2, 10, 6, 13);      // secret room

export const grid = g;

export const playerStart = { x: 5, y: 5 };

// Doors sit on floor cells inside 1-wide gaps.
export const doors = [
  { x: 10, y: 5,  axis: 'x' },                  // spawn -> arena1
  { x: 26, y: 7,  axis: 'x' },                  // arena1 -> lounge
  { x: 18, y: 14, axis: 'y' },                  // arena1 -> spitter hall
  { x: 14, y: 25, axis: 'y', locked: true },    // RED keycard door -> boss
  { x: 4,  y: 9,  axis: 'y', secret: true },    // secret wall (press E)
];

// type: grunt | spitter | boss
export const monsters = [
  { type: 'grunt',   x: 15, y: 4 },
  { type: 'grunt',   x: 21, y: 5 },
  { type: 'grunt',   x: 18, y: 10 },
  { type: 'spitter', x: 12, y: 19 },
  { type: 'spitter', x: 24, y: 21 },
  { type: 'grunt',   x: 23, y: 17 },
  { type: 'grunt',   x: 10, y: 19 },  // keycard guard
  { type: 'grunt',   x: 33, y: 18 },
  { type: 'grunt',   x: 38, y: 24 },
  { type: 'spitter', x: 35, y: 20 },
  { type: 'boss',    x: 17, y: 30 },
];

// kind: shotgun | plasma | keycard | health | shells | cells | gold | treasure
export const items = [
  { kind: 'shotgun',  x: 18, y: 7 },
  { kind: 'plasma',   x: 38, y: 21 },
  { kind: 'keycard',  x: 10, y: 21 },
  { kind: 'health',   x: 3,  y: 4 },
  { kind: 'health',   x: 14, y: 11 },
  { kind: 'health',   x: 33, y: 3 },
  { kind: 'health',   x: 24, y: 20 },
  { kind: 'health',   x: 35, y: 25 },
  { kind: 'health',   x: 8,  y: 32 },
  { kind: 'shells',   x: 16, y: 3 },
  { kind: 'shells',   x: 22, y: 10 },
  { kind: 'shells',   x: 12, y: 17 },
  { kind: 'shells',   x: 31, y: 17 },
  { kind: 'shells',   x: 20, y: 28 },
  { kind: 'cells',    x: 39, y: 17 },
  { kind: 'cells',    x: 36, y: 24 },
  { kind: 'cells',    x: 10, y: 28 },
  { kind: 'gold',     x: 30, y: 3 },
  { kind: 'gold',     x: 36, y: 5 },
  { kind: 'gold',     x: 39, y: 10 },
  { kind: 'gold',     x: 26, y: 16 },
  { kind: 'gold',     x: 40, y: 26 },
  { kind: 'gold',     x: 7,  y: 28 },
  { kind: 'gold',     x: 27, y: 33 },
  { kind: 'treasure', x: 3,  y: 12 },
  { kind: 'treasure', x: 5,  y: 12 },
  { kind: 'treasure', x: 3,  y: 11 },
  { kind: 'treasure', x: 34, y: 8 },
];

export const npcs = [
  { name: 'JOE THE JANITOR', x: 34, y: 4 },
];

export const crates = [
  { x: 14, y: 3 }, { x: 23, y: 11 }, { x: 9, y: 17 }, { x: 27, y: 21 },
  { x: 31, y: 25 }, { x: 8, y: 30 }, { x: 40, y: 12 }, { x: 28, y: 2 },
];

// Point lights: [gx, gy, colorHex, intensity, flicker?]
export const lights = [
  [5, 5,   0x66ffff, 30, false],   // spawn - cyan
  [18, 7,  0xffaa55, 45, false],   // arena1 - warm
  [34, 7,  0x5588ff, 45, false],   // lounge - blue
  [13, 19, 0x66ff66, 35, true],    // spitter hall - sick green flicker
  [24, 19, 0x66ff66, 30, false],
  [35, 21, 0xff8833, 50, false],   // big hall - orange
  [31, 17, 0xff4444, 25, true],
  [17, 30, 0xff3322, 60, false],   // boss arena - red
  [25, 31, 0x8844ff, 35, false],
  [4, 12,  0xffcc33, 30, false],   // secret - gold
  [10, 5,  0xffffff, 12, false],   // door corridors
  [18, 14, 0xffffff, 12, false],
];

export const exit = { x: 26, y: 30 };
export const bossArena = { x1: 6, y1: 27, x2: 28, y2: 33 };
