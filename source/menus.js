// ============================================================
//  MENUS : titre, menu d'accueil, carte, paramètres
// ============================================================
const DECORS = [
  { key: "nuit", sky: ["#0a1620", "#12303f", "#1d4a55"], far: "#0f2a36", ridge: "#0b1d26", stars: true, moon: true, part: "fog" },
  { key: "foret", sky: ["#5fb4e0", "#a9dcf2", "#dff3fb"], far: "#4d8f55", ridge: "#2c6236", trees: true, part: "leaves" },
  { key: "coucher", sky: ["#2b3d63", "#c9877a", "#f6b27a"], far: "#5a4258", ridge: "#2f2233", sun: true, part: "birds" },
  { key: "neige", sky: ["#8fb0d4", "#cfe0f2", "#eef5fc"], far: "#b5cbe2", ridge: "#e9f1f9", mountains: true, part: "snow" },
  { key: "grotte", sky: ["#0d0918", "#1a1230", "#291c44"], far: "#1f1838", ridge: "#130d22", crystals: true, part: "fireflies" }
];
const ridgeY = (x, w, h) => h * 0.8 + Math.sin(x / w * 5 + 1) * h * 0.022 + Math.sin(x / w * 13) * h * 0.008;
// soleil / lune / nuage : image perso si elle existe
function drawSunDefault(ctx, x, y, r, col) { ctx.fillStyle = col || "rgba(255,217,160,0.95)"; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
function drawSun(ctx, x, y, r, col) { const im = !MEDIA.noCustom && mediaImg("deco.soleil"); if (im) drawContain(ctx, im, x, y, r * 2.6); else drawSunDefault(ctx, x, y, r, col); }
function drawMoonDefault(ctx, x, y, r, sky) { ctx.fillStyle = "#f2efd8"; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.beginPath(); ctx.arc(x + r * 0.42, y - r * 0.25, r * 0.9, 0, 7); ctx.fill(); ctx.restore(); }
function drawMoon(ctx, x, y, r, sky) { const im = !MEDIA.noCustom && mediaImg("deco.lune"); if (im) drawContain(ctx, im, x, y, r * 2.6); else { ctx.fillStyle = "#f2efd8"; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillStyle = sky; ctx.beginPath(); ctx.arc(x + r * 0.42, y - r * 0.25, r * 0.9, 0, 7); ctx.fill(); } }
function drawCloudDefault(ctx, x, y, s) { ctx.fillStyle = "rgba(255,255,255,0.9)"; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x - s * 0.3 + i * s * 0.2, y + (i % 2) * s * 0.06, s * 0.17, 0, 7); ctx.fill(); } }
function drawCloud(ctx, x, y, s) { const im = !MEDIA.noCustom && mediaImg("deco.nuage"); if (im) drawContain(ctx, im, x, y, s); else drawCloudDefault(ctx, x, y, s); }
function drawDecor(ctx, w, h, d, now, key) {
  if (!MEDIA.noCustom && customBg(ctx, key || ("bg.title." + d.key), w, h)) return;
  drawDecorRaw(ctx, w, h, d, now);
}
function drawDecorRaw(ctx, w, h, d, now) {
  const g = ctx.createLinearGradient(0, 0, 0, h * 0.8);
  g.addColorStop(0, d.sky[0]); g.addColorStop(0.6, d.sky[1]); g.addColorStop(1, d.sky[2]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const rr = seeded(42);
  if (d.stars) for (let i = 0; i < 70; i++) { const x = rr() * w, y = rr() * h * 0.55, a = 0.3 + 0.7 * Math.abs(Math.sin(now / 900 + i)); ctx.fillStyle = "rgba(220,240,240," + (a * 0.7) + ")"; ctx.fillRect(x, y, 1.5, 1.5); }
  if (d.moon) drawMoon(ctx, w * 0.84, h * 0.08, Math.min(w, h) * 0.05, d.sky[0]);
  if (d.sun) drawSun(ctx, w * 0.25, h * 0.62, Math.min(w, h) * 0.09, "rgba(255,217,160,0.9)");
  if (d.mountains) { ctx.fillStyle = "#9db6d2"; ctx.beginPath(); ctx.moveTo(0, h * 0.7); for (let i = 0; i <= 6; i++) ctx.lineTo(w * i / 6, h * (i % 2 ? 0.38 : 0.6)); ctx.lineTo(w, h * 0.7); ctx.fill(); ctx.fillStyle = "#ffffff"; for (let i = 1; i <= 5; i += 2) { ctx.beginPath(); ctx.moveTo(w * i / 6, h * 0.38); ctx.lineTo(w * i / 6 + w * 0.05, h * 0.45); ctx.lineTo(w * i / 6 - w * 0.05, h * 0.45); ctx.fill(); } }
  if (d.crystals) for (let i = 0; i < 9; i++) { const x = rr() * w, y = h * (0.45 + rr() * 0.3), s = 14 + rr() * 26; const a = 0.5 + 0.5 * Math.sin(now / 700 + i); ctx.fillStyle = "rgba(140,220,255," + (0.35 + a * 0.4) + ")"; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.35, y); ctx.lineTo(x, y + s * 0.3); ctx.lineTo(x - s * 0.35, y); ctx.fill(); }
  // collines lointaines
  ctx.fillStyle = d.far; ctx.beginPath(); ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 10) ctx.lineTo(x, h * 0.68 + Math.sin(x / w * 3 + 2) * h * 0.04);
  ctx.lineTo(w, h); ctx.fill();
  if (d.trees) treeRow(ctx, w, h * 0.7, 46, "#3d7a45", 77, 12);
  if (d.sun) { ctx.fillStyle = "rgba(60,110,140,0.6)"; ctx.fillRect(0, h * 0.7, w, h * 0.12); }
  ctx.fillStyle = d.ridge; ctx.beginPath(); ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 8) ctx.lineTo(x, ridgeY(x, w, h)); ctx.lineTo(w, h); ctx.fill();
  // particules
  const t = now / 1000;
  if (d.part === "fog") for (let k = 0; k < 3; k++) { const yy = h * (0.62 + k * 0.1), off = (now / (60 + k * 30)) % w; ctx.fillStyle = "rgba(190,233,228," + (0.05 + k * 0.02) + ")"; for (let x = -w; x < w * 2; x += w * 0.6) { ctx.beginPath(); ctx.ellipse(x + off, yy, w * 0.35, 30, 0, 0, 7); ctx.fill(); } }
  if (d.part === "leaves") for (let i = 0; i < 14; i++) { const x = ((i * 0.13 + t * 0.03 * (1 + i % 3)) % 1.1) * w, y = ((i * 0.29 + t * 0.05) % 1) * h * 0.8; ctx.fillStyle = i % 2 ? "#9bd36a" : "#e8c75a"; ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2 + i); ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.5, 0, 0, 7); ctx.fill(); ctx.restore(); }
  if (d.part === "snow") { ctx.fillStyle = "#fff"; for (let i = 0; i < 50; i++) { const x = ((i * 0.071 + t * 0.02) % 1) * w + Math.sin(t + i) * 8, y = ((i * 0.137 + t * 0.06) % 1) * h; ctx.fillRect(x, y, 2.5, 2.5); } }
  if (d.part === "fireflies") for (let i = 0; i < 18; i++) { const x = (0.5 + 0.45 * Math.sin(t * 0.3 + i * 1.7)) * w, y = h * (0.4 + 0.3 * Math.sin(t * 0.4 + i)); ctx.fillStyle = "rgba(255,240,140," + (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))) + ")"; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 7); ctx.fill(); }
  if (d.part === "birds") { ctx.strokeStyle = "rgba(40,30,40,0.7)"; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { const x = ((t * 0.04 + i * 0.12) % 1.2) * w - 0.1 * w, y = h * (0.2 + i * 0.04) + Math.sin(t * 2 + i) * 6, f = Math.sin(t * 8 + i) * 4; ctx.beginPath(); ctx.moveTo(x - 8, y - f); ctx.lineTo(x, y); ctx.lineTo(x + 8, y - f); ctx.stroke(); } }
}

