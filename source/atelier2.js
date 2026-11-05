// ============================================================
//  ATELIER (suite) : attaques, générateur par texte / IA, outils,
//  historique des versions, corbeille, dossier « creatures »
//  Règle : rien n'est supprimé sans confirmation. Chaque
//  enregistrement garde une copie de la version précédente.
// ============================================================
const RANGE_OPTS = [["front", "Corps à corps (case devant)"], ["line", "À distance (ligne droite)"], ["room", "Zone (toute la salle)"], ["self", "Sur soi"]];
function effectOpts() { return [["", "Aucun"]].concat(Object.keys(EFFECT_LABELS).map(k => [k, EFFECT_LABELS[k]])); }
function trashOf() { const t = (MODS && MODS.trash) || {}; return { monsters: (t.monsters || []).slice(), attacks: (t.attacks || []).slice(), items: (t.items || []).slice() }; }
function nextAttackId() { let n = 1, id; do { id = "A" + String(n).padStart(2, "0"); n++; } while (ATK[id] || trashOf().attacks.some(a => a.id === id)); return id; }
function nextMonId() { let n = DATA.monsters.length + 1, id; do { id = String(n).padStart(3, "0"); n++; } while (MON[id] || trashOf().monsters.some(m => m.id === id)); return id; }

// ---------- liste des attaques ----------
function renderAtkList() {
  const list = $("#atlAtkList"); list.replaceChildren();
  for (const a of DATA.attacks) {
    const b = el("button", "atl-row"); b.type = "button";
    const chip = typeChip(a.type); chip.classList.add("atl-chip");
    const tx = el("span", "atl-tx");
    const bits = [a.power ? "Puiss. " + a.power : "Statut", RANGE_LABELS[moveRange(a)], a.effect && EFFECT_LABELS[a.effect] ? EFFECT_LABELS[a.effect] + (typeof a.chance === "number" ? " (" + a.chance + " %)" : "") : null].filter(Boolean);
    tx.append(el("b", null, a.name), el("small", null, a.id + " · " + bits.join(" · ")));
    b.append(chip, tx, el("span", "atl-go", "Modifier"));
    b.onclick = () => editAttack(a.id);
    list.append(b);
  }
}
function usersOf(atkId) { return DATA.monsters.filter(m => (m.moves || []).includes(atkId)).map(m => m.name); }
function estDamage(a, lv) {
  const user = { lv, mid: DATA.monsters[0].id, kind: "hero", st: {} }, tgt = { lv, mid: DATA.monsters[0].id, kind: "enemy", st: {} };
  if (!(a.power > 0)) return 0;
  const atk = 20 * (0.8 + lv * 0.06), def = 18 * (0.8 + lv * 0.06);
  return Math.round(((a.power || 0) + lv * 1.2) * atk / (def + 25) * 0.72 * 1.12);
}
function editAttack(id, preset) {
  const isNew = !!preset || !ATK[id];
  const src = preset ? JSON.parse(JSON.stringify(preset)) : JSON.parse(JSON.stringify(ATK[id] || { id, name: "Nouvelle attaque", type: "Normal", power: 30, accuracy: 95, pp: 20, effect: null, range: "front" }));
  if (!src.id) src.id = nextAttackId();
  const f = el("form", "atl-form"); f.onsubmit = e => e.preventDefault();
  const name = inp("text", src.name, { maxlength: "28" });
  const type = sel(TYPES.map(t => [t, t]), src.type || "Normal");
  const power = inp("number", src.power ?? 0, { min: "0", max: "250", inputmode: "numeric" });
  const acc = inp("number", src.accuracy ?? 100, { min: "1", max: "100", inputmode: "numeric" });
  const pp = inp("number", src.pp ?? 15, { min: "1", max: "60", inputmode: "numeric" });
  const range = sel(RANGE_OPTS, moveRange(src));
  const effect = sel(effectOpts(), src.effect || "");
  const chance = inp("number", typeof src.chance === "number" ? src.chance : "", { min: "0", max: "100", placeholder: "auto", inputmode: "numeric" });
  const desc = el("textarea"); desc.rows = 2; desc.value = src.description || "";
  const g1 = el("div", "fld-grid"); g1.append(field("Puissance", power), field("Précision %", acc), field("PP", pp), field("Chance d’effet %", chance));
  const g2 = el("div", "fld-grid"); g2.append(field("Type", type), field("Portée", range));
  const est = el("p", "sheet-note");
  const refresh = () => { const a = { power: +power.value || 0 }; const lv = hero && G ? hero().lv : 10; est.textContent = (a.power > 0 ? "≈ " + estDamage(a, lv) + " dégâts au niveau " + lv + " contre une cible moyenne." : "Capacité de statut : l’effet est garanti.") + " Portée : " + RANGE_LABELS[range.value] + "."; };
  power.oninput = refresh; range.onchange = refresh; refresh();
  f.append(field("Nom", name), g2, g1, field("Effet secondaire", effect), field("Description (facultatif)", desc), est);
  const users = usersOf(src.id);
  if (!isNew && users.length) f.append(el("p", "sheet-note", "Utilisée par : " + users.join(", ")));
  const read = () => {
    const a = { id: src.id, name: name.value.trim() || "Sans nom", type: type.value, power: clamp(+power.value || 0, 0, 250), accuracy: clamp(+acc.value || 100, 1, 100), pp: clamp(+pp.value || 10, 1, 60), effect: effect.value || null, range: range.value };
    if (chance.value !== "") a.chance = clamp(+chance.value, 0, 100);
    if (desc.value.trim()) a.description = desc.value.trim();
    if (a.range === "self" && !a.effect) a.effect = "heal";
    return a;
  };
  const save = async () => {
    const a = read();
    const mods = currentMods();
    const i = mods.attacks.findIndex(x => x.id === a.id);
    if (i >= 0) mods.attacks[i] = a; else mods.attacks.push(a);
    if (await commitMods(mods, "Attaque « " + a.name + " » enregistrée.", (i >= 0 ? "Attaque modifiée : " : "Attaque créée : ") + a.name)) { closeSheet(); ATL.tab = "atks"; renderAtelier(); }
  };
  const acts = [{ label: "Annuler", cls: "ghost" }, { label: "Enregistrer", cls: "primary", keep: true, fn: save }];
  if (!isNew) {
    acts.unshift({ label: "Supprimer", cls: "danger", keep: true, fn: () => confirmTrashAttack(src.id) });
    acts.splice(1, 0, { label: "Dupliquer", keep: true, fn: () => { const c = read(); c.id = nextAttackId(); c.name = c.name + " +"; editAttack(c.id, c); } });
  }
  openSheet({ title: isNew ? "Nouvelle attaque" : src.name, body: f, actions: acts, tall: true });
}
function confirmTrashAttack(id) {
  const a = ATK[id]; if (!a) return;
  const users = usersOf(id);
  openSheet({
    title: "Mettre « " + a.name + " » à la corbeille ?", body: el("p", "sheet-text", "L’attaque est rangée dans la corbeille de l’Atelier : tu pourras la restaurer à tout moment." + (users.length ? " Elle est utilisée par " + users.join(", ") + " : ces créatures ne pourront plus l’utiliser tant qu’elle est à la corbeille." : "")), actions: [
      { label: "Annuler", cls: "ghost", fn: () => editAttack(id) },
      { label: "Mettre à la corbeille", cls: "danger", fn: async () => { const mods = currentMods(); mods.attacks = mods.attacks.filter(x => x.id !== id); mods.trash.attacks.push(Object.assign({}, a, { deletedAt: Date.now() })); await commitMods(mods, a.name + " est dans la corbeille.", "Attaque à la corbeille : " + a.name); } }
    ]
  });
}
// ---------- générateur d'attaque par description ----------
const PROMPT_TYPES = [
  ["Feu", /feu|flamm|brûl|brul|braise|incend|lave|chaleur/], ["Eau", /\beau|vague|aqua|marée|maree|pluie|torrent|bulle/], ["Plante", /plante|feuill|liane|racine|pollen|fleur|épine|epine/],
  ["Électrique", /électr|electr|foudre|éclair|eclair|tonnerre|étincel|etincel/], ["Glace", /glace|gel|neige|givre|blizzard|froid/], ["Roche", /roche|pierre|rocher|caillou|cristal/],
  ["Terre", /terre|sol\b|séisme|seisme|sable|boue/], ["Vol", /vent|vol\b|aile|plume|tornade|bourrasque|air\b/], ["Insecte", /insecte|dard|piqûre|piqure|essaim/],
  ["Spectre", /spectre|fantôm|fantom|esprit|âme|ame\b|hant/], ["Ténèbres", /ombre|ténèbr|tenebr|noir|obscur|nuit/], ["Acier", /acier|métal|metal|fer\b|lame|épée|epee/],
  ["Fée", /fée|fee\b|magie|charme|étoile|etoile|lumière|lumiere/], ["Normal", /normal|coup|frappe|charge/]
];
const PROMPT_EFFECTS = [
  ["paralyze", /paralys/], ["burn", /brûl|brul/], ["freeze", /gel(e|é|er)|congel|glac(e|é) la cible/], ["sleep", /dort|sommeil|endor/], ["flinch", /peur|apeur|effra/],
  ["lower_speed", /ralent|lent\b/], ["lower_accuracy", /précision|precision|aveugl|brouill/], ["poison", /poison|empoison|toxi/], ["drain", /drain|absorb|vol de vie|aspire/],
  ["lower_defense", /(baisse|réduit|reduit|brise|casse|affaibli).{0,20}défense|defense/], ["ignore_defense", /ignore.{0,12}défense|ignore.{0,12}defense|perce|transperce/], ["heal", /soign|guéri|gueri|régén|regen|récupère|recupere/]
];
function parseAttackPrompt(text, lv) {
  const t = String(text || "").toLowerCase();
  lv = Math.max(1, +lv || 10);
  let range = "front";
  if (/distance|loin|ligne|projectile|tir\b|tire|lance|rayon|jet\b/.test(t)) range = "line";
  if (/zone|salle|tous les|toute la|autour|explosion|onde/.test(t)) range = "room";
  if (/corps à corps|corps a corps|contact|au contact|devant/.test(t)) range = "front";
  let effect = null;
  for (const [k, re] of PROMPT_EFFECTS) if (re.test(t)) { effect = k; break; }
  if (/(se|me|te) soign|soigne (le lanceur|soi)|sur soi|régénère|regenere/.test(t)) { range = "self"; effect = "heal"; }
  let type = null;
  for (const [k, re] of PROMPT_TYPES) if (re.test(t)) { type = k; break; }
  if (!type) type = G ? ((monById(hero().mid).types || [])[0] || "Normal") : "Normal";
  if (effect === "freeze" && !/glace|gel|neige|givre|froid/.test(t)) effect = "freeze";
  const m = t.match(/(\d{1,3})\s*%/);
  const chance = m ? clamp(+m[1], 0, 100) : (effect && effect !== "heal" && effect !== "ignore_defense" && effect !== "drain" ? 30 : null);
  let power = Math.round(22 + lv * 2.2);
  if (/très puissant|tres puissant|dévast|devast|ultime|énorme|enorme|surpuissant/.test(t)) power = Math.round(power * 1.5);
  else if (/puissant|fort\b|violent/.test(t)) power = Math.round(power * 1.25);
  if (/faible|léger|leger|petit/.test(t)) power = Math.round(power * 0.7);
  const pm = t.match(/puissance\s*(\d{1,3})/); if (pm) power = +pm[1];
  if (effect && effect !== "drain" && effect !== "ignore_defense") power = Math.round(power * 0.75);
  if (range === "room") power = Math.round(power * 0.8);
  if (range === "self" || /sans dégât|sans degat|statut/.test(t)) power = 0;
  power = clamp(power, 0, 160);
  let accuracy = power >= 70 ? 85 : 95;
  if (/précis|precis|infaillible|toujours/.test(t)) accuracy = 100;
  if (/imprécis|imprecis|aléatoire|aleatoire/.test(t)) accuracy = 75;
  const pp = power === 0 ? 12 : power >= 80 ? 8 : power >= 50 ? 12 : 20;
  let name = null;
  const q = String(text).match(/[«"“]([^»"”]{2,28})[»"”]/) || String(text).match(/(?:appel(?:é|e)e?|nomm(?:é|e)e?)\s+([A-Za-zÀ-ÿ' -]{2,28})/i);
  if (q) name = q[1].trim();
  if (!name) name = autoAttackName(type, range, effect);
  const a = { id: nextAttackId(), name, type, power, accuracy, pp, effect, range };
  if (chance != null && effect) a.chance = chance;
  a.description = String(text).trim().slice(0, 160);
  return a;
}
function autoAttackName(type, range, effect) {
  const head = { line: ["Rayon", "Tir", "Jet", "Flèche"], room: ["Onde", "Tempête", "Nova", "Explosion"], front: ["Coup", "Frappe", "Morsure", "Griffe"], self: ["Souffle", "Aura", "Méditation"] }[range] || ["Coup"];
  const tw = { Feu: "Ardent", Eau: "Aquatique", Plante: "Sylvestre", "Électrique": "Foudroyant", Glace: "Givré", Roche: "Rocheux", Terre: "Tellurique", Vol: "Céleste", Insecte: "Piquant", Spectre: "Spectral", "Ténèbres": "Ténébreux", Acier: "d’Acier", "Fée": "Féerique", Normal: "Vif" }[type] || "Vif";
  const ew = { paralyze: "Paralysant", burn: "Brûlant", freeze: "Gelant", sleep: "Berceur", flinch: "Terrifiant", poison: "Toxique", drain: "Vampirique", lower_defense: "Brise-Garde", lower_speed: "Engourdissant" }[effect];
  const h = head[Math.floor(rnd() * head.length)];
  return ew ? h + " " + ew : h + " " + tw;
}
async function aiAttack(text, lv) {
  if (!Store.sample) throw new Error("L’IA n’est pas disponible ici (ouvre le jeu depuis son lien Claude).");
  const prompt = "Tu conçois une attaque pour un jeu de donjon au tour par tour (style « donjon mystère »). Réponds UNIQUEMENT avec un objet JSON.\n" +
    "Champs : name (nom français court, max 24 caractères), type (un de : " + TYPES.join(", ") + "), power (0 à 150 ; 0 pour une capacité de statut), accuracy (50 à 100), pp (5 à 30), " +
    "range (front = corps à corps, line = à distance en ligne droite, room = toute la salle, self = sur soi), effect (null ou un de : " + Object.keys(EFFECT_LABELS).join(", ") + "), chance (0 à 100, probabilité de l’effet), description (une phrase en français).\n" +
    "Équilibre : au niveau " + lv + ", une attaque normale a une puissance d’environ " + Math.round(22 + lv * 2.2) + ". Une attaque avec effet ou de zone est un peu moins puissante.\n" +
    "Description du joueur : " + JSON.stringify(String(text).slice(0, 600));
  const r = await Store.sample.json(prompt, { modelTier: "quick" });
  if (!r || typeof r !== "object") throw new Error("réponse illisible");
  const a = { id: nextAttackId(), name: String(r.name || "Attaque").slice(0, 28), type: TYPES.includes(r.type) ? r.type : "Normal", power: clamp(+r.power || 0, 0, 160), accuracy: clamp(+r.accuracy || 95, 30, 100), pp: clamp(+r.pp || 15, 1, 60), effect: EFFECT_LABELS[r.effect] ? r.effect : null, range: ["front", "line", "room", "self"].includes(r.range) ? r.range : "front" };
  if (a.effect && r.chance != null) a.chance = clamp(+r.chance, 0, 100);
  if (r.description) a.description = String(r.description).slice(0, 160);
  if (a.range === "self" && !a.effect) a.effect = "heal";
  return a;
}
// ---------- outils ----------
const ROLES = { attaquant: ["Attaquant", { hp: 0.24, attack: 0.36, defense: 0.16, speed: 0.24 }], tank: ["Défenseur", { hp: 0.34, attack: 0.18, defense: 0.34, speed: 0.14 }], rapide: ["Rapide", { hp: 0.22, attack: 0.28, defense: 0.14, speed: 0.36 }], equilibre: ["Équilibré", { hp: 0.28, attack: 0.26, defense: 0.24, speed: 0.22 }] };
function optimizeStats(m, role, bonus) {
  const w = (ROLES[role] || ROLES.equilibre)[1];
  const total = ((m.hp || 40) / 1.6 + (m.attack || 20) + (m.defense || 20) + (m.speed || 20)) * (1 + (bonus || 0) / 100);
  return { hp: Math.max(8, Math.round(total * w.hp * 1.6)), attack: Math.max(5, Math.round(total * w.attack)), defense: Math.max(5, Math.round(total * w.defense)), speed: Math.max(5, Math.round(total * w.speed)) };
}
function fuseAttacks(a, b) {
  const order = { front: 0, line: 1, room: 2, self: -1 };
  const hi = (a.power || 0) >= (b.power || 0) ? a : b, lo = hi === a ? b : a;
  const range = (order[a.range || moveRange(a)] >= order[b.range || moveRange(b)]) ? moveRange(a) : moveRange(b);
  const half = s => s.split(/\s+/);
  const wa = half(a.name), wb = half(b.name);
  const name = (wa.length > 1 && wb.length > 1 ? wa[0] + " " + wb.slice(1).join(" ") : a.name.slice(0, Math.ceil(a.name.length / 2)) + b.name.slice(Math.floor(b.name.length / 2)).toLowerCase()).slice(0, 28);
  const f = { id: nextAttackId(), name, type: hi.type, power: clamp(Math.round((hi.power || 0) * 0.8 + (lo.power || 0) * 0.4), 0, 160), accuracy: Math.round(((a.accuracy ?? 100) + (b.accuracy ?? 100)) / 2), pp: Math.max(5, Math.round(((a.pp || 15) + (b.pp || 15)) / 2.4)), effect: a.effect || b.effect || null, range: range === "self" ? "front" : range };
  if (f.effect) f.chance = Math.max(a.chance || 30, b.chance || 30);
  f.description = "Fusion de « " + a.name + " » et « " + b.name + " ».";
  return f;
}
function renderTools() {
  const pane = $("#atl-tools"); pane.replaceChildren();
  // générateur
  const gen = el("div", "tool-card");
  gen.append(el("h3", null, "Créer une attaque avec une description"));
  gen.append(el("p", "sheet-note", "Écris ce que fait l’attaque, par exemple : « attaque à distance qui paralyse la cible », « grosse explosion de feu dans toute la salle », « se soigne avec la lumière de la lune ». Le jeu traduit ta phrase en portée, effet, puissance et précision selon le niveau."));
  const ta = el("textarea", "json"); ta.rows = 3; ta.placeholder = "Décris ton attaque…"; ta.style.minHeight = "84px";
  const lv = inp("number", G ? hero().lv : 10, { min: "1", max: "100", inputmode: "numeric" });
  const row = el("div", "row-btns");
  const b1 = el("button", "btn primary", "Générer"); b1.type = "button";
  const b2 = el("button", "btn", "Demander à Claude (IA)"); b2.type = "button"; b2.hidden = !Store.sample;
  const out = el("p", "json-err");
  b1.onclick = () => { if (!ta.value.trim()) { out.textContent = "Écris d’abord une description."; return; } out.textContent = ""; editAttack(null, parseAttackPrompt(ta.value, +lv.value)); };
  b2.onclick = async () => { if (!ta.value.trim()) { out.textContent = "Écris d’abord une description."; return; } b2.disabled = true; out.textContent = "Claude réfléchit…"; try { const a = await aiAttack(ta.value, +lv.value); out.textContent = ""; editAttack(null, a); } catch (e) { out.textContent = "L’IA n’a pas pu répondre (" + ((e && (e.message || e.code)) || e) + "). Le générateur simple marche toujours."; } finally { b2.disabled = false; } };
  row.append(b1, b2);
  gen.append(ta, field("Niveau de référence", lv), row, out);
  // optimiseur
  const opt = el("div", "tool-card");
  opt.append(el("h3", null, "Optimiser les statistiques"));
  opt.append(el("p", "sheet-note", "Répartit autrement les points d’une créature selon un rôle, sans changer son total (ou avec un petit bonus)."));
  const ms = sel(DATA.monsters.map(m => [m.id, m.name + " #" + m.id]), DATA.monsters[0].id);
  const rs = sel(Object.keys(ROLES).map(k => [k, ROLES[k][0]]), "equilibre");
  const bs = sel([["0", "Même total"], ["5", "+5 %"], ["10", "+10 %"]], "0");
  const prev = el("div", "opt-prev");
  const draw = () => {
    const m = MON[ms.value]; const n = optimizeStats(m, rs.value, +bs.value);
    prev.replaceChildren(el("p", "sheet-note", "Avant : PV " + m.hp + " · Atq " + m.attack + " · Déf " + m.defense + " · Vit " + m.speed), el("p", "sheet-text", "Après : PV " + n.hp + " · Atq " + n.attack + " · Déf " + n.defense + " · Vit " + n.speed));
  };
  ms.onchange = draw; rs.onchange = draw; bs.onchange = draw; draw();
  const ob = el("button", "btn primary", "Appliquer"); ob.type = "button";
  ob.onclick = async () => { const m = MON[ms.value]; const n = optimizeStats(m, rs.value, +bs.value); const mods = currentMods(); const i = mods.monsters.findIndex(x => x.id === m.id); Object.assign(mods.monsters[i], n); await commitMods(mods, m.name + " optimisé.", "Stats optimisées : " + m.name + " (" + ROLES[rs.value][0] + ")"); ATL.tab = "tools"; renderAtelier(); };
  const og = el("div", "fld-grid"); og.append(field("Créature", ms), field("Rôle", rs), field("Budget", bs));
  opt.append(og, prev, ob);
  // fusion
  const fu = el("div", "tool-card");
  fu.append(el("h3", null, "Fusionner deux attaques"));
  fu.append(el("p", "sheet-note", "Crée une nouvelle attaque qui mélange les deux : le type de la plus forte, une puissance combinée, la plus grande portée et l’effet de l’une ou l’autre. Les deux attaques d’origine sont gardées."));
  const aOpts = DATA.attacks.map(a => [a.id, a.name + " (" + a.type + ")"]);
  const fa = sel(aOpts, (DATA.attacks[0] || {}).id), fb = sel(aOpts, (DATA.attacks[1] || {}).id);
  const fg = el("div", "fld-grid"); fg.append(field("Attaque A", fa), field("Attaque B", fb));
  const fbtn = el("button", "btn primary", "Fusionner"); fbtn.type = "button";
  fbtn.onclick = () => { if (fa.value === fb.value) { toast("Choisis deux attaques différentes."); return; } editAttack(null, fuseAttacks(ATK[fa.value], ATK[fb.value])); };
  fu.append(fg, fbtn);
  // équilibrage
  const eq = el("div", "tool-card");
  eq.append(el("h3", null, "Vérifier l’équilibrage"));
  const lst = el("ul", "plain");
  const warn = [];
  for (const a of DATA.attacks) { if (a.power > 120) warn.push(a.name + " : puissance très haute (" + a.power + ")."); if ((a.accuracy ?? 100) < 60) warn.push(a.name + " : précision très basse."); if (a.effect && !EFFECT_LABELS[a.effect]) warn.push(a.name + " : effet inconnu « " + a.effect + " »."); }
  for (const m of DATA.monsters) { const tot = m.hp / 1.6 + m.attack + m.defense + m.speed; if (tot > 140) warn.push(m.name + " : statistiques très hautes (total " + Math.round(tot) + ")."); if (!(m.moves || []).some(id => ATK[id])) warn.push(m.name + " : aucune capacité valide."); }
  if (!warn.length) lst.append(el("li", null, "Tout a l’air équilibré.")); else for (const w of warn) lst.append(el("li", null, w));
  eq.append(lst);
  pane.append(gen, opt, fu, eq);
}
// ---------- historique et corbeille ----------
async function renderHistory() {
  const pane = $("#atl-hist"); pane.replaceChildren();
  pane.append(el("p", "sheet-note", "Chaque fois que tu enregistres, l’ancienne version est gardée ici. Rien n’est effacé sans ton accord."));
  const tr = trashOf();
  const tc = el("div", "tool-card"); tc.append(el("h3", null, "Corbeille"));
  if (!tr.monsters.length && !tr.attacks.length && !tr.items.length) tc.append(el("p", "empty", "La corbeille est vide."));
  const row = (o, kind) => {
    const r = el("div", "hist-row");
    r.append(el("span", null, (kind === "monsters" ? "Créature " : kind === "items" ? "Objet " : "Attaque ") + o.name + " (" + o.id + ")"));
    const rb = el("button", "btn small", "Restaurer"); rb.type = "button";
    rb.onclick = async () => { const mods = currentMods(); mods.trash[kind] = mods.trash[kind].filter(x => x.id !== o.id); const c = Object.assign({}, o); delete c.deletedAt; if (mods[kind].some(x => x.id === c.id)) c.id = kind === "attacks" ? nextAttackId() : kind === "items" ? c.id + "_" + Date.now().toString(36).slice(-3) : nextMonId(); mods[kind].push(c); await commitMods(mods, o.name + " restauré.", "Restauré : " + o.name); ATL.tab = "hist"; renderAtelier(); };
    const db = el("button", "btn small danger", "Supprimer"); db.type = "button";
    db.onclick = () => openSheet({ title: "Supprimer définitivement ?", body: el("p", "sheet-text", "« " + o.name + " » sera retiré de la corbeille. Une copie reste quand même dans l’historique des versions."), actions: [{ label: "Annuler", cls: "ghost" }, { label: "Supprimer", cls: "danger", fn: async () => { const mods = currentMods(); mods.trash[kind] = mods.trash[kind].filter(x => x.id !== o.id); await commitMods(mods, o.name + " supprimé.", "Vidé de la corbeille : " + o.name); ATL.tab = "hist"; renderAtelier(); } }] });
    r.append(rb, db); return r;
  };
  for (const m of tr.monsters) tc.append(row(m, "monsters"));
  for (const a of tr.attacks) tc.append(row(a, "attacks"));
  for (const it of tr.items) tc.append(row(it, "items"));
  pane.append(tc);
  const hc = el("div", "tool-card"); hc.append(el("h3", null, "Versions précédentes"));
  const wait1 = el("p", "sheet-note", "Chargement…"); hc.append(wait1); pane.append(hc);
  const list = await Store.listModHistory();
  wait1.remove();
  if (!list.length) hc.append(el("p", "empty", "Aucune version pour l’instant."));
  for (const v of list) {
    const r = el("div", "hist-row");
    r.append(el("span", null, new Date(v.at).toLocaleString("fr-FR") + " · " + (v.label || "Modification")));
    const rb = el("button", "btn small", "Restaurer"); rb.type = "button";
    rb.onclick = () => openSheet({ title: "Restaurer cette version ?", body: el("p", "sheet-text", "L’Atelier revient à l’état du " + new Date(v.at).toLocaleString("fr-FR") + ". L’état actuel est gardé dans l’historique, tu pourras y revenir."), actions: [{ label: "Annuler", cls: "ghost" }, { label: "Restaurer", cls: "primary", fn: async () => { const mods = await Store.getModVersion(v); if (!mods) { toast("Version illisible."); return; } await commitMods(mods, "Version restaurée.", "Retour à la version du " + new Date(v.at).toLocaleString("fr-FR")); ATL.tab = "hist"; renderAtelier(); } }] });
    const dl = el("button", "btn small ghost", "Télécharger"); dl.type = "button";
    dl.onclick = async () => { const mods = await Store.getModVersion(v); if (mods) downloadBlob("atelier_" + new Date(v.at).toISOString().slice(0, 16).replace(/[:T]/g, "-") + ".json", new Blob([JSON.stringify(mods, null, 2)], { type: "application/json" })); };
    r.append(rb, dl); hc.append(r);
  }
}
// ---------- dossier « creatures » ----------
function renderFolder() {
  const pane = $("#atl-folder"); pane.replaceChildren();
  const c = el("div", "tool-card");
  c.append(el("h3", null, "Importer ton dossier « creatures »"));
  c.append(el("p", "sheet-note", "Ton dossier contient un sous-dossier par créature : 0001 à 2000. Dans chacun : creature.json (nom, types, stats, attaques) et tes images : portrait.png, sprite.png, ou un sprite PMD (AnimData.xml + Walk-Anim.png…). Les dossiers vides sont ignorés. Ta partie n’est pas touchée."));
  const fin = el("input"); fin.type = "file"; fin.id = "fFolder"; fin.className = "file-in"; fin.setAttribute("webkitdirectory", ""); fin.setAttribute("directory", ""); fin.multiple = true;
  const zin = el("input"); zin.type = "file"; zin.id = "fZip"; zin.className = "file-in"; zin.accept = ".zip";
  const l1 = el("label", "btn primary"); l1.htmlFor = "fFolder"; l1.textContent = "Choisir le dossier creatures";
  const l2 = el("label", "btn"); l2.htmlFor = "fZip"; l2.textContent = "Importer un .zip du dossier";
  const status = el("p", "sheet-text"); const rep = el("ul", "plain small");
  const run = async files => { status.textContent = "Lecture…"; rep.replaceChildren(); try { const r = await importCreatureFiles(files, t => { status.textContent = t; }); status.textContent = r.summary; for (const l of r.lines.slice(0, 80)) rep.append(el("li", null, l)); if (r.lines.length > 80) rep.append(el("li", null, "… et " + (r.lines.length - 80) + " autres.")); } catch (e) { status.textContent = "Import impossible : " + ((e && e.message) || e); } };
  fin.onchange = () => { if (fin.files.length) run(Array.from(fin.files).map(f => ({ path: f.webkitRelativePath || f.name, file: f }))); fin.value = ""; };
  zin.onchange = async () => { if (!zin.files.length) return; status.textContent = "Ouverture du .zip…"; try { const JSZip = await loadJSZip(); const zip = await JSZip.loadAsync(zin.files[0]); const files = []; for (const z of Object.values(zip.files)) { if (z.dir) continue; const base = z.name.split("/").pop(); if (!/\.(json|png|xml|webp|jpe?g|gif)$/i.test(base)) continue; files.push({ path: z.name, file: new File([await z.async("blob")], base) }); } run(files); } catch (e) { status.textContent = "Import impossible : " + ((e && e.message) || e); } zin.value = ""; };
  const rw = el("div", "row-btns"); rw.append(fin, zin, l1, l2);
  c.append(rw, status, rep);
  const e = el("div", "tool-card");
  e.append(el("h3", null, "Sauvegarder ton travail en fichiers"));
  e.append(el("p", "sheet-note", "Récupère tes créatures au même format (un dossier idXXX par créature) pour les remettre dans ton dossier sur ton PC, ou une copie complète de l’Atelier."));
  const b1 = el("button", "btn", "Télécharger mes créatures (.zip)"); b1.type = "button";
  b1.onclick = async () => { try { const JSZip = await loadJSZip(); const zip = new JSZip(); for (const m of DATA.monsters) zip.file("creatures/" + String(+m.id || m.id).padStart(4, "0") + "/creature.json", JSON.stringify(Object.assign({ actif: true }, m, { id: String(+m.id || m.id).padStart(4, "0") }), null, 2)); zip.file("attacks.json", JSON.stringify(DATA.attacks, null, 2)); zip.file("locations.json", JSON.stringify(DATA.locations, null, 2)); const blob = await zip.generateAsync({ type: "blob" }); downloadBlob("creatures.zip", blob); } catch (err) { toast("Zip impossible ici : " + ((err && err.message) || err), 4000); } };
  const b2 = el("button", "btn", "Copie complète de l’Atelier (.json)"); b2.type = "button";
  b2.onclick = () => downloadBlob("atelier_complet.json", new Blob([JSON.stringify(withRemoved(currentMods()), null, 2)], { type: "application/json" }));
  const fi = el("input"); fi.type = "file"; fi.id = "fAtlJson"; fi.className = "file-in"; fi.accept = ".json,application/json";
  const l3 = el("label", "btn ghost"); l3.htmlFor = "fAtlJson"; l3.textContent = "Recharger une copie (.json)";
  fi.onchange = async () => { const f = fi.files[0]; fi.value = ""; if (!f) return; try { const d = JSON.parse(await f.text()); const mods = currentMods(); for (const k of ["monsters", "attacks", "locations"]) if (Array.isArray(d[k])) mods[k] = mergeList(mods[k], d[k], []); if (d.trash) for (const k of ["monsters", "attacks"]) mods.trash[k] = mods.trash[k].concat((d.trash[k] || []).filter(x => !mods.trash[k].some(y => y.id === x.id))); await commitMods(mods, "Copie rechargée (fusionnée avec l’Atelier).", "Copie rechargée : " + f.name); } catch (err) { toast("Fichier illisible : " + ((err && err.message) || err), 4000); } };
  const r2 = el("div", "row-btns"); r2.append(fi, b1, b2, l3);
  e.append(r2);
  pane.append(c, e);
}
function downloadBlob(filename, blob) {
  if (Store.downloads) { Store.downloads.save({ filename, data: blob }).then(() => toast("Fichier enregistré.")).catch(e => { if (!e || e.code !== "declined") toast("Téléchargement impossible."); }); return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}
async function importCreatureFiles(entries, onStatus) {
  const groups = new Map();
  for (const e of entries) {
    const parts = String(e.path).split(/[\\/]/);
    let id = null;
    for (const p of parts.slice(0, -1)) { const m = /^(?:id)?0*(\d{1,4})$/i.exec(p); if (m) id = +m[1]; }
    if (!id || id < 1 || id > 9999) continue;
    const mid = String(id).padStart(3, "0"); // dossier 0058 ↔ créature 058
    if (!groups.has(mid)) groups.set(mid, []);
    groups.get(mid).push(e.file);
  }
  const mods = currentMods();
  const lines = [];
  let nNew = 0, nUpd = 0, nImg = 0, done = 0;
  const atkIds = new Set(mods.attacks.map(a => a.id));
  for (const [mid, files] of groups) {
    done++; if (done % 25 === 0 && onStatus) onStatus("Lecture… " + done + "/" + groups.size);
    const byName = {}; for (const f of files) byName[f.name.toLowerCase()] = f;
    let js = null;
    const jf = byName["creature.json"] || files.find(f => /\.json$/i.test(f.name));
    if (jf) { try { js = JSON.parse(await jf.text()); } catch (e) { lines.push("id" + mid + " : creature.json illisible (" + e.message + ")"); } }
    const imgs = files.filter(f => /\.(png|webp|jpe?g|gif)$/i.test(f.name));
    const hasPMD = !!byName["animdata.xml"];
    const named = js && typeof js.name === "string" && js.name.trim();
    const active = (js && js.actif === true) || named || imgs.length;
    if (!active || (js && js.actif === false && !imgs.length)) continue;
    const i = mods.monsters.findIndex(m => String(m.id) === mid);
    const base = i >= 0 ? JSON.parse(JSON.stringify(mods.monsters[i])) : { id: mid, name: "Créature #" + (+mid), types: ["Normal"], hp: 40, attack: 20, defense: 20, speed: 20, moves: ["A01"], description: "", form: "blob", stage: 1 };
    if (js) {
      if (named) base.name = js.name.trim().slice(0, 24);
      if (Array.isArray(js.types)) { const t = js.types.filter(x => TYPES.includes(x)).slice(0, 2); if (t.length) base.types = t; }
      for (const k of ["hp", "attack", "defense", "speed"]) if (typeof js[k] === "number" && js[k] > 0) base[k] = Math.round(js[k]);
      if (Array.isArray(js.moves)) { const mv = js.moves.map(String).filter(id => atkIds.has(id)).slice(0, 4); if (mv.length) base.moves = mv; }
      if (typeof js.description === "string") base.description = js.description.slice(0, 200);
      if (FORMS.includes(js.form)) base.form = js.form;
      if (typeof js.stage === "number") base.stage = js.stage;
      if (typeof js.drop_rate === "number") base.drop_rate = clamp(js.drop_rate, 0, 100);
      if ([1, 2, 3].includes(+js.rarity)) base.rarity = +js.rarity;
      if (typeof js.recruit_rate === "number") base.recruit_rate = clamp(js.recruit_rate, 0, 100);
    }
    if (i >= 0) { mods.monsters[i] = base; nUpd++; } else { mods.monsters.push(base); nNew++; }
    let imgNote = "";
    try {
      if (hasPMD) {
        const { doc, blobs } = await readSpriteFiles(files);
        doc.mid = mid;
        const stored = await Store.storeSprite(mid, doc, blobs);
        loadSpriteDoc(stored); nImg++; imgNote = " · sprite PMD";
      } else {
        const n4 = String(+mid).padStart(4, "0");
        const one = byName["sprite.png"] || byName[n4 + ".png"] || byName[mid + ".png"] || byName["portrait.png"] || byName["normal.png"] || imgs[0];
        if (one) { const r = await Store.saveMedia("mon." + mid, one, "img"); if (!r.error) { nImg++; imgNote = " · image"; } else imgNote = " · image refusée (" + r.error + ")"; }
      }
    } catch (e) { imgNote = " · image non lue (" + ((e && e.message) || e) + ")"; }
    // portraits d'émotions (noms de sprite_config.json : Normal.png, Happy.png…) et planche de portraits
    try {
      let nEmo = 0;
      for (const f of imgs) {
        const base = f.name.replace(/\.[^.]+$/, "");
        const emo = SPRITE_CONFIG.emotions.find(e2 => e2.toLowerCase() === base.toLowerCase());
        if (emo) { const r = await Store.saveMedia("emo." + mid + "." + emo, f, "img"); if (!r.error) nEmo++; }
        else if (/^(portraits?|portrait[_-]?sheet|planche)$/i.test(base) && !hasPMD) { const r = await Store.saveMedia("psheet." + mid, f, "img"); if (!r.error) nEmo++; }
      }
      if (nEmo) { nImg++; imgNote += " · " + nEmo + " portrait(s) d’émotion"; }
    } catch (e) { }
    lines.push(String(+mid).padStart(4, "0") + " " + base.name + (i >= 0 ? " (mise à jour)" : " (nouvelle)") + imgNote);
  }
  if (!nNew && !nUpd) return { summary: "Aucune créature à importer : les dossiers sont vides (mets au moins un nom dans creature.json ou une image).", lines };
  await commitMods(mods, nNew + nUpd + " créatures importées.", "Import du dossier creatures (" + (nNew + nUpd) + ")");
  if (nImg) await loadAllMedia();
  return { summary: nNew + " nouvelle(s), " + nUpd + " mise(s) à jour, " + nImg + " avec images.", lines };
}
// ---------- stockage de l'historique ----------
Store.snapshotMods = async function (prev, label) {
  if (!prev) return;
  const at = Date.now();
  const doc = { json: JSON.stringify(prev), at, label: String(label || "Modification").slice(0, 120) };
  try { await IDB.set("modhist:" + at, doc); } catch (e) { }
  if (this.db && this.canEdit) { try { await this.db.doc("modhist/v" + at).set(doc); } catch (e) { } }
};
Store.listModHistory = async function () {
  const out = new Map();
  if (this.db) {
    try {
      let q = this.db.collection("modhist");
      try { q = q.orderBy("at", "desc").limit(60); } catch (e) { }
      const snap = await withTimeout(q.get(), 8000);
      for (const d of snap.docs) { const v = d.data(); if (v && v.at) out.set(v.at, { at: v.at, label: v.label, src: "shared", id: d.id }); }
    } catch (e) { }
  }
  try { const keys = (await IDB.keys()) || []; for (const k of keys) if (String(k).startsWith("modhist:")) { const at = +String(k).slice(8); if (!out.has(at)) { const v = await IDB.get(k); if (v) out.set(at, { at, label: v.label, src: "local", key: k }); } } } catch (e) { }
  return Array.from(out.values()).sort((a, b) => b.at - a.at);
};
Store.getModVersion = async function (v) {
  try {
    if (v.src === "shared" && this.db) { const s = await this.db.doc("modhist/" + v.id).get(); if (s && s.exists) return JSON.parse(s.data().json); }
    const d = await IDB.get(v.key || ("modhist:" + v.at)); if (d) return JSON.parse(d.json);
  } catch (e) { }
  return null;
};

// ---------- objets (items.json) ----------
function renderItemList() {
  const list = $("#atlItemList"); list.replaceChildren();
  for (const it of DATA.items) {
    const b = el("button", "atl-row"); b.type = "button";
    b.append(itemIconCanvas(it.id, 30));
    const tx = el("span", "atl-tx");
    const bits = [ITEM_KINDS[it.kind] || it.kind, it.value ? "valeur " + it.value : null, it.bonus ? Object.entries(it.bonus).map(([k, v]) => "+" + v + " " + ({ attack: "Atq", defense: "Déf", speed: "Vit", hp: "PV" }[k] || k)).join(" ") : null, it.price ? it.price + " p." : null, it.rare ? "rare" : null].filter(Boolean);
    tx.append(el("b", null, it.name), el("small", null, it.id + " · " + bits.join(" · ")));
    b.append(tx, el("span", "atl-go", "Modifier"));
    b.onclick = () => editItem(it.id);
    list.append(b);
  }
}
function editItem(id) {
  const isNew = !id || !ITEMS[id];
  const src = isNew ? { id: "objet" + (DATA.items.length + 1), name: "Nouvel objet", desc: "", icon: "ribbon", color: "#ff8a3d", w: 2, kind: "equip", bonus: { attack: 2 }, price: 200, shop: "objets" } : JSON.parse(JSON.stringify(ITEMS[id]));
  const f = el("form", "atl-form"); f.onsubmit = e => e.preventDefault();
  const iid = inp("text", src.id, { maxlength: "24" }); iid.disabled = !isNew;
  const name = inp("text", src.name, { maxlength: "28" });
  const desc = el("textarea"); desc.rows = 2; desc.value = src.desc || "";
  const kind = sel(Object.keys(ITEM_KINDS).filter(k => k !== "money").map(k => [k, ITEM_KINDS[k]]), src.kind || "heal");
  const value = inp("number", src.value ?? "", { min: "0", max: "999", inputmode: "numeric" });
  const icon = sel(ITEM_ICONS.map(k => [k, k]), src.icon || "berry");
  const color = inp("color", src.color || "#ff8a3d");
  const w = inp("number", src.w ?? 2, { min: "0", max: "50", inputmode: "numeric" });
  const price = inp("number", src.price ?? 50, { min: "0", max: "99999", inputmode: "numeric" });
  const shop = sel([["", "Pas en boutique"], ["objets", "Marchande d’objets"], ["orbes", "Marchand d’orbes"]], src.shop || "");
  const rare = el("input"); rare.type = "checkbox"; rare.checked = !!src.rare;
  const b = src.bonus || {};
  const bon = {}; const bg = el("div", "fld-grid");
  for (const [k, l] of [["attack", "Bonus attaque"], ["defense", "Bonus défense"], ["speed", "Bonus vitesse"], ["hp", "Bonus PV"]]) { bon[k] = inp("number", b[k] ?? "", { min: "0", max: "99", inputmode: "numeric" }); bg.append(field(l, bon[k])); }
  const prev = el("canvas", "item-prev"); prev.width = prev.height = 96;
  const redraw = () => { const tmp = { id: "__prev", name: "", icon: icon.value, color: color.value }; ITEMS.__prev = tmp; const x = prev.getContext("2d"); x.clearRect(0, 0, 96, 96); drawItem(x, "__prev", 48, 48, 150, 0); delete ITEMS.__prev; };
  icon.onchange = redraw; color.oninput = redraw; requestAnimationFrame(redraw);
  const bonusBox = el("div"); bonusBox.append(el("h4", "fld-h", "Bonus de l’équipement"), bg);
  const syncKind = () => { bonusBox.hidden = kind.value !== "equip"; }; kind.onchange = syncKind; syncKind();
  const g1 = el("div", "fld-grid"); g1.append(field("Effet", kind), field("Valeur (PV, dégâts, % …)", value), field("Prix", price), field("Fréquence en donjon", w));
  const g2 = el("div", "fld-grid"); g2.append(field("Icône", icon), field("Couleur", color), field("Boutique", shop));
  const rl = el("label", "chk"); rl.append(rare, document.createTextNode(" Objet rare (coffres de fin de donjon, fontaine)"));
  const top = el("div", "item-top"); top.append(prev);
  f.append(top, field("Identifiant (lettres, sans espace)", iid), field("Nom", name), field("Description", desc), g1, bonusBox, g2, rl);
  const save = async () => {
    const o = { id: (iid.value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "") || ("objet" + Date.now().toString(36)), name: name.value.trim() || "Objet", desc: desc.value.trim(), icon: icon.value, color: color.value, w: clamp(+w.value || 0, 0, 50), kind: kind.value, price: clamp(+price.value || 0, 0, 99999) };
    if (value.value !== "") o.value = +value.value;
    if (shop.value) o.shop = shop.value;
    if (rare.checked) o.rare = true;
    if (o.kind === "throw" || o.kind === "sleepseed") o.throw = true;
    if (o.kind === "equip") { o.bonus = {}; for (const k in bon) if (bon[k].value !== "" && +bon[k].value) o.bonus[k] = +bon[k].value; if (!Object.keys(o.bonus).length) o.bonus.attack = 1; }
    const mods = currentMods();
    if (isNew && mods.items.some(x => x.id === o.id)) { toast("Cet identifiant existe déjà."); return; }
    const i = mods.items.findIndex(x => x.id === o.id);
    if (i >= 0) mods.items[i] = o; else mods.items.push(o);
    if (await commitMods(mods, "Objet « " + o.name + " » enregistré.", (i >= 0 ? "Objet modifié : " : "Objet créé : ") + o.name)) { closeSheet(); ATL.tab = "items"; renderAtelier(); }
  };
  const acts = [{ label: "Annuler", cls: "ghost" }, { label: "Enregistrer", cls: "primary", keep: true, fn: save }];
  if (!isNew && src.id !== "or") acts.unshift({ label: "Supprimer", cls: "danger", keep: true, fn: () => openSheet({ title: "Mettre « " + src.name + " » à la corbeille ?", body: el("p", "sheet-text", "L’objet ne sera plus trouvé ni vendu. Tu peux le restaurer depuis l’onglet Historique. Les exemplaires déjà dans un sac disparaîtront au prochain chargement."), actions: [{ label: "Annuler", cls: "ghost", fn: () => editItem(src.id) }, { label: "Mettre à la corbeille", cls: "danger", fn: async () => { const mods = currentMods(); mods.items = mods.items.filter(x => x.id !== src.id); mods.trash.items.push(Object.assign({}, src, { deletedAt: Date.now() })); await commitMods(mods, src.name + " est dans la corbeille.", "Objet à la corbeille : " + src.name); } }] }) });
  openSheet({ title: isNew ? "Nouvel objet" : src.name, body: f, actions: acts, tall: true });
}
// ---------- table des types ----------
function renderTypeChart() {
  const pane = $("#atl-types"); pane.replaceChildren();
  pane.append(el("p", "sheet-note", "Ligne = type de l’attaque, colonne = type de la cible. ×1,5 très efficace · ×0,7 pas très efficace · ×0,4 presque sans effet. Une attaque du même type que son lanceur fait ×1,25."));
  const wrap = el("div", "tc-wrap"); const t = el("table", "typechart");
  const hr = el("tr"); hr.append(el("th", "corner", "Atq ↓ / Cible →"));
  for (const d of TYPES) { const th = el("th", "tc-col"); const s = el("span", null, d.slice(0, 4)); s.style.color = TYPE_COLORS[d]; th.title = d; th.append(s); hr.append(th); }
  t.append(hr);
  for (const a of TYPES) {
    const tr = el("tr"); const th = el("th", "tc-row", a); th.style.color = TYPE_COLORS[a]; tr.append(th);
    for (const d of TYPES) {
      const m = typeMult(a, [d]);
      const td = el("td", m > 1 ? "tc-super" : m < 0.5 ? "tc-weak" : m < 1 ? "tc-resist" : "", m > 1 ? "1,5" : m < 0.5 ? "0,4" : m < 1 ? "0,7" : "");
      td.title = a + " → " + d + " : ×" + String(m).replace(".", ",");
      tr.append(td);
    }
    t.append(tr);
  }
  wrap.append(t); pane.append(wrap);
}
