// ============================================================
//  MOTEUR : données actives, unités, génération, tours, combat
// ============================================================
let DATA = JSON.parse(JSON.stringify(DEFAULT_DATA));
let MON = {}, ATK = {}, LOC = {};
function indexData() {
  MON = {}; ATK = {}; LOC = {};
  for (const m of DATA.monsters) MON[m.id] = m;
  for (const a of DATA.attacks) ATK[a.id] = a;
  for (const l of DATA.locations) LOC[l.id] = l;
  ITEMS = {};
  for (const it of (DATA.items && DATA.items.length ? DATA.items : DEFAULT_DATA.items)) ITEMS[it.id] = it;
  if (!ITEMS.or) ITEMS.or = DEFAULT_DATA.items.find(i => i.id === "or");
}
indexData();

const rnd = Math.random;
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = arr => arr[Math.floor(rnd() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const DIRS8 = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
const sgn = v => (v > 0 ? 1 : v < 0 ? -1 : 0);

function monById(id) { return MON[id] || DATA.monsters[0]; }
function atkById(id) { return id === "_basic" ? BASIC_ATTACK : ATK[id]; }
function locById(id) { return LOC[id] || SPECIAL_LOCS[id] || DATA.locations[0]; }
function themeOf(locId) {
  if (R && R.loc === locId && R.themeOf && THEMES[R.themeOf]) return THEMES[R.themeOf];
  if (THEMES[locId]) return THEMES[locId];
  if (SPECIAL_LOCS[locId]) return THEMES[SPECIAL_LOCS[locId].themeOf || "L03"];
  const l = LOC[locId];
  const t = l && l.theme && l.theme.find(x => THEME_BY_TYPE[x]);
  return THEMES[t ? THEME_BY_TYPE[t] : "L02"];
}
function movesOf(m) { return (m.moves || []).filter(id => ATK[id]).slice(0, 4); }
function formOf(m) {
  if (m.form && FORMS.includes(m.form)) return m.form;
  return FORM_BY_TYPE[(m.types || [])[0]] || "blob";
}

let uidCounter = 1;
function newUid() { return "u" + (uidCounter++) + "_" + Math.floor(rnd() * 1e6); }

function makeUnit(mid, lv, kind) {
  const m = monById(mid);
  const u = { uid: newUid(), kind, mid: m.id, lv, xp: 0, x: 0, y: 0, dir: [0, 1], st: {}, pp: {} };
  u.hp = maxHP(u);
  refillPP(u);
  return u;
}
function refillPP(u) {
  u.pp = {};
  for (const id of unitMoves(u)) u.pp[id] = ATK[id].pp;
}
function unitMoves(u) { return u.moves && u.moves.length ? u.moves.filter(id => ATK[id]).slice(0, 4) : movesOf(monById(u.mid)); }
function rarityOf(mid) { return RARITY[monById(mid).rarity || 1] || RARITY[1]; }
function equipBonus(u, k) { const it = u.equip && ITEMS[u.equip]; return it && it.kind === "equip" && it.bonus ? (+it.bonus[k] || 0) : 0; }
function maxHP(u) {
  const b = monById(u.mid);
  let v = Math.round((b.hp || 40) * (0.8 + u.lv * 0.08) * rarityOf(u.mid).mul) + 4 + equipBonus(u, "hp");
  if (u.boss) v = Math.round(v * (u.bossMul || 2.6));
  else if (u.kind === "enemy" && u.fac !== "ctfB") v = Math.round(v * 0.85);   // (Capture de Relique : à armes égales)
  if (u.shadow) v = Math.round(v * 1.1);
  if (u.kind === "enemy" && typeof donjonForce === "function") v = Math.max(1, Math.round(v * donjonForce(u)));
  return v;
}
function statOf(u, k) {
  const b = monById(u.mid);
  let v = (b[k] || 15) * (0.8 + u.lv * 0.06) * rarityOf(u.mid).mul + equipBonus(u, k);
  if (u.boss) v *= 1.12;
  if (u.shadow) v *= 1.08;
  if (u.kind === "enemy" && typeof donjonForce === "function") v *= donjonForce(u);
  if (u.kind !== "enemy" && !u.guest && typeof hasOrder === "function" && hasOrder("amovenus") && G && G.team.filter(x => x && !x.guest).length >= 3) v *= 1.1;
  return v;
}
function xpNeed(lv) { return 30 + lv * 12; }
function unitName(u) {
  if (u.kind === "hero" && G && G.heroName) return G.heroName;
  if (u.kind === "partner" && G && G.partnerName) return G.partnerName;
  if (u.nick) return u.nick;
  const n = monById(u.mid).name;
  if (u.crew) return u.boss ? "Chef " + n : n;
  return u.boss ? n + " (gardien)" : n;
}

// ------------------------------------------------------------
//  ÉTAT DE PARTIE
// ------------------------------------------------------------
let G = null;      // sauvegarde complète
let R = null;      // exploration en cours (= G.run)
let VISMAP = null; // Uint8Array de visibilité (recalculé)

function hero() { return G.team[0]; }
function partner() { return G.team[1]; }
function recruit() { return G.team[2] || null; }
function activeTeam() { return G.team.filter(u => u && !u.ko && u.hp > 0); }
function teamAllies() { return G.team.slice(1).filter(u => u && !u.ko && u.hp > 0); }
function isAllyKind(u) { return u && (u.kind === "partner" || u.kind === "ally"); }
function allUnits() { return activeTeam().concat(R ? R.enemies : []); }

function baseForms() { return DATA.monsters.filter(m => (m.stage || 1) === 1 && !m.story); }
function pickThieves(exclude) {
  const pool = baseForms().map(m => m.id).filter(id => !exclude.includes(id));
  const out = [];
  // les trois voyous du script : 010, 011, 012 (si disponibles)
  for (const id of ["010", "011", "012"]) if (MON[id] && !exclude.includes(id) && out.length < 3) { out.push(id); const k = pool.indexOf(id); if (k >= 0) pool.splice(k, 1); }
  if (out.length < 3) { out.length = 0; for (const id of ["010", "011", "012"]) if (MON[id] && !exclude.includes(id) && !pool.includes(id)) pool.push(id); }
  while (out.length < 3 && pool.length) out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  while (out.length < 3) out.push(DATA.monsters[0].id);
  return out;
}
function newGame(heroMid, partnerMid, heroName) {
  const h = makeUnit(heroMid, 1, "hero");
  const p = makeUnit(partnerMid, 1, "partner");
  G = {
    v: 2, heroName: heroName || "", partnerName: "", team: [h, p],
    bag: [], money: 0, badges: 0, shards: 0,
    progress: { cleared: [], finale: false }, run: null,
    story: { step: "ch1_beach", ch1Done: false },
    thieves: pickThieves([heroMid, partnerMid]),
    stats: { kills: 0, runs: 0 }, savedAt: Date.now()
  };
  R = null;
}

function chapterOf() { return G && G.story && G.story.ch2Done ? 3 : G && G.story && G.story.ch1Done ? 2 : 1; }
function isUnlocked(locId) {
  const req = UNLOCKS[locId];
  if (!req) return !!LOC[locId] && !!(G && G.story && G.story.ch1Done); // lieu ajouté dans l'Atelier
  return req.every(r => r === "@ch2" ? chapterOf() >= 3 : String(r).startsWith("@order:") ? (typeof hasOrder === "function" && hasOrder(r.slice(7))) : (G.progress.cleared.includes(r) || !LOC[r]));
}

// ------------------------------------------------------------
//  GRILLE
// ------------------------------------------------------------
function I(x, y) { return y * R.w + x; }
function inb(x, y) { return x >= 0 && y >= 0 && x < R.w && y < R.h; }
function tile(x, y) { return inb(x, y) ? R.grid[I(x, y)] : "#"; }
function isWall(x, y) { return tile(x, y) === "#"; }
function diagOK(x, y, d) {
  if (d[0] && d[1]) return !isWall(x + d[0], y) && !isWall(x, y + d[1]);
  return true;
}
function unitAt(x, y) {
  for (const u of activeTeam()) if (u.x === x && u.y === y) return u;
  for (const e of R.enemies) if (e.x === x && e.y === y) return e;
  return null;
}
function roomOf(x, y) { return inb(x, y) ? R.roomAt[I(x, y)] : -1; }
// Camps : notre équipe, créatures sauvages, et équipes rivales du tournoi (fac = "t1", "t2"…)
function factionOf(u) { return u.kind === "enemy" ? (u.fac || "wild") : "team"; }
function isHostile(a, b) { return factionOf(a) !== factionOf(b); }
function hostilesOf(u) { return u.kind === "enemy" ? activeTeam().concat(R.enemies.filter(e => e !== u && isHostile(u, e))) : R.enemies.slice(); }

// ------------------------------------------------------------
//  GÉNÉRATION D'ÉTAGE
// ------------------------------------------------------------
function genFloor() {
  if (R.ctf && typeof ctfGenFloor === "function") { ctfGenFloor(); return; }   // Capture de Relique
  const loc = locById(R.loc);
  const th = themeOf(R.loc);
  const isBoss = R.floor >= R.floors;
  const cp = !!loc.compact && !isBoss;
  const w = isBoss ? 24 : cp ? 30 : 40, h = isBoss ? 19 : cp ? 21 : 28;
  R.w = w; R.h = h;
  R.grid = new Array(w * h).fill("#");
  R.roomAt = new Array(w * h).fill(-1);
  R.rooms = [];
  R.items = []; R.traps = []; R.enemies = [];
  R.explored = new Array(w * h).fill(0);
  R.revealed = false;
  R.boss = isBoss;
  R.bossDefeated = false;
  R.stairs = null;
  const carveRoom = r => {
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
      R.grid[I(x, y)] = "."; R.roomAt[I(x, y)] = r.id;
    }
  };
  if (isBoss) {
    const r = { x: 3, y: 3, w: w - 6, h: h - 6, id: 0 };
    R.rooms.push(r); carveRoom(r);
    // piliers décoratifs
    for (const [px, py] of [[6, 6], [w - 7, 6], [6, h - 7], [w - 7, h - 7]]) { R.grid[I(px, py)] = "#"; R.roomAt[I(px, py)] = -1; }
  } else {
    let cells;
    for (let attempt = 0; attempt < 20; attempt++) {
      R.rooms = [];
      const cx = pick([3, 4]), cy = pick([2, 3]);
      const cw = Math.floor((w - 2) / cx), chh = Math.floor((h - 2) / cy);
      cells = [];
      for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
        const ox = 1 + i * cw, oy = 1 + j * chh;
        if (rnd() < 0.8) {
          const rw = ri(4, Math.min(11, cw - 3)), rh = ri(3, Math.min(8, chh - 3));
          const rx = ox + 1 + ri(0, Math.max(0, cw - rw - 2)), ry = oy + 1 + ri(0, Math.max(0, chh - rh - 2));
          const r = { x: rx, y: ry, w: rw, h: rh, id: R.rooms.length };
          R.rooms.push(r);
          cells.push({ i, j, room: r.id, px: rx + (rw >> 1), py: ry + (rh >> 1) });
        } else {
          cells.push({ i, j, room: -1, px: ox + ri(2, cw - 3), py: oy + ri(2, chh - 3) });
        }
      }
      cells.cx = cx; cells.cy = cy;
      if (R.rooms.length >= 3) break;
    }
    R.rooms.forEach(carveRoom);
    // arbre couvrant entre cellules voisines + quelques connexions en plus
    const cid = (i, j) => j * cells.cx + i;
    const seen = new Set([0]); const stack = [0]; const edges = [];
    while (stack.length) {
      const c = stack[stack.length - 1]; const ci = cells[c];
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [ci.i + dx, ci.j + dy])
        .filter(([i, j]) => i >= 0 && j >= 0 && i < cells.cx && j < cells.cy).map(([i, j]) => cid(i, j)).filter(n => !seen.has(n));
      if (!nb.length) { stack.pop(); continue; }
      const n = pick(nb); seen.add(n); edges.push([c, n]); stack.push(n);
    }
    for (let k = 0; k < 2; k++) {
      const a = ri(0, cells.length - 1); const ca = cells[a];
      const opts = [[1, 0], [0, 1]].map(([dx, dy]) => [ca.i + dx, ca.j + dy]).filter(([i, j]) => i < cells.cx && j < cells.cy).map(([i, j]) => cid(i, j));
      if (opts.length) edges.push([a, pick(opts)]);
    }
    for (const [a, b] of edges) carveCorridor(cells[a], cells[b]);
    for (const c of cells) if (c.room < 0 && R.grid[I(c.px, c.py)] === "#") R.grid[I(c.px, c.py)] = ",";
    // tuiles spéciales selon le lieu
    for (const r of R.rooms) {
      if (th.ice && rnd() < 0.75) {
        const iw = ri(2, Math.min(5, Math.max(2, r.w - 2))), ih = ri(2, Math.min(3, Math.max(2, r.h - 2)));
        const ix = r.x + ri(0, r.w - iw), iy = r.y + ri(0, r.h - ih);
        for (let y = iy; y < iy + ih; y++) for (let x = ix; x < ix + iw; x++) R.grid[I(x, y)] = "i";
      }
      if (th.electric && rnd() < 0.7) {
        const n = ri(2, 4);
        for (let k = 0; k < n; k++) R.grid[I(r.x + ri(0, r.w - 1), r.y + ri(0, r.h - 1))] = "e";
      }
    }
  }
  // placement
  const used = new Set();
  const freeTileIn = (r, allowSpecial) => {
    for (let k = 0; k < 60; k++) {
      const x = r.x + ri(0, r.w - 1), y = r.y + ri(0, r.h - 1);
      const t = R.grid[I(x, y)];
      if (t === "#" || used.has(I(x, y))) continue;
      if (!allowSpecial && t !== ".") continue;
      used.add(I(x, y)); return { x, y };
    }
    return null;
  };
  const team = activeTeam();
  const h0 = hero();
  let startRoom;
  if (isBoss) {
    startRoom = R.rooms[0];
    h0.x = w >> 1; h0.y = h - 5; used.add(I(h0.x, h0.y));
  } else {
    startRoom = pick(R.rooms);
    const p = freeTileIn(startRoom) || { x: startRoom.x, y: startRoom.y };
    h0.x = p.x; h0.y = p.y;
  }
  h0.dir = [0, -1];
  used.add(I(h0.x, h0.y));
  for (const p0 of G.team.slice(1)) {
    if (!p0 || p0.ko) continue;
    let placed = false;
    for (const ring of [DIRS8, DIRS8.map(d => [d[0] * 2, d[1] * 2])]) {
      for (const d of ring) {
        const x = h0.x + d[0], y = h0.y + d[1];
        if (inb(x, y) && !isWall(x, y) && !used.has(I(x, y))) { p0.x = x; p0.y = y; used.add(I(x, y)); placed = true; break; }
      }
      if (placed) break;
    }
    if (!placed) { p0.x = h0.x; p0.y = h0.y; }
    p0.dir = [0, -1];
  }
  if (!isBoss) {
    const others = R.rooms.filter(r => r !== startRoom);
    const sr = pick(others.length ? others : R.rooms);
    R.stairs = freeTileIn(sr) || { x: sr.x, y: sr.y };
    // objets
    const nItems = ri(3, 5) + (R.floor > 2 ? 1 : 0);
    for (let k = 0; k < nItems; k++) {
      const p = freeTileIn(pick(R.rooms)); if (p) R.items.push(makeFloorItem(p.x, p.y));
    }
    // pièges cachés
    const nTraps = ri(1, 3);
    for (let k = 0; k < nTraps; k++) {
      const r = pick(others.length ? others : R.rooms);
      const p = freeTileIn(r); if (p) R.traps.push({ x: p.x, y: p.y, kind: pick(["spike", "spike", "tp"]), seen: false });
    }
    // ennemis
    let n = (typeof loc.level === "number" && loc.level <= 2) ? 3 + Math.floor(R.floor / 2) : 3 + (loc.difficulty || 1) + Math.floor(R.floor / 2);
    if (R.tour) n = 2 + Math.floor(R.floor / 3);
    if (loc.compact) n = Math.min(n, 4 + Math.floor(R.floor / 25));
    n = Math.min(n, 12);
    for (let k = 0; k < n; k++) spawnEnemy(true);
    if (R.tour) tourPopulateFloor(freeTileIn);
  } else {
    if (R.arena) {
      arenaPopulate();
    } else if (R.bonusBoss && MON[R.bonusBoss.mid]) {
      R.bossMid = R.bonusBoss.mid;
      const b = makeEnemy(R.bonusBoss.mid, R.bonusBoss.lv, true, R.bonusBoss.mul);
      b.x = w >> 1; b.y = 5; b.aware = false; b.dormant = true; b.dir = [0, 1]; b.bonus = true;
      R.enemies.push(b);
    } else if (loc.crew && G.thieves && G.thieves.length >= 3) {
      // les trois voleurs du chapitre 1
      R.crew = true;
      const th = G.thieves.map(id => MON[id] ? id : DATA.monsters[0].id);
      R.bossMid = th[0];
      const b = makeEnemy(th[0], enemyLevel() + 1, true, 1.5);
      b.crew = true; b.x = w >> 1; b.y = 5; b.aware = false; b.dormant = true; b.dir = [0, 1];
      R.enemies.push(b);
      [[-3, th[1]], [3, th[2]]].forEach(([dx, mid]) => {
        const m = makeEnemy(mid, Math.max(1, enemyLevel() - 1));
        m.crew = true; m.x = (w >> 1) + dx; m.y = 6; m.dormant = true; m.dir = [0, 1]; R.enemies.push(m);
      });
    } else {
      const bossMid = (loc.boss && MON[loc.boss]) ? loc.boss : pick((loc.common_monsters || []).filter(id => MON[id]).concat([DATA.monsters[0].id]));
      R.bossMid = bossMid;
      const b = makeEnemy(bossMid, enemyLevel() + ((loc.difficulty || 1) > 1 ? 2 : 1), true);
      b.x = w >> 1; b.y = 5; b.aware = false; b.dormant = true;
      R.enemies.push(b);
      for (const dx of ((loc.difficulty || 1) > 1 ? [-3, 3] : [3])) {
        const m = makeEnemy(typeof pickSpawn === "function" ? pickSpawn() : pick(enemyPool()), enemyLevel());
        m.x = (w >> 1) + dx; m.y = 6; m.dormant = true; R.enemies.push(m);
      }
    }
    for (let k = 0; k < 2; k++) { const p = freeTileIn(R.rooms[0]); if (p) R.items.push({ x: p.x, y: p.y, id: pick(["baie", "baie", "elixir", "pomme"]) }); }
  }
  R.turn0 = R.turn;
  updateVis();
}