// ------------------------------------------------------------
//  ÉCRAN TITRE
// ------------------------------------------------------------
const TITLE = { cur: 0, next: 1, t0: 0, fade: 0 };
function goTitle() {
  R = null;
  showScreen("title");
  setMusic("bgm.titre");
  refreshModoButtons();
  TITLE.t0 = performance.now(); TITLE.cur = Math.floor(rnd() * DECORS.length); TITLE.fade = 0;
  refreshTitle();
}
function drawTitle(now) {
  const cv = $("#titleCanvas"); const { ctx, w, h, dpr } = fitCanvas(cv);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!TITLE.fade && now - TITLE.t0 > 9000) { TITLE.fade = now; TITLE.next = (TITLE.cur + 1) % DECORS.length; }
  drawDecor(ctx, w, h, DECORS[TITLE.cur], now);
  if (TITLE.fade) {
    const k = clamp((now - TITLE.fade) / 1600, 0, 1);
    ctx.save(); ctx.globalAlpha = k; drawDecor(ctx, w, h, DECORS[TITLE.next], now); ctx.restore();
    if (k >= 1) { TITLE.cur = TITLE.next; TITLE.fade = 0; TITLE.t0 = now; }
  }
  // défilé de créatures
  const mons = DATA.monsters; const s = Math.min(64, Math.max(40, w / 9));
  const span = mons.length * s * 1.6 + w;
  for (let i = 0; i < mons.length; i++) {
    const x = ((now / 1000) * s * 0.55 + i * s * 1.6) % span - s;
    if (x > w + s) continue;
    const y = ridgeY(x, w, h) + 2;
    drawShadow(ctx, x, y, s);
    drawCreature(ctx, mons[i].id, x, y, s, { t: now + i * 300, dir: [1, 0], moving: true });
  }
}
function refreshTitle() {
  $("#btnContinue").hidden = !G;
  const foot = $("#titleFoot");
  if (G) {
    const h = hero();
    foot.textContent = unitName(h) + " · Niv. " + h.lv + " · " + (typeof storyChapterLabel === "function" ? storyChapterLabel() : "Chapitre 1");
  } else foot.textContent = "Fan game · fait par José";
}
function continueGame() {
  if (!G) return;
  if (G.run) { R = G.run; resumeDungeon(); return; }
  if (G.story.ch1Done && /^ch2_(recruit|register|tournoi)$/.test(G.story.step || "") && !G.story.ch2Done) { goRoyaume(); return; }
  if (G.story.ch2Done) { playRoom("load"); return; }
  if (G.story.ch1Done) { goHub(); return; }
  if (G.story.step === "ch1_map") { goMap(); return; }
  playChapter1Intro();
}
function startNew() {
  const go = () => { playNewGame(); };
  if (G) {
    openSheet({
      title: "Nouvelle partie ?", body: el("p", "sheet-text", "Ta sauvegarde actuelle sera remplacée. Tes créatures modifiées et tes sprites restent dans l’Atelier."), actions: [
        { label: "Annuler", cls: "ghost" }, { label: "Recommencer", cls: "danger", fn: go }
      ]
    });
  } else go();
}
function openSettings() {
  const body = el("div", "pause");
  const grid = el("div", "pause-grid");
  const add = (label, fn, cls) => { const b = el("button", "btn " + (cls || ""), label); b.type = "button"; b.onclick = () => { sfx("tap"); fn(); }; grid.append(b); };
  add(OPTS.sound ? "Son : activé" : "Son : coupé", () => { OPTS.sound = !OPTS.sound; saveOpts(); if (OPTS.sound) unlockAudio(); openSettings(); });
  add(OPTS.music === false ? "Musique : coupée" : "Musique : activée", () => { OPTS.music = OPTS.music === false; saveOpts(); MUSIC.key = null; refreshMusic(); openSettings(); });
  add(OPTS.fastText ? "Texte : rapide" : "Texte : normal", () => { OPTS.fastText = !OPTS.fastText; saveOpts(); openSettings(); });
  add("Atelier", () => { closeSheet(); $("#atlBack").dataset.back = SCREEN === "hub" ? "hub" : "title"; openAtelier(); });
  add("Sauvegarde (user_save.json)", () => { closeSheet(); openSaveSheet(); });
  if (G && G.story.ch1Done) add("Trophées", () => { closeSheet(); openTrophies(); });
  if (G) add("Effacer la sauvegarde", confirmErase, "danger");
  body.append(grid);
  body.append(el("p", "sheet-note", "Donjon Mystère Ultimate est un fan game fait par moi et pour moi — José. Toutes les créatures, les décors et l’histoire sont originaux."));
  openSheet({ title: "Paramètres", body, actions: [{ label: "Fermer", cls: "ghost" }] });
}
function confirmErase() {
  openSheet({
    title: "Effacer la sauvegarde ?", body: el("p", "sheet-text", "Ta progression sera perdue. Les modifications de l’Atelier sont gardées."), actions: [
      { label: "Annuler", cls: "ghost", fn: openSettings },
      { label: "Effacer", cls: "danger", fn: async () => { await Store.deleteSave(); G = null; R = null; goTitle(); toast("Sauvegarde effacée."); } }
    ]
  });
}

