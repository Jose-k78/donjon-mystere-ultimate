// ============================================================
//  DÉMARRAGE
// ============================================================
function sanitizeSave(g) {
  if (!g || typeof g !== "object" || g.v !== 2 || !Array.isArray(g.team) || !g.team[0]) return null;
  try {
    for (const u of g.team) {
      if (!u) continue;
      if (!MON[u.mid]) u.mid = DATA.monsters[0].id;
      u.st = u.st || {}; u.pp = u.pp || {};
      for (const id of unitMoves(u)) if (u.pp[id] == null) u.pp[id] = ATK[id].pp;
      if (typeof u.lv !== "number") u.lv = 1;
      if (typeof u.xp !== "number") u.xp = 0;
      if (typeof u.hp !== "number") u.hp = 1;
    }
    if (!g.team[1]) g.team[1] = makeUnit(DATA.monsters[1 % DATA.monsters.length].id, g.team[0].lv, "partner");
    g.bag = (g.bag || []).filter(id => ITEMS[id] && !ITEMS[id].money).slice(0, BAG_MAX);
    g.progress = g.progress || { cleared: [], finale: false };
    g.progress.cleared = (g.progress.cleared || []).filter(Boolean);
    g.stats = g.stats || { kills: 0, runs: 0 };
    g.story = g.story || { step: "ch1_beach", ch1Done: false };
    g.money = g.money || 0; g.badges = g.badges || 0; g.shards = g.shards || 0;
    if (!Array.isArray(g.thieves) || g.thieves.length < 3) g.thieves = pickThieves([g.team[0].mid, g.team[1].mid]);
    g.thieves = g.thieves.map(id => MON[id] ? id : DATA.monsters[0].id);
    if (g.run && (!g.run.grid || !(LOC[g.run.loc] || SPECIAL_LOCS[g.run.loc]) || !Array.isArray(g.run.enemies))) g.run = null;
    if (g.run && !LOC[g.run.loc] && !SPECIAL_LOCS[g.run.loc]) g.run = null;
    if (g.run) for (const e of g.run.enemies) { if (!MON[e.mid]) e.mid = DATA.monsters[0].id; e.st = e.st || {}; e.pp = e.pp || {}; }
    if (g.run && g.run.tour) for (const t of g.run.tour.teams || []) for (const e of t.members || []) { if (!MON[e.mid]) e.mid = DATA.monsters[0].id; e.st = e.st || {}; e.pp = e.pp || {}; }
    if (g.ctfBackup && !(g.run && g.run.ctf) && typeof ctfRestoreTeam === "function") ctfRestoreTeam(g);   // match de Capture de Relique interrompu
    if (g.run && g.run.ctf) g.team = g.team.filter(u => u && MON[u.mid]).slice(0, 5);                       // Capture de Relique : 5 joueurs
    else { const main = g.team.filter(u => u && !u.guest).slice(0, 3); const guests = g.run ? g.team.filter(u => u && u.guest && MON[u.mid]).slice(0, 1) : []; g.team = main.concat(guests); }
    if (g.team[2] && !(g.run && g.run.ctf)) g.team[2].kind = "ally";
    g.reserve = Array.isArray(g.reserve) ? g.reserve.filter(u => u && MON[u.mid]) : [];
    for (const u of g.reserve) { u.st = u.st || {}; u.pp = u.pp || {}; u.kind = "ally"; }
    g.story.met = g.story.met || {};
    g.day = g.day || 1;
    for (const u of g.team.concat(g.reserve)) { u.bag = Array.isArray(u.bag) ? u.bag.filter(id => ITEMS[id]) : []; if (u.equip && !ITEMS[u.equip]) u.equip = null; if (u.moves) u.moves = u.moves.filter(id => ATK[id]); }
    if (g.unknown && typeof g.unknown === "object") SPECIAL_LOCS.INCONNU = g.unknown;
    g.mg = g.mg && typeof g.mg === "object" ? g.mg : {}; g.fish = g.fish && typeof g.fish === "object" ? g.fish : {}; g.trophies = g.trophies && typeof g.trophies === "object" ? g.trophies : {}; g.tickets = g.tickets || 0;
    if (g.story.c3) { g.story.c3.oaths = (g.story.c3.oaths || []).filter(id => GUILD_ARCS[id]); }
    if (g.story.bonds) for (const k in g.story.bonds) g.story.bonds[k] = clamp(+g.story.bonds[k] || 0, 0, 100);
    if (g.story.ultimate && !ATK[g.story.ultimate]) g.story.ultimate = null;
    return g;
  } catch (e) { return null; }
}
function wire() {
  $("#btnContinue").onclick = () => { unlockAudio(); sfx("tap"); continueGame(); };
  $("#btnNew").onclick = () => { unlockAudio(); sfx("tap"); startNew(); };
  $("#btnOptions").onclick = () => { unlockAudio(); sfx("tap"); openSettings(); };
  $("#btnGraphics").onclick = () => { sfx("tap"); openStudio("title"); };
  $("#btnHubGraphics").onclick = () => { sfx("tap"); openStudio("hub"); };
  $("#stBack").onclick = () => { sfx("tap"); stopStudioPreview(); if (STUDIO.back === "hub" && G && G.story.ch1Done) goHub(); else goTitle(); };
  for (const b of $$("[data-back]")) b.onclick = () => {
    sfx("tap"); const to = b.dataset.back;
    if (to === "hub" && G && G.story.ch1Done) goHub();
    else if (to === "map" && G) goMap();
    else goTitle();
  };
  $("#mapCanvas").addEventListener("click", mapTap);
  $("#btnMapTeam").onclick = () => openTeam();
  $("#btnMapBag").onclick = () => openBag(false);
  $("#btnMapBack").onclick = () => { sfx("tap"); if (G && G.story.ch1Done) goHub(); else { Store.saveGame(G); goTitle(); } };
  for (const b of $$("[data-hub]")) b.onclick = () => { unlockAudio(); hubAction(b.dataset.hub); };
  $("#btnHubTitle").onclick = () => { sfx("tap"); Store.saveGame(G); goTitle(); };
  // donjon
  setupGestures();
  setupWheel();
  setupRoyaume();
  $("#btnPause").onclick = () => { if (!DG.transition && !DIALOG_OPEN && !SHEET_OPEN && R) { const r = DG.cv.getBoundingClientRect(); openWheel(r.left + DG.w / 2, r.top + DG.h * 0.5, false); } };
  $("#btnBag").onclick = () => { if (!DG.transition && !DIALOG_OPEN && !SHEET_OPEN && R) { sfx("tap"); openBag(true); } };
  $("#btnStairs").onclick = () => { if (!blocked()) askStairs(); };
  $("#log").onclick = () => { if (!DG.transition) openLog(); };
  // feuille
  $("#sheet").addEventListener("click", e => { if (e.target.id === "sheet" && $("#sheet").dataset.dismiss === "1") closeSheet(); });
  // atelier
  for (const b of $$("#atlTabs button")) b.onclick = () => { ATL.tab = b.dataset.tab; renderAtelier(); };
  for (const b of $$("#jsonKinds button")) b.onclick = () => { ATL.jsonKind = b.dataset.kind; renderJson(); };
  $("#btnNewMon").onclick = () => newMonster();
  $("#btnNewAtk").onclick = () => editAttack(nextAttackId());
  $("#btnNewItem").onclick = () => editItem(null);
  $("#btnJsonApply").onclick = () => applyJson();
  $("#btnJsonReset").onclick = () => resetJson();
  $("#btnJsonCopy").onclick = () => copyJson();
  $("#btnJsonDl").onclick = () => downloadJson();
  // clavier
  document.addEventListener("keydown", e => onKey(e, true));
  document.addEventListener("keyup", e => onKey(e, false));
  window.addEventListener("blur", () => { KEYS_DOWN.clear(); DG.held = null; });
  window.addEventListener("resize", () => resizeAll());
  document.addEventListener("visibilitychange", () => { if (document.hidden && G) Store.saveGame(G); });
}
let LAST = performance.now();
function loop(now) {
  const dt = Math.min(100, now - LAST); LAST = now;
  try {
    if (SCREEN === "title") drawTitle(now);
    else if (SCREEN === "scene") drawScene(now);
    else if (SCREEN === "hub") drawHub(now);
    else if (SCREEN === "map") { if (!LOOPMAP.t || now - LOOPMAP.t > 50) { LOOPMAP.t = now; renderMap(now); } }
    else if (SCREEN === "dungeon") dungeonTick(now, dt);
    else if (SCREEN === "royaume") townTick(now, dt);
    else if (SCREEN === "atelier") atelierTick(now);
  } catch (e) { console.error(e); }
  requestAnimationFrame(loop);
}
const LOOPMAP = { t: 0 };
async function boot(hot) {
  wire();
  applyMods(lsGet(LS_MODS));
  G = sanitizeSave(hot && hot.G ? hot.G : lsGet(LS_SAVE));
  requestAnimationFrame(loop);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { for (const k in TILESET_CACHE) delete TILESET_CACHE[k]; });
  const storeReady = Store.init().then(async () => {
    if (Store.db) {
      const mods = await Store.loadMods();
      if (mods) applyMods(mods);
      const save = await Store.loadSave();
      const s2 = sanitizeSave(save);
      if (s2 && (SCREEN === "title" || SCREEN === "scene" && BOOT && !BOOT.done) && !NG && (!G || (s2.savedAt || 0) > (G.savedAt || 0))) { G = s2; if (SCREEN === "title") refreshTitle(); }
    }
    const sprites = await Store.loadSpriteDocs();
    for (const mid in sprites) loadSpriteDoc(sprites[mid]);
    refreshModoButtons();
    await loadAllMedia();
    if (!Store.db && typeof syncBoot === "function") { try { await syncBoot(); } catch (e) { } }
    MUSIC.key = null; refreshMusic();
    if (SCREEN === "atelier") renderAtelier();
    if (SCREEN === "map") refreshMap();
  }).catch(() => { });
  if (hot && hot.screen && G) {
    if (hot.screen === "dungeon" && G.run) { continueGame(); return; }
    if (hot.screen === "hub" && G.story.ch1Done) { goHub(); return; }
    if (hot.screen === "royaume" && G.story.ch1Done) { goRoyaume(); return; }
    if (hot.screen === "map") { goMap(); return; }
    goTitle(); return;
  }
  playBoot();
  return storeReady;
}
try {
  const hot = window.claude && window.claude.hot;
  if (hot && typeof hot.snapshot === "function") hot.snapshot(() => ({ G: G ? JSON.parse(JSON.stringify(G)) : null, screen: SCREEN }));
  const start = d => boot(d || {});
  if (hot && typeof hot.ready === "function") hot.ready(start); else start((hot && hot.data) || {});
} catch (e) { boot({}); }
