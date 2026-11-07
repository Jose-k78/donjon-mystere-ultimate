// ============================================================
//  ARÈNE · CAPTURE DE RELIQUE (5 contre 5)
//  Deux équipes, deux bases, deux reliques. On vole la relique adverse
//  et on la ramène dans sa base : 1 point. Premier à 3 points.
//  Règle « simple » : une relique lâchée tombe au sol, n'importe qui la ramasse
//  (sa propre équipe la renvoie direct à sa base). On marque même si sa relique est volée.
//  Un K.O. disparaît jusqu'au prochain point. Pas de créatures sauvages.
// ============================================================
const CTF_W = 76, CTF_H = 44, CTF_WIN = 3, CTF_MAX_TURNS = 1000, CTF_COL_A = "#ffb347";

function ctfSide(u) { return u.kind === "enemy" ? "B" : "A"; }
function ctfOpp(s) { return s === "A" ? "B" : "A"; }
function ctfAlive(side) { return side === "A" ? activeTeam() : R.enemies.filter(e => e.fac === "ctfB" && e.hp > 0); }
function ctfByUid(uid) { if (!uid) return null; return G.team.find(u => u.uid === uid && !u.ko && u.hp > 0) || R.enemies.find(e => e.uid === uid) || null; }
function ctfCarrying(u) { if (!R || !R.ctf || !u) return null; for (const k of ["A", "B"]) { const r = R.ctf.relics[k]; if (r.state === "carried" && r.carrier === u.uid) return k; } return null; }
function ctfRelicPos(k) { const r = R.ctf.relics[k]; if (r.state === "carried") { const c = ctfByUid(r.carrier); return c ? { x: c.x, y: c.y } : { x: r.home.x, y: r.home.y }; } return { x: r.x, y: r.y }; }
function ctfInBase(side, x, y) { const b = R.ctf.base[side]; return x >= b.x && y >= b.y && x < b.x + b.w && y < b.y + b.h; }
function ctfName(side) { return side === "A" ? fillTpl("l’équipe de {name}") : "l’" + R.ctf.nameB; }
function ctfNameCap(side) { const n = ctfName(side); return n.charAt(0).toUpperCase() + n.slice(1); }
function ctfCol(side) { return side === "A" ? CTF_COL_A : R.ctf.colB; }
function ctfTurnsLeft() { return Math.max(0, R.ctf.maxTurns - (R.turn - (R.turn0 || 0))); }

// ---------- choix des 5 ----------
function ctfCandidates() { return G.team.slice(1).concat(G.reserve || []).filter(u => u && !u.guest); }
function openCtfTeamPick() {
  const cands = ctfCandidates();
  const sel = new Set(cands.slice(0, 0));
  // pré-sélection : l'équipe actuelle, puis les plus forts du dortoir
  for (const u of G.team.slice(1)) if (sel.size < 4 && !u.guest) sel.add(u);
  for (const u of (G.reserve || []).slice().sort((a, b) => b.lv - a.lv)) if (sel.size < 4) sel.add(u);
  const render = () => {
    const body = el("div", "ctf-pick");
    body.append(el("p", "sheet-text dim", "Choisis 4 coéquipiers dans ton équipe et ton dortoir. Ton héros joue toujours."));
    const list = el("div", "ctf-pick-list");
    const heroRow = el("div", "ctf-row on fixed");
    const hc = el("canvas", "ctf-face"); heroRow.append(hc, ctfRowText(hero(), "Ton héros"));
    list.append(heroRow); requestAnimationFrame(() => paintPortrait(hc, hero().mid, { still: true }));
    for (const u of cands) {
      const on = sel.has(u);
      const b = el("button", "ctf-row" + (on ? " on" : "")); b.type = "button";
      const cv = el("canvas", "ctf-face");
      b.append(cv, ctfRowText(u, G.team.includes(u) ? "Équipe" : "Dortoir"), el("b", "ctf-check", on ? "✓" : ""));
      b.onclick = () => { sfx("tap"); if (sel.has(u)) sel.delete(u); else if (sel.size < 4) sel.add(u); else { toast("4 coéquipiers maximum : retire-en un d’abord.", 1800); return; } render(); };
      list.append(b);
      requestAnimationFrame(() => paintPortrait(cv, u.mid, { still: true }));
    }
    body.append(list);
    const miss = 4 - sel.size;
    body.append(el("p", "sheet-note", sel.size + "/4 coéquipiers" + (miss > 0 ? " · " + miss + " renfort" + (miss > 1 ? "s" : "") + " de l’Arène complétera" + (miss > 1 ? "nt" : "") + " ton équipe." : ".")));
    openSheet({
      title: "Ton équipe de 5", body, tall: true, actions: [
        { label: "Annuler", cls: "ghost" },
        { label: "Lancer le match", cls: "primary", fn: () => ctfStart(cands.filter(u => sel.has(u))) }
      ]
    });
  };
  render();
}
function ctfRowText(u, where) {
  const t = el("span", "ctf-row-t");
  t.append(el("b", null, unitName(u)), el("small", null, "Niv. " + u.lv + " · " + (monById(u.mid).types || []).join("/") + " · " + where));
  return t;
}
function ctfStart(chosen) {
  if (G.ctfBackup) ctfRestoreTeam();   // sécurité : jamais deux sauvegardes d'équipe l'une sur l'autre
  chosen = chosen.filter(u => G.team.includes(u) || (G.reserve || []).includes(u)).slice(0, 4);
  G.ctfBackup = { team: G.team.map(u => u.uid), reserve: (G.reserve || []).map(u => u.uid) };
  const benched = G.team.slice(1).filter(u => !chosen.includes(u));
  G.reserve = (G.reserve || []).filter(u => !chosen.includes(u)).concat(benched);
  G.team = [hero()].concat(chosen);
  const lv = Math.max(1, Math.round(G.team.reduce((s, u) => s + u.lv, 0) / G.team.length));
  const used = G.team.map(u => u.mid);
  while (G.team.length < 5) {
    const mid = tourMids(1, used)[0]; used.push(mid);
    const u = makeUnit(mid, lv, "ally"); u.loan = true;
    G.team.push(u);
  }
  if (typeof Store !== "undefined") Store.saveGame(G);
  enterDungeon("RELIQUE");
}
// remet l'équipe et le dortoir comme avant le match
function ctfRestoreTeam(g) {
  g = g || G;
  const b = g.ctfBackup;
  const all = g.team.concat(g.reserve || []).filter(u => u && !u.loan);
  if (b) {
    const by = uid => all.find(u => u.uid === uid);
    const team = b.team.map(by).filter(Boolean), res = b.reserve.map(by).filter(Boolean);
    for (const u of all) if (!team.includes(u) && !res.includes(u)) res.push(u);
    if (team.length && team[0].kind === "hero") { g.team = team; g.reserve = res; }
    else { g.team = g.team.filter(u => !u.loan); }
    delete g.ctfBackup;
  } else g.team = g.team.filter(u => !u.loan);
  for (const u of g.team.concat(g.reserve || [])) { delete u.ctfOrder; delete u.ctfAuto; delete u.hold; u.ko = false; if (MON[u.mid]) { u.hp = maxHP(u); u.st = {}; refillPP(u); } }
}

