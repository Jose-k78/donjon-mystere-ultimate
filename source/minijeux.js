// ============================================================
//  MINI-JEUX ET ACTIVITÉS : pêche, salle des jeux, lots,
//  invocations, trophées, sauvegarde user_save.json
// ============================================================
function mgState() { G.mg = G.mg || {}; G.fish = G.fish || {}; G.tickets = G.tickets || 0; G.trophies = G.trophies || {}; return G.mg; }
// ---------- fenêtre de mini-jeu ----------
function openMini(title, onClose) {
  closeMini();
  const root = el("div", "mg-overlay"); root.id = "mgOverlay";
  const head = el("div", "mg-head");
  const t = el("b", "mg-title", title); const sc = el("span", "mg-score pix", "");
  const x = el("button", "btn small ghost", "Quitter"); x.type = "button";
  head.append(t, sc, x);
  const content = el("div", "mg-content");
  root.append(head, content);
  document.body.append(root);
  if (typeof RM !== "undefined") RM.paused = true;
  const M = { root, content, score: sc, closed: false, timers: [], raf: 0 };
  M.close = () => { if (M.closed) return; M.closed = true; for (const t2 of M.timers) clearTimeout(t2); cancelAnimationFrame(M.raf); root.remove(); if (typeof RM !== "undefined") RM.paused = false; MINI = null; if (onClose) onClose(); };
  x.onclick = () => { sfx("tap"); M.close(); };
  MINI = M;
  return M;
}
let MINI = null;
function closeMini() { if (MINI) MINI.close(); }
function giveTickets(n, why) { mgState(); G.tickets += n; Store.saveGame(G); toast("+" + n + " jetons" + (why ? " · " + why : ""), 2200); checkTrophies(); }