// ------------------------------------------------------------
//  MENU D'ACCUEIL
// ------------------------------------------------------------
const HUB = { a: 0.3, b: 0.42, da: 1, db: 1 };
function goHub() {
  R = null;
  showScreen("hub");
  setMusic("bgm.accueil");
  refreshModoButtons();
  refreshHub();
  Store.saveGame(G);
}
function refreshHub() {
  if (!G) return;
  const h = hero();
  $("#pfName").textContent = unitName(h);
  $("#pfLv").textContent = "Niv. " + h.lv;
  $("#pfMoney").textContent = String(G.money || 0);
  $("#pfBadges").textContent = String(G.badges || 0);
  $("#pfShards").textContent = String(G.shards || 0);
  requestAnimationFrame(() => paintPortrait($("#pfFace"), h.mid, { still: true }));
  $("#hubRoyaume").hidden = !(G.story.ch2Done || /^ch2_/.test(G.story.step || ""));
  const hb = $('[data-hub="histoire"]'); hb.classList.toggle("glow", G.story.step === "ch1_done" && !G.story.ch2Done);
}
function drawHub(now) {
  if (!G) return;
  const cv = $("#hubCanvas"); const { ctx, w, h, dpr } = fitCanvas(cv);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawDecor(ctx, w, h, DECORS[2], now, "bg.hub");
  const s = Math.min(80, Math.max(50, w / 7));
  const step = 0.00006 * 16;
  HUB.a += HUB.da * step; HUB.b += HUB.db * step * 0.95;
  if (HUB.a > 0.82 || HUB.a < 0.12) HUB.da *= -1;
  if (HUB.b > 0.88 || HUB.b < 0.18) HUB.db *= -1;
  for (const [x, mid, d] of [[HUB.a, hero().mid, HUB.da], [HUB.b, partner().mid, HUB.db]]) {
    const px = x * w, py = ridgeY(px, w, h) + 2;
    drawShadow(ctx, px, py, s);
    drawCreature(ctx, mid, px, py, s, { t: now, dir: [d, 0], moving: true });
  }
}
function hubAction(k) {
  sfx("tap");
  if (k === "histoire") {
    const body = el("div", "chapters");
    const c1 = el("div", "chap done"); c1.append(el("b", null, CH1.title), el("small", null, "Terminé"));
    const rv = el("button", "btn small", "Revoir les scènes"); rv.type = "button"; rv.onclick = () => { closeSheet(); playChapter1Intro({ replay: true }); };
    c1.append(rv);
    const st = G.story.step || "";
    const c2 = el("div", "chap" + (G.story.ch2Done ? " done" : ""));
    c2.append(el("b", null, CH2.title), el("small", null, G.story.ch2Done ? "Terminé · mode libre" : st === "ch1_done" ? "Nouveau !" : "En cours"));
    const b2 = el("button", "btn small " + (G.story.ch2Done ? "" : "primary"), G.story.ch2Done ? "Aller au Royaume" : st === "ch1_done" || st === "ch2_intro" ? "Commencer" : "Continuer"); b2.type = "button";
    b2.onclick = () => { closeSheet(); if (st === "ch1_done" || st === "ch2_intro") playChapter2Intro(); else goRoyaume(); };
    c2.append(b2);
    body.append(c1, c2);
    if (G.story.ch2Done) {
      const s = st3(), nx = storyNext();
      const rows = [[CH3.title, s.c3.end, s.c3.on], [CH4.title, s.c4.step >= 5, s.c4.on], [CH5.title, s.c5.done, s.c5.on], [EPI.title, s.epi.done, s.c5.done]];
      rows.forEach(([t, done, on], i) => {
        const c = el("div", "chap" + (done ? " done" : on || (i === 0) ? "" : " locked"));
        const sub = done ? "Terminé" : on ? "En cours · " + (nx ? fillTpl(nx.obj) : "") : i === 0 || rows[i - 1][1] ? "Nouveau ! " + (nx ? fillTpl(nx.obj) : "") : "Plus tard";
        c.append(el("b", null, t), el("small", null, sub));
        if (!done && (on || i === 0 || rows[i - 1][1]) && nx) { const b = el("button", "btn small primary", "Continuer"); b.type = "button"; b.onclick = () => { closeSheet(); goRoyaume(); setTimeout(() => storyObjectiveTap(), 700); }; c.append(b); }
        body.append(c);
      });
      if (s.c3.on) { const bb = el("div", "pause-grid"); const mk = (l, f) => { const b = el("button", "btn small", l); b.type = "button"; b.onclick = () => { closeSheet(); f(); }; bb.append(b); }; mk("Serments (" + s.c3.oaths.length + "/8)", () => { goRoyaume(); setTimeout(openGuildMissions, 600); }); mk("Liens", openBonds); mk("Trophées", openTrophies); body.append(bb); }
    } else { const c3 = el("div", "chap locked"); c3.append(el("b", null, "Chapitre 3"), el("small", null, "Après le tournoi")); body.append(c3); }
    openSheet({ title: "Histoire", body, actions: [{ label: "Fermer", cls: "ghost" }] });
  } else if (k === "donjon") goMap();
  else if (k === "quetes" && G.story.ch2Done) { openQuestBoard(false); return; }
  else if (k === "quetes") {
    const body = el("div", "chapters");
    for (const [t, d] of [["Retrouver une Baie Dorée perdue", "Forêt Verdoyante · bientôt"], ["Escorter un Pousseron égaré", "Forêt Verdoyante · bientôt"], ["Livrer un colis à la plage", "bientôt"]]) { const q = el("div", "chap locked"); q.append(el("b", null, t), el("small", null, d)); body.append(q); }
    body.append(el("p", "sheet-note", "Le tableau des missions de la guilde ouvrira au chapitre 2."));
    openSheet({ title: "Quêtes", body, actions: [{ label: "Fermer", cls: "ghost" }] });
  } else if (k === "invoc") {
    if (!G.story.ch1Done) { openSheet({ title: "Invocations", body: el("p", "sheet-text", "Termine le chapitre 1 pour invoquer des créatures avec tes Éclats d’étoile."), actions: [{ label: "Fermer", cls: "ghost" }] }); return; }
    openInvocations();
  } else if (k === "equipe") openTeam();
  else if (k === "royaume") goRoyaume();
  else if (k === "params") openSettings();
}