// ---------- début du match ----------
function initCtf() {
  R.floors = 1;
  const lv = Math.max(1, Math.round(G.team.reduce((s, u) => s + u.lv, 0) / G.team.length));
  const nm = RIVAL_TEAM_NAMES.slice().sort(() => rnd() - 0.5)[0];
  const used = G.team.map(u => u.mid);
  const mids = tourMids(5, used);
  R.ctf = { score: { A: 0, B: 0 }, nameB: nm.name, colB: nm.col, relics: {}, base: {}, bagB: ["baie", "baie", "baie"], outB: [], maxTurns: CTF_MAX_TURNS, sudden: false, over: null, lv, watch: null, fast: false, points: 0 };
  R.tour = { arena: true, ctf: true, log: [], teams: [{ fac: "ctfB", name: nm.name, col: nm.col, kind: "rival", floor: 1, state: "in", onFloor: true, bag: [], members: [] }] };
  const rolesB = ["attaquer", "attaquer", "defendre", "defendre", "suivre"];
  R.ctf.startB = mids.map((mid, i) => { const u = makeRival(mid, lv + (i === 0 ? 1 : 0), "ctfB", nm.name); u.ctfOrder = rolesB[i]; u.ctfAuto = true; return u; });
  const rolesA = ["attaquer", "defendre", "attaquer", "suivre"];
  G.team.slice(1).forEach((u, i) => { u.ctfOrder = rolesA[i % rolesA.length]; u.ctfAuto = true; });
}
function ctfGenFloor() {
  const W = CTF_W, H = CTF_H, half = W >> 1;
  R.w = W; R.h = H;
  R.grid = new Array(W * H).fill("#"); R.roomAt = new Array(W * H).fill(-1); R.rooms = [];
  R.items = []; R.traps = []; R.enemies = [];
  R.explored = new Array(W * H).fill(0);
  R.revealed = false; R.boss = false; R.bossDefeated = false; R.stairs = null;
  // moitié gauche : grille 3 × 3, base au milieu à gauche ; puis miroir
  const cxN = 3, cyN = 3, cw = Math.floor((half - 1) / cxN), ch = Math.floor((H - 2) / cyN);
  const cells = [];
  for (let j = 0; j < cyN; j++) for (let i = 0; i < cxN; i++) {
    const ox = 1 + i * cw, oy = 1 + j * ch;
    let r = null;
    if (i === 0 && j === 1) r = { x: 2, y: oy + ((ch - 9) >> 1), w: 9, h: 9, base: true };
    else if (i === 2 || rnd() < 0.85) {
      const rw = ri(5, Math.min(10, cw - 3)), rh = ri(4, Math.min(9, ch - 3));
      r = { x: ox + 1 + ri(0, Math.max(0, cw - rw - 2)), y: oy + 1 + ri(0, Math.max(0, ch - rh - 2)), w: rw, h: rh };
    }
    if (r) { r.id = R.rooms.length; R.rooms.push(r); cells.push({ i, j, room: r.id, px: r.x + (r.w >> 1), py: r.y + (r.h >> 1) }); }
    else cells.push({ i, j, room: -1, px: ox + ri(2, cw - 3), py: oy + ri(2, ch - 3) });
  }
  const carve = r => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { R.grid[I(x, y)] = "."; R.roomAt[I(x, y)] = r.id; } };
  R.rooms.forEach(carve);
  // chemins : arbre couvrant + boucles (plusieurs routes vers chaque base)
  const cid = (i, j) => j * cxN + i;
  const seen = new Set([0]), stack = [0], edges = [];
  while (stack.length) {
    const c = stack[stack.length - 1], ci = cells[c];
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [ci.i + dx, ci.j + dy]).filter(([i, j]) => i >= 0 && j >= 0 && i < cxN && j < cyN).map(([i, j]) => cid(i, j)).filter(n => !seen.has(n));
    if (!nb.length) { stack.pop(); continue; }
    const n = pick(nb); seen.add(n); edges.push([c, n]); stack.push(n);
  }
  edges.push([cid(0, 1), cid(0, 0)], [cid(0, 1), cid(0, 2)], [cid(0, 1), cid(1, 1)]);
  for (let k = 0; k < 2; k++) { const a = ri(0, cells.length - 1), ca = cells[a]; const o = [[1, 0], [0, 1]].map(([dx, dy]) => [ca.i + dx, ca.j + dy]).filter(([i, j]) => i < cxN && j < cyN).map(([i, j]) => cid(i, j)); if (o.length) edges.push([a, pick(o)]); }
  for (const [a, b] of edges) carveCorridor(cells[a], cells[b]);
  for (const c of cells) if (c.room < 0 && R.grid[I(c.px, c.py)] === "#") R.grid[I(c.px, c.py)] = ",";
  // miroir vers la droite
  const nL = R.rooms.length;
  for (let y = 0; y < H; y++) for (let x = 0; x < half; x++) { R.grid[I(W - 1 - x, y)] = R.grid[I(x, y)]; }
  for (let k = 0; k < nL; k++) { const r = R.rooms[k]; const m = { x: W - r.x - r.w, y: r.y, w: r.w, h: r.h, id: R.rooms.length, base: r.base }; R.rooms.push(m); carve(m); }
  // le centre : une grande salle de combat + trois passages
  const mid = { x: half - 7, y: (H >> 1) - 5, w: 14, h: 10, id: R.rooms.length, center: true };
  R.rooms.push(mid); carve(mid);
  for (let j = 0; j < cyN; j++) { const c = cells[cid(2, j)]; carveCorridor(c, { px: W - 1 - c.px, py: c.py }); }
  // bases et reliques
  const bA = R.rooms.find(r => r.base && r.x < half), bB = R.rooms.find(r => r.base && r.x > half);
  R.ctf.base = { A: { x: bA.x, y: bA.y, w: bA.w, h: bA.h }, B: { x: bB.x, y: bB.y, w: bB.w, h: bB.h } };
  for (const [k, b] of [["A", bA], ["B", bB]]) { const hx = b.x + (b.w >> 1), hy = b.y + (b.h >> 1); R.ctf.relics[k] = { home: { x: hx, y: hy }, x: hx, y: hy, state: "base", carrier: null }; }
  // objets et pièges (placés en miroir pour que ce soit juste)
  for (let k = 0; k < 7; k++) ctfPlacePair("item");
  for (let k = 0; k < 6; k++) ctfPlacePair("trap");
  // les deux équipes dans leur base
  for (const u of G.team) { u.ko = false; ctfPlace(u, "A"); u.dir = [1, 0]; }
  for (const u of R.ctf.startB) { ctfPlace(u, "B"); u.dir = [-1, 0]; u.aware = true; R.enemies.push(u); }
  delete R.ctf.startB;
  for (let y = bA.y - 1; y <= bA.y + bA.h; y++) for (let x = bA.x - 1; x <= bA.x + bA.w; x++) if (inb(x, y)) R.explored[I(x, y)] = 1;
  R.turn0 = R.turn;
  updateVis();
}
function ctfFreeIn(r, avoidBase) {
  for (let k = 0; k < 80; k++) {
    const x = r.x + ri(0, r.w - 1), y = r.y + ri(0, r.h - 1);
    if (isWall(x, y) || unitAt(x, y)) continue;
    if (avoidBase && (ctfInBase("A", x, y) || ctfInBase("B", x, y))) continue;
    if (R.items.some(i => i.x === x && i.y === y) || R.traps.some(t => t.x === x && t.y === y)) continue;
    if (["A", "B"].some(s => R.ctf.relics[s] && R.ctf.relics[s].home.x === x && R.ctf.relics[s].home.y === y)) continue;
    return { x, y };
  }
  return null;
}
function ctfPlacePair(kind) {
  const half = R.w >> 1;
  const rooms = R.rooms.filter(r => !r.base && r.x + r.w <= half);
  for (let k = 0; k < 10; k++) {
    const p = ctfFreeIn(pick(rooms), true); if (!p) continue;
    const q = { x: R.w - 1 - p.x, y: p.y };
    if (isWall(q.x, q.y) || unitAt(q.x, q.y) || R.items.some(i => i.x === q.x && i.y === q.y) || R.traps.some(t => t.x === q.x && t.y === q.y)) continue;
    if (kind === "item") { const id = randomItem(); R.items.push(makeFloorItem(p.x, p.y, id)); R.items.push(makeFloorItem(q.x, q.y, id)); }
    else { const t = pick(["spike", "spike", "tp"]); R.traps.push({ x: p.x, y: p.y, kind: t, seen: false }, { x: q.x, y: q.y, kind: t, seen: false }); }
    return true;
  }
  return false;
}
function ctfPlace(u, side) {
  const b = R.ctf.base[side], home = R.ctf.relics[side].home;
  const spots = [];
  for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) if (!(x === home.x && y === home.y) && !isWall(x, y) && !unitAt(x, y)) spots.push({ x, y, d: cheb({ x, y }, home) });
  spots.sort((a, c) => a.d - c.d);
  const p = spots.length ? spots[Math.min(spots.length - 1, ri(0, 6))] : { x: b.x, y: b.y };
  u.x = p.x; u.y = p.y; u.wp = null; u.hold = null;
  VIS[u.uid] = { tw: [], atk: null, hurt: 0 };
}