function carveCorridor(a, b) {
  let x = a.px, y = a.py;
  const hFirst = rnd() < 0.5;
  const dig = () => { if (R.grid[I(x, y)] === "#") R.grid[I(x, y)] = ","; };
  const walkX = () => { while (x !== b.px) { dig(); x += sgn(b.px - x); } };
  const walkY = () => { while (y !== b.py) { dig(); y += sgn(b.py - y); } };
  if (hFirst) { walkX(); walkY(); } else { walkY(); walkX(); }
  dig();
}

function pickByRarity(ids) {
  let tot = 0; const ws = ids.map(id => { const w = rarityOf(id).weight; tot += w; return w; });
  let r = rnd() * tot;
  for (let i = 0; i < ids.length; i++) { r -= ws[i]; if (r <= 0) return ids[i]; }
  return ids[0];
}
function randomItem() {
  const ids = Object.keys(ITEMS).filter(id => (ITEMS[id].w || 0) > 0);
  let tot = 0; for (const id of ids) tot += ITEMS[id].w;
  let r = rnd() * tot;
  for (const id of ids) { r -= ITEMS[id].w; if (r <= 0) return id; }
  return "baie";
}
function enemyPool() {
  const loc = locById(R.loc);
  const fromFile = typeof donjonSpawnList === "function" ? donjonSpawnList(loc) : null;
  if (fromFile) return [...new Set(fromFile.map(x => x.id))];
  const pool = (loc.common_monsters || []).filter(id => MON[id]);
  return pool.length ? pool : DATA.monsters.filter(m => !m.story && (m.rarity || 1) < 3).map(m => m.id);
}
// le niveau des créatures suit celui du héros (dès la fin du chapitre 1)
function enemyLevel() {
  const cap = locById(R.loc).lvMax, lim = v => cap ? Math.max(1, Math.min(cap, v)) : v;   // niveau_max de donjons.json
  const base = enemyLevelBase();
  if (typeof R.lvBase === "number" || typeof R.lvFlat === "number" || !G.story.ch1Done) return lim(base);
  const scaled = hero().lv - 1 + Math.floor((R.floor - 1) * 0.5) + ri(-1, 1) + Math.max(0, (locById(R.loc).difficulty || 1) - 2);
  return lim(Math.max(1, base, scaled));
}
function enemyLevelBase() {
  const loc = locById(R.loc);
  if (typeof R.lvFlat === "number") return Math.max(1, R.lvFlat + Math.floor(R.floor / 10) + ri(-1, 1));
  if (typeof R.lvBase === "number") return Math.max(1, R.lvBase + Math.floor((R.floor - 1) * 0.4) + ri(-1, 0));
  if (typeof loc.level === "number") return Math.max(1, loc.level + Math.floor((R.floor - 1) * 0.7) + ri(0, 1));
  const base = [0, 2, 6, 10, 14, 18][clamp(loc.difficulty || 1, 1, 5)];
  return base + Math.floor(R.floor * 0.7) + ri(0, 1);
}
function makeFloorItem(x, y, id) {
  const it = { x, y, id: id || randomItem() };
  if (it.id === "or") { const loc = locById(R.loc); it.amount = ri(4, 14) * (loc.difficulty || 1) + R.floor * 2; }
  return it;
}
function makeEnemy(mid, lv, boss, bossMul) {
  const e = makeUnit(mid, lv, "enemy");
  if (boss) { e.boss = true; if (bossMul) e.bossMul = bossMul; e.hp = maxHP(e); }
  e.asleep = false; e.aware = false;
  return e;
}
function spawnEnemy(initial) {
  const h = hero();
  for (let k = 0; k < 40; k++) {
    const r = pick(R.rooms);
    const x = r.x + ri(0, r.w - 1), y = r.y + ri(0, r.h - 1);
    if (isWall(x, y) || unitAt(x, y)) continue;
    if (cheb({ x, y }, h) < (initial ? 6 : 8)) continue;
    if (!initial && VISMAP && VISMAP[I(x, y)]) continue;
    if (R.stairs && R.stairs.x === x && R.stairs.y === y) continue;
    const qt = typeof questSpawnFor === "function" ? questSpawnFor() : null;
    const e = makeEnemy(qt ? qt.target : (typeof pickSpawn === "function" ? pickSpawn() : pickByRarity(enemyPool())), enemyLevel());
    if (qt) { e.questTarget = qt.id; R.questSpawned = (R.questSpawned || 0) + 1; if (qt.shadow) { e.shadow = true; e.lv += 2; e.hp = maxHP(e); } }
    else if (R.story && rnd() < (locById(R.loc).shadow || 0)) e.shadow = true;
    e.x = x; e.y = y; e.dir = pick(DIRS8);
    if (initial && rnd() < 0.3) e.st.sleep = 99;
    R.enemies.push(e);
    return e;
  }
  return null;
}

