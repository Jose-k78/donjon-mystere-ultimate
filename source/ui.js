// ============================================================
//  INTERFACE : écrans, dialogues, menus, rendu du donjon
// ============================================================
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
// Remplace les balises du scénario : {name}, {partner}, {heroSp}, {partnerSp}, {chef}, {sbire1}, {sbire2}
let NG = null; // choix en cours pendant la nouvelle partie
function fillTpl(s) {
  const h = G ? hero() : null, p = G ? partner() : null;
  const sp = mid => (mid && MON[mid] ? MON[mid].name : "?");
  const th = (G && G.thieves) || [];
  return s.replace(/\{name\}/g, (G && G.heroName) || (NG && NG.name) || (h ? sp(h.mid) : "toi"))
    .replace(/\{partner\}/g, p ? unitName(p) : "ton ami")
    .replace(/\{heroSp\}/g, h ? sp(h.mid) : (NG ? sp(NG.hero) : "?"))
    .replace(/\{partnerSp\}/g, p ? sp(p.mid) : "?")
    .replace(/\{recruit\}/g, G && G.team[2] ? unitName(G.team[2]) : "notre nouvel ami")
    .replace(/\{recruitSp\}/g, G && G.team[2] ? sp(G.team[2].mid) : "?")
    .replace(/\{chef\}/g, sp(th[0])).replace(/\{sbire1\}/g, sp(th[1])).replace(/\{sbire2\}/g, sp(th[2]));
}
let SCREEN = "title";
function showScreen(name) {
  SCREEN = name;
  for (const s of $$(".screen")) s.hidden = s.id !== "scr-" + name;
  requestAnimationFrame(() => { resizeAll(); if (name === "map") renderMap(); if (name === "hub") refreshHub(); });
}
function fitCanvas(cv, cap) {
  const dpr = Math.min(cap || 2, window.devicePixelRatio || 1);
  const w = Math.max(1, cv.clientWidth), h = Math.max(1, cv.clientHeight);
  const W = Math.round(w * dpr), H = Math.round(h * dpr);
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const ctx = cv.getContext("2d");
  return { ctx, w, h, dpr };
}

// ------------------------------------------------------------
//  SONS (synthé minuscule)
// ------------------------------------------------------------
let AC = null;
let OPTS = Object.assign({ sound: true, mini: true, fastText: false }, lsGet(LS_OPTS) || {});
function saveOpts() { lsSet(LS_OPTS, OPTS); }
function unlockAudio() {
  if (AC || !OPTS.sound) return;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; }
}
function tone(f, d, type, vol, f2, delay) {
  const t = AC.currentTime + (delay || 0);
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type || "square"; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(vol || 0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + 0.02);
}
function noise(d, vol, delay) {
  const t = AC.currentTime + (delay || 0);
  const b = AC.createBuffer(1, Math.floor(AC.sampleRate * d), AC.sampleRate);
  const ch = b.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
  const s = AC.createBufferSource(), g = AC.createGain(); s.buffer = b; g.gain.value = vol || 0.08;
  s.connect(g); g.connect(AC.destination); s.start(t);
}
function sfx(n) {
  if (!OPTS.sound || !AC) return;
  try {
    switch (n) {
      case "swing": noise(0.08, 0.05); break;
      case "cast": tone(300, 0.18, "triangle", 0.07, 900); break;
      case "hit": tone(140, 0.12, "square", 0.07, 60); noise(0.06, 0.06); break;
      case "hit2": tone(220, 0.1, "square", 0.07, 90); tone(330, 0.12, "square", 0.05, 110, 0.06); break;
      case "miss": tone(900, 0.08, "sine", 0.05, 1300); break;
      case "ko": tone(400, 0.35, "triangle", 0.07, 80); break;
      case "level": [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.14, "square", 0.05, null, i * 0.08)); break;
      case "pick": tone(660, 0.07, "square", 0.05); tone(990, 0.09, "square", 0.05, null, 0.06); break;
      case "heal": tone(523, 0.25, "sine", 0.06); tone(784, 0.3, "sine", 0.05, null, 0.05); break;
      case "zap": tone(1200, 0.15, "sawtooth", 0.04, 200); break;
      case "quake": noise(0.6, 0.12); break;
      case "tp": tone(200, 0.4, "sine", 0.06, 1600); break;
      case "stairs": [440, 392, 349, 294].forEach((f, i) => tone(f, 0.12, "triangle", 0.06, null, i * 0.09)); break;
      case "tap": tone(520, 0.04, "square", 0.03); break;
    }
  } catch (e) { }
}

