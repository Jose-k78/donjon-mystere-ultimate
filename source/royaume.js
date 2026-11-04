// ============================================================
//  LE ROYAUME : mini monde ouvert (marché, auberge, arène, palais,
//  ruelles), créatures vagabondes à recruter
// ============================================================
const TOWN_W = 46, TOWN_H = 37;
const TOWN_BUILDING_SKINS = [["palais", "Palais royal"], ["arene", "Arène"], ["auberge", "Auberge"], ["guildes", "Maison des Guildes"], ["maison", "Maison"]];
const RM = { grid: null, bld: [], npcs: [], hero: null, party: [], trail: [], held: null, path: null, goal: null, T: 40, w: 0, h: 0, dpr: 1, cv: null, ctx: null, paused: false, camX: 0, camY: 0, place: "", gs: { id: null }, keys: new Set(), lastStep: 0 };
const WALK = "gpdfGb";
function tI(x, y) { return y * TOWN_W + x; }
function tAt(x, y) { return x < 0 || y < 0 || x >= TOWN_W || y >= TOWN_H ? "x" : RM.grid[tI(x, y)]; }
function buildTown() {
  if (RM.grid) return;
  const g = new Array(TOWN_W * TOWN_H).fill("g");
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < TOWN_W && y < TOWN_H) g[tI(x, y)] = c; };
  const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); };
  // chemins
  rect(22, 9, 24, 36, "p");            // grande avenue (porte sud → palais)
  rect(15, 12, 31, 21, "p");           // place
  rect(3, 15, 15, 17, "p");            // route du marché
  rect(2, 10, 14, 22, "p");            // place du marché
  rect(31, 15, 34, 18, "p");           // route de l'arène
  rect(6, 23, 33, 23, "p");            // rue du sud
  rect(8, 23, 9, 25, "p"); rect(35, 23, 36, 26, "p"); rect(33, 23, 36, 23, "p");
  rect(19, 22, 19, 34, "p"); rect(28, 22, 28, 34, "p"); // ruelles
  rect(13, 29, 19, 29, "p"); rect(28, 33, 34, 33, "p");
  rect(21, 16, 25, 18, "w"); set(23, 17, "b");          // fontaine (b = statue, bloquée plus bas)
  // bâtiments
  RM.bld = [];
  const B = (key, x0, y0, x1, y1, door, kind, name) => { rect(x0, y0, x1, y1, "B"); if (door) set(door[0], door[1], "d"); RM.bld.push({ key, x0, y0, x1, y1, door, kind, name }); };
  B("palais", 14, 1, 32, 8, [23, 8], "palace", "Palais royal");
  B("arene", 35, 10, 44, 23, [35, 16], "arena", "Arène");
  B("auberge", 4, 25, 12, 31, [8, 25], "inn", "Auberge");
  B("guildes", 31, 26, 40, 31, [35, 26], "guild", "Maison des Guildes");
  B("maison", 14, 24, 17, 27, [16, 27], "house", "Maison");
  B("maison", 25, 25, 27, 28, null, "house", "Maison");
  B("maison", 29, 24, 32, 25, null, "house", "Maison");
  B("maison", 13, 31, 18, 34, [16, 31], "house", "Maison");
  B("maison", 25, 30, 27, 33, null, "house", "Maison");
  B("maison", 29, 28, 30, 31, null, "house", "Maison");
  // étals du marché
  RM.stalls = [];
  for (const [x, y, c] of [[4, 11, "#ff8a3d"], [8, 11, "#58b6ff"], [12, 11, "#7ce38a"], [4, 20, "#ffd23f"], [8, 20, "#ff7eb6"], [12, 20, "#c39cff"]]) { set(x, y, "s"); set(x + 1, y, "s"); RM.stalls.push({ x, y, c }); }
  // bannières des guildes devant le palais
  RM.banners = [];
  [15, 17, 19, 21, 25, 27, 29, 31].forEach((x, i) => { set(x, 9, "k"); RM.banners.push({ x, y: 9, guild: GUILDS[i] }); });
  // fleurs et arbres
  const rr = seeded(4242);
  for (let y = 1; y < TOWN_H - 1; y++) for (let x = 1; x < TOWN_W - 1; x++) {
    if (g[tI(x, y)] !== "g") continue;
    let nearPath = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const c = g[tI(x + dx, y + dy)]; if (c && c !== "g" && c !== "t") nearPath = true; }
    const r = rr();
    if (!nearPath && r < 0.34) set(x, y, "t");
    else if (r > 0.9) set(x, y, "f");
  }
  // murs d'enceinte et porte sud
  for (let x = 0; x < TOWN_W; x++) { set(x, 0, "x"); set(x, TOWN_H - 1, "x"); }
  for (let y = 0; y < TOWN_H; y++) { set(0, y, "x"); set(TOWN_W - 1, y, "x"); }
  rect(22, TOWN_H - 1, 24, TOWN_H - 1, "G");
  set(19, 12, "n"); // tableau des quêtes
  RM.board = { x: 19, y: 12 };
  RM.signs = [{ x: 15, y: 22, text: "↙ Auberge · ↓ Ruelles · ↘ Maison des Guildes" }, { x: 31, y: 14, text: "→ Arène du Royaume" }, { x: 14, y: 14, text: "← Marché : objets, orbes, capacités" }, { x: 25, y: 34, text: "↓ Sortie du Royaume" }];
  for (const sg of RM.signs) set(sg.x, sg.y, "i");
  RM.grid = g;
}
function townWalkable(x, y) { return WALK.includes(tAt(x, y)) && tAt(x, y) !== "b"; }
function npcAt(x, y) { return RM.npcs.find(n => !n.gone && ((n.x === x && n.y === y) || (n.nx === x && n.ny === y))); }
function townFree(x, y, self) {
  if (!townWalkable(x, y)) return false;
  const n = npcAt(x, y); if (n && n !== self) return false;
  if (self && self !== RM.hero && RM.hero.x === x && RM.hero.y === y) return false;
  return true;
}
function townPath(sx, sy, tx, ty, self, adj) {
  const W = TOWN_W, H = TOWN_H;
  const prev = new Int32Array(W * H).fill(-1), seen = new Uint8Array(W * H);
  const q = [tI(sx, sy)]; seen[q[0]] = 1;
  let goal = -1;
  for (let qi = 0; qi < q.length && qi < 3000; qi++) {
    const c = q[qi], cx = c % W, cy = (c / W) | 0;
    if ((adj && Math.max(Math.abs(cx - tx), Math.abs(cy - ty)) <= 1 && !(cx === tx && cy === ty)) || (!adj && cx === tx && cy === ty)) { goal = c; break; }
    for (const d of DIRS8) {
      const nx = cx + d[0], ny = cy + d[1];
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const n = tI(nx, ny); if (seen[n]) continue;
      if (d[0] && d[1] && (!townWalkable(cx + d[0], cy) || !townWalkable(cx, cy + d[1]))) continue;
      const okGoal = !adj && nx === tx && ny === ty && townWalkable(nx, ny);
      if (!okGoal && !townFree(nx, ny, self)) continue;
      seen[n] = 1; prev[n] = c; q.push(n);
    }
  }
  if (goal < 0) return null;
  const out = [];
  for (let c = goal; c !== tI(sx, sy) && c >= 0; c = prev[c]) out.unshift([c % W, (c / W) | 0]);
  return out;
}
// ---- personnages ----
function townMid(exclude) {
  const pool = DATA.monsters.filter(m => (m.rarity || 1) < 3).map(m => m.id).filter(id => !exclude.includes(id));
  return pool.length ? pick(pool) : DATA.monsters[0].id;
}
function ensureTownCast() {
  const st = G.story;
  const ex = G.team.map(u => u.mid).concat(G.thieves || []);
  if (!st.townMids || !MON[st.townMids.merchant] || !(st.townMids.folk || []).every(id => MON[id])) {
    const used = ex.slice(); const t = () => { const m = townMid(used); used.push(m); return m; };
    st.townMids = { merchant: t(), inn: t(), guards: [t(), t()], registrar: t(), folk: [t(), t(), t(), t(), t()] };
  }
  if (!Array.isArray(st.vag) || !st.vag.length) {
    const used = ex.concat(Object.values(st.townMids).flat());
    const idx = VAGABONDS.map((_, i) => i).sort(() => rnd() - 0.5).slice(0, 6);
    st.vag = idx.map(i => { const m = townMid(used); used.push(m); return { i, nick: VAGABONDS[i].nick, mid: m, lv: Math.max(1, hero().lv + ri(-1, 1)), recruited: false }; });
  }
  for (const v of st.vag) if (!MON[v.mid]) v.mid = townMid(ex);
}
function makeNpc(o) { return Object.assign({ x: 0, y: 0, nx: null, ny: null, px: 0, py: 0, t0: 0, dur: 0, dir: [0, 1], path: [], wait: 1500 + rnd() * 4000, zone: null, gone: false }, o); }
function spawnTownNpcs() {
  ensureTownCast();
  const M = G.story.townMids;
  RM.npcs = [];
  const put = (o, x, y) => { const n = makeNpc(o); n.x = n.px = x; n.y = n.py = y; RM.npcs.push(n); return n; };
  put({ kind: "vendor", shop: "objets", mid: castMid("vendor_objets"), name: VENDORS.objets.name, dir: [0, 1] }, 5, 10);
  put({ kind: "vendor", shop: "orbes", mid: castMid("vendor_orbes"), name: VENDORS.orbes.name, dir: [0, 1] }, 9, 10);
  put({ kind: "vendor", shop: "skills", mid: castMid("vendor_skills"), name: VENDORS.skills.name, dir: [0, 1] }, 13, 10);
  put({ kind: "inn", mid: castMid("innkeeper"), name: "Aubergiste" }, 10, 24);
  put({ kind: "questguard", mid: castMid("questguard"), name: "Garde royal", dir: [0, 1] }, 20, 13);
  put({ kind: "informant", mid: castMid("informant"), name: "Informatrice", dir: [1, 0] }, 16, 15);
  put({ kind: "soldier", mid: castMid("soldier"), name: "Soldat du Royaume", dir: [0, 1] }, 21, 34);
  put({ kind: "hood", mid: null, name: "Voyageur encapuchonné", li: 0 }, 19, 33);
  put({ kind: "guard", mid: M.guards[0], name: "Garde du palais" }, 21, 10);
  put({ kind: "guard", mid: M.guards[1], name: "Garde du palais" }, 25, 10);
  put({ kind: "registrar", mid: M.registrar, name: "Préposée de l’Arène", dir: [-1, 0] }, 34, 15);
  const zones = [{ x0: 15, y0: 12, x1: 31, y1: 21 }, { x0: 2, y0: 10, x1: 14, y1: 22 }, { x0: 6, y0: 22, x1: 34, y1: 34 }, { x0: 21, y0: 21, x1: 25, y1: 34 }];
  M.folk.forEach((mid, i) => { const z = zones[i % zones.length]; const p = randomTownSpot(z); put({ kind: "folk", mid, name: "Habitant", li: i % TOWNFOLK_LINES.length, zone: z }, p[0], p[1]); });
  G.story.vag.forEach((v, i) => { if (v.recruited) return; const z = zones[(i + 1) % zones.length]; const p = randomTownSpot(z); put({ kind: "vag", mid: v.mid, name: v.nick, vag: v, zone: z }, p[0], p[1]); });
  if (G.story.innFriend && MON[G.story.innFriend.mid]) put({ kind: "friend", mid: G.story.innFriend.mid, name: unitName(G.story.innFriend), unit: G.story.innFriend }, 11, 24);
}
function randomTownSpot(z) {
  for (let k = 0; k < 80; k++) { const x = ri(z.x0, z.x1), y = ri(z.y0, z.y1); if (townWalkable(x, y) && !npcAt(x, y) && tAt(x, y) !== "d") return [x, y]; }
  return [23, 20];
}
function townParty() { return G.team.slice(1).filter(Boolean); }
function goRoyaume() {
  if (!G) return;
  R = null; MAPSEL = null;
  closeWheel && WHEEL.open && closeWheel();
  buildTown();
  spawnTownNpcs();
  const p = G.story.rmPos && townWalkable(G.story.rmPos.x, G.story.rmPos.y) ? G.story.rmPos : { x: 23, y: 33 };
  RM.hero = { x: p.x, y: p.y, px: p.x, py: p.y, t0: 0, dur: 0, dir: [0, -1] };
  RM.trail = [];
  for (let i = 0; i < 4; i++) RM.trail.push([p.x, Math.min(TOWN_H - 2, p.y + 1 + i)]);
  RM.party = townParty().map((u, i) => ({ u, x: RM.trail[i][0], y: RM.trail[i][1], px: RM.trail[i][0], py: RM.trail[i][1], t0: 0, dur: 0, dir: [0, -1] }));
  RM.path = null; RM.goal = null; RM.held = null; RM.paused = false;
  showScreen("royaume");
  layoutTown();
  setMusic("bgm.royaume");
  refreshTownHud();
  Store.saveGame(G);
}
function refreshTownHud() {
  $("#rmMoney").textContent = String(G.money || 0);
  $("#rmObj").textContent = townObjective();
  $("#rmObj").hidden = !townObjective();
}
function townObjective() {
  const s = G.story.step;
  if (s === "ch2_recruit") return G.team.length >= 3 ? CH2.objRegister : CH2.objRecruit;
  if (s === "ch2_register") return CH2.objRegister;
  if (s === "ch2_tournoi") return CH2.objTournoi;
  return "";
}
function layoutTown() {
  const cv = $("#rmCanvas"); if (!cv) return;
  RM.cv = cv;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, cv.clientWidth), h = Math.max(1, cv.clientHeight);
  RM.T = clamp(Math.min(w / 10, h / 14), 32, 60); RM.dpr = dpr; RM.w = w; RM.h = h;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  RM.ctx = cv.getContext("2d");
}
// ---- déplacements ----
const TSTEP = 165;
function tweenPos(o, now) {
  if (!o.dur) return [o.x, o.y];
  const k = clamp((now - o.t0) / o.dur, 0, 1);
  if (k >= 1) { o.dur = 0; return [o.x, o.y]; }
  return [o.px + (o.x - o.px) * k, o.py + (o.y - o.py) * k];
}
function stepHero(d, now) {
  const H = RM.hero;
  H.dir = d;
  const nx = H.x + d[0], ny = H.y + d[1];
  if (d[0] && d[1] && (!townWalkable(H.x + d[0], H.y) || !townWalkable(H.x, H.y + d[1]))) return false;
  if (!townFree(nx, ny, RM.hero)) { const n = npcAt(nx, ny); if (n && !RM.path) return false; return false; }
  RM.trail.unshift([H.x, H.y]); RM.trail.length = Math.max(4, RM.party.length + 2);
  H.px = H.x; H.py = H.y; H.x = nx; H.y = ny; H.t0 = now; H.dur = TSTEP * (d[0] && d[1] ? 1.35 : 1);
  RM.party.forEach((m, i) => {
    const [tx, ty] = RM.trail[i];
    if (m.x !== tx || m.y !== ty) { m.dir = [sgn(tx - m.x), sgn(ty - m.y)]; m.px = m.x; m.py = m.y; m.x = tx; m.y = ty; m.t0 = now; m.dur = H.dur; }
  });
  onHeroTile();
  return true;
}
function onHeroTile() {
  const H = RM.hero; const c = tAt(H.x, H.y);
  if (c === "d") { const b = RM.bld.find(b => b.door && b.door[0] === H.x && b.door[1] === H.y); RM.path = null; if (b) { RM.blockUntil = performance.now() + 200; enterBuilding(b); } }
  if (c === "G") { RM.path = null; leaveTownGate(); }
}
function npcTick(n, now, dt) {
  if (n.gone || n.dur) return;
  if (!n.zone) return;
  if (RM.paused) return;
  n.wait -= dt; if (n.wait > 0) return;
  if (!n.path || !n.path.length) {
    const p = randomTownSpot(n.zone);
    if (Math.max(Math.abs(p[0] - n.x), Math.abs(p[1] - n.y)) > 6) { n.wait = 600; return; }
    n.path = townPath(n.x, n.y, p[0], p[1], n, false) || [];
    if (!n.path.length) { n.wait = 800 + rnd() * 1500; return; }
  }
  const [nx, ny] = n.path[0];
  if (!townFree(nx, ny, n) || RM.party.some(m => m.x === nx && m.y === ny) || (RM.hero.x === nx && RM.hero.y === ny)) { n.path = null; n.wait = 500 + rnd() * 600; return; }
  n.path.shift();
  n.dir = [sgn(nx - n.x), sgn(ny - n.y)];
  n.px = n.x; n.py = n.y; n.x = nx; n.y = ny; n.t0 = now; n.dur = 620;
  if (!n.path.length) n.wait = 2500 + rnd() * 5000;
}
function townTick(now, dt) {
  if (!RM.grid || !RM.hero) return;
  const H = RM.hero;
  const busy = SHEET_OPEN || DIALOG_OPEN || RM.paused || (RM.blockUntil && now < RM.blockUntil);
  tweenPos(H, now); for (const m of RM.party) tweenPos(m, now); for (const n of RM.npcs) tweenPos(n, now);
  for (const n of RM.npcs) npcTick(n, now, dt);
  if (!busy && !H.dur) {
    const d = RM.held || townKeyDir();
    if (d) { RM.path = null; RM.goal = null; stepHero(d, now); }
    else if (RM.path && RM.path.length) {
      const [nx, ny] = RM.path[0];
      const ok = stepHero([nx - H.x, ny - H.y], now);
      if (ok) RM.path.shift(); else { RM.path = RM.goal ? townPath(H.x, H.y, RM.goal.x, RM.goal.y, RM.hero, RM.goal.adj) : null; if (!RM.path) RM.goal = null; }
      if (RM.path && !RM.path.length) RM.path = null;
    } else if (RM.goal) {
      const g = RM.goal; RM.goal = null;
      if (g.npc) { if (Math.max(Math.abs(g.npc.x - H.x), Math.abs(g.npc.y - H.y)) <= 1) talkTo(g.npc); }
      else if (g.fn) g.fn();
    }
  }
  renderTown(now);
  // lieu courant
  const pl = townPlaceName(H.x, H.y);
  if (pl !== RM.place) { RM.place = pl; $("#rmPlace").textContent = pl; }
}
function townPlaceName(x, y) {
  if (y <= 11 && x >= 13 && x <= 33) return "Parvis du palais";
  if (x <= 15 && y >= 9 && y <= 22) return "Marché";
  if (x >= 31 && y >= 9 && y <= 24) return "Arène";
  if (x <= 13 && y >= 23) return "Auberge";
  if (x >= 30 && y >= 24) return "Maison des Guildes";
  if (y >= 22) return "Ruelles";
  return "Place du Royaume";
}
function townKeyDir() {
  if (!RM.keys.size) return null;
  let dx = 0, dy = 0;
  for (const k of RM.keys) { const d = KEYMAP[k]; if (d) { dx += d[0]; dy += d[1]; } }
  dx = sgn(dx); dy = sgn(dy);
  return dx || dy ? [dx, dy] : null;
}
// ---- rendu ----
function renderTown(now) {
  const ctx = RM.ctx; if (!ctx) return;
  const T = RM.T, dpr = RM.dpr, w = RM.w, h = RM.h;
  const [hx, hy] = tweenPos(RM.hero, now);
  let camX = (hx + 0.5) * T - w / 2, camY = (hy + 0.5) * T - h * 0.55;
  camX = clamp(camX, 0, Math.max(0, TOWN_W * T - w)); camY = clamp(camY, 0, Math.max(0, TOWN_H * T - h));
  RM.camX = camX; RM.camY = camY;
  ctx.setTransform(dpr, 0, 0, dpr, -camX * dpr, -camY * dpr);
  ctx.fillStyle = "#2f6b39"; ctx.fillRect(camX, camY, w, h);
  const x0 = Math.max(0, Math.floor(camX / T) - 1), y0 = Math.max(0, Math.floor(camY / T) - 1);
  const x1 = Math.min(TOWN_W - 1, x0 + Math.ceil(w / T) + 2), y1 = Math.min(TOWN_H - 1, y0 + Math.ceil(h / T) + 3);
  const imG = mediaImg("town.herbe"), imP = mediaImg("town.pave"), imW = mediaImg("town.eau");
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const c = tAt(x, y), px = x * T, py = y * T;
    if (c === "w" || c === "b") { if (imW) ctx.drawImage(imW, px, py, T, T); else paintTownWater(ctx, px, py, T, now, x, y); continue; }
    if ("pdGskni".includes(c) || c === "B") { if (imP) ctx.drawImage(imP, px, py, T, T); else paintTownPave(ctx, px, py, T, x, y); continue; }
    if (imG) ctx.drawImage(imG, px, py, T, T); else paintTownGrass(ctx, px, py, T, x, y, c === "f");
    if (c === "x") { ctx.fillStyle = "#6d6153"; ctx.fillRect(px, py, T, T); ctx.fillStyle = "#857865"; ctx.fillRect(px, py, T, T * 0.3); }
  }
  // objets triés par profondeur
  const list = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (tAt(x, y) === "t") list.push({ y: y + 0.9, f: () => drawTownTree(ctx, x, y, T, now) });
  for (const b of RM.bld) if (b.x1 >= x0 - 2 && b.x0 <= x1 + 2 && b.y1 >= y0 - 1 && b.y0 <= y1 + 4) list.push({ y: b.y1 + 0.99, f: () => drawBuilding(ctx, b, T, now) });
  for (const s of RM.stalls) list.push({ y: s.y + 0.8, f: () => drawStall(ctx, s, T) });
  for (const bn of RM.banners) list.push({ y: bn.y + 0.85, f: () => drawBanner(ctx, bn, T, now) });
  list.push({ y: 17.9, f: () => drawFountainStatue(ctx, T, now) });
  list.push({ y: RM.board.y + 0.9, f: () => drawQuestBoard(ctx, RM.board, T, now) });
  for (const sg of RM.signs) list.push({ y: sg.y + 0.8, f: () => drawSign(ctx, sg, T) });
  const ent = (o, mid, extra) => { const [x, y] = tweenPos(o, now); list.push({ y: y + 0.95, f: () => { const fx = (x + 0.5) * T, fy = (y + 0.92) * T; drawShadow(ctx, fx, fy, T * 0.95); drawCreature(ctx, mid, fx, fy, T * 0.95, { t: now + (hashStr(String(mid)) % 700), dir: o.dir, moving: !!o.dur }); if (extra) extra(fx, fy); } }); };
  for (const n of RM.npcs) {
    if (n.gone) continue;
    if (n.kind === "hood") { const [x, y] = tweenPos(n, now); list.push({ y: y + 0.95, f: () => { const fx = (x + 0.5) * T, fy = (y + 0.95) * T; drawShadow(ctx, fx, fy, T * 0.9); drawShadowFigure(ctx, fx, fy, T * 1.7, now); } }); continue; }
    ent(n, n.mid, (fx, fy) => drawNpcMark(ctx, n, fx, fy, T, now));
  }
  RM.party.forEach(m => ent(m, m.u.mid));
  ent(RM.hero, hero().mid, (fx, fy) => { ctx.strokeStyle = "rgba(255,179,71,0.9)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(fx, fy - T * 0.04, T * 0.32, T * 0.11, 0, 0, 7); ctx.stroke(); });
  list.sort((a, b) => a.y - b.y);
  for (const o of list) o.f();
  // destination
  if (RM.goalMark && now - RM.goalMark.t < 700) { const k = (now - RM.goalMark.t) / 700; ctx.strokeStyle = "rgba(255,255,255," + (1 - k) + ")"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse((RM.goalMark.x + 0.5) * T, (RM.goalMark.y + 0.6) * T, T * (0.2 + k * 0.25), T * (0.1 + k * 0.12), 0, 0, 7); ctx.stroke(); }
}
function paintTownGrass(ctx, px, py, T, x, y, flowers) {
  const v = ((x * 7349) ^ (y * 9157)) & 3;
  ctx.fillStyle = v % 2 ? "#5d9a4c" : "#5a9549"; ctx.fillRect(px, py, T, T);
  ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(px + T * (0.2 + v * 0.15), py + T * 0.3, T * 0.05, T * 0.14); ctx.fillRect(px + T * 0.7, py + T * (0.55 - v * 0.08), T * 0.05, T * 0.12);
  if (flowers) { const cols = ["#fff3a0", "#ff9ec7", "#ffffff", "#a8d8ff"]; for (let i = 0; i < 3; i++) { ctx.fillStyle = cols[(v + i) % 4]; ctx.beginPath(); ctx.arc(px + T * (0.25 + i * 0.25), py + T * (0.35 + ((i + v) % 2) * 0.3), T * 0.06, 0, 7); ctx.fill(); } }
}
function paintTownPave(ctx, px, py, T, x, y) {
  ctx.fillStyle = (x + y) % 2 ? "#cbb994" : "#c4b18b"; ctx.fillRect(px, py, T, T);
  ctx.strokeStyle = "rgba(90,70,40,0.25)"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, T / 2, T / 2); ctx.strokeRect(px + T / 2 + 0.5, py + T / 2 + 0.5, T / 2 - 1, T / 2 - 1);
}
function paintTownWater(ctx, px, py, T, now, x, y) {
  ctx.fillStyle = "#4aa3d8"; ctx.fillRect(px, py, T, T);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  const k = (now / 900 + x * 0.3 + y * 0.5) % 1;
  ctx.fillRect(px + T * 0.15, py + T * (0.2 + k * 0.6), T * 0.3, 2); ctx.fillRect(px + T * 0.55, py + T * (0.7 - k * 0.5), T * 0.25, 2);
}
function drawTownTree(ctx, x, y, T, now) {
  const im = mediaImg("town.arbre"); const cx = (x + 0.5) * T, by = (y + 1) * T;
  if (im) { drawContain(ctx, im, cx, by - T * 0.7, T * 1.5); return; }
  ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.beginPath(); ctx.ellipse(cx, by - T * 0.1, T * 0.42, T * 0.13, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#6b4a2a"; ctx.fillRect(cx - T * 0.08, by - T * 0.5, T * 0.16, T * 0.42);
  const sw = Math.sin(now / 1400 + x) * T * 0.02;
  ctx.fillStyle = "#2f7a3a"; ctx.beginPath(); ctx.arc(cx + sw, by - T * 0.85, T * 0.48, 0, 7); ctx.fill();
  ctx.fillStyle = "#3f9a49"; ctx.beginPath(); ctx.arc(cx - T * 0.12 + sw, by - T * 0.98, T * 0.3, 0, 7); ctx.fill();
}
function drawStall(ctx, s, T) {
  const im = mediaImg("town.etal"); const x = s.x * T, y = s.y * T;
  if (im) { drawContain(ctx, im, x + T, y + T * 0.3, T * 2.1); return; }
  ctx.fillStyle = "#7a5230"; ctx.fillRect(x + T * 0.08, y + T * 0.35, T * 1.84, T * 0.6);
  ctx.fillStyle = "#a5764a"; ctx.fillRect(x + T * 0.08, y + T * 0.35, T * 1.84, T * 0.12);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = ["#ff5f86", "#ffcf3d", "#7ce38a", "#58b6ff", "#ff8a3d"][i]; ctx.beginPath(); ctx.arc(x + T * (0.3 + i * 0.35), y + T * 0.3, T * 0.1, 0, 7); ctx.fill(); }
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#ffffff" : s.c; ctx.beginPath(); ctx.moveTo(x + i * T / 3, y - T * 0.45); ctx.lineTo(x + (i + 1) * T / 3, y - T * 0.45); ctx.lineTo(x + (i + 1) * T / 3, y - T * 0.12); ctx.quadraticCurveTo(x + (i + 0.5) * T / 3, y - T * 0.02, x + i * T / 3, y - T * 0.12); ctx.fill(); }
  ctx.fillStyle = "#5a3a20"; ctx.fillRect(x + T * 0.04, y - T * 0.45, T * 0.06, T * 1.3); ctx.fillRect(x + T * 1.9, y - T * 0.45, T * 0.06, T * 1.3);
}
function drawBanner(ctx, bn, T, now) {
  const x = (bn.x + 0.5) * T, y = (bn.y + 1) * T, g = bn.guild;
  ctx.fillStyle = "#4a3a2a"; ctx.fillRect(x - T * 0.04, y - T * 1.6, T * 0.08, T * 1.6);
  const wv = Math.sin(now / 500 + bn.x) * T * 0.04;
  ctx.fillStyle = g.col; ctx.beginPath(); ctx.moveTo(x + T * 0.04, y - T * 1.55); ctx.lineTo(x + T * 0.5 + wv, y - T * 1.5); ctx.lineTo(x + T * 0.46 + wv, y - T * 0.95); ctx.lineTo(x + T * 0.27 + wv, y - T * 1.05); ctx.lineTo(x + T * 0.04, y - T * 0.95); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.font = `700 ${Math.round(T * 0.26)}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(g.icon, x + T * 0.26 + wv * 0.5, y - T * 1.27); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
}
function drawFountainStatue(ctx, T, now) {
  const cx = 23.5 * T, by = 18 * T;
  ctx.fillStyle = "#d9d2c3"; ctx.fillRect(cx - T * 0.3, by - T * 0.9, T * 0.6, T * 0.75);
  ctx.fillStyle = "#e8e2d4"; ctx.beginPath(); ctx.arc(cx, by - T * 1.15, T * 0.3, 0, 7); ctx.fill();
  ctx.fillStyle = "#ffd94a"; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? T * 0.08 : T * 0.18; ctx.lineTo(cx + Math.cos(a) * r, by - T * 1.6 + Math.sin(a) * r); } ctx.fill();
  const k = (now / 600) % 1; ctx.fillStyle = "rgba(200,235,255,0.7)";
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.6; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * T * (0.4 + k * 0.5), by - T * 0.9 + k * k * T * 0.6, T * 0.05, 0, 7); ctx.fill(); }
}
function drawBuilding(ctx, b, T, now) {
  const X = b.x0 * T, Y = b.y0 * T, W = (b.x1 - b.x0 + 1) * T, H = (b.y1 - b.y0 + 1) * T;
  const im = mediaImg("town." + b.key);
  if (im) { const sc = Math.min(W / im.width, (H + T) / im.height); const iw = im.width * sc, ih = im.height * sc; ctx.drawImage(im, X + (W - iw) / 2, Y + H - ih, iw, ih); }
  else if (b.kind === "arena") {
    const cx = X + W / 2, cy = Y + H * 0.55;
    ctx.fillStyle = "#b99b6a"; ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.5, H * 0.46, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#9c7f52"; ctx.beginPath(); ctx.ellipse(cx, cy + H * 0.04, W * 0.5, H * 0.42, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = "#e8d3a6"; ctx.beginPath(); ctx.ellipse(cx, cy - H * 0.04, W * 0.36, H * 0.3, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#d8bf8a"; for (let i = 0; i < 9; i++) { const a = Math.PI * 0.1 + i * Math.PI * 0.1; ctx.fillRect(cx + Math.cos(a) * W * 0.44 - T * 0.15, cy + Math.sin(a) * H * 0.38, T * 0.3, T * 0.45); }
    ctx.fillStyle = "#5a4330"; ctx.beginPath(); ctx.arc(X + T * 0.5, (b.door[1] + 0.5) * T, T * 0.45, Math.PI * 0.5, Math.PI * 1.5); ctx.fill(); ctx.fillRect(X, (b.door[1]) * T + T * 0.05, T * 0.5, T * 0.9);
    for (let i = 0; i < 4; i++) { const fx = X + W * (0.2 + i * 0.2); ctx.fillStyle = "#4a3a2a"; ctx.fillRect(fx, Y - T * 0.2, 3, T * 0.9); ctx.fillStyle = GUILDS[i * 2].col; ctx.fillRect(fx + 3, Y - T * 0.2, T * 0.4, T * 0.28); }
  } else {
    const roofH = H * (b.kind === "palace" ? 0.5 : 0.55);
    const wallCol = { palace: "#efe6d2", inn: "#c99a62", guild: "#bfb4a3", house: "#e2cfae" }[b.kind] || "#ddd";
    const roofCol = { palace: "#3e64b8", inn: "#a2462f", guild: "#5a6b78", house: ["#c05a3c", "#557a4a", "#4c6aa0", "#9a5fa8", "#c08a2c", "#7a5a40"][(b.x0 + b.y0) % 6] }[b.kind];
    ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(X + T * 0.15, Y + H - T * 0.1, W, T * 0.25);
    ctx.fillStyle = wallCol; ctx.fillRect(X, Y + roofH * 0.8, W, H - roofH * 0.8);
    ctx.fillStyle = "rgba(0,0,0,0.08)"; ctx.fillRect(X, Y + H - T * 0.25, W, T * 0.25);
    ctx.fillStyle = roofCol; ctx.beginPath(); ctx.moveTo(X - T * 0.2, Y + roofH); ctx.lineTo(X + W * 0.12, Y); ctx.lineTo(X + W * 0.88, Y); ctx.lineTo(X + W + T * 0.2, Y + roofH); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 1; for (let i = 1; i < 5; i++) { const yy = Y + roofH * i / 5; ctx.beginPath(); ctx.moveTo(X + W * 0.12 * (1 - i / 5) - T * 0.2 * i / 5, yy); ctx.lineTo(X + W - W * 0.12 * (1 - i / 5) + T * 0.2 * i / 5, yy); ctx.stroke(); }
    const nWin = Math.max(1, Math.floor(W / T / 2));
    for (let i = 0; i < nWin; i++) { const wx = X + (i + 0.5) * W / nWin - T * 0.22; const wy = Y + roofH + (H - roofH) * 0.18; ctx.fillStyle = "#3b5a78"; ctx.fillRect(wx, wy, T * 0.44, T * 0.4); ctx.fillStyle = "rgba(255,240,170,0.5)"; ctx.fillRect(wx + 2, wy + 2, T * 0.44 - 4, T * 0.15); }
    if (b.kind === "palace") {
      for (const tx of [X - T * 0.3, X + W - T * 1.1]) { ctx.fillStyle = "#e6dcc6"; ctx.fillRect(tx, Y - T * 1.2, T * 1.4, H + T * 1.2); ctx.fillStyle = "#3e64b8"; ctx.beginPath(); ctx.moveTo(tx - T * 0.15, Y - T * 1.2); ctx.lineTo(tx + T * 0.7, Y - T * 2.6); ctx.lineTo(tx + T * 1.55, Y - T * 1.2); ctx.fill(); ctx.fillStyle = "#ffd94a"; ctx.fillRect(tx + T * 0.66, Y - T * 3.1, 3, T * 0.55); }
      ctx.fillStyle = "#ffd94a"; ctx.fillRect(X, Y + roofH * 0.8, W, T * 0.12);
    }
    if (b.door) {
      const dx = b.door[0] * T, dy = b.door[1] * T;
      ctx.fillStyle = b.kind === "palace" ? "#7a5520" : "#5a3a20"; ctx.fillRect(dx + T * 0.18, dy + T * 0.05, T * 0.64, T * 0.95);
      ctx.fillStyle = "#ffd94a"; ctx.beginPath(); ctx.arc(dx + T * 0.7, dy + T * 0.55, T * 0.05, 0, 7); ctx.fill();
    }
    if (b.kind === "inn" || b.kind === "guild") {
      const sx = (b.door[0] + 1) * T, sy = Y + roofH + T * 0.1;
      ctx.fillStyle = "#6b4a2a"; ctx.fillRect(sx, sy, T * 1.9, T * 0.5); ctx.fillStyle = "#fff3d6"; ctx.font = `700 ${Math.round(T * 0.24)}px sans-serif`; ctx.textBaseline = "middle";
      ctx.fillText(b.kind === "inn" ? "Auberge" : "Guildes", sx + T * 0.12, sy + T * 0.26); ctx.textBaseline = "alphabetic";
    }
  }
}
function drawNpcMark(ctx, n, fx, fy, T, now) {
  let mark = null;
  if (n.kind === "vag" && townCanRecruit()) mark = "!";
  if (n.kind === "registrar" && ["ch2_register", "ch2_tournoi"].includes(G.story.step)) mark = "!";
  if (n.kind === "registrar" && G.story.step === "ch2_recruit" && G.team.length >= 3) mark = "!";
  if (n.kind === "friend") mark = "♥";
  if (n.kind === "questguard" && G.story.ch2Done && questsToday().some(q => q.state === "offered" || q.state === "done")) mark = "!";
  if (n.kind === "vendor") mark = n.shop === "objets" ? "¤" : n.shop === "orbes" ? "◎" : "★";
  if (!mark) return;
  const by = fy - T * 1.05 + Math.sin(now / 250) * T * 0.05;
  ctx.fillStyle = mark === "♥" ? "#ff7eb6" : "#ffd166"; ctx.beginPath(); ctx.arc(fx, by, T * 0.17, 0, 7); ctx.fill();
  ctx.fillStyle = "#2a1d05"; ctx.font = `800 ${Math.round(T * 0.24)}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(mark, fx, by + 1); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
}
// image par défaut affichée dans Graphics
function drawTownSlotDefault(ctx, key, w, h) {
  const k = key.slice(5);
  if (k === "herbe") { const T = Math.min(w, h); paintTownGrass(ctx, 0, 0, T, 1, 2, true); return; }
  if (k === "pave") { paintTownPave(ctx, 0, 0, Math.min(w, h), 2, 2); return; }
  if (k === "eau") { paintTownWater(ctx, 0, 0, Math.min(w, h), 300, 1, 1); return; }
  if (k === "arbre") { const T = Math.min(w, h) * 0.68; ctx.save(); ctx.translate((w - T) / 2, (h - T * 1.4) / 2 + T * 0.36); drawTownTree(ctx, 0, 0, T, 0); ctx.restore(); return; }
  if (k === "etal") { ctx.save(); ctx.translate(w * 0.05, h * 0.45); drawStall(ctx, { x: 0, y: 0, c: "#ff8a3d" }, w * 0.45); ctx.restore(); return; }
  const kind = { palais: "palace", arene: "arena", auberge: "inn", guildes: "guild", maison: "house" }[k];
  const fake = { key: "__", kind, x0: 0, y0: 0, x1: 5, y1: 3, door: [kind === "arena" ? 0 : 2, kind === "arena" ? 2 : 3] };
  const T = Math.min(w / 7.5, h / 6);
  ctx.save(); ctx.translate((w - 6 * T) / 2, h - 4.2 * T); drawBuilding(ctx, fake, T, 0); ctx.restore();
}
// ---- interactions ----
function townCanRecruit() {
  const s = G.story.step;
  return G.team.length < 3 && (s === "ch2_recruit" || s === "ch2_register" || s === "ch2_tournoi" || G.story.ch2Done);
}
async function townTalk(lines, ctx) { RM.paused = true; RM.held = null; try { await runDialog(lines, ctx || {}); } finally { RM.paused = false; } }
async function talkTo(n) {
  const H = RM.hero;
  H.dir = [sgn(n.x - H.x), sgn(n.y - H.y)];
  n.dir = [-H.dir[0], -H.dir[1]]; n.path = null; n.wait = 2500;
  sfx("tap");
  const c = { npcMid: n.mid, npcName: n.name };
  if (n.kind === "vendor") { await townTalk([{ who: "npc", text: VENDORS[n.shop].hello }], c); openShop("buy", n.shop); }
  else if (n.kind === "questguard") {
    if (!G.story.ch2Done) { await townTalk([{ who: "npc", text: "Pendant le tournoi, pas de quêtes. Revenez quand vous serez qualifiés !" }], c); return; }
    await townTalk([{ who: "npc", text: pick(["Explorateur ! Le Royaume a besoin de toi. Voilà les quêtes du jour.", "Les quêtes changent chaque matin. Fais vite, elles partent comme des petits pains !", "Une créature s’est encore perdue… Ces donjons sont de vrais labyrinthes."]) }], c);
    openQuestBoard(true);
  }
  else if (n.kind === "informant") { await townTalk(INFORMANT_LINES.map(t => ({ who: "npc", text: t })).slice(0, 1 + (rnd() < 0.5 ? 1 : 0)), c); openBestiary(); }
  else if (n.kind === "soldier") {
    if (!G.story.ch2Done) { await townTalk([{ who: "npc", text: "Ce passage est réservé aux explorateurs qualifiés. Reviens après le tournoi !" }], c); return; }
    await townTalk(SOLDIER_LINES.map(t => ({ who: "npc", text: t })), c);
    const ch = await runChoice(["Partir dans le donjon inconnu", "Pas maintenant"]);
    if (ch === 0) { const loc = genUnknown(); await townTalk([{ who: "npc", text: "Ce matin, on l’appelle « " + loc.name + " ». " + loc.floors + " étages, d’après les éclaireurs. Bonne chance !" }], c); G.story.rmPos = { x: RM.hero.x, y: RM.hero.y }; enterDungeon("INCONNU"); }
  }
  else if (n.kind === "hood") { const L = TRAVELER_LINES[n.li % TRAVELER_LINES.length]; n.li++; await townTalk(L.map(t => ({ who: "traveler", text: t }))); }
  else if (n.kind === "inn") { await townTalk([{ who: "npc", text: "Bienvenue à l’auberge ! Un bon lit, une soupe chaude… et on garde vos amis au chaud." }], c); openInn(); }
  else if (n.kind === "guard") await townTalk([{ who: "npc", text: pick(["Le Roi assiste au tournoi depuis le balcon du palais.", "Les capitaines de guilde ont leurs quartiers au palais pendant le tournoi.", "Circulez ! …Enfin, regardez les bannières si vous voulez. Chaque guilde a la sienne."]) }], c);
  else if (n.kind === "registrar") await arenaDesk(c);
  else if (n.kind === "folk") { const pool = TOWNFOLK_LINES.concat(FOLK_EXTRA); await townTalk(pool[n.li % pool.length].map(t => ({ who: "npc", text: t })), c); n.li = (n.li + 1 + ri(0, 2)) % pool.length; }
  else if (n.kind === "vag") await talkVagabond(n, c);
  else if (n.kind === "friend") await talkFriend(n, c);
}
async function talkVagabond(n, c) {
  const V = VAGABONDS[n.vag.i] || VAGABONDS[0];
  n.vag.talks = (n.vag.talks || 0) + 1;
  await townTalk((n.vag.talks > 1 && V.more ? V.more : V.lines).map(t => ({ who: "npc", text: t })), c);
  if (!townCanRecruit()) {
    if (G.team.length >= 3 && G.story.ch2Done) {
      const ch = await runChoice(["Remplacer " + unitName(G.team[2]) + " par " + n.name, "Plus tard"], "Ton équipe est complète.");
      if (ch === 0) { await doRecruit(n, V, true); }
    }
    return;
  }
  const ch = await runChoice(["Recruter " + n.name, "Plus tard"], n.name + " · " + monById(n.mid).name + " · Niv. " + n.vag.lv);
  if (ch === 0) await doRecruit(n, V, false);
}
async function doRecruit(n, V, replace) {
  if (replace && G.team[2]) { G.reserve.push(G.team[2]); G.team.length = 2; }
  const u = makeUnit(n.mid, Math.max(n.vag.lv, hero().lv - 1), "ally");
  u.nick = n.name; u.vagIdx = n.vag.i;
  G.team.push(u);
  n.vag.recruited = true; n.gone = true;
  RM.npcs = RM.npcs.filter(x => x !== n);
  await townTalk([{ who: "npc", text: V.join }], { npcMid: n.mid, npcName: n.name });
  sfx("level");
  toast(n.name + " rejoint l’équipe !", 2600);
  RM.party = townParty().map((uu, i) => { const old = RM.party.find(m => m.u === uu); if (old) return old; const t = RM.trail[Math.min(i, RM.trail.length - 1)]; return { u: uu, x: t[0], y: t[1], px: t[0], py: t[1], t0: 0, dur: 0, dir: [0, -1] }; });
  if (G.story.step === "ch2_recruit") { await townTalk(CH2.recruited); G.story.step = "ch2_register"; }
  refreshTownHud();
  Store.saveGame(G);
}
async function talkFriend(n, c) {
  await townTalk([{ who: "npc", text: "Oh, c’est vous ! Vous avez besoin d’un coup de patte ?" }], c);
  const ch = await runChoice(G.team.length < 3 ? ["Rejoins-nous !", "On passait juste te voir"] : ["On passait juste te voir"]);
  if (ch === 0 && G.team.length < 3) {
    const u = G.story.innFriend; u.kind = "ally"; G.team.push(u); G.story.innFriend = null;
    RM.npcs = RM.npcs.filter(x => x !== n);
    RM.party = townParty().map((uu, i) => { const t = RM.trail[Math.min(i, RM.trail.length - 1)]; return { u: uu, x: t[0], y: t[1], px: t[0], py: t[1], t0: 0, dur: 0, dir: [0, -1] }; });
    toast(unitName(u) + " rejoint l’équipe !"); Store.saveGame(G);
  }
}
async function arenaDesk(c) {
  const s = G.story.step;
  if (s === "ch2_recruit" && G.team.length >= 3) G.story.step = "ch2_register";
  if (G.story.step === "ch2_recruit") { await townTalk(CH2.needThree); return; }
  if (G.story.step === "ch2_register") { await playRegistration(); return; }
  if (G.story.step === "ch2_tournoi") {
    if (G.team.length < 3) { await townTalk(CH2.needThree); return; }
    await townTalk([{ who: "registrar", text: "L’équipe de {name} ! Le donjon du tournoi vous attend. Vous êtes prêts ?" }]);
    const ch = await runChoice(["Entrer dans le donjon", "Pas encore"]);
    if (ch === 0) { G.story.rmPos = { x: RM.hero.x, y: RM.hero.y }; enterDungeon("TOURNOI"); }
    return;
  }
  if (G.story.ch2Done) {
    await townTalk([{ who: "registrar", text: "Bienvenue à l’Arène ! Un match pour la gloire… et quelques pièces ?" }]);
    const opts = ["Match d’arène : 1 équipe", "Match d’arène : 2 équipes", "Match d’arène : 3 équipes", G.team.length >= 3 ? "Rejouer le tournoi (7 étages)" : "Tournoi : il faut 3 membres", "Plus tard"];
    const ch = await runChoice(opts, "Plus il y a d’équipes, plus la récompense est grosse. Les équipes se battent aussi entre elles !");
    if (ch <= 2) { G.story.arenaN = ch + 1; G.story.rmPos = { x: RM.hero.x, y: RM.hero.y }; enterDungeon("ARENE"); }
    else if (ch === 3 && G.team.length >= 3) { G.story.rmPos = { x: RM.hero.x, y: RM.hero.y }; enterDungeon("TOURNOI"); }
    return;
  }
  await townTalk([{ who: "registrar", text: "Revenez quand le tournoi ouvrira ses portes !" }]);
}
function enterBuilding(b) {
  if (b.kind === "arena") { const n = RM.npcs.find(x => x.kind === "registrar"); if (n) talkTo(n); else arenaDesk({}); }
  else if (b.kind === "inn") openInn();
  else if (b.kind === "guild") openGuildHall();
  else if (b.kind === "palace") townTalk([{ who: "guard", text: "Halte ! Le palais est fermé pendant le tournoi. Le Roi regarde les combats depuis le balcon." }]);
  else toast(pick(["La porte est fermée.", "Personne ne répond.", "On entend quelqu’un ronfler à l’intérieur…"]), 1800);
  // recule d'un pas pour ne pas rester sur la porte
  setTimeout(() => { if (SCREEN === "royaume" && tAt(RM.hero.x, RM.hero.y) === "d") { const H = RM.hero; for (const d of [[0, 1], [0, -1], [1, 0], [-1, 0]]) if (townFree(H.x + d[0], H.y + d[1], RM.hero) && tAt(H.x + d[0], H.y + d[1]) !== "d") { H.px = H.x; H.py = H.y; H.x += d[0]; H.y += d[1]; H.t0 = performance.now(); H.dur = TSTEP; break; } } }, 60);
}
async function leaveTownGate() {
  if (G.story.ch2Done) {
    openSheet({ title: "Porte du Royaume", body: el("p", "sheet-text", "Où veux-tu aller ?"), actions: [
      { label: "Carte du monde", cls: "primary", fn: () => { G.story.rmPos = { x: 23, y: 33 }; goMap(); } },
      { label: "Menu d’accueil", fn: () => { G.story.rmPos = { x: 23, y: 33 }; goHub(); } },
      { label: "Rester en ville", cls: "ghost", fn: townStepBack }
    ] });
  } else {
    await townTalk([{ who: "partner", text: "Hé, on ne part pas maintenant ! Le tournoi nous attend !" }]);
    townStepBack();
  }
}
function townStepBack() { const H = RM.hero; if (tAt(H.x, H.y) === "G") { H.px = H.x; H.py = H.y; H.y -= 1; H.t0 = performance.now(); H.dur = TSTEP; } }
// ---- auberge ----
function openInn() {
  const body = el("div", "result");
  const cv = el("canvas", "shop-face"); const hd = el("div", "shop-head"); hd.append(cv, el("p", "sheet-text", "Bienvenue à l’auberge ! Ta chambre est prête, et tes amis t’attendent au dortoir."));
  requestAnimationFrame(() => paintPortrait(cv, castMid("innkeeper"), { still: true }));
  body.append(hd);
  const acts = [
    { label: "Aller dans ma chambre", cls: "primary", fn: () => { G.story.rmPos = { x: 8, y: 24 }; Store.saveGame(G); playRoom("room"); } },
    { label: "Dortoir (équipe)", fn: () => openDorm() },
    { label: "Fermer", cls: "ghost" }
  ];
  if (!G.story.ch2Done) acts.splice(0, 1, { label: "Se reposer", cls: "primary", fn: () => { for (const u of G.team) { u.hp = maxHP(u); u.ko = false; u.st = {}; refillPP(u); } Store.saveGame(G); sfx("heal"); toast("L’équipe est en pleine forme. Partie sauvegardée.", 2400); } });
  openSheet({ title: "Auberge", body, actions: acts });
}
// ---- guildes ----
function guildBoardBody() {
  const body = el("div", "guilds");
  for (const g of GUILDS) {
    const c = el("div", "guild"); c.style.setProperty("--gc", g.col);
    c.append(el("span", "g-ic", g.icon));
    const tx = el("span", "g-tx"); tx.append(el("b", null, g.name), el("small", null, g.tag)); c.append(tx);
    body.append(c);
  }
  return body;
}
function openGuildHall() {
  const body = guildBoardBody();
  body.prepend(el("p", "sheet-note", "Les huit grandes guildes de The World. Chacune a sa bannière devant le palais."));
  openSheet({ title: "Maison des Guildes", body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}
function openTownMenu() {
  const body = el("div", "pause-grid");
  const add = (label, fn, cls) => { const b = el("button", "btn small " + (cls || ""), label); b.type = "button"; b.onclick = () => { sfx("tap"); closeSheet(); fn(); }; body.append(b); };
  add("Équipe", openTeam);
  add("Sac", () => openBag(false));
  add("Les guildes", openGuildHall);
  if (G.story.ch2Done) { add("Carte du monde", () => { G.story.rmPos = { x: RM.hero.x, y: RM.hero.y }; goMap(); }); add("Menu d’accueil", () => { G.story.rmPos = { x: RM.hero.x, y: RM.hero.y }; goHub(); }); }
  add("Paramètres", openSettings);
  add("Sauvegarder", () => { G.story.rmPos = { x: RM.hero.x, y: RM.hero.y }; Store.saveGame(G); toast("Partie sauvegardée."); });
  add("Écran titre", () => { G.story.rmPos = { x: RM.hero.x, y: RM.hero.y }; Store.saveGame(G); goTitle(); }, "ghost");
  openSheet({ title: "Royaume", body, actions: [{ label: "Fermer", cls: "ghost" }] });
}
// ---- contrôles ----
function townScreenTile(cx, cy) {
  const r = RM.cv.getBoundingClientRect();
  return [Math.floor((cx - r.left + RM.camX) / RM.T), Math.floor((cy - r.top + RM.camY) / RM.T)];
}
function townNpcNear(cx, cy) {
  const r = RM.cv.getBoundingClientRect(); const now = performance.now();
  let best = null, bd = 0.8;
  for (const n of RM.npcs) { if (n.gone) continue; const [x, y] = tweenPos(n, now); const px = (x + 0.5) * RM.T - RM.camX + r.left, py = (y + 0.45) * RM.T - RM.camY + r.top; const d = Math.hypot(px - cx, py - cy) / RM.T; if (d < bd) { bd = d; best = n; } }
  return best;
}
function townTap(cx, cy) {
  if (SHEET_OPEN || DIALOG_OPEN || RM.paused) return;
  const H = RM.hero;
  const n = townNpcNear(cx, cy);
  if (n) {
    if (Math.max(Math.abs(n.x - H.x), Math.abs(n.y - H.y)) <= 1) { talkTo(n); return; }
    RM.goal = { npc: n, x: n.x, y: n.y, adj: true };
    RM.path = townPath(H.x, H.y, n.x, n.y, RM.hero, true);
    if (!RM.path) RM.goal = null;
    return;
  }
  const [tx, ty] = townScreenTile(cx, cy);
  const c = tAt(tx, ty);
  const bn = RM.banners.find(b => b.x === tx && (b.y === ty || b.y - 1 === ty));
  if (bn) { toast(bn.guild.name + " — " + bn.guild.tag, 2600); return; }
  if (tx === RM.board.x && ty === RM.board.y) { const fn = () => openQuestBoard(false); if (Math.max(Math.abs(tx - H.x), Math.abs(ty - H.y)) <= 1) fn(); else { RM.goal = { fn, x: tx, y: ty, adj: true }; RM.path = townPath(H.x, H.y, tx, ty, RM.hero, true); } return; }
  const sg = RM.signs.find(s => s.x === tx && s.y === ty);
  if (sg) { toast(sg.text, 2400); return; }
  if (c === "w" || c === "b") { const fn = makeWish; const near = [[23, 15], [23, 19], [20, 17], [26, 17]].sort((a, b) => Math.hypot(a[0] - H.x, a[1] - H.y) - Math.hypot(b[0] - H.x, b[1] - H.y))[0]; if (Math.abs(H.x - 23) <= 3 && Math.abs(H.y - 17) <= 2) fn(); else { RM.goal = { fn, x: near[0], y: near[1], adj: false }; RM.path = townPath(H.x, H.y, near[0], near[1], RM.hero, false); } return; }
  const st = RM.stalls.find(s => s.y === ty && (s.x === tx || s.x + 1 === tx));
  if (st) { const si = RM.stalls.indexOf(st); const fn = () => openShop("buy", ["objets", "orbes", "skills"][si % 3]); if (Math.max(Math.abs(tx - H.x), Math.abs(ty - H.y)) <= 1) fn(); else { RM.goal = { fn, x: tx, y: ty, adj: true }; RM.path = townPath(H.x, H.y, tx, ty, RM.hero, true); } return; }
  if (c === "B") { const b = RM.bld.find(b => tx >= b.x0 && tx <= b.x1 && ty >= b.y0 && ty <= b.y1); if (b && b.door) { RM.path = townPath(H.x, H.y, b.door[0], b.door[1], RM.hero, false); RM.goalMark = { x: b.door[0], y: b.door[1], t: performance.now() }; } return; }
  if (!townWalkable(tx, ty)) return;
  RM.goal = null;
  RM.path = townPath(H.x, H.y, tx, ty, RM.hero, false);
  RM.goalMark = { x: tx, y: ty, t: performance.now() };
}
function townLongPress(cx, cy) {
  if (SHEET_OPEN || DIALOG_OPEN || RM.paused) return;
  const n = townNpcNear(cx, cy);
  if (n) { openNpcCard(n); return; }
  const [tx, ty] = townScreenTile(cx, cy);
  if (tx === RM.hero.x && ty === RM.hero.y) { openTownMenu(); return; }
  const b = RM.bld.find(b => tx >= b.x0 && tx <= b.x1 && ty >= b.y0 && ty <= b.y1);
  if (b) toast(b.name, 1500);
}
function openNpcCard(n) {
  const m = monById(n.mid);
  const body = el("div", "ucard");
  const top = el("div", "ucard-top"); const cv = el("canvas", "ucard-face"); top.append(cv);
  const info = el("div", "ucard-info");
  info.append(el("h4", null, n.name + " · " + m.name));
  const ty = el("div", "types"); for (const t of m.types || []) ty.append(typeChip(t)); info.append(ty);
  if (n.kind === "vag") info.append(el("p", "sheet-note", "Niv. " + n.vag.lv + " · " + (VAGABONDS[n.vag.i] || {}).mood));
  top.append(info); body.append(top);
  if (n.kind === "vag") { body.append(el("h4", "fld-h", "Son histoire")); for (const l of (VAGABONDS[n.vag.i] || VAGABONDS[0]).lines) body.append(el("p", "sheet-text dim", l)); body.append(statBars(m)); }
  else body.append(el("p", "sheet-text dim", m.description || ""));
  requestAnimationFrame(() => paintPortrait(cv, n.mid, { still: true }));
  const acts = [{ label: "Fermer", cls: "ghost" }, { label: "Parler", cls: "primary", fn: () => { const H = RM.hero; if (Math.max(Math.abs(n.x - H.x), Math.abs(n.y - H.y)) <= 1) talkTo(n); else { RM.goal = { npc: n, x: n.x, y: n.y, adj: true }; RM.path = townPath(H.x, H.y, n.x, n.y, RM.hero, true); } } }];
  openSheet({ title: n.kind === "vag" ? "Créature vagabonde" : n.name, body, actions: acts, tall: n.kind === "vag" });
}
function setupRoyaume() {
  const cv = $("#rmCanvas"), stick = $("#rmStick"), knob = $("#rmKnob");
  const GSR = RM.gs; const R0 = 46;
  cv.addEventListener("pointerdown", e => {
    unlockAudio();
    if (GSR.id != null) return;
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (_) { }
    Object.assign(GSR, { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, long: false });
    clearTimeout(GSR.timer);
    GSR.timer = setTimeout(() => { if (!GSR.moved && GSR.id != null) { GSR.long = true; townLongPress(GSR.x0, GSR.y0); } }, 450);
  });
  cv.addEventListener("pointermove", e => {
    if (e.pointerId !== GSR.id) return;
    const dx = e.clientX - GSR.x0, dy = e.clientY - GSR.y0, d = Math.hypot(dx, dy);
    if (!GSR.moved && !GSR.long && d > 14) { GSR.moved = true; clearTimeout(GSR.timer); RM.path = null; RM.goal = null; const r = cv.getBoundingClientRect(); stick.style.left = (GSR.x0 - r.left) + "px"; stick.style.top = (GSR.y0 - r.top) + "px"; stick.hidden = false; }
    if (!GSR.moved) return;
    const k = Math.min(1, R0 / Math.max(d, 1));
    knob.style.transform = "translate(" + (dx * k) + "px," + (dy * k) + "px)";
    if (d < 14) { RM.held = null; return; }
    const sec = ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8;
    RM.held = DIR_BY_SECTOR[sec];
  });
  const end = e => {
    if (e.pointerId !== GSR.id) return;
    clearTimeout(GSR.timer);
    if (GSR.moved) { RM.held = null; stick.hidden = true; knob.style.transform = ""; }
    else if (!GSR.long && e.type === "pointerup") townTap(e.clientX, e.clientY);
    GSR.id = null;
    try { cv.releasePointerCapture(e.pointerId); } catch (_) { }
  };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  $("#rmMenu").onclick = () => { sfx("tap"); openTownMenu(); };
  $("#rmBag").onclick = () => { sfx("tap"); openBag(false); };
  document.addEventListener("keydown", e => {
    if (SCREEN !== "royaume" || (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (KEYMAP[k]) { e.preventDefault(); RM.keys.add(k); return; }
    if (SHEET_OPEN || DIALOG_OPEN) return;
    if (k === "Enter" || k === " ") { e.preventDefault(); const H = RM.hero; const n = RM.npcs.find(n => !n.gone && n.x === H.x + H.dir[0] && n.y === H.y + H.dir[1]) || RM.npcs.find(n => !n.gone && Math.max(Math.abs(n.x - H.x), Math.abs(n.y - H.y)) <= 1); if (n) talkTo(n); }
    else if (k === "m" || k === "Escape") openTownMenu();
    else if (k === "i" || k === "b") openBag(false);
  });
  document.addEventListener("keyup", e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; RM.keys.delete(k); });
  window.addEventListener("blur", () => { RM.keys.clear(); RM.held = null; });
}

// ---- objets interactifs du village ----
function drawQuestBoard(ctx, b, T, now) {
  const x = b.x * T, y = b.y * T;
  ctx.fillStyle = "#5a3a20"; ctx.fillRect(x + T * 0.12, y - T * 0.2, T * 0.08, T * 1.1); ctx.fillRect(x + T * 0.8, y - T * 0.2, T * 0.08, T * 1.1);
  ctx.fillStyle = "#8a6038"; ctx.fillRect(x, y - T * 0.45, T, T * 0.75);
  ctx.fillStyle = "#f3e7c9"; for (let i = 0; i < 3; i++) ctx.fillRect(x + T * (0.08 + i * 0.3), y - T * (0.35 - (i % 2) * 0.06), T * 0.24, T * 0.32);
  const fresh = G && G.story.ch2Done && questsToday().some(q => q.state === "offered");
  if (fresh) { ctx.fillStyle = "#ff5f6d"; ctx.beginPath(); ctx.arc(x + T * 0.9, y - T * 0.45, T * 0.1 + Math.sin(now / 250) * T * 0.02, 0, 7); ctx.fill(); }
}
function drawSign(ctx, sg, T) {
  const x = (sg.x + 0.5) * T, y = (sg.y + 1) * T;
  ctx.fillStyle = "#5a3a20"; ctx.fillRect(x - T * 0.04, y - T * 0.9, T * 0.08, T * 0.9);
  ctx.fillStyle = "#a5764a"; ctx.fillRect(x - T * 0.38, y - T * 0.95, T * 0.76, T * 0.34);
  ctx.fillStyle = "#3a2410"; ctx.fillRect(x - T * 0.28, y - T * 0.84, T * 0.56, T * 0.04); ctx.fillRect(x - T * 0.28, y - T * 0.74, T * 0.4, T * 0.04);
}
async function makeWish() {
  if ((G.money || 0) < 10) { toast("Il te faut 10 pièces pour faire un vœu.", 2000); return; }
  const ch = await runChoice(["Jeter 10 pièces et faire un vœu", "Pas maintenant"], "La fontaine du Royaume");
  if (ch !== 0) return;
  G.money -= 10; sfx("pick"); refreshTownHud();
  const r = rnd();
  let line;
  if (r < 0.45) line = "Les pièces scintillent au fond de l’eau… Rien ne se passe. Peut-être demain ?";
  else if (r < 0.8) { const id = pick(["baie", "pomme", "caillou", "grainesom"]); if (G.bag.length < BAG_MAX) { G.bag.push(id); line = "Quelque chose flotte vers toi : " + ITEMS[id].name + " !"; } else line = "Un objet flotte vers toi… mais ton sac est plein."; }
  else if (r < 0.95) { G.money += 30; line = "La fontaine te rend 30 pièces ! Quelle chance !"; }
  else { const rares = Object.values(ITEMS).filter(i => i.rare && i.kind !== "money").map(i => i.id); const id = pick(rares.length ? rares : ["baieor"]); if (G.bag.length < BAG_MAX) { G.bag.push(id); line = "L’eau s’illumine ! Un objet rare apparaît : " + ITEMS[id].name + " !"; } else { G.money += 150; line = "L’eau s’illumine ! (Sac plein : 150 pièces à la place.)"; } }
  refreshTownHud(); Store.saveGame(G);
  await townTalk([{ who: null, text: line }]);
}