// ------------------------------------------------------------
//  VISIBILITÉ
// ------------------------------------------------------------
function updateVis() {
  if (R.ctf && typeof ctfUpdateVis === "function") { ctfUpdateVis(); return; }
  const h = hero();
  VISMAP = new Uint8Array(R.w * R.h);
  const th = themeOf(R.loc);
  const r = roomOf(h.x, h.y);
  const mark = (x, y) => { if (inb(x, y)) { VISMAP[I(x, y)] = 1; R.explored[I(x, y)] = 1; } };
  if (th.fog && !R.boss) {
    const rad = r >= 0 ? 3 : 2;
    for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) if (x * x + y * y <= rad * rad + 1) mark(h.x + x, h.y + y);
  } else if (r >= 0) {
    const rm = R.rooms[r];
    for (let y = rm.y - 1; y <= rm.y + rm.h; y++) for (let x = rm.x - 1; x <= rm.x + rm.w; x++) mark(x, y);
  } else {
    for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) mark(h.x + x, h.y + y);
  }
  // les pièces adjacentes au couloir restent sombres; les cases explorées sont mémorisées
}
function isVisible(x, y) { return VISMAP && inb(x, y) && VISMAP[I(x, y)] === 1; }
function unitVisible(u) { return u.kind !== "enemy" || isVisible(u.x, u.y); }

// ------------------------------------------------------------
//  CHEMINS
// ------------------------------------------------------------
function stepToward(u, tx, ty, opts) {
  opts = opts || {};
  const maxD = opts.maxD || 24;
  const W = R.w, H = R.h;
  const start = I(u.x, u.y), goal = I(tx, ty);
  if (start === goal) return null;
  const prev = new Int32Array(W * H).fill(-1);
  const dist = new Int16Array(W * H).fill(-1);
  const q = [start]; dist[start] = 0;
  let found = false;
  const blocked = (x, y) => {
    if (isWall(x, y)) return true;
    if (opts.avoidTraps && !(x === tx && y === ty) && R.traps.some(t => t.seen && t.x === x && t.y === y)) return true;
    const o = unitAt(x, y);
    if (o && o !== u && !(x === tx && y === ty)) {
      if (opts.through) return false;
      if (opts.ignoreAllies && !isHostile(o, u)) return false;
      return true;
    }
    return false;
  };
  for (let qi = 0; qi < q.length; qi++) {
    const c = q[qi]; const cx = c % W, cy = (c / W) | 0;
    if (c === goal) { found = true; break; }
    if (dist[c] >= maxD) continue;
    for (const d of DIRS8) {
      const nx = cx + d[0], ny = cy + d[1];
      if (!inb(nx, ny) || !diagOK(cx, cy, d)) continue;
      const n = I(nx, ny);
      if (dist[n] >= 0 || blocked(nx, ny)) continue;
      dist[n] = dist[c] + 1; prev[n] = c; q.push(n);
    }
  }
  if (!found) {
    // repli : pas qui rapproche le plus
    let best = null, bd = cheb(u, { x: tx, y: ty });
    for (const d of DIRS8) {
      const nx = u.x + d[0], ny = u.y + d[1];
      if (isWall(nx, ny) || !diagOK(u.x, u.y, d) || unitAt(nx, ny)) continue;
      const dd = cheb({ x: nx, y: ny }, { x: tx, y: ty });
      if (dd < bd) { bd = dd; best = d; }
    }
    return best;
  }
  let c = goal;
  while (prev[c] !== start && prev[c] !== -1) c = prev[c];
  return [(c % W) - u.x, ((c / W) | 0) - u.y];
}