// ------------------------------------------------------------
//  FEUILLES (menus), DIALOGUES, NOTIFICATIONS
// ------------------------------------------------------------
let SHEET_OPEN = false, DIALOG_OPEN = false;
function openSheet(opts) {
  const sh = $("#sheet");
  $("#sheetTitle").textContent = opts.title || "";
  const body = $("#sheetBody"); body.replaceChildren();
  if (opts.body) body.append(opts.body);
  const act = $("#sheetActions"); act.replaceChildren();
  for (const a of opts.actions || []) {
    const b = el("button", "btn " + (a.cls || ""), a.label);
    b.type = "button";
    if (a.disabled) b.disabled = true;
    b.onclick = () => { sfx("tap"); if (!a.keep) closeSheet(); if (a.fn) a.fn(); };
    act.append(b);
  }
  act.hidden = !(opts.actions && opts.actions.length);
  sh.dataset.dismiss = opts.noDismiss ? "0" : "1";
  sh._onClose = opts.onClose || null;
  sh.hidden = false; SHEET_OPEN = true;
  sh.classList.toggle("tall", !!opts.tall);
  body.scrollTop = 0;
}
function closeSheet() {
  const sh = $("#sheet"); if (sh.hidden) return;
  sh.hidden = true; SHEET_OPEN = false;
  const f = sh._onClose; sh._onClose = null; if (f) f();
}
function toast(text, ms) {
  const t = $("#toast"); t.textContent = text; t.hidden = false;
  clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, ms || 2600);
}
// Dialogue avec effet machine à écrire. lines: [{who, text, cue}]
// ctx.onCue(cue) peut renvoyer une promesse : la boîte se cache pendant l'animation
function speakerOf(who, ctx) {
  const th = (G && G.thieves) || [];
  switch (who) {
    case "partner": return G ? { mid: partner().mid, name: unitName(partner()) } : null;
    case "hero": return G ? { mid: hero().mid, name: unitName(hero()) } : null;
    case "thought": return G ? { mid: hero().mid, name: unitName(hero()), cls: "thought" } : null;
    case "voice": return { name: "???", cls: "voice" };
    case "cry": return { name: "???", cls: "cry" };
    case "shadow": return { name: "???", cls: "shadow", shadow: true };
    case "chef": return th[0] ? { mid: th[0], name: (MON[th[0]] || {}).name } : null;
    case "sbire1": return th[1] ? { mid: th[1], name: (MON[th[1]] || {}).name } : null;
    case "sbire2": return th[2] ? { mid: th[2], name: (MON[th[2]] || {}).name } : null;
    case "boss": return ctx.bossMid ? { mid: ctx.bossMid, name: monById(ctx.bossMid).name } : null;
    case "recruit": return G && G.team[2] ? { mid: G.team[2].mid, name: unitName(G.team[2]) } : (ctx.npcMid ? { mid: ctx.npcMid, name: ctx.npcName } : null);
    case "npc": return ctx.npcMid ? { mid: ctx.npcMid, name: ctx.npcName || monById(ctx.npcMid).name } : (ctx.npcName ? { name: ctx.npcName, badge: ctx.npcBadge || "#9aa" } : null);
  }
  if (typeof CH2_SPEAKERS !== "undefined" && CH2_SPEAKERS[who]) { const c = CH2_SPEAKERS[who]; if (c.shadow) return { name: c.name, shadow: true, cls: "shadow" }; return { name: c.name, mid: castMid(who) }; }
  return null;
}
function runDialog(lines, ctx) {
  ctx = ctx || {};
  return new Promise(resolve => {
    const box = $("#dialog"), nameEl = $("#dlgName"), textEl = $("#dlgText"), pc = $("#dlgPortrait");
    let i = -1, typing = null, full = "", busy = false;
    DIALOG_OPEN = true; box.hidden = false;
    const speed = OPTS.fastText ? 4 : 2;
    const finish = () => { box.hidden = true; DIALOG_OPEN = false; box.onclick = null; document.removeEventListener("keydown", key); resolve(); };
    const show = (L) => {
      const sp = speakerOf(L.who, ctx);
      box.className = "dialog" + (sp && sp.cls ? " " + sp.cls : "") + (L.who ? "" : " narration");
      nameEl.textContent = sp ? sp.name : ""; nameEl.hidden = !(sp && sp.name);
      pc.hidden = !(sp && (sp.mid || sp.shadow || sp.badge));
      if (sp && sp.mid) requestAnimationFrame(() => paintPortrait(pc, sp.mid, { still: true }));
      else if (sp && sp.shadow) requestAnimationFrame(() => paintShadowPortrait(pc));
      else if (sp && sp.badge) requestAnimationFrame(() => paintBadgePortrait(pc, sp.badge, sp.name));
      full = fillTpl(L.text); textEl.textContent = "";
      let k = 0;
      typing = setInterval(() => {
        k += speed; textEl.textContent = full.slice(0, k);
        if (k >= full.length) { clearInterval(typing); typing = null; }
      }, 22);
    };
    const next = async () => {
      if (busy) return;
      if (typing) { clearInterval(typing); typing = null; textEl.textContent = full; return; }
      i++;
      if (i >= lines.length) { finish(); return; }
      const L = lines[i];
      if (ctx.onLine) ctx.onLine(L, i);
      if (L.cue && ctx.onCue) {
        busy = true; box.hidden = true;
        try { await ctx.onCue(L.cue, L); } catch (e) { console.error(e); }
        box.hidden = false; busy = false;
      }
      show(L);
    };
    const key = e => { if (["Enter", " ", "Space"].includes(e.key)) { e.preventDefault(); next(); } };
    document.addEventListener("keydown", key);
    box.onclick = () => { sfx("tap"); next(); };
    next();
  });
}
function paintBadgePortrait(cv, col, name) {
  const { ctx, w, h, dpr } = fitCanvas(cv);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  const r = Math.min(w, h) * 0.4;
  const g = ctx.createRadialGradient(w / 2 - r * 0.3, h / 2 - r * 0.3, r * 0.1, w / 2, h / 2, r);
  g.addColorStop(0, "#ffffff"); g.addColorStop(0.25, col); g.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, 7); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.font = `700 ${Math.round(r * 0.9)}px "Lilita One", sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText((name || "?").trim().charAt(0).toUpperCase(), w / 2, h / 2 + r * 0.05);
}
function paintShadowPortrait(cv) {
  const { ctx, w, h, dpr } = fitCanvas(cv);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  drawShadowFigure(ctx, w / 2, h * 1.05, h * 0.95, performance.now());
}
// Choix (boutons) affichés au-dessus du bas de l'écran
function runChoice(options, prompt) {
  return new Promise(resolve => {
    const box = $("#choice"); box.replaceChildren();
    if (prompt) box.append(el("p", "choice-q", fillTpl(prompt)));
    options.forEach((o, i) => {
      const b = el("button", "btn " + (i === 0 ? "primary" : ""), fillTpl(o)); b.type = "button";
      b.onclick = () => { sfx("tap"); box.hidden = true; resolve(i); };
      box.append(b);
    });
    box.hidden = false;
    const f = box.querySelector("button"); if (f) f.focus({ preventScroll: true });
  });
}
// Saisie d'un nom
function runNameInput(title, def) {
  return new Promise(resolve => {
    const box = $("#nameBox"), inp = $("#nameIn");
    $("#nameTitle").textContent = title;
    inp.value = ""; inp.placeholder = def;
    box.hidden = false;
    setTimeout(() => { try { inp.focus(); } catch (e) { } }, 80);
    const done = () => { const v = (inp.value || "").trim().slice(0, 12) || def; box.hidden = true; $("#nameOk").onclick = null; inp.onkeydown = null; sfx("tap"); resolve(v); };
    $("#nameOk").onclick = done;
    inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); done(); } };
  });
}
function typeChip(t) { const s = el("span", "chip", t); s.style.setProperty("--tc", TYPE_COLORS[t] || "#999"); return s; }
function statBars(m) {
  const wrap = el("div", "stats");
  for (const [k, lab, max] of [["hp", "PV", 70], ["attack", "Attaque", 35], ["defense", "Défense", 40], ["speed", "Vitesse", 35]]) {
    const row = el("div", "stat");
    row.append(el("span", "stat-l", lab));
    const bar = el("span", "stat-b"); const i = el("i"); i.style.width = clamp((m[k] || 0) / max * 100, 4, 100) + "%"; bar.append(i);
    row.append(bar, el("span", "stat-v", String(m[k] || 0)));
    wrap.append(row);
  }
  return wrap;
}
function moveList(ids, unit) {
  const ul = el("ul", "moves");
  for (const id of ids) {
    const a = ATK[id]; if (!a) continue;
    const li = el("li", "move");
    li.append(typeChip(a.type), el("span", "mv-name", a.name));
    const meta = el("span", "mv-meta", (a.power ? "Puiss. " + a.power : "Statut") + (unit ? " · PP " + (unit.pp[id] ?? a.pp) + "/" + a.pp : " · PP " + a.pp));
    li.append(meta);
    ul.append(li);
  }
  return ul;
}
// ------------------------------------------------------------
//  ÉQUIPE / SAC / CAPACITÉS
// ------------------------------------------------------------
function unitCard(u) {
  const m = monById(u.mid);
  const c = el("div", "ucard" + (u.ko ? " ko" : ""));
  const top = el("div", "ucard-top");
  const cv = el("canvas", "ucard-face"); top.append(cv);
  const info = el("div", "ucard-info");
  info.append(el("h4", null, unitName(u) + (u.kind === "hero" ? "" : u.kind === "partner" ? "  · partenaire" : "  · coéquipier")));
  const ty = el("div", "types"); for (const t of m.types || []) ty.append(typeChip(t)); info.append(ty);
  const mx = maxHP(u);
  const hp = el("div", "bar-row"); hp.append(el("span", "pix", "PV")); const hb = el("span", "hpbar"); const hi = el("i"); hi.style.width = clamp(u.hp / mx * 100, 0, 100) + "%"; hb.append(hi); hp.append(hb, el("span", "pix", Math.max(0, u.hp) + "/" + mx));
  const xp = el("div", "bar-row"); xp.append(el("span", "pix", "XP")); const xb = el("span", "xpbar"); const xi = el("i"); xi.style.width = clamp(u.xp / xpNeed(u.lv) * 100, 0, 100) + "%"; xb.append(xi); xp.append(xb, el("span", "pix", "Niv. " + u.lv));
  info.append(hp, xp);
  top.append(info);
  c.append(top);
  const st = el("p", "ucard-stats pix", "Atq " + Math.round(statOf(u, "attack")) + " · Déf " + Math.round(statOf(u, "defense")) + " · Vit " + (m.speed || 0));
  c.append(st);
  c.append(moveList(unitMoves(u), u));
  requestAnimationFrame(() => paintPortrait(cv, u.mid, { still: true }));
  return c;
}
function openTeam() {
  const body = el("div", "team-list");
  for (const u of G.team) {
    body.append(unitCard(u));
    const row = el("div", "row-btns");
    const eq = el("span", "sheet-note", u.equip && ITEMS[u.equip] ? "Équipé : " + ITEMS[u.equip].name : "Pas d’équipement");
    const bb = el("button", "btn small", (u.kind === "hero" ? "Équipement" : "Sac (" + (u.bag || []).length + ")")); bb.type = "button";
    bb.onclick = () => openAllyBag(u, openTeam);
    row.append(eq, bb); body.append(row);
  }
  openSheet({ title: "Équipe", body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}
function openBag(inDungeon) {
  const body = el("div", "bag");
  body.append(el("p", "sheet-note", G.bag.length + " / " + BAG_MAX + " objets"));
  if (!G.bag.length) body.append(el("p", "empty", "Ton sac est vide. Ramasse des objets dans les donjons."));
  const counts = {};
  G.bag.forEach((id, i) => { (counts[id] = counts[id] || []).push(i); });
  for (const id of Object.keys(counts)) {
    const it = ITEMS[id]; if (!it) continue;
    const b = el("button", "bag-item"); b.type = "button";
    b.append(itemIconCanvas(id, 30));
    const tx = el("span", "bag-tx"); tx.append(el("b", null, it.name + (counts[id].length > 1 ? "  ×" + counts[id].length : "")), el("small", null, it.desc));
    b.append(tx);
    b.onclick = () => itemActions(counts[id][0], inDungeon);
    body.append(b);
  }
  openSheet({ title: "Sac", body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}
function itemActions(idx, inDungeon) {
  const id = G.bag[idx]; const it = ITEMS[id];
  const acts = [];
  const usable = !["revive", "treasure", "money", "throw", "sleepseed", "equip"].includes(it.kind);
  if (inDungeon && R) {
    if (usable) acts.push({ label: "Utiliser", cls: "primary", fn: () => dungeonAct(() => useItem(idx, hero())) });
    acts.push({ label: "Lancer", cls: usable || it.kind === "equip" ? "" : "primary", fn: () => dungeonAct(() => throwItem(idx)) });
    if (it.kind === "equip") for (const p of G.team.filter(u => !u.ko && u.hp > 0)) acts.push({ label: "Équiper sur " + unitName(p), fn: () => dungeonAct(() => useItem(idx, p)) });
    for (const p of teamAllies()) {
      if (["heal", "fullheal", "pp"].includes(it.kind)) acts.push({ label: "Donner à " + unitName(p), fn: () => dungeonAct(() => useItem(idx, p)) });
      else if ((p.bag || []).length < ALLY_BAG) acts.push({ label: "Confier à " + unitName(p), fn: () => { p.bag = p.bag || []; p.bag.push(G.bag.splice(idx, 1)[0]); toast(unitName(p) + " garde " + it.name + "."); } });
    }
    acts.push({ label: "Poser au sol", fn: () => dungeonAct(() => dropItem(idx)) });
  } else {
    if (it.kind === "equip") for (const p of G.team) acts.push({ label: "Équiper sur " + unitName(p), cls: "primary", fn: () => { applyItemOutside(G.bag, idx, p); } });
    acts.push({ label: "Jeter", cls: "danger", fn: () => confirmThrowAway(idx) });
  }
  acts.push({ label: "Retour", cls: "ghost", fn: () => openBag(inDungeon) });
  const body = el("div", "item-detail");
  body.append(itemIconCanvas(id, 48), el("p", null, it.desc));
  openSheet({ title: it.name, body, actions: acts });
}
function confirmThrowAway(idx) {
  const id = G.bag[idx]; const it = ITEMS[id]; if (!it) return;
  openSheet({ title: "Jeter " + it.name + " ?", body: el("p", "sheet-text", "L’objet sera perdu pour de bon."), actions: [
    { label: "Garder", cls: "ghost", fn: () => openBag(false) },
    { label: "Jeter", cls: "danger", fn: () => { G.bag.splice(idx, 1); Store.saveGame(G); toast(it.name + " jeté."); } }
  ] });
}
function openMoves() {
  const h = hero();
  const body = el("div", "move-pick");
  const mk = (mv, ppTxt, disabled, fn) => {
    const b = el("button", "move-btn"); b.type = "button"; b.disabled = disabled;
    b.style.setProperty("--tc", TYPE_COLORS[mv.type] || "#999");
    const l1 = el("span", "mvb-top"); l1.append(el("b", null, mv.name), el("span", "pix", ppTxt));
    const bits = [mv.type, mv.power ? "Puiss. " + mv.power : "Statut", "Préc. " + (mv.accuracy ?? 100) + "%", RANGE_LABELS[moveRange(mv)]];
    if (mv.effect && EFFECT_LABELS[mv.effect] && mv.effect !== "hit_all") bits.push(EFFECT_LABELS[mv.effect]);
    const l2 = el("small", null, bits.join(" · "));
    b.append(l1, l2);
    b.onclick = () => { closeSheet(); fn(); };
    return b;
  };
  body.append(mk(BASIC_ATTACK, "∞", false, () => dungeonAct(() => heroAttack(null))));
  for (const id of unitMoves(h)) {
    const mv = ATK[id];
    body.append(mk(mv, (h.pp[id] || 0) + "/" + mv.pp, (h.pp[id] || 0) <= 0, () => dungeonAct(() => heroAttack(id))));
  }
  openSheet({ title: "Capacités", body, actions: [{ label: "Fermer", cls: "ghost" }] });
}

