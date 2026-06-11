// Node sanity check: every entity sits on floor and is reachable from spawn,
// for ALL levels. Run: node validate.mjs
import { readdirSync } from 'fs';

let fail = 0;

async function validateLevel(file) {
  const L = await import(`./${file}`);
  const { grid, GRID_W, GRID_H, playerStart, doors, monsters, items, npcs,
          crates, exit, lights, barrels = [], sludge = [], meta = {} } = L;
  const name = meta.name || file;
  let local = 0;
  const err = m => { console.error(`FAIL [${name}]:`, m); fail++; local++; };

  // flood fill from spawn over floor cells (doors are floor cells already).
  // Crates block movement, so treat crate cells as solid for reachability.
  const crateSet = new Set(crates.map(c => `${c.x},${c.y}`));
  const blocked = (x, y) => grid[y]?.[x] !== 0 || crateSet.has(`${x},${y}`);
  const seen = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(false));
  if (grid[playerStart.y][playerStart.x] !== 0) err('spawn not on floor');
  const q = [[playerStart.x, playerStart.y]];
  seen[playerStart.y][playerStart.x] = true;
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue;
      if (seen[ny][nx] || blocked(nx, ny)) continue;
      seen[ny][nx] = true;
      q.push([nx, ny]);
    }
  }

  // entities ON a crate cell are unreachable-but-ok only if they ARE the crate;
  // for non-crate entities, require floor + reachable (ignoring its own crate cell).
  const reachable = (x, y) => {
    if (seen[y]?.[x]) return true;
    // a crate cell isn't "seen"; allow if any 4-neighbour is reachable floor
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]])
      if (seen[y + dy]?.[x + dx]) return true;
    return false;
  };
  function check(label, x, y, allowCrate = false) {
    if (grid[y]?.[x] !== 0) return err(`${label} at (${x},${y}) is inside a wall`);
    if (!allowCrate && crateSet.has(`${x},${y}`)) return err(`${label} at (${x},${y}) is on a crate`);
    if (!reachable(x, y)) return err(`${label} at (${x},${y}) unreachable from spawn`);
  }

  doors.forEach(d => check('door', d.x, d.y, true));
  monsters.forEach(m => check(`monster:${m.type}`, m.x, m.y));
  items.forEach(i => check(`item:${i.kind}`, i.x, i.y));
  npcs.forEach(n => check(`npc:${n.name}`, n.x, n.y));
  crates.forEach(c => check('crate', c.x, c.y, true));
  barrels.forEach(b => check('barrel', b.x, b.y));
  lights.forEach(l => check('light', l[0], l[1], true));
  check('exit', exit.x, exit.y);

  // boss must exist
  if (!monsters.some(m => m.type === 'boss')) err('no boss in level');

  // no two blocking/pickup entities on same cell
  const occupied = new Map();
  const claim = (label, x, y) => {
    const k = `${x},${y}`;
    if (occupied.has(k)) err(`${label} overlaps ${occupied.get(k)} at (${x},${y})`);
    occupied.set(k, label);
  };
  items.forEach(i => claim(`item:${i.kind}`, i.x, i.y));
  crates.forEach(c => claim('crate', c.x, c.y));
  barrels.forEach(b => claim('barrel', b.x, b.y));
  npcs.forEach(n => claim('npc', n.x, n.y));
  claim('exit', exit.x, exit.y);

  // doors must be in 1-wide gaps (walls on the two sides perpendicular to axis),
  // except secret doors which fill a wall cell.
  for (const d of doors) {
    if (d.secret) continue;
    const [ax, ay] = d.axis === 'x' ? [0, 1] : [1, 0];
    if (grid[d.y + ay]?.[d.x + ax] !== 1 || grid[d.y - ay]?.[d.x - ax] !== 1)
      err(`door at (${d.x},${d.y}) not flanked by walls`);
  }

  // sludge rects must lie on floor (sample corners + center)
  for (const s of sludge) {
    for (const [sx, sy] of [[s.x1,s.y1],[s.x2,s.y2],[(s.x1+s.x2)>>1,(s.y1+s.y2)>>1]])
      if (grid[sy]?.[sx] !== 0 && !crateSet.has(`${sx},${sy}`))
        err(`sludge corner (${sx},${sy}) not on floor`);
  }

  console.log(local ? `${name}: ${local} problem(s)` :
    `${name}: OK — ${monsters.length} monsters, ${items.length} items, ${barrels.length} barrels, all reachable`);
}

const levels = readdirSync('.').filter(f => /^level\d*\.js$/.test(f)).sort();
for (const f of levels) await validateLevel(f);

console.log(fail ? `\n${fail} total problem(s)` : '\nALL LEVELS OK');
process.exit(fail ? 1 : 0);