// ------------------------------------------------------------
//  TIMELINE (les animations suivent la logique)
// ------------------------------------------------------------
const MOVE_MS = 135;
const VIS = {};     // uid → état visuel
const FX = [];      // effets (popups, projectiles, éclats)
let GHOSTS = [];    // unités K.O. encore affichées
function vis(u) { return VIS[u.uid] || (VIS[u.uid] = { tw: [], atk: null, hurt: 0 }); }
const TL = {
  cursor: 0, moveStart: null, moveEnd: 0, events: [], k: 1,   // k : vitesse des animations (Capture de Relique accélérée)
  now() { return performance.now(); },
  base() { return Math.max(this.now(), this.cursor); },
  move(u, fx, fy, steps) {
    if (this.moveStart === null) this.moveStart = this.base();
    const dur = MOVE_MS * (steps || 1) * (this.k || 1);
    vis(u).tw.push({ fx, fy, tx: u.x, ty: u.y, t0: this.moveStart, dur });
    this.moveEnd = Math.max(this.moveEnd, this.moveStart + dur);
  },
  action(dur, fn) {
    let t = this.base();
    if (this.moveStart !== null) { t = Math.max(t, this.moveEnd); this.moveStart = null; }
    this.events.push({ t, fn }); this.cursor = t + dur * (this.k || 1);
  },
  note(fn) {
    const t = this.moveStart !== null ? this.moveEnd : this.base();
    this.events.push({ t, fn });
  },
  busy() { const n = this.now(); return this.events.length > 0 || n < this.cursor || n < this.moveEnd; },
  update() {
    if (!this.events.length) return;
    const n = this.now();
    this.events.sort((a, b) => a.t - b.t);
    while (this.events.length && this.events[0].t <= n) {
      const e = this.events.shift();
      try { e.fn(); } catch (err) { console.error(err); }
    }
  },
  reset() { this.cursor = 0; this.moveStart = null; this.moveEnd = 0; this.events = []; }
};
function visPos(u, n) {
  const v = VIS[u.uid];
  if (!v || !v.tw.length) return [u.x, u.y];
  let cur = null;
  for (const t of v.tw) if (t.t0 <= n) cur = t;
  if (!cur) return [v.tw[0].fx, v.tw[0].fy];
  // purge des anciennes
  while (v.tw.length > 1 && v.tw[1].t0 <= n && v.tw[0] !== cur) v.tw.shift();
  const p = clamp((n - cur.t0) / cur.dur, 0, 1);
  if (p >= 1 && v.tw.length === 1) { v.tw.length = 0; return [u.x, u.y]; }
  return [cur.fx + (cur.tx - cur.fx) * p, cur.fy + (cur.ty - cur.fy) * p];
}
function isMoving(u, n) {
  const v = VIS[u.uid]; if (!v) return false;
  return v.tw.some(t => n >= t.t0 && n < t.t0 + t.dur);
}

// Messages
let LOGBUF = [];
function msg(...parts) { TL.note(() => pushLog(parts)); }
function msgNow(...parts) { pushLog(parts); }
function msgIf(u, ...parts) { if (unitVisible(u)) msg(...parts); }
function N(u) { return { t: unitName(u), c: u.kind === "enemy" ? "en" : u.kind === "hero" ? "he" : "pa" }; }
function pushLog(parts) {
  LOGBUF.push({ parts, t: performance.now() });
  if (LOGBUF.length > 60) LOGBUF.shift();
  if (typeof onLog === "function") onLog();
}

// ------------------------------------------------------------
//  COMBAT
// ------------------------------------------------------------
const ACC_MULT = [1, 0.82, 0.68, 0.55];
function typeMult(atkType, defTypes) {
  const row = TYPE_CHART[atkType]; if (!row) return 1;
  let m = 1;
  for (const t of defTypes || []) { if (row[0].includes(t)) m *= TYPE_MULT.super; else if (row[2] && row[2].includes(t)) m *= TYPE_MULT.weak; else if (row[1].includes(t)) m *= TYPE_MULT.resist; }
  return m;
}
function calcDamage(user, target, mv) {
  const atk = statOf(user, "attack");
  let def = statOf(target, "defense");
  if (mv.effect === "ignore_defense") def *= 0.7;
  if (target.st && target.st.defd > 0) def *= 0.75;
  let d = ((mv.power || 0) + user.lv * 1.2) * atk / (def + 25) * 0.72;
  const ut = monById(user.mid).types || [];
  if (mv.id !== "_basic" && ut.includes(mv.type)) d *= 1.25;
  const tm = typeMult(mv.type, monById(target.mid).types);
  d *= tm;
  if (R && R.ctf) d *= 0.85;   // Capture de Relique : les deux équipes à armes égales
  else if (user.kind === "enemy") d *= user.boss ? (user.crew ? 0.6 : 0.72) : user.fac ? 0.46 : 0.58; else d *= 1.12;
  d *= clamp(1 + (user.lv - target.lv) * 0.03, 0.7, 1.5);
  const crit = rnd() < 0.06; if (crit) d *= 1.5;
  d *= 0.85 + rnd() * 0.15;
  // un coup ennemi ne retire jamais plus d'un tiers des PV max (45 % pour un gardien)
  if (user.kind === "enemy" && target.kind !== "enemy" && !(R && R.ctf)) d = Math.min(d, maxHP(target) * (user.boss ? 0.4 : user.fac ? 0.22 : 0.3));
  return { dmg: Math.max(1, Math.round(d)), tm, crit };
}
function moveRange(mv) { return mv.range || (mv.effect === "hit_all" ? "room" : mv.effect === "heal" ? "self" : "front"); }
function sameArea(a, b) {
  const ra = roomOf(a.x, a.y);
  if (ra >= 0 && ra === roomOf(b.x, b.y)) return true;
  return cheb(a, b) <= 2;
}
function lineTarget(user, dir, maxK) {
  let x = user.x, y = user.y;
  for (let k = 1; k <= (maxK || 6); k++) {
    if (!diagOK(x, y, dir)) return null;
    x += dir[0]; y += dir[1];
    if (isWall(x, y)) return null;
    const t = unitAt(x, y);
    if (t) return t;
  }
  return null;
}
function targetsFor(user, mv, dir) {
  const rg = moveRange(mv);
  if (rg === "room") return hostilesOf(user).filter(f => sameArea(user, f));
  if (rg === "line") { const t = lineTarget(user, dir, 6); return t && isHostile(user, t) ? [t] : []; }
  if (!diagOK(user.x, user.y, dir)) return [];
  const t = unitAt(user.x + dir[0], user.y + dir[1]);
  return t && isHostile(user, t) ? [t] : [];
}
// vise automatiquement un ennemi si rien n'est devant
function autoAim(user, mv) {
  const rg = moveRange(mv);
  if (rg === "room" || rg === "self") return user.dir;
  if (targetsFor(user, mv, user.dir).length) return user.dir;
  const foes = hostilesOf(user).filter(f => user.kind === "enemy" || unitVisible(f));
  let best = null, bd = 99;
  for (const d of DIRS8) {
    const ts = targetsFor(user, mv, d);
    if (ts.length) { const dd = cheb(user, ts[0]); if (dd < bd) { bd = dd; best = d; } }
  }
  return best || user.dir;
}

function doAttack(user, mv, dir) {
  user.dir = dir;
  if (mv.id !== "_basic") user.pp[mv.id] = Math.max(0, (user.pp[mv.id] || 0) - 1);
  if (moveRange(mv) === "self") {
    const before = user.hp;
    if (mv.effect === "heal") user.hp = Math.min(maxHP(user), user.hp + Math.round(maxHP(user) * 0.35));
    const gained = user.hp - before;
    const seenS = unitVisible(user);
    TL.action(260, () => {
      if (seenS) pushLog([N(user), " utilise ", { t: mv.name, c: "mv" }, " !"]);
      FX.push({ k: "burst", x: user.x, y: user.y, col: TYPE_COLORS[mv.type] || "#fff", t0: performance.now(), dur: 420 });
      if (gained > 0) { popup(user, "+" + gained, "#7ce38a"); if (seenS) pushLog([N(user), " récupère ", { t: gained + " PV", c: "num" }, "."]); }
      sfx("heal");
    });
    return;
  }
  const targets = targetsFor(user, mv, dir);
  const seen = unitVisible(user) || targets.some(unitVisible);
  const rg = moveRange(mv);
  const col = TYPE_COLORS[mv.type] || "#fff";
  TL.action(rg === "line" ? 150 : 210, () => {
    vis(user).atk = { t0: performance.now(), dir: dir.slice() };
    if (seen) pushLog(mv.id === "_basic" ? [N(user), " attaque !"] : [N(user), " utilise ", { t: mv.name, c: "mv" }, " !"]);
    if (rg === "line") {
      const end = targets[0] || { x: user.x + dir[0] * 6, y: user.y + dir[1] * 6 };
      FX.push({ k: "proj", fx: user.x, fy: user.y, tx: end.x, ty: end.y, col, t0: performance.now(), dur: 180 });
    }
    if (rg === "room") FX.push({ k: "wave", x: user.x, y: user.y, col, t0: performance.now(), dur: 420 });
    sfx(mv.id === "_basic" ? "swing" : "cast");
  });
  if (!targets.length) {
    if (seen) msg("…mais ça ne touche personne.");
    return;
  }
  for (const t of targets) {
    const acc = (mv.accuracy == null ? 100 : mv.accuracy) / 100 * ACC_MULT[user.st.acc || 0];
    t.aware = true; t.dormant = false;
    if (rnd() > acc) {
      TL.action(170, () => { popup(t, "Raté", "#d8d8e8"); pushLog([N(t), " esquive l’attaque !"]); sfx("miss"); });
      continue;
    }
    if ((mv.power || 0) > 0) {
      const r = calcDamage(user, t, mv);
      if (rg === "room" && targets.length > 1) r.dmg = Math.max(1, Math.round(r.dmg * 0.65));
      t.hp -= r.dmg;
      if (mv.effect === "drain" && user.hp > 0) { const gain = Math.max(1, Math.round(r.dmg * 0.5)); user.hp = Math.min(maxHP(user), user.hp + gain); TL.note(() => popup(user, "+" + gain, "#7ce38a")); }
      if (t.st.sleep) t.st.sleep = 0;
      if (t.st.frozen && mv.type === "Feu") t.st.frozen = 0;
      TL.action(190, () => {
        vis(t).hurt = performance.now();
        popup(t, String(r.dmg), r.tm > 1 ? "#ffd166" : r.tm < 1 ? "#b8c0d0" : "#ffffff", r.crit || r.tm > 1);
        if (mv.id !== "_basic") FX.push({ k: "burst", x: t.x, y: t.y, col, t0: performance.now(), dur: 380 });
        if (r.crit) pushLog(["Coup critique !"]);
        if (r.tm > 1.01) pushLog([{ t: "C’est très efficace !", c: "good" }]);
        else if (r.tm < 0.99) pushLog([{ t: "Ce n’est pas très efficace…", c: "dim" }]);
        pushLog([N(t), " perd ", { t: r.dmg + " PV", c: "num" }, "."]);
        sfx(r.tm > 1 ? "hit2" : "hit");
        if (t.kind !== "enemy") shake(4);
      });
    }
    if (t.hp > 0) applyEffect(user, t, mv);
    if (t.hp <= 0) handleKO(t, user);
  }
}