// ------------------------------------------------------------
//  CARTE (le reste du monde est sous les nuages)
// ------------------------------------------------------------
const MAP_POS = { L00: [0.3, 0.62], L01: [0.26, 0.6], L02: [0.74, 0.56], L03: [0.3, 0.33], L04: [0.64, 0.2] };
function mapPos(l, i) {
  if (MAP_POS[l.id]) return MAP_POS[l.id];
  const a = i * 2.1 + 0.6; return [0.5 + Math.cos(a) * 0.28, 0.45 + Math.sin(a) * 0.22];
}
let MAPSEL = null;
function goMap() {
  if (!G) return;
  R = null;
  showScreen("map");
  setMusic("bgm.carte");
  refreshMap();
  Store.saveGame(G);
}
function visibleLocs() { return G ? DATA.locations.filter(l => isUnlocked(l.id)) : DATA.locations.filter(l => l.id === "L00"); }
function renderMap(now) {
  const cv = $("#mapCanvas"); if (!cv || SCREEN !== "map") return;
  now = now || performance.now();
  const { ctx, w, h, dpr } = fitCanvas(cv);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!customBg(ctx, "bg.map", w, h)) drawMapBase(ctx, w, h, now);
  drawMapClouds(ctx, w, h, now);
}
function drawMapBase(ctx, w, h, now) {
  ctx.fillStyle = "#123a4c"; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(191,233,228,0.12)"; ctx.lineWidth = 1.5;
  for (let y = 10; y < h; y += 22) { ctx.beginPath(); for (let x = 0; x <= w; x += 12) ctx.lineTo(x, y + Math.sin(x / 20 + y + now / 900) * 2); ctx.stroke(); }
  const cx = w / 2, cy = h * 0.5, R0 = Math.min(w * 0.46, h * 0.44);
  const rr = seeded(11); const pts = []; const n = 28;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const k = 0.82 + rr() * 0.22; pts.push([cx + Math.cos(a) * R0 * k * 1.05, cy + Math.sin(a) * R0 * k * 1.08]); }
  const blob = (scale, fill) => {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const p = pts[i % n], q = pts[(i + 1) % n];
      const px = cx + (p[0] - cx) * scale, py = cy + (p[1] - cy) * scale, qx = cx + (q[0] - cx) * scale, qy = cy + (q[1] - cy) * scale;
      if (i === 0) ctx.moveTo((px + qx) / 2, (py + qy) / 2); else ctx.quadraticCurveTo(px, py, (px + qx) / 2, (py + qy) / 2);
    }
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  };
  blob(1.06, "rgba(191,233,228,0.25)"); blob(1.0, "#e2c88f"); blob(0.9, "#5f9a55");
  // Forêt Verdoyante
  const rt = seeded(5);
  for (let i = 0; i < 34; i++) {
    const a = rt() * Math.PI * 2, d = rt();
    const x = 0.3 * w + Math.cos(a) * d * 0.16 * w, y = 0.62 * h + Math.sin(a) * d * 0.12 * h;
    ctx.fillStyle = i % 2 ? "#2f6e3a" : "#46914f"; ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x + 7, y + 4); ctx.lineTo(x - 7, y + 4); ctx.fill();
  }
  ctx.fillStyle = "#f4dfae"; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.86, w * 0.12, h * 0.04, 0, 0, 7); ctx.fill();
  ctx.setLineDash([4, 6]); ctx.lineWidth = 2.5; ctx.strokeStyle = "rgba(255,179,71,0.85)";
  for (const l of visibleLocs()) { const p = mapPos(l, DATA.locations.indexOf(l)); ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.86); ctx.quadraticCurveTo((0.5 + p[0]) / 2 * w + 20, (0.86 + p[1]) / 2 * h, p[0] * w, p[1] * h); ctx.stroke(); }
  ctx.setLineDash([]);
}
function drawMapClouds(ctx, w, h, now) {
  // nuages sur les zones pas encore découvertes
  const clouds = [[0.62, 0.18, 0.2], [0.3, 0.22, 0.18], [0.78, 0.45, 0.2], [0.5, 0.36, 0.17], [0.86, 0.72, 0.16], [0.16, 0.36, 0.14], [0.66, 0.66, 0.14], [0.45, 0.1, 0.16], [0.9, 0.25, 0.14]];
  const unl = new Set(visibleLocs().map(l => l.id));
  for (const [x0, y0, r0] of clouds) {
    // ne pas couvrir un lieu débloqué
    if ([...unl].some(id => { const p = MAP_POS[id] || [0, 0]; return Math.hypot(p[0] - x0, (p[1] - y0) * 0.8) < r0 * 0.9; })) continue;
    const dx = Math.sin(now / 5000 + x0 * 10) * 6;
    const cim = mediaImg("deco.nuage");
    if (cim) { drawContain(ctx, cim, x0 * w + dx, y0 * h, r0 * w * 2.2); continue; }
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2, x = (x0 + Math.cos(a) * r0 * 0.45) * w + dx, y = (y0 + Math.sin(a) * r0 * 0.3) * h;
      const g = ctx.createRadialGradient(x, y, 4, x, y, r0 * w * 0.55);
      g.addColorStop(0, "rgba(250,252,255,0.97)"); g.addColorStop(0.7, "rgba(235,242,250,0.9)"); g.addColorStop(1, "rgba(235,242,250,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r0 * w * 0.55, 0, 7); ctx.fill();
    }
  }
}
// Toucher la carte : on sélectionne le lieu le plus proche (pas seulement le petit point)
function mapTap(e) {
  if (!G || SCREEN !== "map") return;
  const cv = $("#mapCanvas"), r = cv.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  let best = null, bd = 1e9;
  for (const l of visibleLocs()) {
    const p = mapPos(l, DATA.locations.indexOf(l));
    const d = Math.hypot((p[0] - x) * r.width, (p[1] - y) * r.height);
    if (d < bd) { bd = d; best = l; }
  }
  if (best && bd < Math.min(r.width, r.height) * 0.22) { sfx("tap"); MAPSEL = best.id; refreshMap(); return; }
  if (y < 0.8) toast("Cette partie de l’île est encore cachée sous les nuages.", 2200);
}
function refreshMap() {
  if (!G) return;
  const nodes = $("#mapNodes"); nodes.replaceChildren();
  for (const l of visibleLocs()) {
    const p = mapPos(l, DATA.locations.indexOf(l));
    const done = G.progress.cleared.includes(l.id);
    const b = el("button", "node" + (done ? " done" : "") + (MAPSEL === l.id ? " on" : ""));
    b.type = "button"; b.style.left = (p[0] * 100) + "%"; b.style.top = (p[1] * 100) + "%";
    b.append(el("span", "node-dot"), el("span", "node-label", l.name));
    b.onclick = () => { sfx("tap"); MAPSEL = l.id; refreshMap(); };
    nodes.append(b);
  }
  const home = el("div", "node home"); home.style.left = "50%"; home.style.top = "86%";
  home.append(el("span", "node-dot"), el("span", "node-label", "Plage"));
  nodes.append(home);
  const team = $("#mapTeam"); team.replaceChildren();
  for (const u of G.team) {
    const c = el("button", "team-chip"); c.type = "button";
    const cv = el("canvas", "chip-face");
    c.append(cv, el("span", "chip-name", unitName(u)), el("span", "chip-lv pix", "Niv. " + u.lv));
    c.onclick = () => openTeam();
    team.append(c);
    requestAnimationFrame(() => paintPortrait(cv, u.mid, { still: true }));
  }
  $("#mapHint").hidden = !!MAPSEL || G.story.ch1Done;
  const card = $("#locCard");
  if (!MAPSEL || !LOC[MAPSEL]) { card.hidden = true; return; }
  const l = LOC[MAPSEL]; const done = G.progress.cleared.includes(l.id);
  card.hidden = false; card.replaceChildren();
  const hd = el("div", "loc-hd"); hd.append(el("h3", null, l.name));
  const pips = el("span", "pips"); for (let k = 0; k < 3; k++) pips.append(el("i", k < (l.difficulty || 1) ? "on" : "")); hd.append(pips);
  card.append(hd, el("p", "loc-desc", l.description || ""));
  card.append(el("p", "loc-meta", (l.floors || 4) + " étages · " + (l.crew ? "les voleurs t’attendent au bout" : "gardien au dernier étage") + (done ? " · terminé ✓" : "") + " · nouveau plan à chaque visite"));
  const mons = el("div", "loc-mons");
  for (const id of (l.common_monsters || []).filter(x => MON[x])) {
    const f = el("span", "mini-mon"); const cv = el("canvas"); f.append(cv, el("span", null, MON[id].name)); mons.append(f);
    requestAnimationFrame(() => paintPortrait(cv, id, { still: true, body: true }));
  }
  card.append(mons);
  const row = el("div", "loc-actions");
  const go = el("button", "btn primary", done ? "Explorer à nouveau" : "Explorer"); go.type = "button";
  go.onclick = () => { sfx("tap"); enterDungeon(l.id); };
  const x = el("button", "btn ghost", "Fermer"); x.type = "button"; x.onclick = () => { MAPSEL = null; refreshMap(); };
  row.append(x, go); card.append(row);
}