// ---------- vision : tout ce que voit l'équipe ----------
function ctfUpdateVis() {
  VISMAP = new Uint8Array(R.w * R.h);
  const mark = (x, y) => { if (inb(x, y)) { VISMAP[I(x, y)] = 1; R.explored[I(x, y)] = 1; } };
  for (const u of activeTeam()) {
    const r = roomOf(u.x, u.y);
    if (r >= 0) { const rm = R.rooms[r]; for (let y = rm.y - 1; y <= rm.y + rm.h; y++) for (let x = rm.x - 1; x <= rm.x + rm.w; x++) mark(x, y); }
    else for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) mark(u.x + x, u.y + y);
  }
}
// caméra : le héros, ou l'allié qu'on regarde quand le héros est K.O.
function camUnit() {
  const h = hero();
  if (!R || !R.ctf || !h.ko) return h;
  const al = activeTeam();
  return al.find(u => u.uid === R.ctf.watch) || al[0] || h;
}
function ctfCycleWatch() {
  const al = activeTeam(); if (!al.length) return;
  const i = al.findIndex(u => u.uid === (camUnit() || {}).uid);
  const n = al[(i + 1) % al.length]; R.ctf.watch = n.uid;
  toast("Tu regardes " + unitName(n), 1200);
}

// ---------- déplacements : pièges, reliques, points ----------
function ctfAfterStep(u) {
  if (!R || !R.ctf || u.hp <= 0 || u.ko) return;
  ctfTrap(u);
  if (u.hp <= 0 || u.ko || !R.ctf || R.ctf.over) return;
  // les adversaires ramassent les baies au sol pour leur équipe
  if (u.kind === "enemy") {
    const it = R.items.find(i => i.x === u.x && i.y === u.y);
    if (it && ITEMS[it.id] && /heal/.test(ITEMS[it.id].kind) && R.ctf.bagB.length < 6) { R.ctf.bagB.push(it.id); R.items = R.items.filter(i => i !== it); msgIf(u, N(u), " ramasse ", { t: ITEMS[it.id].name, c: "it" }, "."); }
  }
  ctfStep(u);
}
function ctfTrap(u) {
  const tr = R.traps.find(t => t.x === u.x && t.y === u.y); if (!tr) return;
  if (u.kind !== "enemy" || isVisible(u.x, u.y)) tr.seen = true;
  if (tr.kind === "spike") {
    const d = Math.max(4, Math.round(maxHP(u) * 0.12));
    u.hp -= d;
    msgIf(u, N(u), " marche sur un ", { t: "piège à pics", c: "bad" }, " !");
    TL.note(() => { if (unitVisible(u)) { popup(u, String(d), "#ff8080"); vis(u).hurt = performance.now(); sfx("hit"); } });
    if (u.hp <= 0) handleKO(u, null);
  } else {
    const rooms = R.rooms.filter(r => !r.base);
    for (let k = 0; k < 40; k++) {
      const r = pick(rooms), x = r.x + ri(0, r.w - 1), y = r.y + ri(0, r.h - 1);
      if (isWall(x, y) || unitAt(x, y)) continue;
      msgIf(u, "Un ", { t: "piège de téléportation", c: "bad" }, " envoie ", N(u), " ailleurs !");
      u.x = x; u.y = y; VIS[u.uid] = { tw: [], atk: null, hurt: 0 }; u.wp = null;
      TL.note(() => sfx("tp"));
      break;
    }
  }
}
function ctfStep(u) {
  const side = ctfSide(u), other = ctfOpp(side);
  for (const k of ["A", "B"]) {
    const r = R.ctf.relics[k];
    if (r.state === "carried" || r.x !== u.x || r.y !== u.y) continue;
    if (k === side) { if (r.state === "ground") ctfReturnRelic(k, u); }
    else if (!ctfCarrying(u)) {
      r.state = "carried"; r.carrier = u.uid;
      const t = unitName(u) + " s’empare de la relique de " + ctfName(k) + " !";
      TL.note(() => { pushLog([{ t, c: side === "A" ? "good" : "bad" }]); toast(t, 2200); sfx("pick"); FX.push({ k: "burst", x: u.x, y: u.y, col: ctfCol(k), t0: performance.now(), dur: 520 }); });
    }
  }
  const ro = R.ctf.relics[other];
  if (ro.state === "carried" && ro.carrier === u.uid && ctfInBase(side, u.x, u.y)) ctfPoint(side, u, "capture");
}
function ctfReturnRelic(k, by) {
  const r = R.ctf.relics[k];
  r.state = "base"; r.carrier = null; r.x = r.home.x; r.y = r.home.y;
  const t = (by ? unitName(by) + " renvoie" : "Retour de") + " la relique de " + ctfName(k) + " à sa base.";
  TL.note(() => { pushLog([{ t, c: "mv" }]); toast(t, 1800); sfx("tp"); });
}
function ctfDropRelic(u) {
  const k = ctfCarrying(u); if (!k) return;
  const r = R.ctf.relics[k];
  r.state = "ground"; r.carrier = null; r.x = u.x; r.y = u.y;
  const t = "La relique de " + ctfName(k) + " tombe au sol !";
  TL.note(() => { pushLog([{ t, c: "mv" }]); toast(t, 2000); });
}
function ctfPoint(side, by, why) {
  if (!R.ctf || R.ctf.over) return;
  R.ctf.score[side]++; R.ctf.points++;
  const sc = R.ctf.score;
  const t = why === "wipe" ? ctfNameCap(ctfOpp(side)) + " est entièrement K.O. : 1 point pour " + ctfName(side) + " !" : unitName(by) + " rapporte la relique ! 1 point pour " + ctfName(side) + " !";
  const board = ctfNameCap("A") + " " + sc.A + " – " + sc.B + " " + R.ctf.nameB;
  TL.action(600, () => { pushLog([{ t, c: side === "A" ? "good" : "bad" }]); pushLog([{ t: board, c: "mv" }]); toast((side === "A" ? "🏆 " : "⚠️ ") + t, 3200); sfx("level"); shake(6); });
  if (sc[side] >= CTF_WIN || R.ctf.sudden) { R.ctf.over = side; return; }
  ctfResetRound();
}
function ctfResetRound() {
  for (const k of ["A", "B"]) { const r = R.ctf.relics[k]; r.state = "base"; r.carrier = null; r.x = r.home.x; r.y = r.home.y; }
  let back = 0;
  for (const u of G.team) if (u.ko || u.hp <= 0) { u.ko = false; u.hp = maxHP(u); u.st = {}; ctfPlace(u, "A"); back++; }
  for (const u of R.ctf.outB) { u.hp = maxHP(u); u.st = {}; ctfPlace(u, "B"); u.aware = true; R.enemies.push(u); back++; }
  R.ctf.outB = []; R.ctf.watch = null;
  if (back) msg({ t: "Les K.O. reviennent dans leur base. Les reliques retournent à leur place.", c: "mv" });
  else msg({ t: "Les reliques retournent à leur place.", c: "mv" });
}
// K.O. : on disparaît jusqu'au prochain point
function ctfKO(t, killer) {
  ctfDropRelic(t);
  const g = { u: t, fade: 0 }; GHOSTS.push(g);
  if (t.kind === "enemy") {
    R.enemies = R.enemies.filter(e => e !== t); t.hp = 0;
    const seen = unitVisible(t) || (killer && killer.kind !== "enemy");
    TL.action(240, () => { g.fade = performance.now(); if (seen) pushLog([N(t), " est K.O. ! Retour au prochain point."]); sfx("ko"); });
    if (killer && killer.kind !== "enemy") {
      G.stats.kills++;
      const xp = Math.round((12 + t.lv * 5) * 1.2 * rarityOf(t.mid).mul * 0.65);
      for (const m of activeTeam()) gainXP(m, xp);
    }
    if (rnd() < 0.3) dropLoot(t, 100);
    R.ctf.outB.push(t);
  } else {
    t.ko = true; t.hp = 0;
    TL.action(400, () => { g.fade = performance.now(); pushLog([N(t), " est K.O. ! Retour au prochain point."]); sfx("ko"); });
    if (t.kind === "hero") { R.ctf.watch = null; TL.note(() => toast("Tu es K.O. ! Tu regardes ton équipe jusqu’au prochain point.", 3200)); }
  }
  if (!ctfAlive("A").length) ctfPoint("B", null, "wipe");
  else if (!ctfAlive("B").length) ctfPoint("A", null, "wipe");
}
// à la fin de chaque tour
function ctfTick() {
  const C = R.ctf; if (!C || C.over) return;
  if (R.turn % 4 === 0) for (const e of R.enemies) e.hp = Math.min(maxHP(e), e.hp + 1);
  if (R.turn % 45 === 0 && R.items.length < 18) ctfPlacePair("item");
  if (R.turn % 140 === 0 && R.traps.length < 20) ctfPlacePair("trap");
  if (!C.sudden && ctfTurnsLeft() <= 0) {
    if (C.score.A !== C.score.B) C.over = C.score.A > C.score.B ? "A" : "B";
    else { C.sudden = true; msg({ t: "Temps écoulé, égalité ! Prolongation : le prochain point gagne !", c: "mv" }); TL.note(() => toast("Prolongation : le prochain point gagne !", 3000)); }
  } else if (C.sudden && R.turn - (R.turn0 || 0) >= C.maxTurns + 300) C.over = "draw";
  ctfRebalance("A"); ctfRebalance("B");
}
// rôles automatiques : il reste toujours au moins un attaquant (prolongation : tout le monde attaque)
function ctfRebalance(side) {
  const alive = ctfAlive(side).filter(u => u.kind !== "hero");
  const autos = alive.filter(u => u.ctfAuto);
  if (!autos.length) return;
  if (R.ctf.sudden) { for (const u of autos) if (orderOf(u) !== "attaquer") { u.ctfOrder = "attaquer"; u.hold = null; } return; }
  const heroGoes = side === "A" && !hero().ko;
  if (heroGoes || alive.some(u => orderOf(u) === "attaquer")) return;
  const pickU = autos.slice().sort((a, b) => (orderOf(a) === "suivre" ? -1 : 0) - (orderOf(b) === "suivre" ? -1 : 0) || b.hp / maxHP(b) - a.hp / maxHP(a))[0];
  pickU.ctfOrder = "attaquer"; pickU.hold = null;
  if (side === "A") msg({ t: unitName(pickU) + " part chercher la relique !", c: "mv" });
}