function applyEffect(user, t, mv) {
  const ef = mv.effect; if (!ef) return;
  const ttypes = monById(t.mid).types || [];
  const say = (...p) => TL.note(() => pushLog(p));
  const status0 = (mv.power || 0) === 0; // capacités de statut : effet garanti
  const ch = (base) => status0 || rnd() < (typeof mv.chance === "number" ? clamp(mv.chance, 0, 100) / 100 : base);
  switch (ef) {
    case "lower_accuracy":
      if ((t.st.acc || 0) < 3) { t.st.acc = (t.st.acc || 0) + 1; say("La précision de ", N(t), " baisse !"); }
      break;
    case "flinch":
      if (ch(0.25)) { t.st.flinch = true; say(N(t), " a peur !"); }
      break;
    case "lower_speed":
      if (ch(0.25)) { t.st.slow = 5; say(N(t), " est ralenti !"); }
      break;
    case "paralyze":
      if (!ttypes.includes("Électrique") && ch(0.25)) { t.st.para = 6; say(N(t), " est paralysé !"); }
      break;
    case "freeze":
      if (!ttypes.includes("Glace") && ch(0.2)) { t.st.frozen = ri(2, 3); say(N(t), " est gelé !"); }
      break;
    case "burn":
      if (!ttypes.includes("Feu") && ch(0.25)) { t.st.burn = 6; say(N(t), " est brûlé !"); }
      break;
    case "sleep":
      if (ch(1)) { t.st.sleep = ri(3, 5); say(N(t), " s’endort !"); }
      break;
    case "poison":
      if (!ttypes.includes("Acier") && ch(0.3)) { t.st.poison = 8; say(N(t), " est empoisonné !"); }
      break;
    case "lower_defense":
      if (ch(0.3)) { t.st.defd = 5; say("La défense de ", N(t), " baisse !"); }
      break;
  }
}

function dropLoot(t, rate) {
  if (rnd() * 100 >= rate) return;
  if (tile(t.x, t.y) === "#") return;
  let x = t.x, y = t.y;
  if (R.items.some(i => i.x === x && i.y === y) || (R.stairs && R.stairs.x === x && R.stairs.y === y)) {
    const d = DIRS8.find(d => !isWall(t.x + d[0], t.y + d[1]) && !R.items.some(i => i.x === t.x + d[0] && i.y === t.y + d[1]));
    if (!d) return; x = t.x + d[0]; y = t.y + d[1];
  }
  const coin = rnd() * 100 < DROP.coinShare;
  const it = makeFloorItem(x, y, coin ? "or" : null);
  if (it.id === "or" && t.fac) it.amount = (it.amount || 10) + 10;
  R.items.push(it);
  TL.note(() => { if (isVisible(x, y)) FX.push({ k: "burst", x, y, col: "#ffd166", t0: performance.now(), dur: 360 }); });
}
function handleKO(t, killer) {
  if (R && R.ctf && typeof ctfKO === "function") { ctfKO(t, killer); return; }   // K.O. jusqu'au prochain point
  if (t.kind === "enemy") {
    R.enemies = R.enemies.filter(e => e !== t);
    const g = { u: t, fade: 0 };
    GHOSTS.push(g);
    const seenKO = unitVisible(t) || (killer && killer.kind !== "enemy");
    TL.action(240, () => { g.fade = performance.now(); if (seenKO) pushLog([N(t), " est K.O. !"]); sfx("ko"); });
    const byTeam = !killer || killer.kind !== "enemy";
    if (byTeam) {
      G.stats.kills++;
      const xp = Math.round((12 + t.lv * 5) * (t.boss ? 4 : t.fac ? 1.2 : 1) * rarityOf(t.mid).mul * 0.65);
      for (const m of activeTeam()) gainXP(m, xp);
    }
    if (R.siege) R.siege.kills++;
    if (byTeam && !t.fac && !t.crew && !R.tour && G.story.ch1Done && !R.recruitOffer && !R.noRecruit && !monById(t.mid).story && !(R.story && t.boss)) {
      const m = monById(t.mid);
      let rate = typeof m.recruit_rate === "number" ? m.recruit_rate : rarityOf(t.mid).recruit;
      if (t.boss) rate *= 0.6;
      if (t.bonus) rate = Math.max(rate, (monById(t.mid).rarity || 1) === 3 ? 20 : 12);
      if (rnd() * 100 < rate) R.recruitOffer = { mid: t.mid, lv: t.lv, x: t.x, y: t.y, boss: !!t.boss };
    }
    if (t.questTarget && byTeam && typeof questOnKill === "function") questOnKill(t);
    if (!t.boss && !t.crew) dropLoot(t, t.fac ? DROP.rival : (typeof monById(t.mid).drop_rate === "number" ? monById(t.mid).drop_rate : DROP.wild));
    if (t.fac && R.tour) tourOnKO(t, killer);
    if (R.arena) {
      if (!R.enemies.some(e => e.fac && String(e.fac).startsWith("arena"))) { R.bossDefeated = true; }
    } else if (R.crew) {
      if (t.crew && !R.enemies.some(e => e.crew)) {
        R.bossDefeated = true;
        for (const e of R.enemies) { const g2 = { u: e, fade: 0 }; GHOSTS.push(g2); TL.note(() => { g2.fade = performance.now(); }); }
        R.enemies = [];
      }
    } else if (t.boss) {
      R.bossDefeated = true;
      for (const e of R.enemies) { const g2 = { u: e, fade: 0 }; GHOSTS.push(g2); TL.note(() => { g2.fade = performance.now(); }); }
      R.enemies = [];
    }
  } else {
    const gi = G.bag.findIndex(id => ITEMS[id] && ITEMS[id].kind === "revive");
    if (gi >= 0) {
      G.bag.splice(gi, 1);
      t.hp = maxHP(t); t.st = {};
      TL.action(500, () => { pushLog([{ t: "Graine de Vie", c: "mv" }, " : ", N(t), " se relève !"]); popup(t, "Relevé !", "#7ce38a", true); sfx("level"); });
      return;
    }
    if (t.kind === "ally") {
      t.ko = true; t.hp = 0;
      const g = { u: t, fade: 0 }; GHOSTS.push(g);
      TL.action(400, () => { g.fade = performance.now(); pushLog([N(t), " est K.O. et quitte l’exploration…"]); sfx("ko"); });
    } else {
      // le héros ou le partenaire principal tombe : la partie est perdue
      t.hp = 0; if (t.kind === "partner") t.ko = true;
      R.gameOver = true; R.lostBy = t.kind;
      TL.action(700, () => { pushLog([N(t), " est K.O. !"]); sfx("ko"); vis(t).hurt = performance.now(); });
    }
  }
}

function gainXP(m, xp) {
  m.xp += xp;
  while (m.xp >= xpNeed(m.lv)) {
    m.xp -= xpNeed(m.lv);
    const before = maxHP(m);
    m.lv++;
    m.hp += maxHP(m) - before;
    const lv = m.lv;
    TL.action(380, () => { pushLog([N(m), " monte au ", { t: "niveau " + lv, c: "good" }, " !"]); popup(m, "Niv. " + lv, "#7ce3ff", true); sfx("level"); });
  }
}