// ---------- PÊCHE ----------
function fishLeft() { const m = mgState(); if (m.fishDay !== today()) { m.fishDay = today(); m.fishN = 0; } return FISH_PER_DAY - m.fishN; }
async function talkFisher(n) {
  const c = { npcMid: n.mid, npcName: "Papy Bulle" };
  const first = !mgState().metFisher;
  if (first) {
    await townTalk([
      { who: "npc", text: "Hé, jeunot ! Tu as une tête de pêcheur. Si, si, je le vois au nez." },
      { who: "npc", text: "Tu lances la ligne, tu attends que ça morde, et tu ferres quand l’aiguille est dans la zone verte. Trois fois de suite, et le poisson est à toi !" },
      { who: "npc", text: "Moi, ça fait quarante ans que je cherche le Vieux Barbu. Le roi de l’étang. Un jour, peut-être…" }
    ], c);
    mgState().metFisher = true; Store.saveGame(G);
  }
  const left = fishLeft();
  const ch = await runChoice([left > 0 ? "Pêcher (" + left + " lancers aujourd’hui)" : "Plus de lancers aujourd’hui", "Carnet de pêche", "Plus tard"], "Étang du Royaume");
  if (ch === 0 && left > 0) openFishing();
  else if (ch === 0) await townTalk([{ who: "npc", text: "Les poissons dorment, jeunot. Reviens demain, après une bonne nuit." }], c);
  else if (ch === 1) openFishBook();
}
function rollFish() {
  const lv = hero().lv;
  const pool = FISH.filter(f => f.r < 4 || (lv >= 12 && rnd() < 0.35));
  const tot = pool.reduce((s, f) => s + f.w, 0); let r = rnd() * tot;
  for (const f of pool) { r -= f.w; if (r <= 0) return f; }
  return pool[0];
}
function openFishing() {
  const M = openMini("Pêche à l’étang");
  const info = el("p", "mg-info", "Touche « Lancer » puis attends que ça morde.");
  const pond = el("div", "fish-pond"); const bob = el("div", "fish-bob"); pond.append(bob);
  const bar = el("div", "fish-bar"); const zone = el("i", "fish-zone"); const needle = el("b", "fish-needle"); bar.append(zone, needle); bar.hidden = true;
  const dots = el("div", "fish-dots");
  const btn = el("button", "btn primary big", "Lancer la ligne"); btn.type = "button";
  M.content.append(info, pond, bar, dots, btn);
  let state = "idle", fish = null, hits = 0, miss = 0, pos = 0, dir = 1, speed = 0.9, zw = 0.3, zx = 0.35, lastT = 0;
  const upd = () => { M.score.textContent = fishLeft() + " lancers"; dots.textContent = "●".repeat(hits) + "○".repeat(Math.max(0, 3 - hits)) + "   " + "✗".repeat(miss); };
  upd();
  const anim = now => {
    if (M.closed) return;
    if (state === "reel") {
      const dt = Math.min(50, now - (lastT || now)) / 1000; lastT = now;
      pos += dir * speed * dt; if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; }
      if (fish.r >= 3 && rnd() < 0.02) dir *= -1;
      needle.style.left = (pos * 100) + "%";
    }
    bob.style.transform = "translate(-50%," + (state === "bite" ? Math.sin(now / 60) * 6 : Math.sin(now / 500) * 3) + "px)";
    M.raf = requestAnimationFrame(anim);
  };
  M.raf = requestAnimationFrame(anim);
  const newZone = () => { zw = clamp(0.32 - fish.r * 0.06, 0.1, 0.32); zx = rnd() * (1 - zw); zone.style.left = (zx * 100) + "%"; zone.style.width = (zw * 100) + "%"; };
  btn.onclick = () => {
    sfx("tap");
    if (state === "idle") {
      if (fishLeft() <= 0) { info.textContent = "Plus de lancers aujourd’hui. Reviens demain !"; return; }
      mgState().fishN++; Store.saveGame(G); upd();
      state = "wait"; hits = 0; miss = 0; info.textContent = "…"; btn.textContent = "…"; btn.disabled = true; bob.classList.add("in");
      M.timers.push(setTimeout(() => {
        if (M.closed) return;
        fish = rollFish(); state = "bite"; info.textContent = "Ça mord ! Ferre quand l’aiguille est dans le vert !"; sfx("pick");
        speed = 0.7 + fish.r * 0.35; newZone(); bar.hidden = false; pos = 0; dir = 1; lastT = 0; state = "reel";
        btn.disabled = false; btn.textContent = "Ferrer !"; upd();
      }, 900 + rnd() * 2000));
      return;
    }
    if (state === "reel") {
      const ok = pos >= zx && pos <= zx + zw;
      if (ok) { hits++; sfx("hit"); bar.classList.add("ok"); setTimeout(() => bar.classList.remove("ok"), 200); newZone(); speed *= 1.12; }
      else { miss++; sfx("miss"); bar.classList.add("ko"); setTimeout(() => bar.classList.remove("ko"), 200); }
      upd();
      if (hits >= 3) { state = "idle"; bar.hidden = true; bob.classList.remove("in"); catchFish(fish, info); btn.textContent = "Relancer"; }
      else if (miss >= 3) { state = "idle"; bar.hidden = true; bob.classList.remove("in"); info.textContent = "Le poisson s’est échappé… (" + (fish.r >= 3 ? "c’était un gros !" : "dommage") + ")"; btn.textContent = "Relancer"; }
    }
  };
}
function catchFish(f, info) {
  mgState();
  const size = Math.round((10 + f.r * 12) * (0.7 + rnd() * 0.6));
  const rec = G.fish[f.id] || { n: 0, best: 0 };
  const isNew = !G.fish[f.id];
  rec.n++; const record = size > rec.best; rec.best = Math.max(rec.best, size); G.fish[f.id] = rec;
  G.money = (G.money || 0) + f.val; G.tickets += f.r * 2;
  sfx("level");
  info.textContent = (isNew ? "NOUVEAU ! " : "") + f.name + " (" + size + " cm" + (record && !isNew ? ", record !" : "") + ") · +" + f.val + " pièces, +" + f.r * 2 + " jetons";
  Store.saveGame(G);
  checkTrophies();
}
function openFishBook() {
  mgState();
  const body = el("div", "chapters");
  body.append(el("p", "sheet-note", fishCount(G) + " / " + FISH.length + " espèces pêchées."));
  for (const f of FISH) {
    const r = G.fish[f.id];
    const c = el("div", "chap" + (r ? " done" : " locked"));
    c.append(el("b", null, r ? f.name : "???"), el("small", null, r ? FISH_RANK[f.r] + " · " + r.n + " pris · record " + r.best + " cm · " + f.desc : FISH_RANK[f.r] + " · pas encore pêché"));
    body.append(c);
  }
  openSheet({ title: "Carnet de pêche", body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}

// ---------- SALLE DES JEUX ----------
async function openGamesHall() {
  mgState();
  if (!G.mg.metArcade) {
    await townTalk([
      { who: "arcade", text: "Bienvenue à la Salle des Jeux ! Ici, on gagne des jetons, et les jetons s’échangent contre des lots !" },
      { who: "arcade", text: "Mémoire des Runes, Tir aux Baies, Défi des Types… Il y en a pour tous les cerveaux. Même le tien, mon chou." }
    ]);
    G.mg.metArcade = true; Store.saveGame(G);
  }
  const body = el("div", "pause-grid");
  const add = (label, fn, cls) => { const b = el("button", "btn small " + (cls || ""), label); b.type = "button"; b.onclick = () => { sfx("tap"); closeSheet(); fn(); }; body.append(b); };
  add("Mémoire des Runes", openMemoryMenu);
  add("Tir aux Baies", openWhack);
  add("Défi des Types", openQuiz);
  add("Comptoir des lots", openPrizes, "primary");
  const note = el("p", "sheet-note", "Tu as " + (G.tickets || 0) + " jetons. Record Tir aux Baies : " + (G.mg.whack || 0) + " · Défi des Types : " + (G.mg.quiz || 0) + "/10");
  const wrap = el("div"); wrap.append(body, note);
  openSheet({ title: "Salle des Jeux", body: wrap, actions: [{ label: "Fermer", cls: "ghost" }] });
}
// Mémoire des Runes : retrouver les paires de créatures
function openMemoryMenu() {
  openSheet({ title: "Mémoire des Runes", body: el("p", "sheet-text", "Retourne les cartes deux par deux et retrouve toutes les paires de créatures. Moins tu fais de coups, plus tu gagnes de jetons."), actions: [
    { label: "Facile (6 paires)", fn: () => playMemory(6, 4) }, { label: "Normal (8 paires)", fn: () => playMemory(8, 4) }, { label: "Difficile (10 paires)", cls: "primary", fn: () => playMemory(10, 5) }, { label: "Fermer", cls: "ghost" }
  ] });
}
function playMemory(pairs, cols) {
  const M = openMini("Mémoire des Runes");
  const mids = storyMons().sort(() => rnd() - 0.5).slice(0, pairs);
  const deck = mids.concat(mids).sort(() => rnd() - 0.5);
  const grid = el("div", "mem-grid"); grid.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
  M.content.append(grid);
  let open = [], found = 0, moves = 0, lock = false; const t0 = performance.now();
  const upd = () => { M.score.textContent = moves + " coups · " + found + "/" + pairs; };
  upd();
  deck.forEach(mid => {
    const card = el("button", "mem-card"); card.type = "button";
    const cv = el("canvas"); card.append(cv); card.dataset.mid = mid;
    card.onclick = () => {
      if (lock || card.classList.contains("up") || card.classList.contains("done")) return;
      card.classList.add("up"); sfx("tap");
      requestAnimationFrame(() => paintPortrait(cv, mid, { still: true }));
      open.push(card);
      if (open.length === 2) {
        moves++; lock = true; upd();
        const [a, b] = open;
        if (a.dataset.mid === b.dataset.mid) { a.classList.add("done"); b.classList.add("done"); found++; open = []; lock = false; sfx("pick"); upd();
          if (found === pairs) {
            const secs = Math.round((performance.now() - t0) / 1000);
            const gain = Math.max(3, Math.round(pairs * 3 - (moves - pairs) * 0.8));
            if (pairs >= 10) mgState().memHard = true;
            M.timers.push(setTimeout(() => { M.content.append(el("p", "mg-info", "Bravo ! " + moves + " coups en " + secs + " s.")); giveTickets(gain, "Mémoire des Runes"); }, 300));
          }
        } else M.timers.push(setTimeout(() => { a.classList.remove("up"); b.classList.remove("up"); open = []; lock = false; }, 800));
      }
    };
    grid.append(card);
  });
}
// Tir aux Baies : touche les créatures, évite les ombres
function openWhack() {
  const M = openMini("Tir aux Baies");
  const grid = el("div", "whack-grid");
  const info = el("p", "mg-info", "Touche les créatures qui sortent des trous. Évite les ombres ! 30 secondes.");
  const btn = el("button", "btn primary big", "C’est parti !"); btn.type = "button";
  M.content.append(info, grid, btn);
  const holes = [];
  for (let i = 0; i < 9; i++) { const h = el("button", "whack-hole"); h.type = "button"; const cv = el("canvas"); h.append(cv); grid.append(h); holes.push({ h, cv, on: false, shadow: false, t: 0 }); }
  let score = 0, end = 0, running = false;
  const pool = storyMons();
  const upd = () => { M.score.textContent = score + " pts" + (running ? " · " + Math.max(0, Math.ceil((end - performance.now()) / 1000)) + " s" : ""); };
  holes.forEach(o => { o.h.onclick = () => { if (!running || !o.on) return; o.on = false; o.h.classList.remove("on", "shadow"); if (o.shadow) { score = Math.max(0, score - 2); sfx("miss"); } else { score++; sfx("hit"); } upd(); }; });
  const pop = () => {
    if (!running || M.closed) return;
    const free = holes.filter(o => !o.on); if (free.length) {
      const o = pick(free); o.on = true; o.shadow = rnd() < 0.22; o.h.classList.add("on"); o.h.classList.toggle("shadow", o.shadow);
      const mid = pick(pool); requestAnimationFrame(() => paintPortrait(o.cv, mid, { still: true }));
      const life = Math.max(450, 1000 - (30000 - (end - performance.now())) / 60);
      M.timers.push(setTimeout(() => { o.on = false; o.h.classList.remove("on", "shadow"); }, life));
    }
    M.timers.push(setTimeout(pop, Math.max(330, 700 - (30000 - (end - performance.now())) / 80)));
  };
  const tick = () => { if (M.closed) return; upd(); if (running && performance.now() >= end) { running = false; for (const o of holes) { o.on = false; o.h.classList.remove("on", "shadow"); } const best = mgState().whack || 0; if (score > best) G.mg.whack = score; info.textContent = "Terminé ! " + score + " points" + (score > best ? " · nouveau record !" : ""); btn.hidden = false; btn.textContent = "Rejouer"; giveTickets(Math.max(1, Math.floor(score / 2)), "Tir aux Baies"); return; } M.timers.push(setTimeout(tick, 200)); };
  btn.onclick = () => { sfx("tap"); score = 0; end = performance.now() + 30000; running = true; btn.hidden = true; info.textContent = "Vite !"; pop(); tick(); };
  upd();
}
// Défi des Types : la table des types en quiz
function quizCategory(m) { return m >= 1.2 ? 0 : m >= 0.95 ? 1 : m > 0.45 ? 2 : 3; }
const QUIZ_LABELS = ["Super efficace", "Efficace (normal)", "Peu efficace", "Presque sans effet"];
function openQuiz() {
  const M = openMini("Défi des Types");
  const q = el("div", "quiz-q"); const opts = el("div", "quiz-opts"); const fb = el("p", "mg-info", "");
  M.content.append(q, opts, fb);
  let n = 0, good = 0;
  const mons = DATA.monsters.filter(m => !m.story);
  const next = () => {
    if (M.closed) return;
    if (n >= 10) {
      q.replaceChildren(el("b", null, "Score : " + good + " / 10"));
      opts.replaceChildren();
      if (good > (mgState().quiz || 0)) G.mg.quiz = good;
      giveTickets(good * 3 + (good === 10 ? 10 : 0), "Défi des Types");
      const again = el("button", "btn primary", "Rejouer"); again.type = "button"; again.onclick = () => { closeMini(); openQuiz(); }; opts.append(again);
      return;
    }
    n++; M.score.textContent = "Question " + n + "/10 · " + good + " bonnes";
    const atk = pick(TYPES), mon = pick(mons), mult = typeMult(atk, mon.types || ["Normal"]), ans = quizCategory(mult);
    q.replaceChildren(el("span", null, "Une attaque "), typeChip(atk), el("span", null, " contre " + mon.name + " "), ...(mon.types || []).map(typeChip), el("span", null, " ?"));
    opts.replaceChildren();
    QUIZ_LABELS.forEach((lab, i) => {
      const b = el("button", "btn", lab); b.type = "button";
      b.onclick = () => {
        for (const x of opts.children) x.disabled = true;
        if (i === ans) { good++; sfx("pick"); b.classList.add("primary"); fb.textContent = "Exact ! (×" + (Math.round(mult * 100) / 100) + ")"; }
        else { sfx("miss"); b.classList.add("danger"); opts.children[ans].classList.add("primary"); fb.textContent = "Raté : c’était « " + QUIZ_LABELS[ans] + " » (×" + (Math.round(mult * 100) / 100) + ")."; }
        M.timers.push(setTimeout(next, 1300));
      };
      opts.append(b);
    });
    fb.textContent = "";
  };
  next();
}
function openPrizes() {
  mgState();
  const body = el("div", "bag-list");
  body.append(el("p", "sheet-note", "Tu as " + G.tickets + " jetons."));
  for (const p of PRIZES) {
    const it = ITEMS[p.id]; const name = p.name || (it && it.name); if (!name) continue;
    const b = el("button", "btn small" + (G.tickets >= p.cost ? " primary" : ""), name + " · " + p.cost + " jetons"); b.type = "button";
    b.disabled = G.tickets < p.cost;
    b.onclick = () => {
      if (G.tickets < p.cost) return;
      if (p.id === "_shards5") G.shards = (G.shards || 0) + 5;
      else { if (G.bag.length >= BAG_MAX) { toast("Ton sac est plein !"); return; } G.bag.push(p.id); }
      G.tickets -= p.cost; sfx("level"); Store.saveGame(G); toast(name + " obtenu !"); closeSheet(); openPrizes();
    };
    body.append(b);
  }
  openSheet({ title: "Comptoir des lots", body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}

// ---------- INVOCATIONS (Éclats d'étoile) ----------
const INVOC_COST = 10;
function openInvocations() {
  const body = el("div", "result");
  body.append(el("p", "sheet-text", "Tu as " + (G.shards || 0) + " Éclats d’étoile."));
  body.append(el("p", "sheet-text dim", "Une invocation coûte " + INVOC_COST + " éclats et appelle une créature au hasard, qui rejoint ton dortoir. Commune 80 %, rare 17 %, légendaire 3 %."));
  openSheet({ title: "Invocations", body, actions: [
    { label: "Fermer", cls: "ghost" },
    { label: "×10 (" + (INVOC_COST * 9) + ")", fn: () => doInvoc(10) },
    { label: "Invoquer (" + INVOC_COST + ")", cls: "primary", fn: () => doInvoc(1) }
  ] });
}
function invocRoll() {
  const r = rnd() * 100; const rar = r < 3 ? 3 : r < 20 ? 2 : 1;
  let pool = DATA.monsters.filter(m => !m.story && (m.rarity || 1) === rar);
  if (!pool.length) pool = DATA.monsters.filter(m => !m.story);
  return pick(pool).id;
}
function doInvoc(n) {
  const cost = n === 10 ? INVOC_COST * 9 : INVOC_COST * n;
  if ((G.shards || 0) < cost) { toast("Pas assez d’Éclats d’étoile (" + cost + " nécessaires)."); return; }
  G.shards -= cost; mgState(); G.mg.invoc = (G.mg.invoc || 0) + n;
  G.reserve = G.reserve || [];
  const got = [];
  for (let i = 0; i < n; i++) { const mid = invocRoll(); const u = makeUnit(mid, Math.max(1, hero().lv - 2), "ally"); G.reserve.push(u); got.push(u); }
  Store.saveGame(G); sfx("level");
  const body = el("div", "invoc-grid");
  for (const u of got) {
    const c = el("div", "invoc-card"); const r = rarityOf(u.mid); c.style.setProperty("--rc", r.col || "#ccc");
    const cv = el("canvas"); c.append(cv, el("b", null, monById(u.mid).name), el("small", null, r.name + " · Niv. " + u.lv));
    requestAnimationFrame(() => paintPortrait(cv, u.mid, { still: true }));
    body.append(c);
  }
  openSheet({ title: n > 1 ? "Invocation ×10 !" : "Invocation !", body, actions: [{ label: "Encore", fn: openInvocations }, { label: "Super !", cls: "primary" }], tall: n > 1 });
  checkTrophies();
}

// ---------- TROPHÉES ----------
function checkTrophies() {
  if (!G) return;
  mgState();
  for (const t of TROPHIES) {
    if (G.trophies[t.id]) continue;
    let ok = false; try { ok = !!t.test(G); } catch (e) { }
    if (!ok) continue;
    G.trophies[t.id] = today();
    G.shards = (G.shards || 0) + t.rew;
    toast("🏆 Trophée : " + t.name + " (+" + t.rew + " Éclats)", 3200);
  }
  Store.saveGame(G);
}
function openTrophies() {
  checkTrophies();
  const body = el("div", "chapters");
  const n = TROPHIES.filter(t => G.trophies[t.id]).length;
  body.append(el("p", "sheet-note", n + " / " + TROPHIES.length + " trophées."));
  for (const t of TROPHIES) { const c = el("div", "chap" + (G.trophies[t.id] ? " done" : " locked")); c.append(el("b", null, (G.trophies[t.id] ? "🏆 " : "") + t.name), el("small", null, t.desc + " · +" + t.rew + " Éclats")); body.append(c); }
  openSheet({ title: "Trophées", body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}

// ---------- SAUVEGARDE user_save.json (fichier et dépôt GitHub) ----------
const GH_KEY = "dmu-github";
function ghConf() { return Object.assign({ repo: "Jose-k78/donjon-mystere-ultimate", token: "" }, lsGet(GH_KEY) || {}); }
function saveJson() { return JSON.stringify(Object.assign({ format: "donjon-mystere-ultimate", exportedAt: new Date().toISOString() }, { save: G }), null, 1); }
function openSaveSheet() {
  const body = el("div", "result");
  body.append(el("p", "sheet-text dim", "Ta sauvegarde (avec ton choix d’Ordre, tes liens et tes trophées) tient dans un fichier user_save.json."));
  const row = el("div", "pause-grid");
  const add = (label, fn, cls) => { const b = el("button", "btn small " + (cls || ""), label); b.type = "button"; b.onclick = () => { sfx("tap"); fn(); }; row.append(b); };
  if (G) add("Télécharger user_save.json", () => downloadBlob("user_save.json", new Blob([saveJson()], { type: "application/json" })), "primary");
  add("Importer un fichier", () => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json"; inp.onchange = async () => { const f = inp.files && inp.files[0]; if (f) importSaveText(await f.text()); }; inp.click(); });
  body.append(row);
  body.append(el("h4", "fld-h", "Synchroniser avec GitHub"));
  const c = ghConf();
  const repo = el("input", "inp"); repo.value = c.repo; repo.placeholder = "compte/dépôt";
  const tok = el("input", "inp"); tok.type = "password"; tok.value = c.token; tok.placeholder = "Jeton GitHub (contenu : lecture/écriture)"; tok.autocomplete = "off";
  body.append(el("small", "sheet-note", "Dépôt"), repo, el("small", "sheet-note", "Jeton (gardé seulement sur cet appareil)"), tok);
  const row2 = el("div", "pause-grid");
  const add2 = (label, fn, cls) => { const b = el("button", "btn small " + (cls || ""), label); b.type = "button"; b.onclick = () => { sfx("tap"); lsSet(GH_KEY, { repo: repo.value.trim(), token: tok.value.trim() }); fn(); }; row2.append(b); };
  if (G) add2("Envoyer sur GitHub", () => ghPushSave(), "primary");
  add2("Récupérer depuis GitHub", () => ghPullSave());
  body.append(row2);
  body.append(el("p", "sheet-note", "Le jeton se crée sur github.com → Settings → Developer settings → Fine-grained tokens, limité au dépôt du jeu, avec « Contents : Read and write ». Sans jeton, tu peux quand même récupérer un user_save.json déjà présent dans un dépôt public."));
  openSheet({ title: "Sauvegarde", body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}
function b64utf8(s) { return btoa(unescape(encodeURIComponent(s))); }
function utf8b64(s) { return decodeURIComponent(escape(atob(String(s).replace(/\s/g, "")))); }
async function ghPushSave() {
  const c = ghConf(); if (!c.token) { toast("Ajoute d’abord ton jeton GitHub."); return; }
  const url = "https://api.github.com/repos/" + c.repo + "/contents/user_save.json";
  const hd = { Authorization: "Bearer " + c.token, Accept: "application/vnd.github+json" };
  try {
    let sha;
    const g = await fetch(url, { headers: hd }); if (g.ok) sha = (await g.json()).sha;
    const r = await fetch(url, { method: "PUT", headers: Object.assign({ "Content-Type": "application/json" }, hd), body: JSON.stringify({ message: "Sauvegarde du jeu (" + storyChapterLabel() + ", jour " + today() + ")", content: b64utf8(saveJson()), sha }) });
    if (!r.ok) throw new Error("GitHub a répondu " + r.status);
    toast("Sauvegarde envoyée sur GitHub !", 2600);
  } catch (e) { toast("Envoi impossible : " + ((e && e.message) || e), 3600); }
}
async function ghPullSave() {
  const c = ghConf();
  const hd = { Accept: "application/vnd.github+json" }; if (c.token) hd.Authorization = "Bearer " + c.token;
  try {
    const r = await fetch("https://api.github.com/repos/" + c.repo + "/contents/user_save.json", { headers: hd });
    if (!r.ok) throw new Error(r.status === 404 ? "pas de user_save.json dans le dépôt" : "GitHub a répondu " + r.status);
    importSaveText(utf8b64((await r.json()).content));
  } catch (e) { toast("Récupération impossible : " + ((e && e.message) || e), 3600); }
}
function importSaveText(txt) {
  let data; try { data = JSON.parse(txt); } catch (e) { toast("Fichier illisible."); return; }
  const s = sanitizeSave(data && data.save ? data.save : data);
  if (!s) { toast("Ce fichier n’est pas une sauvegarde du jeu."); return; }
  openSheet({ title: "Charger cette sauvegarde ?", body: el("p", "sheet-text", unitName(s.team[0]) + " · Niv. " + s.team[0].lv + " · " + (s.money || 0) + " pièces. Ta partie actuelle sera remplacée."), actions: [
    { label: "Annuler", cls: "ghost" },
    { label: "Charger", cls: "danger", fn: () => { G = s; R = null; s.savedAt = Date.now(); Store.saveGame(G); toast("Sauvegarde chargée !"); goTitle(); } }
  ] });
}
