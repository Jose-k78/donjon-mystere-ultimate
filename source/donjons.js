// =====================================================================
//  donjons.json : tu choisis toi-même les créatures de chaque donjon
//  Le fichier est à la racine de ton dépôt privé (synchro), ou importé
//  sur l'appareil (Paramètres → Donjons). Un donjon absent du fichier
//  garde les réglages du jeu.
// =====================================================================
const DONJONS_LS = "dmu-donjons";
const DONJONS = { repo: null, local: null, map: {}, src: "", orig: {}, pre: {}, applied: {} };
const DONJON_FIELDS = ["common_monsters", "boss", "level", "floors"];

// "045", 45, "0045", "45 Rapinard", "id045" → "045"
function donjonMid(v) {
  if (v == null) return null;
  const m = /^\s*(?:id)?0*(\d{1,4})(?!\d)/i.exec(String(v));
  return m && +m[1] >= 1 ? String(+m[1]).padStart(3, "0") : null;
}
// "1-3", "5", "5-" (jusqu'à la fin), 4 → [début, fin]
function donjonRange(v) {
  if (v == null || v === "") return null;
  const m = /^\s*(\d+)\s*(?:[-–àa]\s*(\d*))?\s*$/.exec(String(v));
  if (!m) return null;
  const a = +m[1], b = m[2] === undefined ? a : (m[2] === "" ? 9999 : +m[2]);
  return [Math.min(a, b), Math.max(a, b)];
}
function donjonParse(js) {
  const map = {};
  if (!js || typeof js !== "object") return map;
  const list = js.donjons && typeof js.donjons === "object" ? js.donjons : js;
  for (const code in list) {
    if (code.startsWith("_")) continue;
    const e = list[code]; if (!e || typeof e !== "object" || Array.isArray(e)) continue;
    const o = { code: code.toUpperCase(), bad: [] };
    if (Array.isArray(e.creatures)) {
      o.mons = [];
      for (const c of e.creatures) {
        const obj = c && typeof c === "object";
        const id = donjonMid(obj ? c.id : c);
        if (!id) { o.bad.push(String(obj ? JSON.stringify(c) : c)); continue; }
        o.mons.push({ id, w: obj && typeof c.poids === "number" && c.poids > 0 ? Math.min(c.poids, 1000) : 1, f: obj ? donjonRange(c.etages) : null });
      }
    }
    if (e.gardien != null && String(e.gardien).trim() !== "") { o.boss = donjonMid(e.gardien); if (!o.boss) o.bad.push("gardien " + e.gardien); }
    if (typeof e.niveau === "number" && e.niveau > 0) o.level = Math.min(100, Math.round(e.niveau));
    if (typeof e.niveau_max === "number" && e.niveau_max > 0) o.lvMax = Math.min(100, Math.round(e.niveau_max));
    if (typeof e.force === "number" && e.force > 0 && e.force !== 100) o.force = Math.max(10, Math.min(500, e.force)) / 100;
    if (typeof e.etages === "number" && e.etages > 0) o.floors = Math.max(1, Math.min(99, Math.round(e.etages)));
    map[o.code] = o;
  }
  return map;
}
// le fichier du dépôt passe avant celui importé sur l'appareil
function donjonsRefresh() {
  const use = DONJONS.repo || DONJONS.local;
  DONJONS.src = DONJONS.repo ? "dépôt" : DONJONS.local ? "appareil" : "";
  DONJONS.map = use ? donjonParse(use) : {};
}
function donjonsSetRepo(js) { DONJONS.repo = js || null; donjonsRefresh(); }
function donjonsSetLocal(js) { DONJONS.local = js || null; if (js) lsSet(DONJONS_LS, js); else { try { localStorage.removeItem(DONJONS_LS); } catch (e) { } } donjonsRefresh(); }
DONJONS.local = lsGet(DONJONS_LS); donjonsRefresh();