function canActStatus(u) {
  const st = u.st;
  if (st.sleep > 0) { st.sleep--; if (st.sleep === 0 && u.kind !== "enemy") msg(N(u), " se réveille."); return false; }
  if (st.frozen > 0) { st.frozen--; if (st.frozen === 0) msgIf(u, N(u), " n’est plus gelé."); return false; }
  if (st.flinch) { st.flinch = false; msgIf(u, N(u), " a peur et ne bouge pas !"); return false; }
  if (st.para > 0 && rnd() < 0.4) { msgIf(u, N(u), " est paralysé et ne peut pas agir !"); return false; }
  if (st.slow > 0 && R.turn % 2 === 1) return false;
  return true;
}
function tickStatus(u) {
  if (!u || u.hp <= 0) return;
  const st = u.st;
  if (st.para > 0) st.para--;
  if (st.slow > 0) st.slow--;
  if (st.defd > 0) st.defd--;
  if (st.poison > 0) {
    st.poison--;
    const d = Math.max(2, Math.round(maxHP(u) / 14));
    u.hp -= d;
    TL.note(() => { popup(u, String(d), "#c27cff"); vis(u).hurt = performance.now(); });
    msgIf(u, N(u), " souffre du poison.");
    if (u.hp <= 0) { handleKO(u, null); return; }
  }
  if (st.burn > 0) {
    st.burn--;
    const d = Math.max(2, Math.round(maxHP(u) / 16));
    u.hp -= d;
    TL.note(() => { popup(u, String(d), "#ff9a5a"); vis(u).hurt = performance.now(); });
    msgIf(u, N(u), " souffre de sa brûlure.");
    if (u.hp <= 0) handleKO(u, null);
  }
}

// ------------------------------------------------------------
//  IA
// ------------------------------------------------------------
function chooseMove(u, target, isPartner) {
  const opts = [];
  for (const id of unitMoves(u)) {
    if ((u.pp[id] || 0) <= 0) continue;
    const mv = ATK[id];
    const rg = moveRange(mv);
    let w;
    if (rg === "self") { w = mv.effect === "heal" && u.hp < maxHP(u) * 0.45 ? 60 : 0; if (w > 0) opts.push([mv, w]); continue; }
    if ((mv.power || 0) > 0) w = mv.power * typeMult(mv.type, monById(target.mid).types) * ((monById(u.mid).types || []).includes(mv.type) ? 1.25 : 1);
    else {
      const has = { lower_accuracy: (target.st.acc || 0) >= 2, freeze: target.st.frozen > 0, paralyze: target.st.para > 0, lower_speed: target.st.slow > 0 }[mv.effect];
      w = has ? 0 : 16;
    }
    if (rg === "room") w *= (u.kind === "enemy" ? 0.45 : 1) * (hostilesOf(u).filter(f => sameArea(u, f)).length < 2 ? 0.6 : 1);
    if (w > 0) opts.push([mv, w]);
  }
  opts.push([BASIC_ATTACK, isPartner ? 22 : 30]);
  let tot = opts.reduce((s, o) => s + o[1], 0), r = rnd() * tot;
  for (const [mv, w] of opts) { r -= w; if (r <= 0) return mv; }
  return BASIC_ATTACK;
}
function adjacentFoes(u) {
  const out = [];
  for (const d of DIRS8) {
    if (!diagOK(u.x, u.y, d)) continue;
    const t = unitAt(u.x + d[0], u.y + d[1]);
    if (t && isHostile(u, t)) out.push([t, d]);
  }
  return out;
}
function tryLineMove(u, foes) {
  const lineMoves = unitMoves(u).filter(id => (u.pp[id] || 0) > 0 && moveRange(ATK[id]) === "line" && ATK[id].power > 0);
  if (!lineMoves.length) return false;
  for (const d of DIRS8) {
    const t = lineTarget(u, d, 5);
    if (t && isHostile(u, t) && foes.includes(t)) { doAttack(u, ATK[pick(lineMoves)], d); return true; }
  }
  return false;
}
function stepUnit(u, d) {
  if (!d) return false;
  const nx = u.x + d[0], ny = u.y + d[1];
  if (isWall(nx, ny) || !diagOK(u.x, u.y, d) || unitAt(nx, ny)) return false;
  const fx = u.x, fy = u.y;
  u.x = nx; u.y = ny; u.dir = d;
  TL.move(u, fx, fy);
  if (isAllyKind(u)) allyPickUp(u);
  if (R.ctf && typeof ctfAfterStep === "function") ctfAfterStep(u);
  return true;
}
// les coéquipiers ramassent ce qu'ils trouvent sur leur chemin
const ALLY_BAG = 4;
function allyPickUp(u) {
  const it = R.items.find(i => i.x === u.x && i.y === u.y); if (!it) return;
  if (it.id === "or") { const n = it.amount || 10; G.money = (G.money || 0) + n; R.money = (R.money || 0) + n; R.items = R.items.filter(i => i !== it); msg(N(u), " ramasse ", { t: n + " pièces", c: "it" }, "."); TL.note(() => sfx("pick")); return; }
  u.bag = u.bag || [];
  if (u.bag.length >= ALLY_BAG || !ITEMS[it.id]) return;
  u.bag.push(it.id); R.items = R.items.filter(i => i !== it);
  msg(N(u), " ramasse ", { t: ITEMS[it.id].name, c: "it" }, " et le met dans son sac.");
  TL.note(() => sfx("pick"));
}

function allyAct(p) {
  const h = hero();
  if (!p || p.ko || p.hp <= 0) return;
  if (R.ctf && typeof ctfAct === "function") { ctfAct(p); return; }   // Capture de Relique
  if (!canActStatus(p)) return;
  const hb = (p.bag || []).findIndex(id => ITEMS[id] && (ITEMS[id].kind === "heal" || ITEMS[id].kind === "fullheal"));
  if (p.hp < maxHP(p) * 0.33 && hb >= 0) { useItem(hb, p, p.bag); return; }
  if (p.hp < maxHP(p) * 0.4) {
    const healId = unitMoves(p).find(id => (p.pp[id] || 0) > 0 && ATK[id].effect === "heal");
    if (healId) { doAttack(p, ATK[healId], p.dir); return; }
  }
  const adj = adjacentFoes(p);
  if (adj.length) {
    adj.sort((a, b) => a[0].hp - b[0].hp);
    const [t, d] = adj[0];
    const mv = chooseMove(p, t, true);
    doAttack(p, mv, d);
    return;
  }
  if (typeof allyOrderAct === "function" && allyOrderAct(p)) return;     // ordres : Attaquer / Ne plus bouger
  const foes = R.enemies.filter(e => isVisible(e.x, e.y) && cheb(e, p) <= 5 && !e.dormant);
  if (foes.length && cheb(p, h) <= 4) {
    if (rnd() < 0.5 && tryLineMove(p, foes)) return;
    foes.sort((a, b) => cheb(a, p) - cheb(b, p));
    if (stepUnit(p, stepToward(p, foes[0].x, foes[0].y, { maxD: 10 }))) return;
  }
  // suit le héros (le 3e membre suit le partenaire s'il est plus près)
  const lead = p.kind === "ally" && partner() && !partner().ko && cheb(p, partner()) < cheb(p, h) ? partner() : h;
  if (cheb(p, lead) > 1 || (lead !== h && cheb(p, h) > 2)) {
    stepUnit(p, stepToward(p, lead.x, lead.y, { maxD: 40 }));
  }
}
function partnerAct() { for (const u of teamAllies()) { if (R.gameOver) return; allyAct(u); tickStatus(u); } }

function enemyAct(e) {
  if (e.dormant) return;
  if (R.ctf && typeof ctfAct === "function") { ctfAct(e); return; }
  if (e.fac && e.fac !== "wild" && typeof rivalAct === "function") { rivalAct(e); return; }
  if (!canActStatus(e)) return;
  const team = hostilesOf(e).filter(u => u.kind !== "enemy" || cheb(u, e) <= 4);
  if (!team.length) return;
  let t = team[0], td = cheb(e, t);
  for (const m of team) { const d = cheb(e, m); if (d < td) { td = d; t = m; } }
  if (!e.aware) {
    if (td <= 6 && (sameArea(e, t) || td <= 2)) e.aware = true;
  } else if (td > 13) e.aware = false;
  if (e.aware) {
    const adj = adjacentFoes(e);
    if (adj.length) {
      const pickA = adj.find(a => a[0].kind === "hero") && rnd() < 0.6 ? adj.find(a => a[0].kind === "hero") : adj[0];
      const mv = chooseMove(e, pickA[0], false);
      doAttack(e, mv, pickA[1]);
      return;
    }
    if (td <= 4 && rnd() < 0.25 && tryLineMove(e, team)) return;
    if (stepUnit(e, stepToward(e, t.x, t.y, { maxD: 20 }))) return;
    return;
  }
  // errance
  if (!e.wp || (e.wp.x === e.x && e.wp.y === e.y) || rnd() < 0.04) {
    const r = pick(R.rooms);
    e.wp = { x: r.x + ri(0, r.w - 1), y: r.y + ri(0, r.h - 1) };
  }
  if (!stepUnit(e, stepToward(e, e.wp.x, e.wp.y, { maxD: 50 }))) e.wp = null;
}

