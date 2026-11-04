// ============================================================
//  SYSTÈMES DU MODE LIBRE : jours, chambre, quêtes, marchands,
//  recrutement, donjon inconnu, événements de fin de donjon
// ============================================================
// ---------- chaque personnage a son sprite ----------
const CAST_ALIAS = { captainA: "cap_kyogre", captainB: "cap_amovenus" };
function castMid(role) {
  role = CAST_ALIAS[role] || role;
  if (!G) return DATA.monsters[0].id;
  const st = G.story; st.cast = st.cast || {};
  if (st.cast[role] && MON[st.cast[role]]) return st.cast[role];
  const used = new Set(Object.values(st.cast).concat(G.team.map(u => u.mid), G.thieves || []));
  const pool = DATA.monsters.filter(m => (m.rarity || 1) < 3 && !used.has(m.id)).map(m => m.id);
  st.cast[role] = pool.length ? pick(pool) : pick(DATA.monsters).id;
  return st.cast[role];
}
// ---------- jours ----------
function today() { return G.day || 1; }
function sleepUntilTomorrow() {
  G.day = today() + 1;
  for (const u of G.team.concat(G.reserve || [])) { u.hp = maxHP(u); u.ko = false; u.st = {}; refillPP(u); }
  G.story.shop = null; G.unknown = null; delete SPECIAL_LOCS.INCONNU;
  G.quests = genQuests();
  if (Array.isArray(G.story.vag)) for (const v of G.story.vag) v.talks = 0;
  Store.saveGame(G);
}
const WAKE_LINES = [
  "Debout, {name} ! Le soleil est levé depuis longtemps. Le garde royal a sûrement de nouvelles missions !",
  "{name}… {name} ! On raconte qu’un donjon inconnu est apparu cette nuit. On va voir ?",
  "Bien dormi ? Moi, j’ai rêvé de ton pendentif… Allez, une mission nous attend !",
  "Le marché a reçu de nouvelles marchandises ce matin. On passe voir, et après, en mission !",
  "Hé ! Tu ronflais. …Bon. On part en mission, oui ou non ?",
  "J’ai préparé le sac. Il ne manque plus que toi. Direction le tableau des quêtes !",
  "Tu sais quoi ? Aujourd’hui, je le sens bien. On va faire un carton en mission !"
];
EXTRA_BG.room = function (ctx, w, h, now) {
  for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? "#8a6444" : "#90694a"; ctx.fillRect(i * w / 10, 0, w / 10 + 1, h * 0.66); }
  const night = SC.night;
  const wx = w * 0.6, wy = h * 0.1, ww = w * 0.3, wh = h * 0.2;
  const g = ctx.createLinearGradient(0, wy, 0, wy + wh);
  if (night) { g.addColorStop(0, "#1b2248"); g.addColorStop(1, "#3a3f7a"); } else { g.addColorStop(0, "#8fd0ff"); g.addColorStop(1, "#fff1c4"); }
  ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
  if (night) drawMoon(ctx, wx + ww * 0.7, wy + wh * 0.35, wh * 0.18, "#1b2248"); else drawSun(ctx, wx + ww * 0.3, wy + wh * 0.4, wh * 0.18, "rgba(255,240,180,0.95)");
  ctx.strokeStyle = "#4a2e18"; ctx.lineWidth = 6; ctx.strokeRect(wx, wy, ww, wh); ctx.beginPath(); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#a77a52" : "#ad8058"; ctx.fillRect(0, h * 0.66 + i * h * 0.06, w, h * 0.06); }
  // lit
  ctx.fillStyle = "#6b4426"; ctx.fillRect(w * 0.06, h * 0.5, w * 0.46, h * 0.2);
  ctx.fillStyle = "#f3ead8"; ctx.fillRect(w * 0.08, h * 0.47, w * 0.42, h * 0.1);
  ctx.fillStyle = "#4f7bd0"; ctx.fillRect(w * 0.2, h * 0.5, w * 0.3, h * 0.12);
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(w * 0.13, h * 0.5, w * 0.05, h * 0.025, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#5a3a20"; ctx.fillRect(w * 0.04, h * 0.4, w * 0.035, h * 0.3);
  // coffre et tapis
  ctx.fillStyle = "#7a5230"; ctx.fillRect(w * 0.7, h * 0.56, w * 0.2, h * 0.1); ctx.fillStyle = "#ffd94a"; ctx.fillRect(w * 0.79, h * 0.6, w * 0.02, h * 0.02);
  ctx.fillStyle = "#b5523c"; ctx.beginPath(); ctx.ellipse(w * 0.55, h * 0.86, w * 0.36, h * 0.06, 0, 0, 7); ctx.fill();
  if (night) { ctx.fillStyle = "rgba(10,14,40,0.35)"; ctx.fillRect(0, 0, w, h); }
};
function roomCompanion() {
  const pool = G.team.slice(1).concat(G.reserve || []).filter(u => u && MON[u.mid]);
  return pool.length ? pick(pool) : null;
}
async function playRoom(mode) {
  R = null;
  showScreen("scene"); sceneReset("room"); setMusic("bgm.accueil");
  SC.night = mode === "sleep";
  const h = hero();
  actor("hero", h.mid, 0.28, 0.66, { dir: [1, 0], sleep: mode === "sleep" });
  const comp = roomCompanion();
  if (mode === "wake" && comp) {
    actor("c", comp.mid, 0.78, 0.84, { dir: [-1, 0] });
    await wait(500); hop("c");
    await runDialog([{ who: "npc", text: pick(WAKE_LINES) }], { npcMid: comp.mid, npcName: unitName(comp) });
    await fadeTo(async () => { G.story.rmPos = { x: 8, y: 24 }; goRoyaume(); }, 600);
    return;
  }
  if (mode === "load") await runDialog([{ who: "thought", text: "Ta chambre à l’auberge. Jour " + today() + "." }]);
  for (;;) {
    const ch = await runChoice(["Dormir jusqu’à demain", "Gérer l’équipe", "Sortir au village"], "Chambre · Jour " + today());
    if (ch === 0) {
      SC.night = true; if (SC.actors.hero) SC.actors.hero.sleep = true;
      await wait(700);
      await blackCard("Jour " + (today() + 1), 1800, "Les donjons, les marchands et les quêtes ont changé.");
      sleepUntilTomorrow();
      await playRoom("wake");
      return;
    }
    if (ch === 1) { await new Promise(res => { openDorm(res); }); continue; }
    await fadeTo(async () => { G.story.rmPos = { x: 8, y: 24 }; goRoyaume(); }, 500);
    return;
  }
}
// ---------- quêtes du garde royal ----------
function questLocs() { return DATA.locations.filter(l => isUnlocked(l.id)); }
function genQuests() {
  const list = [];
  const locs = questLocs(); if (!locs.length) return { day: today(), list };
  const itemPool = Object.values(ITEMS).filter(i => i.kind !== "money" && (i.w || 0) > 0 && i.kind !== "treasure").map(i => i.id);
  const wanted = pick(itemPool);
  list.push({ id: "q" + today() + "a", type: "item", target: wanted, title: "Livraison", desc: "Rapporte-moi : " + ITEMS[wanted].name + ".", reward: { money: 80 + ri(0, 6) * 10 }, state: "offered" });
  const l1 = pick(locs); const pool = (l1.common_monsters || []).filter(id => MON[id] && (MON[id].rarity || 1) < 3);
  const tgt = pick(pool.length ? pool : [DATA.monsters[0].id]);
  list.push({ id: "q" + today() + "b", type: "defeat", loc: l1.id, target: tgt, title: "Chasse", desc: "Bats un " + monById(tgt).name + " dans " + l1.name + " (à partir de l’étage 2).", reward: { money: 120 + ri(0, 8) * 10, item: pick(["baie", "elixir", "orbelum"]) }, state: "offered" });
  const l2 = pick(locs.filter(l => (l.floors || 3) >= 3).concat(locs));
  const lost = pick(DATA.monsters.filter(m => (m.rarity || 1) === 1)).id;
  list.push({ id: "q" + today() + "c", type: "rescue", loc: l2.id, target: lost, title: "Sauvetage", desc: "Un " + monById(lost).name + " s’est perdu dans " + l2.name + ". Escorte-le jusqu’au dernier étage.", reward: { money: 180 + ri(0, 8) * 10, item: pick(["baieor", "graine", "rubanrouge", "foulardbleu", "badgeeclair", "rubanvital"]) }, state: "offered" });
  return { day: today(), list };
}
function questsToday() {
  if (!G.quests || !Array.isArray(G.quests.list)) G.quests = genQuests();
  return G.quests.list;
}
function questSpawnFor() {
  if (!G || !G.quests || !R || R.floor < 2 || R.questSpawned) return null;
  const q = questsToday().find(q => q.type === "defeat" && q.state === "active" && q.loc === R.loc);
  return q && MON[q.target] && rnd() < 0.45 ? q : null;
}
function questOnKill(t) {
  const q = questsToday().find(q => q.id === t.questTarget && q.state === "active");
  if (q) { q.state = "done"; msg({ t: "Quête accomplie : " + q.desc, c: "good" }); TL.note(() => toast("Quête accomplie ! Va voir le garde royal.", 2600)); }
}
// appelé à chaque nouvel étage
function questFloorHook() {
  if (!G || !G.quests || !R || R.tour) return;
  const q = questsToday().find(q => q.type === "rescue" && q.state === "active" && q.loc === R.loc);
  if (!q) return;
  let g = G.team.find(u => u.guest && u.questId === q.id);
  if (!g && R.floor === 1) {
    g = makeUnit(q.target, Math.max(1, hero().lv - 2), "ally"); g.guest = true; g.questId = q.id; g.nick = monById(q.target).name + " égaré";
    const h = hero();
    const d = DIRS8.find(d => !isWall(h.x + d[0], h.y + d[1]) && !unitAt(h.x + d[0], h.y + d[1]));
    if (d) { g.x = h.x + d[0]; g.y = h.y + d[1]; } else { g.x = h.x; g.y = h.y; }
    G.team.push(g);
    msgNow({ t: unitName(g) + " te suit. Protège-le jusqu’au dernier étage !", c: "good" });
  }
  if (g && !g.ko && R.floor >= R.floors) {
    q.state = "done";
    G.team = G.team.filter(u => u !== g);
    msgNow({ t: unitName(g) + " est en sécurité ! Quête accomplie.", c: "good" });
    toast("Sauvetage réussi ! Va voir le garde royal.", 2600);
  }
  if (g && g.ko) { q.state = "failed"; G.team = G.team.filter(u => u !== g); msgNow({ t: "Le sauvetage a échoué…", c: "bad" }); }
}
function openQuestBoard(fromGuard) {
  const list = questsToday();
  const body = el("div", "result");
  body.append(el("p", "sheet-note", "Jour " + today() + " · De nouvelles quêtes arrivent chaque matin (dors à l’auberge pour passer au jour suivant)."));
  for (const q of list) {
    const c = el("div", "tool-card");
    c.append(el("h3", null, q.title + (q.state === "claimed" ? " ✓" : q.state === "failed" ? " ✗" : "")), el("p", "sheet-text", q.desc));
    c.append(el("p", "sheet-note", "Récompense : " + q.reward.money + " pièces" + (q.reward.item && ITEMS[q.reward.item] ? " + " + ITEMS[q.reward.item].name : "")));
    const st = { offered: "Proposée", active: "En cours", done: "Accomplie : réclame ta récompense !", claimed: "Terminée", failed: "Échouée" }[q.state];
    c.append(el("p", "sheet-note", "État : " + st));
    const b = el("button", "btn small primary"); b.type = "button";
    if (q.state === "offered") { b.textContent = "Accepter"; b.onclick = () => { q.state = "active"; Store.saveGame(G); toast("Quête acceptée."); openQuestBoard(fromGuard); }; c.append(b); }
    else if (q.type === "item" && q.state === "active" && fromGuard) {
      const has = G.bag.indexOf(q.target);
      b.textContent = has >= 0 ? "Donner " + ITEMS[q.target].name : "Il te manque " + ITEMS[q.target].name; b.disabled = has < 0;
      b.onclick = () => { G.bag.splice(G.bag.indexOf(q.target), 1); q.state = "done"; claimQuest(q); openQuestBoard(fromGuard); }; c.append(b);
    } else if (q.state === "done" && fromGuard) { b.textContent = "Réclamer la récompense"; b.onclick = () => { claimQuest(q); openQuestBoard(fromGuard); }; c.append(b); }
    else if (q.state === "done") c.append(el("p", "sheet-note", "Va voir le garde royal sur la place pour ta récompense."));
    body.append(c);
  }
  openSheet({ title: fromGuard ? "Quêtes du garde royal" : "Tableau des quêtes", body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}
function claimQuest(q) {
  q.state = "claimed";
  G.money = (G.money || 0) + (q.reward.money || 0);
  let extra = "";
  if (q.reward.item && ITEMS[q.reward.item]) { if (G.bag.length < BAG_MAX) { G.bag.push(q.reward.item); extra = " et " + ITEMS[q.reward.item].name; } else { G.money += 50; extra = " (sac plein : +50 pièces à la place de l’objet)"; } }
  sfx("level"); toast("+" + q.reward.money + " pièces" + extra + " !", 2600);
  if (SCREEN === "royaume") refreshTownHud();
  Store.saveGame(G);
}
// ---------- donjon inconnu ----------
const UNK_A = ["Grotte", "Tour", "Abîme", "Labyrinthe", "Forêt", "Temple", "Galerie", "Crypte", "Faille", "Jardin"];
const UNK_B = ["des Murmures", "Oubliée", "Inversée", "du Silence", "des Mille Pas", "Sans Nom", "du Reflet", "des Brumes", "Écarlate", "du Vertige", "Éternelle", "des Rêves Perdus"];
function genUnknown() {
  const keys = Object.keys(THEMES).filter(k => /^L\d+$/.test(k));
  const pool = []; const all = DATA.monsters.map(m => m.id);
  while (pool.length < 6 && pool.length < all.length) { const id = pick(all); if (!pool.includes(id)) pool.push(id); }
  const loc = { id: "INCONNU", name: pick(UNK_A) + " " + pick(UNK_B), floors: ri(4, 8), difficulty: 3, themeOf: pick(keys), common_monsters: pool, boss: pick(pool.filter(id => (MON[id].rarity || 1) < 3).concat(pool)), unknown: true, description: "Un donjon qui change à chaque visite." };
  G.unknown = loc; SPECIAL_LOCS.INCONNU = loc;
  return loc;
}
function restoreUnknown() { if (G && G.unknown) SPECIAL_LOCS.INCONNU = G.unknown; }
// ---------- événement de fin de donjon (mode libre) ----------
async function freeModeEndRoll(forceR) {
  if (!G.story.ch2Done || !R || R.bonusDone || SPECIAL_LOCS[R.loc] && R.loc !== "INCONNU") return false;
  R.bonusDone = true;
  const r = typeof forceR === "number" ? forceR : rnd() * 100;
  const h = hero();
  if (r < 42) { await runDialog([{ who: "thought", text: "Le donjon est redevenu calme. Rien de plus à trouver ici." }]); return false; }
  if (r < 80) {
    const rares = Object.values(ITEMS).filter(i => i.rare && i.kind !== "money").map(i => i.id);
    const id = pick(rares.length ? rares : ["baieor"]);
    let line = "Un coffre rare était caché au fond du donjon ! Tu obtiens : " + ITEMS[id].name + ".";
    if (G.bag.length < BAG_MAX) G.bag.push(id); else { G.money = (G.money || 0) + Math.round((ITEMS[id].price || 200) / 2); line += " (Sac plein : revendu " + Math.round((ITEMS[id].price || 200) / 2) + " pièces.)"; }
    sfx("level");
    await runDialog([{ who: null, text: line }]);
    return false;
  }
  const legendary = r >= 97;
  let mid;
  if (legendary) { const L = DATA.monsters.filter(m => (m.rarity || 1) === 3); mid = (L.length ? pick(L) : DATA.monsters.slice().sort((a, b) => (b.hp + b.attack + b.defense + b.speed) - (a.hp + a.attack + a.defense + a.speed))[0]).id; }
  else mid = pick(DATA.monsters.filter(m => (m.rarity || 1) < 3)).id;
  R.bonusBoss = { mid, lv: h.lv + (legendary ? 4 : 2), mul: legendary ? 3.2 : 2.9 };
  await runDialog([{ who: null, text: legendary ? "Le sol tremble… Une créature LÉGENDAIRE surgit des profondeurs !" : "Un grondement… Un gardien plus fort que les autres bloque la sortie !" }]);
  R.bossDefeated = false; R.floors = R.floor + 1;
  DG.transition = false;
  await goDown();
  return true;
}
// ---------- recrutement après un combat ----------
async function seqRecruitOffer() {
  const o = R.recruitOffer; R.recruitOffer = null; if (!o || !MON[o.mid]) return;
  DG.transition = true;
  const m = monById(o.mid);
  const body = el("div", "ucard");
  const top = el("div", "ucard-top"); const cv = el("canvas", "ucard-face"); top.append(cv);
  const info = el("div", "ucard-info"); info.append(el("h4", null, m.name + " · Niv. " + o.lv), el("p", "sheet-note", rarityOf(o.mid).name + (o.boss ? " · gardien" : "")));
  top.append(info); body.append(top, el("p", "sheet-text", m.name + " se relève et te regarde… Il veut rejoindre ton équipe !"));
  requestAnimationFrame(() => paintPortrait(cv, o.mid, { still: true }));
  sfx("level");
  const choice = await new Promise(res => openSheet({ title: "Recrutement !", body, noDismiss: true, actions: [{ label: "Refuser", cls: "ghost", fn: () => res(false) }, { label: "Accepter", cls: "primary", fn: () => res(true) }] }));
  if (choice) {
    const u = makeUnit(o.mid, o.lv, "ally");
    const members = G.team.filter(x => !x.guest).length;
    if (members < 3 && R) {
      const free = [[o.x, o.y]].concat(DIRS8.map(d => [hero().x + d[0], hero().y + d[1]])).find(([x, y]) => !isWall(x, y) && !unitAt(x, y));
      if (free) { u.x = free[0]; u.y = free[1]; }
      G.team.splice(members, 0, u);
      msgNow({ t: m.name + " rejoint l’équipe !", c: "good" });
    } else {
      G.reserve = G.reserve || []; G.reserve.push(u);
      msgNow({ t: m.name + " t’attendra au dortoir de l’auberge.", c: "good" });
    }
    Store.saveGame(G);
  } else msgNow(m.name + " repart de son côté.");
  DG.transition = false;
  if (R && R.bossDefeated) DG.pending = seqCleared;
}
// ---------- sac et équipement des coéquipiers ----------
function openAllyBag(u, back) {
  u.bag = u.bag || [];
  const inD = !!R;
  const body = el("div", "bag-list");
  body.append(el("p", "sheet-note", unitName(u) + " porte " + u.bag.length + "/" + ALLY_BAG + " objets." + (u.equip && ITEMS[u.equip] ? " Équipé : " + ITEMS[u.equip].name + "." : " Aucun équipement.")));
  if (!u.bag.length) body.append(el("p", "empty", "Son sac est vide. Les coéquipiers ramassent ce qu’ils trouvent en marchant."));
  u.bag.forEach((id, i) => {
    const it = ITEMS[id]; if (!it) return;
    const row = el("div", "hist-row");
    row.append(itemIconCanvas(id, 26), el("span", null, it.name));
    const take = el("button", "btn small", "Prendre"); take.type = "button"; take.disabled = G.bag.length >= BAG_MAX;
    take.onclick = () => { G.bag.push(u.bag.splice(i, 1)[0]); Store.saveGame(G); openAllyBag(u, back); };
    row.append(take);
    if (["heal", "fullheal", "pp", "equip"].includes(it.kind)) { const use = el("button", "btn small primary", it.kind === "equip" ? "Équiper" : "Utiliser"); use.type = "button"; use.onclick = () => { if (inD) { closeSheet(); dungeonAct(() => useItem(i, u, u.bag)); } else { applyItemOutside(u.bag, i, u); openAllyBag(u, back); } }; row.append(use); }
    body.append(row);
  });
  const acts = [{ label: back ? "Retour" : "Fermer", cls: "ghost", fn: back || null }];
  if (u.equip) acts.unshift({ label: "Retirer l’équipement", keep: true, fn: () => { if (unequip(u)) { Store.saveGame(G); openAllyBag(u, back); } } });
  openSheet({ title: "Sac de " + unitName(u), body, actions: acts, tall: true });
}
function applyItemOutside(bag, i, u) {
  const it = ITEMS[bag[i]]; if (!it) return;
  if (it.kind === "equip") { const old = u.equip; u.equip = bag.splice(i, 1)[0]; if (old) bag.push(old); u.hp = maxHP(u); toast(unitName(u) + " s’équipe de " + it.name + "."); }
  else if (it.kind === "heal" || it.kind === "fullheal") { bag.splice(i, 1); u.hp = maxHP(u); toast(unitName(u) + " est en pleine forme."); }
  else if (it.kind === "pp") { bag.splice(i, 1); refillPP(u); toast("PP restaurés."); }
  Store.saveGame(G);
}
// ---------- marchands ----------
function shopToday() {
  const st = G.story;
  if (st.shop && st.shop.day === today()) return st.shop;
  const objs = Object.values(ITEMS).filter(i => i.shop === "objets" && i.kind !== "equip").map(i => i.id);
  const eq = Object.values(ITEMS).filter(i => i.kind === "equip" && i.shop).map(i => i.id).sort(() => rnd() - 0.5).slice(0, 2);
  const orbs = Object.values(ITEMS).filter(i => i.shop === "orbes").map(i => i.id);
  const skills = DATA.attacks.filter(a => a.power > 0 || a.effect).map(a => a.id).sort(() => rnd() - 0.5).slice(0, 6);
  st.shop = { day: today(), objets: objs.concat(eq), orbes: orbs.sort(() => rnd() - 0.5).slice(0, Math.max(3, orbs.length - 1)), skills };
  return st.shop;
}
function itemPrice(id) { return ITEMS[id].price || 50; }
function skillPrice(a) { return Math.round(60 + (a.power || 20) * 3 + (a.effect ? 40 : 0)); }
const VENDORS = {
  objets: { role: "vendor_objets", name: "Marchande d’objets", hello: "Des baies fraîches, des pommes, des rubans… Tout pour l’aventure !" },
  orbes: { role: "vendor_orbes", name: "Marchand d’orbes", hello: "Mes orbes viennent des ruines les plus profondes. Approche, approche…" },
  skills: { role: "vendor_skills", name: "Maître des capacités", hello: "Je peux enseigner une nouvelle capacité à un membre de ton équipe. Le savoir a un prix !" }
};
function shopHeader(kind) {
  const v = VENDORS[kind]; const h = el("div", "shop-head");
  const cv = el("canvas", "shop-face"); h.append(cv, el("p", "sheet-text", v.hello));
  requestAnimationFrame(() => paintPortrait(cv, castMid(v.role), { still: true }));
  return h;
}
function openShop(tab, kind) {
  kind = kind || "objets"; tab = tab || "buy";
  if (kind === "skills") return openSkillShop();
  const stock = shopToday()[kind] || [];
  const body = el("div", "shop");
  body.append(shopHeader(kind));
  const seg = el("div", "seg");
  for (const [k, l] of [["buy", "Acheter"], ["sell", "Vendre"]]) { const b = el("button", k === tab ? "on" : "", l); b.type = "button"; b.onclick = () => openShop(k, kind); seg.append(b); }
  body.append(seg, el("p", "sheet-note", "Pièces : " + (G.money || 0) + " · Sac : " + G.bag.length + "/" + BAG_MAX + " · Stock du jour " + today()));
  if (tab === "buy") {
    for (const id of stock) {
      const it = ITEMS[id]; if (!it) continue; const price = itemPrice(id);
      const row = el("button", "bag-item"); row.type = "button";
      row.append(itemIconCanvas(id, 30));
      const tx = el("span", "bag-tx"); tx.append(el("b", null, it.name + " · " + price + " p."), el("small", null, it.desc)); row.append(tx);
      row.disabled = (G.money || 0) < price || G.bag.length >= BAG_MAX;
      row.onclick = () => { G.money -= price; G.bag.push(id); sfx("pick"); toast(it.name + " acheté !", 1400); if (SCREEN === "royaume") refreshTownHud(); Store.saveGame(G); openShop("buy", kind); };
      body.append(row);
    }
  } else {
    if (!G.bag.length) body.append(el("p", "empty", "Ton sac est vide."));
    G.bag.forEach((id, i) => {
      const it = ITEMS[id]; if (!it) return;
      const price = it.kind === "treasure" ? (+it.value || 300) : Math.max(5, Math.round(itemPrice(id) / 2));
      const row = el("button", "bag-item"); row.type = "button";
      row.append(itemIconCanvas(id, 30));
      const tx = el("span", "bag-tx"); tx.append(el("b", null, it.name + " · " + price + " p."), el("small", null, "Vendre cet objet")); row.append(tx);
      row.onclick = () => { G.bag.splice(i, 1); G.money = (G.money || 0) + price; sfx("pick"); if (SCREEN === "royaume") refreshTownHud(); Store.saveGame(G); openShop("sell", kind); };
      body.append(row);
    });
  }
  openSheet({ title: VENDORS[kind].name, body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}
function openSkillShop() {
  const body = el("div", "shop");
  body.append(shopHeader("skills"), el("p", "sheet-note", "Pièces : " + (G.money || 0) + " · Capacités du jour " + today()));
  for (const id of shopToday().skills) {
    const a = ATK[id]; if (!a) continue; const price = skillPrice(a);
    const row = el("button", "bag-item"); row.type = "button";
    const chip = typeChip(a.type);
    const tx = el("span", "bag-tx"); tx.append(el("b", null, a.name + " · " + price + " p."), el("small", null, (a.power ? "Puiss. " + a.power : "Statut") + " · " + RANGE_LABELS[moveRange(a)] + (a.effect && EFFECT_LABELS[a.effect] ? " · " + EFFECT_LABELS[a.effect] : "")));
    row.append(chip, tx);
    row.disabled = (G.money || 0) < price;
    row.onclick = () => teachMove(id, price);
    body.append(row);
  }
  openSheet({ title: VENDORS.skills.name, body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}
function teachMove(atkId, price) {
  const a = ATK[atkId];
  const body = el("div", "team-list"); body.append(el("p", "sheet-note", "Qui doit apprendre " + a.name + " ?"));
  for (const u of G.team) {
    const b = el("button", "btn small", unitName(u) + (unitMoves(u).includes(atkId) ? " (la connaît déjà)" : "")); b.type = "button";
    b.disabled = unitMoves(u).includes(atkId);
    b.onclick = () => {
      const mv = unitMoves(u).slice();
      const finish = repl => { const list = mv.slice(); if (repl == null) list.push(atkId); else list[repl] = atkId; u.moves = list.slice(0, 4); refillPP(u); G.money -= price; sfx("level"); toast(unitName(u) + " apprend " + a.name + " !", 2200); if (SCREEN === "royaume") refreshTownHud(); Store.saveGame(G); closeSheet(); };
      if (mv.length < 4) { finish(null); return; }
      const bd = el("div", "team-list"); bd.append(el("p", "sheet-note", unitName(u) + " connaît déjà 4 capacités. Laquelle oublier ?"));
      mv.forEach((id, i) => { const bb = el("button", "btn small", "Oublier " + (ATK[id] ? ATK[id].name : id)); bb.type = "button"; bb.onclick = () => finish(i); bd.append(bb); });
      openSheet({ title: "Remplacer une capacité", body: bd, actions: [{ label: "Annuler", cls: "ghost", fn: openSkillShop }] });
    };
    body.append(b);
  }
  openSheet({ title: a.name + " · " + price + " p.", body, actions: [{ label: "Retour", cls: "ghost", fn: openSkillShop }] });
}
// ---------- informateur : où trouver les créatures ----------
function openBestiary() {
  const body = el("div", "result");
  body.append(el("p", "sheet-text", "Je note tout ce que les explorateurs me racontent. Voilà où vivent les créatures que tu peux recruter :"));
  const all = DATA.locations.concat(G.unknown ? [] : []);
  for (const l of all) {
    const c = el("div", "tool-card");
    const open = isUnlocked(l.id);
    c.append(el("h3", null, l.name + (open ? "" : " · pas encore accessible")));
    const lst = el("div", "beast-list");
    for (const id of l.common_monsters || []) {
      const m = MON[id]; if (!m) continue; const r = rarityOf(id);
      const rate = typeof m.recruit_rate === "number" ? m.recruit_rate : r.recruit;
      const chip = el("span", "beast"); chip.style.setProperty("--rc", r.col);
      chip.textContent = (r === RARITY[3] && !open ? "???" : m.name) + " · " + r.name + " · " + rate + " %";
      lst.append(chip);
    }
    c.append(lst); body.append(c);
  }
  body.append(el("p", "sheet-note", "Le pourcentage, c’est la chance qu’une créature veuille te rejoindre après l’avoir battue. Les gardiens sont plus difficiles à convaincre."));
  openSheet({ title: "Carnet de l’informatrice", body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}
// ---------- dortoir : appeler, congédier, libérer, renommer ----------
function refreshParty() { if (typeof RM !== "undefined" && RM.trail && SCREEN === "royaume") RM.party = townParty().map((uu, k) => { const t = RM.trail[Math.min(k, RM.trail.length - 1)]; return { u: uu, x: t[0], y: t[1], px: t[0], py: t[1], t0: 0, dur: 0, dir: [0, -1] }; }); }
function openDorm(onDone) {
  G.reserve = G.reserve || [];
  const body = el("div", "team-list");
  body.append(el("h4", "fld-h", "Ton équipe (3 maximum dans les donjons)"));
  G.team.forEach((u, i) => {
    const row = el("div", "dorm-row"); row.append(unitCard(u));
    const btns = el("div", "row-btns");
    const bag = el("button", "btn small", "Sac (" + ((u.bag || []).length) + ")"); bag.type = "button"; bag.onclick = () => openAllyBag(u, () => openDorm(onDone)); btns.append(bag);
    if (i >= 2) {
      const out = el("button", "btn small ghost", "Congédier"); out.type = "button";
      out.onclick = () => { G.reserve.push(G.team.splice(i, 1)[0]); Store.saveGame(G); refreshParty(); openDorm(onDone); };
      btns.append(out);
    }
    row.append(btns); body.append(row);
  });
  body.append(el("h4", "fld-h", "Au dortoir (" + G.reserve.length + ")"));
  if (!G.reserve.length) body.append(el("p", "empty", "Personne au dortoir. Bats des créatures en donjon : certaines voudront te rejoindre."));
  G.reserve.forEach((u, i) => {
    const row = el("div", "dorm-row"); row.append(unitCard(u));
    const btns = el("div", "row-btns");
    const call = el("button", "btn small primary", G.team.length < 3 ? "Appeler" : "Échanger avec " + unitName(G.team[2])); call.type = "button";
    call.onclick = () => { const outU = G.team.length >= 3 ? G.team.splice(2, 1)[0] : null; u.kind = "ally"; G.team.push(u); G.reserve.splice(i, 1); if (outU) G.reserve.push(outU); Store.saveGame(G); refreshParty(); openDorm(onDone); };
    const ren = el("button", "btn small", "Renommer"); ren.type = "button";
    ren.onclick = async () => { closeSheet(); const n = await runNameInput("Nouveau nom pour " + unitName(u), unitName(u)); if (n) u.nick = n; Store.saveGame(G); openDorm(onDone); };
    const bag = el("button", "btn small", "Sac (" + ((u.bag || []).length) + ")"); bag.type = "button"; bag.onclick = () => openAllyBag(u, () => openDorm(onDone));
    const fire = el("button", "btn small danger", "Libérer"); fire.type = "button";
    fire.onclick = () => openSheet({ title: "Libérer " + unitName(u) + " ?", body: el("p", "sheet-text", unitName(u) + " quittera ton équipe pour de bon et retournera à la nature. Ses objets reviennent dans ton sac si tu as de la place."), actions: [{ label: "Garder", cls: "ghost", fn: () => openDorm(onDone) }, { label: "Libérer", cls: "danger", fn: () => { for (const id of u.bag || []) if (G.bag.length < BAG_MAX) G.bag.push(id); if (u.equip && G.bag.length < BAG_MAX) G.bag.push(u.equip); G.reserve.splice(i, 1); Store.saveGame(G); toast(unitName(u) + " retourne à la nature."); openDorm(onDone); } }] });
    btns.append(call, ren, bag, fire); row.append(btns); body.append(row);
  });
  openSheet({ title: "Dortoir de l’auberge", body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true, onClose: onDone });
}

// positions des nouveaux donjons sur la carte
Object.assign(MAP_POS, { L05: [0.84, 0.42], L06: [0.14, 0.8], L07: [0.46, 0.74], L08: [0.48, 0.12], L09: [0.86, 0.7], L10: [0.1, 0.46], L11: [0.56, 0.38], L12: [0.66, 0.84], L13: [0.4, 0.52], L14: [0.18, 0.18] });
