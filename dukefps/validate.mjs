// Node sanity check: every entity sits on floor and is reachable from spawn.
// Run: node validate.mjs
import { grid, GRID_W, GRID_H, playerStart, doors, monsters, items, npcs, crates, exit, lights } from './level.js';

let fail = 0;
const err = m => { console.error('FAIL:', m); fail++; };

// flood fill from spawn (doors are floor cells already)
const seen = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(false));
const q = [[playerStart.x, playerStart.y]];
if (grid[playerStart.y][playerStart.x] !== 0) err('spawn not on floor');
seen[playerStart.y][playerStart.x] = true;
while (q.length) {
  const [x, y] = q.pop();
  for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue;
    if (seen[ny][nx] || grid[ny][nx] !== 0) continue;
    seen[ny][nx] = true;
    q.push([nx, ny]);
  }
}

function check(label, x, y) {
  if (grid[y]?.[x] !== 0) return err(`${label} at (${x},${y}) is inside a wall`);
  if (!seen[y][x]) return err(`${label} at (${x},${y}) unreachable from spawn`);
}

doors.forEach(d => check(`door`, d.x, d.y));
monsters.forEach(m => check(`monster:${m.type}`, m.x, m.y));
items.forEach(i => check(`item:${i.kind}`, i.x, i.y));
npcs.forEach(n => check(`npc:${n.name}`, n.x, n.y));
crates.forEach(c => check('crate', c.x, c.y));
lights.forEach(l => check('light', l[0], l[1]));
check('exit', exit.x, exit.y);

// no two entities on same cell (crates block movement)
const occupied = new Map();
const claim = (label, x, y) => {
  const k = `${x},${y}`;
  if (occupied.has(k)) err(`${label} overlaps ${occupied.get(k)} at (${x},${y})`);
  occupied.set(k, label);
};
items.forEach(i => claim(`item:${i.kind}`, i.x, i.y));
crates.forEach(c => claim('crate', c.x, c.y));
npcs.forEach(n => claim('npc', n.x, n.y));
claim('exit', exit.x, exit.y);

// doors must be in 1-wide gaps (walls on the two sides perpendicular to axis)
for (const d of doors) {
  const [ax, ay] = d.axis === 'x' ? [0, 1] : [1, 0];
  if (grid[d.y + ay][d.x + ax] !== 1 || grid[d.y - ay][d.x - ax] !== 1)
    err(`door at (${d.x},${d.y}) not flanked by walls`);
}

console.log(fail ? `${fail} problem(s)` : 'level OK — all entities reachable, doors flanked, no overlaps');
process.exit(fail ? 1 : 0);