// ------------------------------------------------------------
//  ACTIONS DU JOUEUR
// ------------------------------------------------------------
function heroMove(d) {
  const h = hero();
  h.dir = d;
  const nx = h.x + d[0], ny = h.y + d[1];
  if (isWall(nx, ny) || !diagOK(h.x, h.y, d)) return false;
  const o = unitAt(nx, ny);
  if (o && o.kind === "enemy") { doAttack(h, BASIC_ATTACK, d); return true; }
  const fx = h.x, fy = h.y;
  if (o && isAllyKind(o)) { // échange de place
    o.x = fx; o.y = fy; o.dir = [-d[0], -d[1]];
    TL.move(o, nx, ny);
  }
  h.x = nx; h.y = ny;
  // glissade sur la glace
  let steps = 1;
  while (tile(h.x, h.y) === "i") {
    const sx = h.x + d[0], sy = h.y + d[1];
    if (isWall(sx, sy) || !diagOK(h.x, h.y, d) || unitAt(sx, sy)) break;
    h.x = sx; h.y = sy; steps++;
    if (steps > 12) break;
  }
  TL.move(h, fx, fy, steps);
  if (steps > 1) msg("Tu glisses sur la glace !");
  onEnterTile(h);
  if (R.ctf && typeof ctfAfterStep === "function") ctfAfterStep(h);
  return true;
}
function onEnterTile(u) {
  const th = themeOf(R.loc);
  // objet
  const it = R.items.find(i => i.x === u.x && i.y === u.y);
  if (it && u.kind === "hero" && it.id === "or") {
    const n = it.amount || 10;
    G.money = (G.money || 0) + n; R.items = R.items.filter(i => i !== it); R.money = (R.money || 0) + n;
    msg("Tu ramasses ", { t: n + " pièces", c: "it" }, ".");
    TL.note(() => sfx("pick"));
  } else if (it && u.kind === "hero") {
    if (G.bag.length < BAG_MAX) {
      G.bag.push(it.id); R.items = R.items.filter(i => i !== it); R.found = (R.found || 0) + 1;
      msg("Tu ramasses : ", { t: ITEMS[it.id].name, c: "it" }, ".");
      TL.note(() => sfx("pick"));
    } else msg("Ton sac est plein. ", { t: ITEMS[it.id].name, c: "it" }, " reste au sol.");
  }
  // piège
  const tr = R.ctf ? null : R.traps.find(t => t.x === u.x && t.y === u.y);   // (Capture de Relique : voir ctfTrap)
  if (tr && u.kind !== "enemy") {
    tr.seen = true;
    if (tr.kind === "spike") {
      const d = 6 + R.floor * 2;
      u.hp -= d;
      msg(N(u), " marche sur un ", { t: "piège à pics", c: "bad" }, " !");
      TL.note(() => { popup(u, String(d), "#ff8080"); vis(u).hurt = performance.now(); sfx("hit"); });
      if (u.hp <= 0) handleKO(u, null);
    } else if (tr.kind === "tp" && u.kind === "hero") {
      msg("Un ", { t: "piège de téléportation", c: "bad" }, " t’envoie ailleurs !");
      for (let k = 0; k < 40; k++) {
        const r = pick(R.rooms); const x = r.x + ri(0, r.w - 1), y = r.y + ri(0, r.h - 1);
        if (!isWall(x, y) && !unitAt(x, y)) { u.x = x; u.y = y; VIS[u.uid] = { tw: [], atk: null, hurt: 0 }; TL.note(() => sfx("tp")); break; }
      }
    }
  }
  // dalle électrique
  if (tile(u.x, u.y) === "e" && th.electric && u.kind !== "enemy" && !(monById(u.mid).types || []).includes("Électrique")) {
    const d = 4 + R.floor;
    u.hp -= d;
    msg(N(u), " reçoit une ", { t: "décharge", c: "bad" }, " !");
    TL.note(() => { popup(u, String(d), "#ffe066"); vis(u).hurt = performance.now(); sfx("zap"); });
    if (rnd() < 0.25) { u.st.para = 4; msg(N(u), " est paralysé !"); }
    if (u.hp <= 0) handleKO(u, null);
  }
}
function heroOnStairs() { const h = hero(); return R && R.stairs && h.x === R.stairs.x && h.y === R.stairs.y; }

function heroAttack(mvId) {
  const h = hero();
  const mv = mvId ? ATK[mvId] : BASIC_ATTACK;
  if (!mv) return false;
  if (mvId && (h.pp[mvId] || 0) <= 0) { msgNow("Plus de PP pour ", { t: mv.name, c: "mv" }, "."); return false; }
  const d = autoAim(h, mv);
  doAttack(h, mv, d);
  return true;
}

function useItem(idx, target, bagRef) {
  const bag = bagRef || G.bag;
  const id = bag[idx]; const it = ITEMS[id]; if (!it) return false;
  const h = hero(); const u = target || h;
  const name = { t: it.name, c: "it" };
  const v = +it.value || 0;
  switch (it.kind) {
    case "heal": { const b = u.hp; u.hp = Math.min(maxHP(u), u.hp + (v || 40)); msg(N(u), " mange ", name, " et récupère ", { t: (u.hp - b) + " PV", c: "num" }, "."); TL.note(() => { popup(u, "+" + (u.hp - b), "#7ce38a"); sfx("heal"); }); break; }
    case "fullheal": { u.hp = maxHP(u); u.st = {}; msg(N(u), " mange ", name, " : PV au maximum !"); TL.note(() => { popup(u, "PV max", "#ffd166", true); sfx("heal"); }); break; }
    case "food": R.belly = Math.min(100, R.belly + (v || 50)); msg(N(u), " mange ", name, ". Le ventre est rassasié."); TL.note(() => sfx("heal")); break;
    case "fullfood": R.belly = 100; msg(N(u), " mange ", name, ". Le ventre est plein !"); TL.note(() => sfx("heal")); break;
    case "pp": for (const id2 of unitMoves(u)) u.pp[id2] = ATK[id2].pp; msg(N(u), " boit ", name, " : PP restaurés !"); TL.note(() => sfx("heal")); break;
    case "light": R.revealed = true; for (let i = 0; i < R.grid.length; i++) if (R.grid[i] !== "#") R.explored[i] = 1; msg(name, " illumine tout l’étage !"); TL.note(() => sfx("level")); break;
    case "escape": if (R.tour && !R.tour.arena && false) return false; msg(name, " : l’équipe s’échappe du donjon !"); R.escaped = true; break;
    case "teamheal": for (const m of activeTeam()) { const b = m.hp; m.hp = Math.min(maxHP(m), m.hp + Math.round(maxHP(m) * (v || 50) / 100)); TL.note(() => popup(m, "+" + (m.hp - b), "#7ce38a")); } msg(name, " soigne toute l’équipe !"); TL.note(() => sfx("heal")); break;
    case "roomsleep": { const foes = R.enemies.filter(e => unitVisible(e) && cheb(e, h) <= 8); for (const e of foes) e.st.sleep = ri(4, 7); msg(name, " : ", { t: foes.length + " ennemi(s)", c: "num" }, " s’endorment !"); TL.note(() => sfx("level")); break; }
    case "roomdmg": {
      const foes = R.enemies.filter(e => unitVisible(e) && cheb(e, h) <= 8); msg(name, " libère la foudre !");
      for (const e of foes) { e.hp -= (v || 30); e.aware = true; e.dormant = false; TL.note(() => { vis(e).hurt = performance.now(); popup(e, String(v || 30), "#ffe066"); }); if (e.hp <= 0) handleKO(e, h); }
      TL.note(() => sfx("zap")); break;
    }
    case "equip": {
      const old = u.equip; const bm = maxHP(u);
      u.equip = id; bag.splice(idx, 1);
      if (old && ITEMS[old]) { if (bag.length < (bag === G.bag ? BAG_MAX : ALLY_BAG)) bag.push(old); else if (R) R.items.push({ x: u.x, y: u.y, id: old, dropped: true }); }
      u.hp = Math.min(maxHP(u), u.hp + Math.max(0, maxHP(u) - bm));
      msg(N(u), " s’équipe de ", name, " !"); TL.note(() => sfx("level"));
      return true;
    }
    case "revive": msgNow("La ", name, " s’utilise toute seule quand un membre est K.O."); return false;
    case "treasure": msgNow(name, " est un trésor : revends-le au marché."); return false;
    case "throw": case "sleepseed": return throwItem(idx, bag);
    default: return false;
  }
  bag.splice(idx, 1);
  return true;
}
function unequip(u) {
  if (!u || !u.equip) return false;
  if (G.bag.length >= BAG_MAX) { toast("Ton sac est plein."); return false; }
  const bm = maxHP(u); G.bag.push(u.equip); u.equip = null; u.hp = Math.min(u.hp, maxHP(u));
  return bm !== maxHP(u) || true;
}
// Poser un objet au sol : il apparaît sur la case (ou juste à côté)
function dropItem(idx) {
  const id = G.bag[idx]; const it = ITEMS[id]; if (!it) return false;
  const h = hero();
  let spot = null;
  const free = (x, y) => !isWall(x, y) && !R.items.some(i => i.x === x && i.y === y) && !(R.stairs && R.stairs.x === x && R.stairs.y === y);
  if (free(h.x, h.y)) spot = { x: h.x, y: h.y };
  else for (const d of DIRS8) { if (free(h.x + d[0], h.y + d[1]) && diagOK(h.x, h.y, d)) { spot = { x: h.x + d[0], y: h.y + d[1] }; break; } }
  if (!spot) { msgNow("Pas de place au sol ici."); return false; }
  G.bag.splice(idx, 1);
  R.items.push({ x: spot.x, y: spot.y, id, dropped: true });
  msg(N(h), " pose ", { t: it.name, c: "it" }, " au sol.");
  TL.note(() => { sfx("pick"); FX.push({ k: "burst", x: spot.x, y: spot.y, col: it.color || "#fff", t0: performance.now(), dur: 300 }); });
  return true;
}
function itemUnderHero() { const h = hero(); return R ? R.items.find(i => i.x === h.x && i.y === h.y) : null; }
function pickUpHere() {
  const it = itemUnderHero(); if (!it) return false;
  const h = hero();
  if (it.id === "or") { onEnterTile(h); return true; }
  if (G.bag.length >= BAG_MAX) { msgNow("Ton sac est plein (", BAG_MAX + "/" + BAG_MAX, ")."); return false; }
  onEnterTile(h);
  return true;
}
// Tous les objets peuvent être lancés. Un objet qui ne touche personne tombe au sol.
function throwItem(idx, bagRef) {
  const bag = bagRef || G.bag;
  const id = bag[idx]; const it = ITEMS[id]; if (!it || it.kind === "money") return false;
  const h = hero();
  let dir = h.dir, tgt = null;
  for (const d of [h.dir].concat(DIRS8)) {
    let x = h.x, y = h.y, found = null;
    for (let k = 1; k <= 8; k++) {
      if (!diagOK(x, y, d)) break;
      x += d[0]; y += d[1]; if (isWall(x, y)) break;
      const o = unitAt(x, y); if (o && (o.kind === "enemy" || (it.kind !== "throw" && it.kind !== "sleepseed" && d === h.dir))) { found = o; break; }
    }
    if (found && unitVisible(found)) { dir = d; tgt = found; break; }
  }
  h.dir = dir;
  bag.splice(idx, 1);
  let land = { x: h.x, y: h.y };
  if (!tgt) { let x = h.x, y = h.y; for (let k = 1; k <= 6; k++) { if (!diagOK(x, y, dir)) break; const nx = x + dir[0], ny = y + dir[1]; if (isWall(nx, ny)) break; x = nx; y = ny; } land = { x, y }; }
  const end = tgt || land;
  TL.action(220, () => {
    vis(h).atk = { t0: performance.now(), dir: dir.slice() };
    pushLog([N(h), " lance ", { t: it.name, c: "it" }, " !"]);
    FX.push({ k: "proj", fx: h.x, fy: h.y, tx: end.x, ty: end.y, col: it.color, t0: performance.now(), dur: 220, item: id });
    sfx("swing");
  });
  if (!tgt) {
    if (!R.items.some(i => i.x === land.x && i.y === land.y) && !(R.stairs && R.stairs.x === land.x && R.stairs.y === land.y)) { R.items.push({ x: land.x, y: land.y, id, dropped: true }); msg({ t: it.name, c: "it" }, " tombe au sol."); }
    else msg("Ça ne touche personne.");
    return true;
  }
  if (tgt.kind === "enemy") { tgt.aware = true; tgt.dormant = false; }
  const v = +it.value || 0;
  const hurt = d => { tgt.hp -= d; TL.action(180, () => { vis(tgt).hurt = performance.now(); popup(tgt, String(d), "#fff"); pushLog([N(tgt), " perd ", { t: d + " PV", c: "num" }, "."]); sfx("hit"); }); if (tgt.hp <= 0) handleKO(tgt, h); };
  switch (it.kind) {
    case "throw": hurt(v || 20); break;
    case "sleepseed": tgt.st.sleep = ri(4, 6); msg(N(tgt), " s’endort profondément !"); break;
    case "heal": { const b = tgt.hp; tgt.hp = Math.min(maxHP(tgt), tgt.hp + (v || 40)); msg(N(tgt), " attrape ", { t: it.name, c: "it" }, " et récupère ", { t: (tgt.hp - b) + " PV", c: "num" }, "."); TL.note(() => popup(tgt, "+" + (tgt.hp - b), "#7ce38a")); break; }
    case "fullheal": tgt.hp = maxHP(tgt); tgt.st = {}; msg(N(tgt), " attrape ", { t: it.name, c: "it" }, " : PV au maximum !"); break;
    case "pp": for (const id2 of unitMoves(tgt)) tgt.pp[id2] = ATK[id2].pp; msg(N(tgt), " attrape ", { t: it.name, c: "it" }, " : PP restaurés."); break;
    case "roomdmg": hurt(Math.round((v || 30) * 0.7)); break;
    default: hurt(Math.max(4, Math.round(6 + R.floor))); msg({ t: it.name, c: "it" }, " rebondit sur ", N(tgt), "."); break;
  }
  return true;
}

