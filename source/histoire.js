// ============================================================
//  HISTOIRE : chapitres 3, 4, 5 et épilogue (mise en scène + logique)
// ============================================================
const STORY_TMP = { recruitMid: null, bossMid: null };
for (const id in STORY_MISSIONS) SPECIAL_LOCS[id] = Object.assign({ id, story: true }, STORY_MISSIONS[id]);

function st3() {
  const s = G.story;
  s.c3 = s.c3 || { on: false, oaths: [], ice: false, end: false };
  s.c3.oaths = s.c3.oaths || [];
  s.c4 = s.c4 || { on: false, step: 0 };
  s.c5 = s.c5 || { on: false, ck: 1, seen: {}, done: false };
  s.c5.seen = s.c5.seen || {};
  s.epi = s.epi || { done: false, order: null, orders: [] };
  s.epi.orders = s.epi.orders || [];
  s.bonds = s.bonds || {}; s.bondSeen = s.bondSeen || {}; s.talked = s.talked || {};
  return s;
}
function hasOrder(id) { return !!(G && G.story && G.story.epi && (G.story.epi.orders || []).includes(id)); }
function storyMons() { return DATA.monsters.filter(m => !m.story && (m.rarity || 1) < 3).map(m => m.id); }
function storyLoc(id) {
  const L = SPECIAL_LOCS[id];
  L.common_monsters = (STORY_MISSIONS[id].common_monsters || []).filter(m => MON[m]);
  if (!L.common_monsters.length) L.common_monsters = storyMons();
  if (L.bossRole) L.boss = castMid(L.bossRole);
  if (L.boss && !MON[L.boss]) L.boss = null;
  return L;
}
// ---------- personnages ----------
function raskUnit() { return G.team.concat(G.reserve || []).find(u => u && (u.story === "rask" || (u.mid === "045" && u.nick === "Rask"))) || null; }
function joinRask() {
  const u = makeUnit("045", Math.max(1, hero().lv), "ally"); u.nick = "Rask"; u.story = "rask";
  G.reserve = G.reserve || [];
  if (G.team.length >= 3) { const out = G.team.splice(2, 1)[0]; out.kind = "ally"; G.reserve.push(out); setTimeout(() => toast(unitName(out) + " se repose au dortoir de l’auberge. Tu peux changer l’équipe à l’auberge.", 3600), 800); }
  G.team.push(u);
}
function ensureRaskInTeam() {
  const r = raskUnit(); if (!r || G.team.includes(r)) return;
  const i = G.reserve.indexOf(r); if (i < 0) return;
  G.reserve.splice(i, 1);
  const out = G.team.length >= 3 ? G.team.splice(2, 1)[0] : null;
  r.kind = "ally"; G.team.push(r);
  if (out) G.reserve.push(out);
  toast("Rask rejoint l’équipe pour cette mission.", 2400);
}
function castKeyMid(k) {
  switch (k) {
    case "hero": return hero().mid;
    case "partner": case "orion": return partner().mid;
    case "recruit": return STORY_TMP.recruitMid || (G.team[2] && G.team[2].mid);
    case "king": case "kingSleep": return castMid("king");
    case "guard": return castMid("guard");
    case "boss": return STORY_TMP.bossMid;
    case "chef": return G.thieves[0]; case "sbire1": return G.thieves[1]; case "sbire2": return G.thieves[2];
    case "rask": { const r = raskUnit(); return r ? r.mid : "045"; }
  }
  const c = STORY_CAST[k]; if (!c) return null;
  if (c.mid) return MON[c.mid] ? c.mid : DATA.monsters[0].id;
  if (c.role) return castMid(c.role);
  return null;
}
// ---------- mise en scène ----------
const LEFT_POS = { hero: [0.32, 0.615], partner: [0.18, 0.64], rask: [0.45, 0.59], recruit: [0.07, 0.6] };
const RIGHT_SLOTS = [[0.7, 0.615], [0.84, 0.64], [0.58, 0.565], [0.93, 0.57], [0.77, 0.535], [0.63, 0.66], [0.9, 0.68], [0.5, 0.655], [0.71, 0.5], [0.86, 0.495], [0.6, 0.495]];
function stageScene(sc) {
  sceneReset(sc.bg || "dark");
  SC.slots = {}; SC.slotN = 0;
  for (const spec of sc.cast || []) {
    const later = spec.endsWith("@"), opt = spec.endsWith("?");
    const key = spec.replace(/[?@]$/, "");
    if (opt && key === "rask" && !raskUnit()) continue;
    if (opt && key === "recruit" && !STORY_TMP.recruitMid) continue;
    placeActor(key, later);
  }
}
function placeActor(key, hidden) {
  const mid = castKeyMid(key); if (!mid) return null;
  let pos = LEFT_POS[key], dir = [1, 0];
  if (!pos) { pos = RIGHT_SLOTS[(SC.slotN || 0) % RIGHT_SLOTS.length]; SC.slotN = (SC.slotN || 0) + 1; dir = [-1, 0]; }
  SC.slots = SC.slots || {}; SC.slots[key] = pos;
  const aKey = key === "kingSleep" ? "king" : key;
  const big = key === "king" || key === "kingSleep" || key === "vizir" || key === "orion" || key === "boss";
  const a = actor(aKey, mid, hidden ? 1.25 : pos[0], pos[1], { dir, sc: big ? 1.15 : key.startsWith("cap") ? 0.95 : 1 });
  if (key === "king" || key === "kingSleep") a.crown = true;
  if (key === "kingSleep") a.sleep = true;
  if (key === "vizir") a.dark = true;
  if (hidden) a.hidden = true;
  const g = key.startsWith("cap") && STORY_CAST[key] && STORY_CAST[key].guild;
  const gd = g && GUILDS.find(x => x.id === g);
  if (gd) a.badge = { col: gd.col, icon: gd.icon };
  return a;
}
async function runScene(sc, ctx) {
  showScreen("scene"); stageScene(sc);
  await wait(350);
  await runDialog(sc.lines, Object.assign({ onCue: storyCue }, ctx || {}));
}
async function storyCue(cue) {
  for (const c of String(cue).split("|")) {
    const [op, a, b] = c.split(":");
    if (op === "hop") { hop(a); await wait(260); }
    else if (op === "shake") { sceneShake(); await wait(450); }
    else if (op === "flash") await flashWhite(140, 80, 320);
    else if (op === "in") {
      let A = SC.actors[a];
      if (!A) A = placeActor(a, true);
      if (!A) continue;
      const pos = (SC.slots && SC.slots[a]) || [0.7, 0.66];
      A.hidden = false; A.x = 1.25; A.y = pos[1];
      await moveA(a, pos[0], pos[1], 650); A.dir = [pos[0] < 0.5 ? 1 : -1, 0];
    }
    else if (op === "out") { const A = SC.actors[a]; if (A && !A.hidden) { A.dir = [1, 0]; moveA(a, 1.3, A.y, 600).then(() => { A.hidden = true; }); } }
    else if (op === "bg") SC.bg = a;
    else if (op === "pendant") { for (const k in SC.actors) if (SC.actors[k].holding && SC.actors[k].holding.kind === "pendant") SC.actors[k].holding = null; if (SC.actors[a]) SC.actors[a].holding = { kind: "pendant" }; sfx("pick"); await wait(300); }
    else if (op === "face") { const A = SC.actors[a], B = SC.actors[b]; if (A && B) A.dir = [B.x > A.x ? 1 : -1, 0]; }
    else if (op === "wake") { const A = SC.actors[a]; if (A) { A.sleep = false; hop(a); await wait(400); } }
    else if (op === "vizir") {
      const C = SC.actors.chancelier; const x = C ? C.x : 0.7, y = C ? C.y : 0.66;
      await flashWhite(120, 60, 300);
      if (C) C.hidden = true;
      actor("vizir", castKeyMid("vizir"), x, y, { dir: [-1, 0], sc: 1.3, dark: true });
      setMusic("bgm.ombre");
    }
    else if (op === "wait") await wait(+a || 400);
    else if (op === "light") { const A = SC.actors[a]; if (A) { A.dark = false; await flashWhite(100, 60, 260); } }
  }
}
// scène plein écran au milieu d'un donjon, puis retour au donjon
async function dungeonScene(sc, after) {
  DG.transition = true;
  await fadeTo(async () => { showScreen("scene"); stageScene(sc); }, 420);
  await runDialog(sc.lines, { onCue: storyCue });
  if (after) await after();
  await fadeTo(async () => { showScreen("dungeon"); DG.maskGrid = null; }, 420);
}
const sdlg = (lines, ctx) => runDialog(lines, Object.assign({ onCue: storyDungeonCue }, ctx || {}));
async function storyDungeonCue(cue) {
  for (const c of String(cue).split("|")) {
    if (c === "shake") { shake(10); sfx("quake"); await wait(400); }
    else if (c === "flash") await flashWhite(120, 60, 300);
  }
}
// ---------- où en est l'histoire ? ----------
function storyNext() {
  if (!G || !G.story.ch2Done) return null;
  const s = st3(), c3 = s.c3, c4 = s.c4, c5 = s.c5;
  if (!c3.on) return { obj: CH3.objPalace, place: "palace", fn: playCh3Intro };
  const n = c3.oaths.length;
  if (n >= 4 && !c3.ice) return { obj: CH3.objIce, place: "palace", fn: playIceCall };
  if (n < 8) return { obj: CH3.objGuilds.replace("{n}", n), place: "guild", fn: openGuildMissions };
  if (!c3.end) return { obj: CH3.objFete, place: "inn", fn: playCh3End };
  if (!c4.on) return { obj: CH4.objIntro, place: "palace", fn: playCh4Intro };
  if (c4.step === 1) return { obj: CH4.objEgouts, place: "guild", mission: "S_EGOUTS", fn: () => playMissionIntro("S_EGOUTS") };
  if (c4.step === 2) return { obj: CH4.objArchives, place: "guild", mission: "S_ARCHIVES", fn: () => playMissionIntro("S_ARCHIVES") };
  if (c4.step === 3) return { obj: CH4.objFaille, place: "guild", mission: "S_FAILLE", fn: () => playMissionIntro("S_FAILLE") };
  if (c4.step === 4) return { obj: CH4.objPalace, place: "palace", fn: playCh4Palace };
  if (!c5.on) return { obj: CH5.objStart, place: "gate", fn: playCh5Intro };
  if (!c5.done) return { obj: CH5.objTower.replace("{f}", c5.ck), place: "gate", mission: "S_TOUR", fn: () => startStoryMission("S_TOUR", c5.ck) };
  if (!s.epi.done) return { obj: "Le Conseil t’attend au palais.", place: "palace", fn: playEpilogue };
  return null;
}
function storyChapterLabel() {
  if (!G) return "";
  const s = G.story;
  if (!s.ch1Done) return "Chapitre 1";
  if (!s.ch2Done) return "Chapitre 2";
  st3();
  if (!s.c3.end) return "Chapitre 3";
  if (s.c4.step < 5) return "Chapitre 4";
  if (!s.c5.done) return "Chapitre 5";
  if (!s.epi.done) return "Épilogue";
  return "Histoire terminée";
}
function storyObjectiveTap() {
  if (RM.paused || SHEET_OPEN || DIALOG_OPEN) return;
  const n = storyNext(); if (!n) return;
  sfx("tap");
  openSheet({ title: "Objectif", body: el("p", "sheet-text", fillTpl(n.obj)), actions: [
    { label: "Plus tard", cls: "ghost" },
    { label: "Y aller maintenant", cls: "primary", fn: () => { G.story.rmPos = { x: RM.hero.x, y: RM.hero.y }; n.fn(); } }
  ] });
}
function storyBuilding(place) {
  const n = storyNext();
  if (n && n.place === place) { G.story.rmPos = { x: RM.hero.x, y: RM.hero.y }; RM.paused = true; Promise.resolve(n.fn()).finally(() => { RM.paused = false; }); return true; }
  return false;
}
// ---------- missions ----------
function startStoryMission(id, startFloor, opts) {
  opts = opts || {};
  const L = storyLoc(id);
  ensureRaskInTeam();
  G.team = G.team.filter(u => !u.guest);
  if (L.guest && STORY_CAST[L.guest]) {
    const g = makeUnit(STORY_CAST[L.guest].mid, Math.max(1, hero().lv), "ally");
    g.guest = true; g.storyGuest = L.guest; g.nick = STORY_CAST[L.guest].name;
    G.team.push(g);
  }
  G.story.mission = { id, replay: !!opts.replay, arc: opts.arc || null };
  if (SCREEN === "royaume" && RM.hero) G.story.rmPos = { x: RM.hero.x, y: RM.hero.y };
  RM.paused = false;
  enterDungeon(id, startFloor || 1);
}
function storyRunInit() {
  const L = locById(R.loc);
  if (L.story) {
    R.story = L.id; R.seen = {};
    R.replay = !!(G.story.mission && G.story.mission.id === L.id && G.story.mission.replay);
    if (L.tower) R.lvFlat = Math.max(1, hero().lv - 1);
  }
}
function storyPreFloor() {
  if (!R) return;
  const L = locById(R.loc);
  if (L.shuffleTheme) R.themeOf = pick(["L01", "L02", "L03", "L04", "L07", "L09", "L10", "L14", "S_FAILLE", "S_NUIT", "S_ABYSSE"].filter(k => THEMES[k]));
}
function storyFloorSetup() {
  if (!R || !R.story) return;
  const L = SPECIAL_LOCS[R.story];
  for (const e of R.enemies) {
    if (e.boss) { if (!L.bossClean) e.shadow = true; if (L.bossName) e.nick = L.bossName; if (L.bossMul) { e.bossMul = L.bossMul; e.hp = maxHP(e); } }
    else if (rnd() < (L.shadow || 0)) e.shadow = true;
  }
  if (L.siege && R.floor >= R.floors) setupSiege();
}
function setupSiege() {
  R.enemies = []; R.bossMid = null;
  R.siege = { t: 0, kills: 0, done: false };
  for (let k = 0; k < 9; k++) spawnShadowNear();
}
function spawnShadowNear() {
  const h = hero();
  for (let tries = 0; tries < 80; tries++) {
    const x = h.x + ri(-8, 8), y = h.y + ri(-9, 2);
    if (!inb(x, y) || isWall(x, y) || unitAt(x, y) || cheb({ x, y }, h) < 3) continue;
    const e = makeEnemy(pick(enemyPool()), enemyLevel()); e.shadow = true; e.aware = true; e.x = x; e.y = y; e.dir = [0, 1];
    R.enemies.push(e); return e;
  }
  return null;
}
async function storyOnFloor() {
  if (!R || !R.story) return;
  const id = R.story, f = R.floor;
  if (R.replay && id !== "S_TOUR") return;
  R.seen = R.seen || {};
  if (R.seen[f]) return;
  R.seen[f] = true;
  DG.transition = true;
  try {
    const arcId = arcOfMission(id);
    if (arcId) { const L = GUILD_ARCS[arcId].floors[f]; if (L) await sdlg(L); }
    else if (id === "S_GLACE") { if (CH3.iceFloors[f]) await sdlg(CH3.iceFloors[f]); if (f >= R.floors) await sdlg(CH3.siege); }
    else if (id === "S_EGOUTS" && CH4.egoutsFloors[f]) { const E = CH4.egoutsFloors[f]; await sdlg(E.lines); await runChoice(E.choice); await sdlg(E.after); G.story.thugsSaved = true; }
    else if (id === "S_ARCHIVES" && CH4.archivesFloors[f]) await sdlg(CH4.archivesFloors[f]);
    else if (id === "S_FAILLE" && CH4.failleFloors[f]) await sdlg(CH4.failleFloors[f]);
    else if (id === "S_TOUR") { await towerFloor(f); return; }
  } finally { DG.transition = false; }
}
function arcOfMission(id) { return Object.keys(GUILD_ARCS).find(k => GUILD_ARCS[k].mission === id) || null; }
// ---- tour céleste : relais de serments ----
async function towerFloor(f) {
  const c5 = st3().c5;
  if (f === 1 && !c5.seen[1]) { c5.seen[1] = true; await dungeonScene(CH5.base); Store.saveGame(G); }
  const camp = CH5.camps[f];
  if (camp) {
    if (!c5.seen[f]) {
      c5.seen[f] = true;
      await sdlg(camp.lines);
      if (camp.reveal) { R.revealed = true; for (let i = 0; i < R.grid.length; i++) if (R.grid[i] !== "#") R.explored[i] = 1; }
      campRest(f);
      if (camp.skip) { await wait(250); R.floor = camp.skip - 1; DG.transition = false; await goDown(); return; }
    } else campRest(f, true);
  }
  if (f === 95 && !c5.seen[95]) { c5.seen[95] = true; await dungeonScene(CH5.father); campRest(95); }
  if (f === 99 && !c5.seen[99]) { c5.seen[99] = true; await dungeonScene(CH5.ult, chooseUltimate); campRest(99); }
  DG.transition = false;
}
function campRest(f, quiet) {
  const h = hero();
  for (const m of G.team) {
    if (m.ko) { m.ko = false; const d = DIRS8.find(d => !isWall(h.x + d[0], h.y + d[1]) && !unitAt(h.x + d[0], h.y + d[1])); if (d) { m.x = h.x + d[0]; m.y = h.y + d[1]; } else { m.x = h.x; m.y = h.y; } }
    m.hp = maxHP(m); m.st = {}; refillPP(m);
  }
  R.belly = 100;
  const c5 = st3().c5; if (f > c5.ck) c5.ck = f;
  Store.saveGame(G);
  if (!quiet) { msgNow({ t: CH5.campHeal, c: "good" }); sfx("heal"); }
  else msgNow({ t: "Reprise au relais de l’étage " + f + ".", c: "good" });
  if (typeof checkTrophies === "function") checkTrophies();
}
async function chooseUltimate() {
  const h = hero();
  const ids = unitMoves(h).concat(DATA.attacks.filter(a => a.ultime).map(a => a.id), ["A90"]);
  const list = [...new Set(ids)].filter(id => ATK[id]).slice(0, 7);
  const i = await runChoice(list.map(id => ATK[id].name + " · " + ATK[id].type + (ATK[id].power ? " · " + ATK[id].power : "")), CH5.ultPrompt);
  G.story.ultimate = list[i] || "A90";
  await runDialog(CH5.ultChosen, { onCue: storyCue });
}
function ultimateName() { const a = G && G.story.ultimate && ATK[G.story.ultimate]; return a ? a.name : "Lumière Originelle"; }
// ---- répliques du gardien ----
function storyBossLines() {
  const id = R.story;
  if (R.replay && id !== "S_TOUR") return [{ who: "boss", text: "…" }];
  const arcId = arcOfMission(id);
  if (arcId) return GUILD_ARCS[arcId].boss;
  return { S_EGOUTS: CH4.egoutsBoss, S_ARCHIVES: CH4.archivesBoss, S_FAILLE: CH4.failleBoss, S_TOUR: CH5.boss }[id] || null;
}
// ---- appelé à chaque fin de tour ----
function storyTurnHook() {
  if (!R || !R.story || R.gameOver) return null;
  if (R.siege && !R.siege.done) {
    R.siege.t++;
    if (R.siege.t % 3 === 0 && R.enemies.length < 14) spawnShadowNear();
    const low = activeTeam().some(m => m.hp < maxHP(m) * 0.4);
    if (R.siege.t >= 16 || R.siege.kills >= 7 || low) { R.siege.done = true; return seqIceRescue; }
  }
  if (R.story === "S_TOUR" && R.boss && !R.ultDone) {
    const b = R.enemies.find(e => e.boss);
    if (b && b.hp <= maxHP(b) * 0.4) return seqUltimate;
  }
  return null;
}
async function seqIceRescue() {
  DG.transition = true;
  await wait(300);
  R.noRecruit = true;
  await runDialog(CH3.rescue, { onCue: async cue => {
    if (cue !== "freeze" && cue !== "fire") return;
    shake(16); sfx("quake");
    await flashWhite(110, 80, 340);
    const list = cue === "freeze" ? R.enemies.filter((_, i) => i % 2 === 0) : R.enemies.slice();
    for (const e of list) { popup(e, cue === "freeze" ? "❄" : "✹", cue === "freeze" ? "#bfefff" : "#ff8a3d", true); e.hp = 0; handleKO(e, hero()); }
    await wait(700);
  } });
  R.enemies = [];
  R.bossDefeated = true;
  DG.transition = false;
  DG.pending = seqCleared;
}
async function seqUltimate() {
  R.ultDone = true; DG.transition = true;
  const b = R.enemies.find(e => e.boss);
  await runDialog(CH5.ultimate, { bossMid: b && b.mid, bossName: SPECIAL_LOCS.S_TOUR.bossName, onCue: async cue => {
    if (cue === "rock" && b) { popup(b, "Caillou !", "#e0b080"); sfx("hit"); await wait(450); }
    if (cue === "ult") { ultimateFX(); sfx("level"); await flashWhite(220, 380, 650); shake(22); sfx("quake"); if (b) popup(b, "★ " + ultimateName() + " ★", "#ffd94a", true); await wait(900); }
  } });
  if (b) { b.hp = 0; handleKO(b, hero()); }
  R.bossDefeated = true;
  DG.transition = false;
  DG.pending = seqCleared;
}
function ultimateFX() {
  const h = hero();
  for (let i = 0; i < 18; i++) FX.push({ k: "pop", x: h.x + ri(-4, 4), y: h.y + ri(-5, 1), text: "✦", col: pick(["#ffd94a", "#fff4c2", "#9ff0ff", "#ff7eb6"]), big: true, t0: performance.now() - i * 25, dur: 1300 });
}
// ---------- fin d'une mission ----------
async function storyCleared() {
  DG.transition = true;
  await wait(600);
  const id = R.story, L = SPECIAL_LOCS[id], replay = R.replay;
  STORY_TMP.bossMid = R.bossMid;
  const ctx = { bossMid: R.bossMid, bossName: L.bossName };
  if (id === "S_TOUR" && !R.ultDone) { R.ultDone = true; await runDialog(CH5.ultimate.slice(2), Object.assign({}, ctx, { onCue: async c => { if (c === "ult") { await flashWhite(220, 380, 650); shake(22); } } })); }
  const money = R.money || 0;
  endRun();
  DG.transition = false; DG.pending = null;
  G.story.mission = null;
  bondAdd("partner", 2); if (raskUnit() && G.team.includes(raskUnit())) bondAdd("rask", 2);
  if (replay) {
    const prize = 150 + hero().lv * 6;
    G.money = (G.money || 0) + prize; G.shards = (G.shards || 0) + 1;
    const arcId = arcOfMission(id); if (arcId) bondAdd(GUILD_ARCS[arcId].friend, 5);
    Store.saveGame(G);
    openSheet({ title: "Mission réussie !", body: el("p", "sheet-text", L.name + " : +" + prize + " pièces · " + money + " pièces ramassées · +1 Éclat d’étoile"), actions: [{ label: "Retour au Royaume", cls: "primary", fn: goRoyaume }], noDismiss: true });
    return;
  }
  const arcId = arcOfMission(id);
  if (arcId) return finishArc(arcId, ctx);
  if (id === "S_GLACE") return finishIce();
  if (id === "S_EGOUTS") return finishStep(CH4.egoutsVictory, { bg: "sewer", cast: ["hero", "partner", "rask", "boss"] }, ctx, 2, "Les Bas-Fonds sont libérés.");
  if (id === "S_ARCHIVES") return finishStep(CH4.archivesVictory, { bg: "library", cast: ["hero", "partner", "rask", "sablier", "boss"] }, ctx, 3, "Le parchemin est déchiffré.");
  if (id === "S_FAILLE") return finishFaille();
  if (id === "S_TOUR") return finishTower();
}
function storyReward(money, shards) { G.money = (G.money || 0) + money; G.shards = (G.shards || 0) + shards; }
async function finishArc(gid, ctx) {
  const arc = GUILD_ARCS[gid], g = GUILDS.find(x => x.id === gid), fr = STORY_CAST[arc.friend];
  setMusic("bgm.fin");
  await runScene({ bg: SPECIAL_LOCS[arc.mission].bg, cast: ["hero", "partner", "rask?", arc.friend, "boss"], lines: arc.victory }, ctx);
  sfx("level");
  await blackCard("Serment scellé", 2400, fr.name + " · " + g.name);
  await runScene({ bg: "guildhall", cast: ["hero", "partner", "rask?", arc.cap, arc.friend], lines: arc.hall });
  const s = st3();
  if (!s.c3.oaths.includes(gid)) s.c3.oaths.push(gid);
  bondAdd(arc.friend, 25);
  G.badges = (G.badges || 0) + 1; storyReward(400, 5);
  G.story.rmPos = { x: 35, y: 27 };
  Store.saveGame(G);
  goRoyaume();
  const n = s.c3.oaths.length;
  setTimeout(() => toast("Serment de " + fr.name + " ! +400 pièces, +5 Éclats · " + (n === 4 && !s.c3.ice ? "Une alerte arrive du palais…" : n + "/8 Serments"), 4200), 500);
  if (typeof checkTrophies === "function") setTimeout(checkTrophies, 4800);
}
async function finishIce() {
  setMusic("bgm.fin");
  await runScene(CH3.iceAfter);
  const s = st3(); s.c3.ice = true;
  storyReward(500, 8);
  G.story.rmPos = { x: 35, y: 27 };
  Store.saveGame(G);
  goRoyaume();
  setTimeout(() => toast("Quatre nouvelles guildes ont besoin de vous ! (Maison des Guildes)", 4200), 500);
}
async function finishStep(lines, sc, ctx, nextStep, msgText) {
  setMusic("bgm.fin");
  await runScene(Object.assign({ lines }, sc), ctx);
  const s = st3(); s.c4.step = Math.max(s.c4.step, nextStep);
  storyReward(400, 5);
  Store.saveGame(G);
  goRoyaume();
  setTimeout(() => toast(msgText + " · " + (storyNext() || { obj: "" }).obj, 4200), 500);
}
async function finishFaille() {
  setMusic("bgm.chapitre4");
  await runScene(CH4.father);
  const s = st3(); s.c4.step = Math.max(s.c4.step, 4);
  storyReward(500, 8);
  Store.saveGame(G);
  goRoyaume();
  setTimeout(() => toast(CH4.objPalace, 4200), 500);
}
async function finishTower() {
  setMusic("bgm.fin");
  await runScene(CH5.after);
  const s = st3(); s.c5.done = true; s.c5.ck = 100;
  storyReward(3000, 50);
  if (G.bag.length < BAG_MAX) G.bag.push("badgeroyal");
  G.badges = (G.badges || 0) + 1;
  Store.saveGame(G);
  await playEpilogue();
}
// ---------- chapitre 3 ----------
async function playCh3Intro() {
  st3();
  showScreen("scene"); sceneReset("black"); setMusic("bgm.chapitre3");
  await blackCard(CH3.title, 2600);
  await runScene(CH3.intro);
  const ch = await runChoice(CH3.introChoice);
  if (ch === 1) await runDialog(CH3.introWhy, { onCue: storyCue });
  await runDialog(CH3.introEnd, { onCue: storyCue });
  const r = raskUnit();
  if (!r) {
    STORY_TMP.recruitMid = G.team[2] ? G.team[2].mid : null;
    await fadeTo(async () => { stageScene(CH3.rask); }, 600);
    await runDialog(CH3.rask.lines, { onCue: storyCue });
    if (STORY_TMP.recruitMid) await runDialog(CH3.raskRecruit, { onCue: storyCue });
    const c = await runChoice(CH3.raskChoice);
    if (c === 1) await runDialog(CH3.raskWhy, { onCue: storyCue });
    await runDialog(CH3.raskEnd, { onCue: storyCue });
    joinRask();
    STORY_TMP.recruitMid = null;
  } else r.story = "rask";
  const s = st3();
  G.story.raskJoined = true; s.c3.on = true;
  bondAdd("rask", 10);
  G.story.rmPos = { x: 23, y: 10 };
  Store.saveGame(G);
  await fadeTo(async () => { goRoyaume(); }, 500);
  setTimeout(() => toast(CH3.objGuilds.replace("{n}", 0), 4200), 400);
}
function openGuildMissions() {
  const s = st3();
  const body = el("div", "guilds missions");
  body.append(el("p", "sheet-note", CH3.hallIntro));
  const nx = storyNext();
  if (nx && nx.mission && nx.mission !== "S_TOUR") {
    const c = el("div", "guild main-mission"); c.style.setProperty("--gc", "#ffd166");
    c.append(el("span", "g-ic", "★"));
    const tx = el("span", "g-tx"); tx.append(el("b", null, "Histoire : " + SPECIAL_LOCS[nx.mission].name), el("small", null, fillTpl(nx.obj))); c.append(tx);
    const b = el("button", "btn small primary", "Partir"); b.type = "button"; b.onclick = () => { closeSheet(); RM.paused = true; Promise.resolve(nx.fn()).finally(() => { RM.paused = false; }); };
    c.append(b); body.append(c);
  }
  for (const gid of GUILD_ORDER) {
    const arc = GUILD_ARCS[gid], g = GUILDS.find(x => x.id === gid), fr = STORY_CAST[arc.friend], M = STORY_MISSIONS[arc.mission];
    const done = s.c3.oaths.includes(gid), open = s.c3.on && (arc.wave === 1 || s.c3.ice);
    const c = el("div", "guild" + (open || done ? "" : " locked")); c.style.setProperty("--gc", g.col);
    c.append(el("span", "g-ic", g.icon));
    const tx = el("span", "g-tx");
    tx.append(el("b", null, g.name), el("small", null, fr.name + " · " + M.name + " · " + (done ? "Serment scellé ✓" : open ? "Disponible" : "Après l’alerte du Glacier")));
    c.append(tx);
    if (open || done) {
      const b = el("button", "btn small " + (done ? "" : "primary"), done ? "Rejouer" : "Partir"); b.type = "button";
      b.onclick = () => { closeSheet(); RM.paused = true; Promise.resolve(playArc(gid, done)).finally(() => { RM.paused = false; }); };
      c.append(b);
    }
    body.append(c);
  }
  openSheet({ title: "Maison des Guildes", body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}
async function playArc(gid, replay) {
  const arc = GUILD_ARCS[gid];
  if (!replay) {
    showScreen("scene"); setMusic("bgm.chapitre3");
    await fadeTo(async () => { stageScene({ bg: "guildhall", cast: ["hero", "partner", "rask?", arc.cap, arc.friend + "@"] }); }, 400);
    await runDialog(arc.intro, { onCue: storyCue });
  }
  startStoryMission(arc.mission, 1, { replay, arc: gid });
}
async function playIceCall() {
  setMusic("bgm.chapitre3");
  await runScene(CH3.ice);
  startStoryMission("S_GLACE", 1);
}
async function playCh3End() {
  setMusic("bgm.chapitre3");
  await runScene(CH3.fete);
  const c = await runChoice(CH3.feteChoice);
  await runDialog(c === 0 ? CH3.feteA : CH3.feteB, { onCue: storyCue });
  await runDialog(CH3.feteEnd, { onCue: storyCue });
  await fadeTo(async () => { sceneReset("dark"); actor("shadow", null, 0.62, 0.86, { shadowFigure: true }); setMusic("bgm.ombre"); }, 1000);
  await runDialog(CH3.shadow);
  await blackCard(CH3.end, 3200, CH3.endSub);
  const s = st3(); s.c3.end = true;
  bondAdd("partner", 10); bondAdd("rask", 10);
  G.badges = (G.badges || 0) + 1; storyReward(800, 15);
  G.story.rmPos = { x: 8, y: 24 };
  Store.saveGame(G);
  goRoyaume();
  setTimeout(() => toast("Chapitre 3 terminé ! +800 pièces, +15 Éclats d’étoile", 4200), 500);
  if (typeof checkTrophies === "function") setTimeout(checkTrophies, 4800);
}
// ---------- chapitre 4 ----------
async function playCh4Intro() {
  showScreen("scene"); sceneReset("black"); setMusic("bgm.chapitre4");
  await blackCard(CH4.title, 2600);
  await runScene(CH4.intro);
  const s = st3(); s.c4.on = true; s.c4.step = 1;
  G.story.rmPos = { x: 23, y: 10 };
  Store.saveGame(G);
  await fadeTo(async () => { goRoyaume(); }, 500);
  setTimeout(() => toast(CH4.objEgouts, 4200), 400);
}
async function playMissionIntro(id) {
  setMusic("bgm.chapitre4");
  if (id === "S_EGOUTS") await runScene(CH4.egoutsIntro);
  else if (id === "S_ARCHIVES") await runScene(CH4.archivesIntro);
  else if (id === "S_FAILLE") await runScene({ bg: "rift", cast: ["hero", "partner", "rask"], lines: [{ who: "partner", text: "La faille est toujours ouverte… Le pendentif tire vers l’intérieur.", emo: "Determined" }, { who: "rask", text: "Bon. On entre dans le trou bizarre. Comme d’habitude." }] });
  startStoryMission(id, 1);
}
async function playCh4Palace() {
  showScreen("scene"); setMusic("bgm.chapitre4");
  await runScene(CH4.palace);
  await runChoice(CH4.palaceChoice);
  await runDialog(CH4.palaceEnd, { onCue: storyCue });
  await blackCard(CH4.end, 3200, CH4.endSub);
  const s = st3(); s.c4.step = 5;
  G.story.pendantLost = true;
  G.badges = (G.badges || 0) + 1; storyReward(1000, 20);
  bondAdd("partner", 10); bondAdd("rask", 10);
  G.story.rmPos = { x: 23, y: 10 };
  Store.saveGame(G);
  goRoyaume();
  setTimeout(() => toast("Chapitre 4 terminé ! +1000 pièces, +20 Éclats · " + CH5.objStart, 4500), 500);
  if (typeof checkTrophies === "function") setTimeout(checkTrophies, 5000);
}
// ---------- chapitre 5 ----------
async function playCh5Intro() {
  showScreen("scene"); sceneReset("black"); setMusic("bgm.chapitre5");
  await blackCard(CH5.title, 2600);
  await runScene(CH5.intro);
  const s = st3(); s.c5.on = true; s.c5.ck = Math.max(1, s.c5.ck || 1);
  Store.saveGame(G);
  startStoryMission("S_TOUR", 1);
}
// ---------- épilogue ----------
async function playEpilogue() {
  showScreen("scene"); sceneReset("black"); setMusic("bgm.epilogue");
  await blackCard(EPI.title, 2600);
  await runScene(EPI.scene);
  const i = await runChoice(ORDERS.map(o => o.name), EPI.prompt);
  const o = ORDERS[i];
  await runDialog(EPI.reactions[o.id], { onCue: storyCue });
  const s = st3();
  s.epi.done = true; s.epi.order = o.id; if (!s.epi.orders.includes(o.id)) s.epi.orders.push(o.id);
  G.story.pendantLost = false;
  await blackCard(o.name.replace("Intégrer l’", "").replace("Refuser et fonder", "Fonder"), 2400, o.unlock);
  await fadeTo(async () => { stageScene(EPI.finale); setMusic("bgm.fin"); }, 900);
  await runDialog(EPI.finale.lines, { onCue: storyCue });
  for (const c of EPI.credits) await blackCard(c, 2200);
  await fadeTo(async () => { sceneReset("dark"); actor("shadow", null, 0.62, 0.86, { shadowFigure: true }); }, 800);
  await runDialog(EPI.teaser);
  await blackCard(EPI.end, 3000, EPI.endSub);
  G.story.rmPos = { x: 23, y: 21 };
  Store.saveGame(G);
  goRoyaume();
  if (typeof checkTrophies === "function") setTimeout(checkTrophies, 800);
}
// Le palais après l'épilogue : changer d'Ordre (et débloquer les autres)
async function palaceFreeMode() {
  const s = st3();
  await townTalk([{ who: "king", text: "Ah, {name} ! Le palais est ta maison. Tu veux rejoindre un autre Ordre ? Tout ce que tu as débloqué reste à toi." }]);
  const opts = ORDERS.map(o => (s.epi.orders.includes(o.id) ? "✓ " : "") + o.name.replace("Intégrer l’", ""));
  const i = await runChoice(opts.concat(["Rien, merci"]), "Ordre actuel : " + ((ORDERS.find(o => o.id === s.epi.order) || {}).name || "aucun").replace("Intégrer l’", ""));
  if (i >= ORDERS.length) return;
  const o = ORDERS[i];
  s.epi.order = o.id; if (!s.epi.orders.includes(o.id)) s.epi.orders.push(o.id);
  Store.saveGame(G);
  await townTalk(EPI.reactions[o.id]);
  toast(o.unlock, 3800);
  if (typeof checkTrophies === "function") setTimeout(checkTrophies, 3900);
}
// ---------- liens d'amitié ----------
function bondPts(k) { return (G.story.bonds && G.story.bonds[k]) || 0; }
function bondRank(k) { return Math.min(5, 1 + Math.floor(bondPts(k) / 25)); }
function bondAdd(k, pts) {
  const s = st3();
  const before = bondRank(k);
  s.bonds[k] = Math.min(100, (s.bonds[k] || 0) + pts);
  const after = bondRank(k);
  if (after > before) setTimeout(() => toast("Lien avec " + bondName(k) + " : rang " + after + " " + "♥".repeat(after), 2600), 1200);
}
function bondName(k) { return k === "partner" ? unitName(partner()) : (STORY_CAST[k] || {}).name || k; }
function pendingBondScene(k) {
  const s = st3();
  const list = BOND_SCENES[k] || [];
  return list.find(sc => bondRank(k) >= sc.rank && !s.bondSeen[k + sc.rank] && (!sc.req || (sc.req === "ice" && s.c3.ice)));
}
async function talkBond(k, ctx) {
  const s = st3();
  const sc = pendingBondScene(k);
  if (sc) { await townTalkOrDialog(sc.lines, ctx); s.bondSeen[k + sc.rank] = true; Store.saveGame(G); return true; }
  const chat = k === "partner" ? PARTNER_CHAT : k === "rask" ? RASK_CHAT : FRIEND_CHAT[k] || ["…"];
  await townTalkOrDialog([{ who: k === "partner" ? "partner" : k, text: pick(chat) }], ctx);
  if (s.talked[k] !== today()) { s.talked[k] = today(); bondAdd(k, 5); Store.saveGame(G); }
  return false;
}
function townTalkOrDialog(lines, ctx) { return SCREEN === "royaume" ? townTalk(lines, ctx) : runDialog(lines, ctx || {}); }
async function talkPal(n) {
  const k = n.pal;
  await talkBond(k, {});
  const ch = await runChoice(["Offrir un objet", "À plus tard"], STORY_CAST[k].name + " · Lien rang " + bondRank(k) + " " + "♥".repeat(bondRank(k)));
  if (ch === 0) openGiftSheet(k);
}
function openGiftSheet(k) {
  const body = el("div", "bag-list");
  const fav = (GUILD_ARCS[Object.keys(GUILD_ARCS).find(g => GUILD_ARCS[g].friend === k)] || {}).fav;
  if (!G.bag.length) body.append(el("p", "empty", "Ton sac est vide."));
  G.bag.forEach((id, i) => {
    const it = ITEMS[id]; if (!it) return;
    const b = el("button", "btn small", it.name + (id === fav ? " ♥" : "")); b.type = "button";
    b.onclick = async () => {
      closeSheet(); G.bag.splice(i, 1);
      const love = id === fav;
      bondAdd(k, love ? 15 : 8); Store.saveGame(G);
      await townTalk([{ who: k, text: love ? "C’est… c’est mon préféré ! Comment tu as deviné ?!" : "Pour moi ? Merci, c’est gentil.", emo: love ? "Joyous" : "Happy" }]);
    };
    body.append(b);
  });
  body.append(el("p", "sheet-note", "Chaque ami a un objet préféré (marqué ♥ quand tu le trouves)."));
  openSheet({ title: "Offrir à " + STORY_CAST[k].name, body, actions: [{ label: "Fermer", cls: "ghost" }] });
}
function openBonds() {
  const s = st3();
  const body = el("div", "chapters");
  const keys = ["partner"].concat(raskUnit() ? ["rask"] : [], FRIEND_KEYS.filter(k => s.c3.oaths.includes(STORY_CAST[k].guild)));
  for (const k of keys) {
    const c = el("div", "chap bond"); const r = bondRank(k);
    c.append(el("b", null, bondName(k) + " · rang " + r), el("small", null, "♥".repeat(r) + "♡".repeat(5 - r) + " · " + bondPts(k) + "/100" + (pendingBondScene(k) ? " · une scène t’attend !" : "")));
    body.append(c);
  }
  body.append(el("p", "sheet-note", "Parle à tes amis chaque jour, offre-leur des cadeaux et appelle-les en renfort pour renforcer vos liens. Parle à " + unitName(partner()) + " et à Rask dans ta chambre."));
  openSheet({ title: "Liens d’amitié", body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}
// ---------- serments : appeler un ami en renfort ----------
const FRIEND_CALL = {
  ondin: "Vous avez appelé ? J’arrive ! …Par la rivière, évidemment !", ardent: "Quelqu’un a besoin d’un idiot qui fonce ? PRÉSENT !",
  racine: "La forêt a entendu. Je suis là.", lys: "Je suis là ! Et cette fois, vous me laissez aussi me reposer, hein ?",
  sablier: "Pile à l’heure ! Pour une fois !", frimas: "Présent.", nyx: "Tu as cherché la lune. Me voilà.", zip: "ZIP ! Tadaa ! …J’ai traversé trois murs pour venir."
};
function canCallOath() { return G && G.story.c3 && G.story.c3.oaths.length > 0 && R && !R.story && !R.tour && !R.arena && !R.oathUsed && !G.team.some(u => u.guest); }
function openOathCall() {
  const s = st3();
  const body = el("div", "bag-list");
  body.append(el("p", "sheet-note", "Un seul appel par exploration. L’ami reste avec toi jusqu’à la sortie."));
  for (const k of FRIEND_KEYS) {
    if (!s.c3.oaths.includes(STORY_CAST[k].guild)) continue;
    const b = el("button", "btn small", STORY_CAST[k].name + " · rang " + bondRank(k)); b.type = "button";
    b.onclick = () => { closeSheet(); callFriend(k); };
    body.append(b);
  }
  openSheet({ title: "Appel de Serment", body, actions: [{ label: "Fermer", cls: "ghost" }] });
}
async function callFriend(k) {
  if (!canCallOath()) return;
  const h = hero();
  const u = makeUnit(STORY_CAST[k].mid, Math.max(1, h.lv - 3 + bondRank(k)), "ally");
  u.guest = true; u.oathFriend = k; u.nick = STORY_CAST[k].name;
  const d = DIRS8.find(d => !isWall(h.x + d[0], h.y + d[1]) && !unitAt(h.x + d[0], h.y + d[1]));
  u.x = d ? h.x + d[0] : h.x; u.y = d ? h.y + d[1] : h.y; u.dir = [0, 1];
  G.team.push(u); R.oathUsed = true;
  sfx("level"); popup(u, "Serment !", "#ffd166", true);
  DG.transition = true;
  await runDialog([{ who: k, text: FRIEND_CALL[k] || "Me voilà !", emo: "Determined" }]);
  DG.transition = false;
  msgNow({ t: STORY_CAST[k].name + " répond à l’appel du Serment !", c: "good" });
  bondAdd(k, 3);
}
// ---------- le Royaume : amis présents en ville ----------
function storyTownNpcs(put, zones) {
  if (!G.story.ch2Done) return;
  const s = st3();
  const z = { x0: 30, y0: 22, x1: 44, y1: 35 };
  for (const k of FRIEND_KEYS) {
    if (!s.c3.oaths.includes(STORY_CAST[k].guild)) continue;
    const p = randomTownSpot(z);
    put({ kind: "pal", pal: k, mid: STORY_CAST[k].mid, name: STORY_CAST[k].name, zone: z }, p[0], p[1]);
  }
  if (G.story.thugsSaved && G.thieves) {
    const zm = { x0: 2, y0: 10, x1: 14, y1: 22 };
    G.thieves.forEach((mid, i) => { const p = randomTownSpot(zm); put({ kind: "thug", mid, name: MON[mid] ? MON[mid].name : "Voyou", li: i, zone: zm }, p[0], p[1]); });
  }
  if (s.c5.done) put({ kind: "orion", mid: partner().mid, name: "Orion", dir: [0, 1] }, 12, 24);
}
const THUG_LINES = [
  ["On travaille honnêtement, maintenant ! On vend des pommes ! …Enfin, on essaie.", "Si tu vois quelqu’un voler, préviens-nous. On sait comment ils pensent."],
  ["Le chef dit qu’on a une deuxième chance. Moi, je compte bien ne pas la gâcher !"],
  ["Pardon pour la plage, hein. Et pour le tournoi. Et pour… bref. Pardon."]
];
const ORION_LINES = ["Ta grand-mère aurait adoré ce Royaume. Et elle t’aurait adoré, {name}.", "Je n’ai plus de capuche. C’est étrange, de sentir le soleil.", "Prends soin de mon fils. …Il prend soin de toi aussi, je le vois bien."];
// ---------- bonus des Ordres ----------
function hoopaRing() {
  const locs = DATA.locations.filter(l => isUnlocked(l.id));
  if (!locs.length) return;
  const L = pick(locs);
  const f = ri(1, Math.max(1, (L.floors || 3) - 1));
  sfx("tp");
  toast("L’Anneau de Hoopa s’ouvre… Direction " + L.name + ", étage " + f + " !", 3200);
  enterDungeon(L.id, f);
}
function guildName() { const s = st3(); return s.guildName || ("Guilde de " + ((G && G.heroName) || unitName(hero()))); }
function openQG() {
  const s = st3();
  const body = el("div", "result");
  body.append(el("p", "sheet-text", "Bienvenue au QG de la « " + guildName() + " » !"));
  body.append(el("p", "sheet-text dim", "Membres : " + (G.team.length + (G.reserve || []).length) + " · Le dortoir n’a pas de limite. Parle aux habitants du Royaume : ils peuvent rejoindre ta guilde."));
  const acts = [{ label: "Fermer", cls: "ghost" }, { label: "Renommer la guilde", fn: async () => { const n = await runNameInput("Nom de ta guilde", guildName()); s.guildName = String(n || "").slice(0, 24) || null; Store.saveGame(G); openQG(); } }];
  if (s.qgDay !== today()) acts.push({ label: "Coffre du jour", cls: "primary", fn: () => { s.qgDay = today(); const id = pick(["baie", "elixir", "orbelum", "grossepomme", "graine", "orbesoin"]); let t = "+150 pièces"; G.money = (G.money || 0) + 150; if (G.bag.length < BAG_MAX) { G.bag.push(id); t += " et " + ITEMS[id].name; } Store.saveGame(G); refreshTownHud(); toast("Coffre du QG : " + t + " !", 2800); } });
  openSheet({ title: "QG de ta guilde", body, actions: acts });
}
async function folkRecruit(n) {
  const ch = await runChoice(["Rejoindre la « " + guildName() + " »", "Au revoir"], "QG indépendant : recrutement libre");
  if (ch !== 0) return;
  const u = makeUnit(n.mid, Math.max(1, hero().lv - 1), "ally");
  G.reserve = G.reserve || []; G.reserve.push(u);
  n.gone = true; RM.npcs = RM.npcs.filter(x => x !== n);
  G.story.townMids.folk = (G.story.townMids.folk || []).map(m => m === n.mid ? townMid([n.mid]) : m);
  Store.saveGame(G); sfx("level");
  await townTalk([{ who: "npc", text: "Moi ? Dans une guilde de héros ? J’accepte ! Je file au dortoir !" }], { npcMid: n.mid, npcName: n.name });
  toast(monById(n.mid).name + " rejoint ta guilde (dortoir de l’auberge).", 2800);
}
Object.assign(MAP_POS, { E_ABYSSES: [0.08, 0.66], E_FAILLES: [0.6, 0.6], E_TOUNDRA: [0.76, 0.1], E_SANCTUAIRE: [0.34, 0.86] });