// applique le réglage du fichier à un lieu (kind : "lieu" = donjon normal, "histoire", "special", "inconnu")
function donjonApply(loc, kind) {
  if (!loc || !loc.id) return loc;
  const id = String(loc.id).toUpperCase();
  if (kind === "special") { if (!DONJONS.orig[id]) DONJONS.orig[id] = { common_monsters: (loc.common_monsters || []).slice(), boss: loc.boss, level: loc.level }; Object.assign(loc, JSON.parse(JSON.stringify(DONJONS.orig[id]))); }
  delete loc.spawn; delete loc.lvMax; delete loc.force; delete loc.fromFile;
  const o = DONJONS.map[id]; if (!o) { if (kind === "lieu") { delete DONJONS.pre[id]; delete DONJONS.applied[id]; } return loc; }
  if (kind === "lieu") { const pre = {}; for (const f of DONJON_FIELDS) pre[f] = loc[f] === undefined ? undefined : JSON.parse(JSON.stringify(loc[f])); DONJONS.pre[id] = pre; }
  loc.fromFile = true;
  if (o.mons) {
    const ok = o.mons.filter(x => MON[x.id]);
    if (ok.length) { loc.common_monsters = [...new Set(ok.map(x => x.id))]; loc.spawn = ok; }
  }
  if (o.boss && MON[o.boss]) loc.boss = o.boss;
  if (o.level) loc.level = o.level;
  if (o.lvMax) loc.lvMax = o.lvMax;
  if (o.force) loc.force = o.force;
  if (o.floors && kind === "lieu" && !loc.tower) loc.floors = o.floors;
  if (kind === "lieu") { const ap = {}; for (const f of DONJON_FIELDS) ap[f] = loc[f] === undefined ? undefined : JSON.parse(JSON.stringify(loc[f])); DONJONS.applied[id] = ap; }
  return loc;
}
// l'Atelier n'enregistre pas les valeurs venues du fichier (sinon elles resteraient après les avoir retirées du fichier) ;
// ce que tu as changé toi-même dans l'Atelier est gardé
function donjonsUnbake(mods) {
  if (!mods || !Array.isArray(mods.locations)) return mods;
  const locs = mods.locations.map(l => {
    if (!l || !l.id) return l;
    const id = String(l.id).toUpperCase(), pre = DONJONS.pre[id], ap = DONJONS.applied[id];
    const c = Object.assign({}, l); delete c.spawn; delete c.lvMax; delete c.force; delete c.fromFile;
    if (pre && ap) for (const f of DONJON_FIELDS) if (JSON.stringify(c[f]) === JSON.stringify(ap[f])) { if (pre[f] === undefined) delete c[f]; else c[f] = JSON.parse(JSON.stringify(pre[f])); }
    return c;
  });
  return Object.assign({}, mods, { locations: locs });
}
function donjonsApplyAll() {
  for (const l of DATA.locations) donjonApply(l, "lieu");
  for (const k of ["TOURNOI", "ARENE"]) if (SPECIAL_LOCS[k]) donjonApply(SPECIAL_LOCS[k], "special");
}
// créatures possibles à l'étage actuel (le fichier peut les répartir par étages)
function donjonSpawnList(loc) {
  if (!loc || !loc.spawn) return null;
  const f = (typeof R !== "undefined" && R && R.floor) || 1;
  const ok = loc.spawn.filter(x => MON[x.id]);
  const here = ok.filter(x => !x.f || (f >= x.f[0] && f <= x.f[1]));
  return here.length ? here : ok.length ? ok : null;
}
// tirage : poids du fichier × rareté (les rares et légendaires restent plus rares)
function pickSpawn() {
  const loc = locById(R.loc), list = donjonSpawnList(loc);
  if (!list) return pickByRarity(enemyPool());
  let tot = 0; const ws = list.map(x => { const w = rarityOf(x.id).weight * x.w; tot += w; return w; });
  let r = rnd() * tot;
  for (let i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return list[i].id; }
  return list[0].id;
}
function donjonForce(u) {
  if (!u || u.kind !== "enemy" || typeof R === "undefined" || !R || R.tour) return 1;
  const l = R.loc && (LOC[R.loc] || SPECIAL_LOCS[R.loc]);
  return (l && l.force) || 1;
}
// ---------- tous les donjons connus du jeu ----------
function donjonsAll() {
  const out = [];
  for (const l of DATA.locations) out.push({ code: l.id, loc: l, kind: "lieu" });
  // copies (sans toucher aux missions en cours)
  if (typeof STORY_MISSIONS !== "undefined") for (const id in STORY_MISSIONS) {
    const M = STORY_MISSIONS[id];
    out.push({ code: id, kind: "histoire", loc: donjonApply(Object.assign({ id }, M, { common_monsters: (M.common_monsters || []).filter(m => MON[m]), boss: M.boss && MON[M.boss] ? M.boss : null, level: M.level }), "histoire") });
  }
  for (const k of ["TOURNOI", "ARENE"]) if (SPECIAL_LOCS[k]) out.push({ code: k, loc: SPECIAL_LOCS[k], kind: "special" });
  out.push({ code: "INCONNU", kind: "inconnu", loc: donjonApply({ id: "INCONNU", name: "Donjon inconnu (change à chaque visite)", difficulty: 3, common_monsters: [] }, "inconnu") });
  return out;
}
function donjonBaseLevel(loc) { return typeof loc.level === "number" ? loc.level : [0, 2, 6, 10, 14, 18][clamp(loc.difficulty || 1, 1, 5)]; }
// ce qui ne va pas dans le fichier (créatures inconnues, codes inconnus…)
function donjonsCheck() {
  const errs = [], known = new Set(donjonsAll().map(d => d.code.toUpperCase()));
  for (const code in DONJONS.map) {
    const o = DONJONS.map[code];
    if (!known.has(code)) errs.push(code + " : ce code de donjon n’existe pas dans le jeu.");
    for (const b of o.bad) errs.push(code + " : « " + b + " » n’est pas un numéro de créature.");
    if (o.mons) {
      const miss = [...new Set(o.mons.filter(x => !MON[x.id]).map(x => x.id))];
      if (miss.length) errs.push(code + " : créature" + (miss.length > 1 ? "s " : " ") + miss.join(", ") + (miss.length > 1 ? " absentes du jeu (ignorées)." : " absente du jeu (ignorée)."));
      if (o.mons.length && !o.mons.some(x => MON[x.id])) errs.push(code + " : aucune créature valable, le donjon garde sa liste du jeu.");
    }
    if (o.boss && !MON[o.boss]) errs.push(code + " : le gardien " + o.boss + " n’existe pas dans le jeu (ignoré).");
  }
  return errs;
}
// ---------- modèle à jour, prêt à modifier ----------
function donjonsTemplate() {
  const q = s => JSON.stringify(s);
  const label = id => id + (MON[id] ? " " + MON[id].name : "");
  const lines = ["{", "  \"_aide\": ["];
  const help = [
    "Une entrée par donjon. Le code (L01, E_ABYSSES, S_KYOGRE…) ne change jamais.",
    "creatures : les créatures qui apparaissent. Seul le numéro compte, le nom après est là pour t’aider : \"045 Rapinard\", \"0150\" ou 150.",
    "Pour des étages précis ou plus souvent : {\"id\": \"150\", \"etages\": \"1-3\", \"poids\": 2}  (poids 2 = deux fois plus souvent ; les rares et légendaires restent plus rares).",
    "gardien : la créature du dernier étage (\"\" = celle du jeu).",
    "niveau : niveau des créatures au 1er étage (il monte un peu à chaque étage). Après le chapitre 1, elles suivent aussi ton niveau.",
    "niveau_max : elles ne dépassent jamais ce niveau (le gardien peut avoir 2 niveaux de plus). null = pas de limite.",
    "force : 100 = normal, 70 = 30 % moins fortes, 130 = 30 % plus fortes.",
    "etages : nombre d’étages (donjons du menu seulement). Un donjon retiré du fichier reprend les réglages du jeu."
  ];
  help.forEach((h, i) => lines.push("    " + q(h) + (i < help.length - 1 ? "," : "")));
  lines.push("  ],", "  \"donjons\": {");
  const all = donjonsAll();
  all.forEach((d, i) => {
    const l = d.loc, o = DONJONS.map[d.code.toUpperCase()];
    const mons = (l.common_monsters || []).filter(id => MON[id]);
    let cre;
    if (o && o.mons) cre = o.mons.map(x => (x.f || x.w !== 1) ? "{\"id\": " + q(label(x.id)) + (x.f ? ", \"etages\": " + q(x.f[0] + (x.f[1] === x.f[0] ? "" : "-" + (x.f[1] >= 9999 ? "" : x.f[1]))) : "") + (x.w !== 1 ? ", \"poids\": " + x.w : "") + "}" : q(label(x.id)));
    else cre = mons.map(id => q(label(id)));
    const fields = ["\"nom\": " + q(l.name || d.code)];
    if (d.kind === "lieu" && !l.tower) fields.push("\"etages\": " + (l.floors || 5));
    fields.push("\"niveau\": " + (o && o.level ? o.level : donjonBaseLevel(l)), "\"niveau_max\": " + (o && o.lvMax ? o.lvMax : "null"), "\"force\": " + (o && o.force ? Math.round(o.force * 100) : 100));
    const boss = l.boss && MON[l.boss] ? label(l.boss) : "";
    fields.push("\"gardien\": " + q(boss));
    const note = d.kind === "histoire" ? (l.tower ? "Tour de 100 étages : liste vide = toutes les créatures communes et rares." : "Mission de l’histoire.") : d.kind === "inconnu" ? "Liste vide = 6 créatures au hasard à chaque visite." : d.code === "TOURNOI" ? "Créatures sauvages du tournoi (les équipes rivales ne changent pas)." : "";
    if (note) fields.push("\"_note\": " + q(note));
    lines.push("    " + q(d.code) + ": {");
    lines.push("      " + fields.join(", ") + ",");
    lines.push("      \"creatures\": [" + cre.join(", ") + "]");
    lines.push("    }" + (i < all.length - 1 ? "," : ""));
  });
  lines.push("  }", "}");
  return lines.join("\n") + "\n";
}