// ------------------------------------------------------------
//  TOUR COMPLET
// ------------------------------------------------------------
let onTurnEnd = null; // branché par l'interface
function endTurn() {
  R.turn++;
  const h = hero();
  const hDown = !!(R.ctf && h.ko);   // Capture de Relique : héros K.O., on regarde l'équipe
  if (!hDown) tickStatus(h);
  // faim (pas en Capture de Relique)
  if (!R.ctf && R.turn % (locById(R.loc).hunger2 ? 5 : 10) === 0 && R.belly > 0) {
    R.belly--;
    if (R.belly === 20) msg({ t: "Ton ventre gargouille…", c: "bad" });
    if (R.belly === 0) msg({ t: "Tu meurs de faim ! Tu perds des PV à chaque pas.", c: "bad" });
  }
  if (!R.ctf && R.belly === 0 && h.hp > 0) {
    h.hp -= 1;
    if (h.hp <= 0) handleKO(h, null);
  }
  // régénération lente
  const calm = !R.enemies.some(e => isVisible(e.x, e.y) && !e.dormant);
  if (R.belly > 0 && R.turn % (locById(R.loc).regen1 ? 1 : 4) === 0) for (const m of activeTeam()) m.hp = Math.min(maxHP(m), m.hp + 1); // 1 PV tous les 4 pas
  if (!R.gameOver) partnerAct();
  if (!R.gameOver) for (const e of R.enemies.slice()) {
    if (e.hp <= 0 || !R.enemies.includes(e)) continue;
    enemyAct(e); tickStatus(e);
    if (R.gameOver) break;
  }
  // réveil des ennemis endormis quand on s'approche
  for (const e of R.enemies) if (e.st.sleep > 50 && cheb(e, h) <= 1 && rnd() < 0.5) e.st.sleep = 1;
  // apparitions
  if (!R.boss && !R.tour && R.turn % 36 === 0 && R.enemies.length < 10) spawnEnemy(false);
  if (R.tour && !R.gameOver) tourTick();
  if (R.ctf && typeof ctfTick === "function") ctfTick();
  // éboulements dans les cavernes
  const th = themeOf(R.loc);
  if (th.quake && !R.boss && R.turn > 5 && R.turn % 47 === 0) {
    msg({ t: "Le sol tremble… Des pierres tombent du plafond !", c: "bad" });
    TL.note(() => { shake(10); sfx("quake"); });
    for (const m of activeTeam()) {
      if (rnd() < 0.6) {
        const d = 3 + R.floor; m.hp -= d;
        TL.note(() => { popup(m, String(d), "#e0b080"); vis(m).hurt = performance.now(); });
        if (m.hp <= 0) handleKO(m, null);
      }
    }
  }
  // vents du glacier : rien de dangereux, juste l'ambiance (rendu)
  TL.moveStart = null;
  updateVis();
  R.heroSkip = false;
  if (!R.gameOver && !R.bossDefeated && !R.escaped) {
    if (!hDown && !canActStatus(h)) R.heroSkip = true;
  }
  if (onTurnEnd) onTurnEnd();
}

function startRun(locId, startFloor) {
  const loc = locById(locId);
  R = G.run = {
    loc: loc.id, floor: 1, floors: loc.id === "ARENE" || loc.id === "RELIQUE" ? 1 : Math.max(2, loc.floors || (3 + (loc.difficulty || 1))),
    belly: 100, turn: 0, gameOver: false, escaped: false, found: 0, startLv: hero().lv,
    bagStart: G.bag.slice(), moneyStart: G.money || 0, money: 0
  };
  for (const m of G.team) { m.ko = false; m.hp = maxHP(m); m.st = {}; refillPP(m); }
  G.stats.runs++;
  if (loc.id === "TOURNOI") initTournament();
  if (loc.id === "ARENE") initArena();
  if (loc.id === "RELIQUE" && typeof initCtf === "function") initCtf();
  if (typeof storyRunInit === "function") storyRunInit();
  if (startFloor > 1) R.floor = Math.min(startFloor, R.floors);
  resetVisuals();
  if (typeof storyPreFloor === "function") storyPreFloor();
  genFloor();
  if (typeof questFloorHook === "function") questFloorHook();
  if (typeof storyFloorSetup === "function") storyFloorSetup();
}
function nextFloor() {
  if (R.tour && !R.tour.arena) tourStash();
  R.floor++;
  for (const m of activeTeam()) { m.st = {}; }
  resetVisuals();
  if (typeof storyPreFloor === "function") storyPreFloor();
  genFloor();
  if (typeof questFloorHook === "function") questFloorHook();
  if (typeof storyFloorSetup === "function") storyFloorSetup();
}
function endRun() {
  if ((R && R.ctf) || G.ctfBackup) { if (typeof ctfRestoreTeam === "function") ctfRestoreTeam(); }   // équipe d'avant le match
  G.team = G.team.filter(u => !u.guest);
  for (const m of G.team) { m.ko = false; m.hp = maxHP(m); m.st = {}; refillPP(m); }
  G.run = null; R = null;
  resetVisuals();
}
function resetVisuals() {
  for (const k in VIS) delete VIS[k];
  FX.length = 0; GHOSTS = []; TL.reset(); LOGBUF = [];
}
function restoreRun() {
  R = G.run;
  if (!R) return;
  resetVisuals();
  updateVis();
}