// ---------- intelligence (nos alliés et l'équipe adverse) ----------
function ctfFoesNear(u, rad) {
  const all = u.kind === "enemy" ? activeTeam() : R.enemies.filter(e => e.hp > 0);
  return all.filter(f => cheb(f, u) <= rad && (sameArea(f, u) || cheb(f, u) <= 3 || ctfCarrying(f))).sort((a, b) => cheb(a, u) - cheb(b, u));
}
function ctfGo(u, x, y) {
  if (u.x === x && u.y === y) return false;
  let d = stepToward(u, x, y, { maxD: 140 });
  if (d && stepUnit(u, d)) return true;
  d = stepToward(u, x, y, { maxD: 140, ignoreAllies: true });
  if (d && stepUnit(u, d)) return true;
  // contourner un coéquipier qui bloque
  const opts = DIRS8.filter(dd => !isWall(u.x + dd[0], u.y + dd[1]) && diagOK(u.x, u.y, dd) && !unitAt(u.x + dd[0], u.y + dd[1]));
  if (opts.length) { opts.sort((a, b) => cheb({ x: u.x + a[0], y: u.y + a[1] }, { x, y }) - cheb({ x: u.x + b[0], y: u.y + b[1] }, { x, y })); return stepUnit(u, opts[Math.min(opts.length - 1, ri(0, 1))]); }
  return false;
}
function ctfFight(u, foes) {
  if (!foes.length) return false;
  if (rnd() < 0.4 && tryLineMove(u, foes)) return true;
  return ctfGo(u, foes[0].x, foes[0].y);
}
function ctfHit(u, adj, prefer) {
  const a = (prefer && adj.find(x => x[0] === prefer)) || adj.slice().sort((p, q) => p[0].hp - q[0].hp)[0];
  doAttack(u, chooseMove(u, a[0], u.kind !== "enemy"), a[1]);
}
function ctfHeal(u) {
  if (u.kind === "enemy") {
    const bi = R.ctf.bagB.findIndex(x => x === "baie" || x === "baieor" || (ITEMS[x] && /heal/.test(ITEMS[x].kind)));
    if (bi >= 0) {
      const id = R.ctf.bagB.splice(bi, 1)[0], b = u.hp;
      u.hp = ITEMS[id].kind === "fullheal" || id === "baieor" ? maxHP(u) : Math.min(maxHP(u), u.hp + (+ITEMS[id].value || 40));
      if (unitVisible(u)) { msg(N(u), " mange ", { t: ITEMS[id].name, c: "it" }, " !"); TL.note(() => { popup(u, "+" + (u.hp - b), "#7ce38a"); sfx("heal"); }); }
      return true;
    }
  } else {
    const hb = (u.bag || []).findIndex(id => ITEMS[id] && (ITEMS[id].kind === "heal" || ITEMS[id].kind === "fullheal"));
    if (hb >= 0) { useItem(hb, u, u.bag); return true; }
  }
  const healId = unitMoves(u).find(id => (u.pp[id] || 0) > 0 && ATK[id].effect === "heal");
  if (healId) { doAttack(u, ATK[healId], u.dir); return true; }
  return false;
}
function ctfAct(u) {
  if (!u || u.hp <= 0 || u.ko) return;
  if (!canActStatus(u)) return;
  const side = ctfSide(u), other = ctfOpp(side);
  const mine = R.ctf.relics[side], theirs = R.ctf.relics[other];
  // 1. se soigner
  if (u.hp < maxHP(u) * 0.35 && rnd() < 0.8 && ctfHeal(u)) return;
  // 2. le porteur rentre à la base
  if (theirs.state === "carried" && theirs.carrier === u.uid) {
    if (ctfGo(u, mine.home.x, mine.home.y)) return;
    const adj = adjacentFoes(u); if (adj.length) ctfHit(u, adj);
    return;
  }
  const thief = mine.state === "carried" ? ctfByUid(mine.carrier) : null;
  const adj = adjacentFoes(u);
  if (adj.length) { ctfHit(u, adj, thief); return; }
  const ord = orderOf(u);
  if (ord === "rester") { const f = ctfFoesNear(u, 6); if (f.length && rnd() < 0.7) tryLineMove(u, f); return; }
  // 3. quelqu'un a volé notre relique : on le poursuit
  if (thief && (ord === "defendre" || cheb(u, thief) <= 14)) {
    if (rnd() < 0.35 && tryLineMove(u, [thief])) return;
    if (ctfGo(u, thief.x, thief.y)) return;
  }
  // 4. notre relique est au sol : on la touche pour la renvoyer
  if (mine.state === "ground" && (ord === "defendre" || cheb(u, mine) <= 12)) { if (ctfGo(u, mine.x, mine.y)) return; }
  if (ord === "defendre") {
    const home = mine.home;
    const near = ctfFoesNear(u, 8).filter(f => cheb(f, home) <= 9);
    if (near.length && ctfFight(u, near)) return;
    if (!u.hold || rnd() < 0.04) { const b = R.ctf.base[side]; u.hold = { x: b.x + ri(1, b.w - 2), y: b.y + ri(1, b.h - 2) }; }
    if (cheb(u, home) > 3 || rnd() < 0.25) ctfGo(u, u.hold.x, u.hold.y);
    return;
  }
  if (ord === "suivre") {
    const lead = side === "A" ? (!hero().ko ? hero() : null) : (ctfByUid(theirs.carrier) || R.enemies.find(e => e !== u && e.fac === "ctfB" && orderOf(e) === "attaquer"));
    if (lead) {
      const foes = ctfFoesNear(u, 5).filter(f => cheb(f, lead) <= 6);
      if (foes.length && ctfFight(u, foes)) return;
      if (cheb(u, lead) > 1) ctfGo(u, lead.x, lead.y);
      return;
    }
  }
  // attaquer (ou suivre sans chef) : vers la relique adverse, en escortant le porteur
  const foes = ctfFoesNear(u, 5);
  if (foes.length && (cheb(foes[0], u) <= 3 || rnd() < 0.5) && ctfFight(u, foes)) return;
  const mate = theirs.state === "carried" ? ctfByUid(theirs.carrier) : null;
  if (mate && mate !== u) { if (cheb(u, mate) > 2) ctfGo(u, mate.x, mate.y); return; }
  const tgt = ctfRelicPos(other);
  ctfGo(u, tgt.x, tgt.y);
}

// ---------- affichage ----------
function drawRelic(ctx, x, y, T, col, now, small) {
  const s = T * (small ? 0.16 : 0.22), b = Math.sin(now / 280) * T * 0.04;
  ctx.save(); ctx.translate(x, y + b);
  ctx.shadowColor = col; ctx.shadowBlur = 14;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -s * 1.5); ctx.lineTo(s, -s * 0.25); ctx.lineTo(0, s * 1.2); ctx.lineTo(-s, -s * 0.25); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.beginPath(); ctx.moveTo(0, -s * 1.5); ctx.lineTo(s * 0.38, -s * 0.25); ctx.lineTo(0, s * 0.15); ctx.lineTo(-s * 0.38, -s * 0.25); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(20,12,4,0.85)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, -s * 1.5); ctx.lineTo(s, -s * 0.25); ctx.lineTo(0, s * 1.2); ctx.lineTo(-s, -s * 0.25); ctx.closePath(); ctx.stroke();
  ctx.restore();
}
// bases + reliques posées (dans le monde, avant les créatures)
function ctfDrawWorld(ctx, T, now) {
  for (const k of ["A", "B"]) {
    const b = R.ctf.base[k], col = ctfCol(k);
    ctx.save(); ctx.globalAlpha = 0.14; ctx.fillStyle = col; ctx.fillRect(b.x * T, b.y * T, b.w * T, b.h * T); ctx.restore();
    ctx.strokeStyle = col; ctx.globalAlpha = 0.55; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.strokeRect(b.x * T + 1, b.y * T + 1, b.w * T - 2, b.h * T - 2); ctx.setLineDash([]); ctx.globalAlpha = 1;
    const h = R.ctf.relics[k].home;
    ctx.fillStyle = "rgba(30,22,14,0.55)"; ctx.beginPath(); ctx.ellipse((h.x + 0.5) * T, (h.y + 0.74) * T, T * 0.36, T * 0.14, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse((h.x + 0.5) * T, (h.y + 0.74) * T, T * 0.36, T * 0.14, 0, 0, 7); ctx.stroke();
    const r = R.ctf.relics[k];
    if (r.state !== "carried") drawRelic(ctx, (r.x + 0.5) * T, (r.y + 0.42) * T, T, col, now);
  }
}
// porteur : relique au-dessus de la tête
function ctfDrawCarrier(ctx, u, fx, fy, T, now, sc) {
  const k = ctfCarrying(u); if (!k) return;
  const col = ctfCol(k), pulse = 0.5 + 0.5 * Math.sin(now / 160);
  ctx.strokeStyle = col; ctx.globalAlpha = 0.5 + pulse * 0.5; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(fx, fy - T * 0.04, T * 0.44, T * 0.16, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
  drawRelic(ctx, fx, fy - T * 1.12 * (sc || 1), T, col, now, true);
}
// après l'obscurité : les porteurs et les reliques restent visibles partout
function ctfDrawHidden(ctx, T, now) {
  for (const k of ["A", "B"]) {
    const r = R.ctf.relics[k], col = ctfCol(k);
    if (r.state === "carried") {
      const c = ctfByUid(r.carrier); if (!c || isVisible(c.x, c.y)) continue;
      const [vx, vy] = visPos(c, now), fx = (vx + 0.5) * T, fy = (vy + 0.84) * T;
      drawCreature(ctx, c.mid, fx, fy, T, { t: now + (hashStr(c.uid) % 1000), dir: c.dir, moving: isMoving(c, now), alpha: 0.85 });
      ctfDrawCarrier(ctx, c, fx, fy, T, now, 1);
    } else if (!isVisible(r.x, r.y)) {
      ctx.globalAlpha = 0.9; drawRelic(ctx, (r.x + 0.5) * T, (r.y + 0.42) * T, T, col, now); ctx.globalAlpha = 1;
    }
  }
}
function ctfMini(c, scale, now) {
  for (const k of ["A", "B"]) { const b = R.ctf.base[k]; c.fillStyle = ctfCol(k); c.globalAlpha = 0.35; c.fillRect(b.x * scale, b.y * scale, b.w * scale, b.h * scale); c.globalAlpha = 1; }
  const blink = Math.floor(now / 250) % 2;
  for (const k of ["A", "B"]) {
    const p = ctfRelicPos(k), r = R.ctf.relics[k];
    c.fillStyle = blink ? "#ffffff" : ctfCol(k);
    const s = r.state === "carried" ? 3 : 2;
    c.fillRect(p.x * scale - s, p.y * scale - s, scale + s * 2, scale + s * 2);
    c.fillStyle = ctfCol(k); c.fillRect(p.x * scale, p.y * scale, scale, scale);
  }
}
function ctfHud(tb) {
  const C = R.ctf;
  const rel = k => { const r = C.relics[k]; if (r.state === "base") return "à la base"; if (r.state === "ground") return "au sol"; const c = ctfByUid(r.carrier); return "portée par " + (c ? unitName(c) : "?"); };
  const team = G.team.map(u => ({ n: unitName(u).slice(0, 8) + (u.kind === "hero" && !u.ko ? " " + Math.max(0, u.hp) + "/" + maxHP(u) : ""), p: u.ko ? 0 : Math.round(clamp(u.hp / maxHP(u), 0, 1) * 100), ko: !!u.ko, h: u.kind === "hero", o: u.kind === "hero" ? "" : (ALLY_ORDERS[orderOf(u)] || {}).icon || "" }));
  const data = { a: C.score.A, b: C.score.B, ra: rel("A"), rb: rel("B"), t: C.sudden ? "Prolongation" : ctfTurnsLeft() + " tours", team, ko: hero().ko, w: (camUnit() || {}).uid, fast: C.fast };
  const key = JSON.stringify(data);
  if (DG.hud.ctf === key) return; DG.hud.ctf = key;
  tb.classList.add("ctf");
  const sc = el("div", "ctf-score");
  const ta = el("span", "ctf-t"); ta.style.setProperty("--tc", CTF_COL_A); ta.append(el("i"), document.createTextNode(fillTpl("{name}")));
  const tb2 = el("span", "ctf-t"); tb2.style.setProperty("--tc", C.colB); tb2.append(document.createTextNode(C.nameB.replace(/^Équipe /, "")), el("i"));
  sc.append(ta, el("b", "pix ctf-n", C.score.A + " – " + C.score.B), tb2, el("small", "ctf-time", data.t));
  const info = el("div", "ctf-info", "Ta relique : " + data.ra + " · La leur : " + data.rb);
  const tm = el("div", "ctf-team");
  for (const u of team) { const p = el("span", "ctf-pill" + (u.ko ? " ko" : "") + (u.h ? " hero" : "")); const bar = el("i"); bar.style.width = u.p + "%"; p.append(el("em", null, u.o), document.createTextNode(u.n), bar); tm.append(p); }
  const nodes = [sc, info, tm];
  if (data.ko) { const c = camUnit(); nodes.push(el("div", "ctf-info ko", "K.O. : tu regardes " + (c ? unitName(c) : "ton équipe") + ". Touche l’écran pour changer.")); }
  tb.replaceChildren(...nodes);
}
// Fin du match
async function seqCtfEnd() {
  DG.transition = true;
  await wait(700);
  const C = R.ctf, win = C.over === "A", draw = C.over === "draw", sc = C.score;
  const picked = R.money || 0;
  await runDialog([{ who: "presenter", text: win ? "Et c’est terminé ! L’équipe de {name} remporte la Capture de Relique, " + sc.A + " à " + sc.B + " !" : draw ? "Temps écoulé ! Personne ne marque en prolongation : match nul, " + sc.A + " partout !" : "C’est fini ! " + C.nameB + " l’emporte " + sc.B + " à " + sc.A + "… Quelle bataille quand même !" }]);
  const prize = win ? 160 + hero().lv * 6 + sc.A * 30 : (draw ? 80 : 40) + sc.A * 30;
  const shards = win ? 2 : 0;
  endRun();
  G.money = (G.money || 0) + prize; G.shards = (G.shards || 0) + shards;
  G.story.ctf = G.story.ctf || { played: 0, wins: 0 };
  G.story.ctf.played++; if (win) G.story.ctf.wins++;
  Store.saveGame(G);
  DG.transition = false; DG.pending = null;
  const body = el("div", "result");
  body.append(el("p", "sheet-text", (win ? "Victoire " : draw ? "Match nul " : "Défaite ") + sc.A + " – " + sc.B + " contre " + C.nameB + "."));
  body.append(el("p", "sheet-text dim", "+" + prize + " pièces" + (shards ? " · +" + shards + " Éclats d’étoile" : "") + (picked ? " · " + picked + " pièces ramassées" : "") + " · " + G.story.ctf.wins + " victoire" + (G.story.ctf.wins > 1 ? "s" : "") + " en " + G.story.ctf.played + " match" + (G.story.ctf.played > 1 ? "s" : "")));
  openSheet({ title: win ? "Relique capturée !" : draw ? "Match nul" : "Match perdu", body, noDismiss: true, actions: [{ label: "Rejouer", fn: () => openCtfTeamPick() }, { label: "Retour au Royaume", cls: "primary", fn: goRoyaume }] });
}
async function ctfIntro() {
  DG.transition = true;
  await runDialog([
    { who: "presenter", text: "Capture de Relique ! L’équipe de {name} contre " + R.ctf.nameB + " !" },
    { who: "presenter", text: "Volez la relique adverse et ramenez-la dans votre base. La première équipe à 3 points gagne ! Les K.O. reviennent à chaque point marqué." }
  ]);
  DG.transition = false;
  if (!G.story.ctfHint) { G.story.ctfHint = true; toast("Maintiens ton héros → Ordres : Prendre la relique, Défendre, Nous suivre, Ne plus bouger.", 4200); }
}
