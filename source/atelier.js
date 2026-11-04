// ============================================================
//  ATELIER : modifier créatures, attaques, lieux, sprites PMD
// ============================================================
const ATL = { tab: "mons", jsonKind: "monsters", preview: null };
function currentMods() {
  const t = (MODS && MODS.trash) || {};
  return { monsters: JSON.parse(JSON.stringify(DATA.monsters)), attacks: JSON.parse(JSON.stringify(DATA.attacks)), locations: JSON.parse(JSON.stringify(DATA.locations)), items: JSON.parse(JSON.stringify(DATA.items || DEFAULT_DATA.items)), trash: { monsters: JSON.parse(JSON.stringify(t.monsters || [])), attacks: JSON.parse(JSON.stringify(t.attacks || [])), items: JSON.parse(JSON.stringify(t.items || [])) } };
}
// Enregistre l'Atelier. La version précédente est toujours gardée dans l'historique.
async function commitMods(mods, okText, label) {
  const err = validateAll(mods);
  if (err) { toast(err, 4200); return false; }
  if (!mods.trash) mods.trash = currentMods().trash;
  mods = withRemoved(mods);
  const prev = MODS ? JSON.parse(JSON.stringify(MODS)) : withRemoved(currentMods());
  applyMods(mods);
  await Store.snapshotMods(prev, label || okText);
  const where = await Store.saveMods(mods);
  toast(okText ? okText + (where === "shared" ? " (partagé)" : "") : (where === "shared" ? "Enregistré pour tous les joueurs de cette page." : "Enregistré sur cet appareil."));
  renderAtelier();
  return true;
}
function validateAll(d) {
  return validateKind("monsters", d.monsters, d) || validateKind("attacks", d.attacks, d) || validateKind("locations", d.locations, d) || (Array.isArray(d.items) ? validateKind("items", d.items, d) : null);
}
function validateKind(kind, arr, all) {
  if (!Array.isArray(arr)) return kind + " : il faut une liste [ … ].";
  if (!arr.length) return kind + " : la liste est vide.";
  const ids = new Set();
  for (const [i, o] of arr.entries()) {
    const where = kind + " n°" + (i + 1) + (o && o.name ? " (" + o.name + ")" : "");
    if (!o || typeof o !== "object") return where + " : ce n’est pas un objet.";
    if (o.id == null || String(o.id).trim() === "") return where + " : « id » manquant.";
    o.id = String(o.id);
    if (ids.has(o.id)) return where + " : l’id « " + o.id + " » est en double.";
    ids.add(o.id);
    if (!o.name || typeof o.name !== "string") return where + " : « name » manquant.";
    if (kind === "monsters") {
      if (!Array.isArray(o.types) || !o.types.length) return where + " : « types » doit être une liste, ex. [\"Feu\"].";
      for (const k of ["hp", "attack", "defense", "speed"]) if (typeof o[k] !== "number" || o[k] <= 0) return where + " : « " + k + " » doit être un nombre positif.";
      if (!Array.isArray(o.moves)) return where + " : « moves » doit être une liste d’ids d’attaques.";
    }
    if (kind === "attacks") {
      if (!o.type) return where + " : « type » manquant.";
      for (const k of ["power", "accuracy", "pp"]) if (typeof o[k] !== "number" || o[k] < 0) return where + " : « " + k + " » doit être un nombre.";
      if (o.range && !["front", "line", "room", "self"].includes(o.range)) return where + " : « range » doit valoir front, line, room ou self.";
    }
    if (kind === "items") {
      if (!ITEM_KINDS[o.kind]) return where + " : « kind » doit être un de : " + Object.keys(ITEM_KINDS).join(", ") + ".";
      if (o.kind === "equip" && (typeof o.bonus !== "object" || !o.bonus)) return where + " : un équipement a besoin de « bonus », ex. {\"attack\": 4}.";
    }
    if (kind === "locations") {
      if (!Array.isArray(o.common_monsters) || !o.common_monsters.length) return where + " : « common_monsters » doit lister au moins une créature.";
      if (all && all.monsters) { const mids = new Set(all.monsters.map(m => String(m.id))); const bad = o.common_monsters.find(id => !mids.has(String(id))); if (bad) return where + " : la créature « " + bad + " » n’existe pas."; }
    }
  }
  return null;
}
function openAtelier() {
  showScreen("atelier");
  renderAtelier();
}
function renderAtelier() {
  for (const b of $$("#atlTabs button")) b.classList.toggle("on", b.dataset.tab === ATL.tab);
  for (const p of $$(".atl-pane")) p.hidden = p.id !== "atl-" + ATL.tab;
  const note = $("#atlWhere");
  if (Store.db && Store.canEdit) note.textContent = "Tes modifications sont enregistrées avec la page : tous ceux qui l’ouvrent jouent avec tes créatures et tes sprites.";
  else if (Store.db) note.textContent = "Tu peux tester des modifications, mais seul le propriétaire de la page peut les partager. Elles restent sur cet appareil.";
  else note.textContent = "Tes modifications sont enregistrées dans ce navigateur.";
  if (ATL.tab === "mons") renderMonList();
  if (ATL.tab === "atks") renderAtkList();
  if (ATL.tab === "items") renderItemList();
  if (ATL.tab === "types") renderTypeChart();
  if (ATL.tab === "tools") renderTools();
  if (ATL.tab === "folder") renderFolder();
  if (ATL.tab === "hist") renderHistory();
  if (ATL.tab === "json") renderJson();
}
function renderMonList() {
  const list = $("#atlMonList"); list.replaceChildren();
  for (const m of DATA.monsters) {
    const b = el("button", "atl-row"); b.type = "button";
    const cv = el("canvas", "atl-thumb");
    const tx = el("span", "atl-tx");
    tx.append(el("b", null, m.name), el("small", null, "#" + m.id + " · " + (m.types || []).join(" / ") + (SPRITES[m.id] ? " · sprite PMD" : "")));
    b.append(cv, tx, el("span", "atl-go", "Modifier"));
    b.onclick = () => editMonster(m.id);
    list.append(b);
    requestAnimationFrame(() => paintPortrait(cv, m.id, { still: true, body: true }));
  }
}
function field(label, input) { const w = el("label", "fld"); w.append(el("span", null, label), input); return w; }
function inp(type, val, attrs) { const i = el("input"); i.type = type; i.value = val == null ? "" : val; for (const k in attrs || {}) i.setAttribute(k, attrs[k]); return i; }
function sel(options, val) { const s = el("select"); for (const [v, l] of options) { const o = el("option", null, l); o.value = v; if (String(v) === String(val)) o.selected = true; s.append(o); } return s; }
function editMonster(mid, isNew) {
  const src = isNew ? { id: mid, name: "Nouvelle créature", types: ["Normal"], hp: 40, attack: 20, defense: 18, speed: 18, moves: ["A01"], description: "", form: "blob" } : JSON.parse(JSON.stringify(MON[mid]));
  const f = el("form", "atl-form"); f.id = "monForm";
  f.onsubmit = e => e.preventDefault();
  const name = inp("text", src.name, { id: "fName", maxlength: "24" });
  const desc = el("textarea"); desc.id = "fDesc"; desc.rows = 2; desc.value = src.description || "";
  const tOpts = TYPES.map(t => [t, t]);
  const t1 = sel(tOpts, (src.types || [])[0] || "Normal"); t1.id = "fT1";
  const t2 = sel([["", "—"]].concat(tOpts), (src.types || [])[1] || ""); t2.id = "fT2";
  const form = sel(FORMS.map(x => [x, FORM_LABELS[x]]), formOf(src)); form.id = "fForm";
  const nums = {};
  const grid = el("div", "fld-grid");
  for (const [k, lab] of [["hp", "PV"], ["attack", "Attaque"], ["defense", "Défense"], ["speed", "Vitesse"]]) { nums[k] = inp("number", src[k], { id: "f_" + k, min: "1", max: "255", inputmode: "numeric" }); grid.append(field(lab, nums[k])); }
  const mvSel = [];
  const mvGrid = el("div", "fld-grid");
  const aOpts = [["", "—"]].concat(DATA.attacks.map(a => [a.id, a.name + " (" + a.type + ")"]));
  for (let k = 0; k < 4; k++) { const s = sel(aOpts, (src.moves || [])[k] || ""); s.id = "fMove" + k; mvSel.push(s); mvGrid.append(field("Capacité " + (k + 1), s)); }
  const tg = el("div", "fld-grid"); tg.append(field("Type 1", t1), field("Type 2", t2));
  const rar = sel([["1", "Commune (×1)"], ["2", "Rare (×1,14 · apparaît 5× moins)"], ["3", "Légendaire (×1,32 · très rare)"]], String(src.rarity || 1));
  const rec = inp("number", typeof src.recruit_rate === "number" ? src.recruit_rate : "", { min: "0", max: "100", placeholder: "auto", inputmode: "numeric" });
  const drp = inp("number", typeof src.drop_rate === "number" ? src.drop_rate : "", { min: "0", max: "100", placeholder: "30", inputmode: "numeric" });
  const rg = el("div", "fld-grid"); rg.append(field("Rareté", rar), field("Recrutement %", rec), field("Butin %", drp));
  f.append(field("Nom", name), field("Description", desc), tg, field("Apparence (si pas de sprite)", form), el("h4", "fld-h", "Rareté et recrutement"), rg, el("p", "sheet-note", "Plus une créature est rare, plus elle est forte et plus elle est difficile à croiser. Recrutement : chance qu’elle veuille te rejoindre après l’avoir battue (vide = selon la rareté : 18 %, 8 % ou 3 %)."), el("h4", "fld-h", "Statistiques de base"), grid, el("h4", "fld-h", "Capacités"), mvGrid);
  // sprite
  const sp = el("div", "atl-sprite");
  const pv = el("canvas", "atl-preview"); pv.id = "atlPreview";
  const side = el("div", "atl-sprite-side");
  side.append(el("h4", "fld-h", "Sprite"));
  const status = el("p", "sheet-note", SPRITES[src.id] ? "Sprite PMD importé" + (SPRITES[src.id].doc && SPRITES[src.id].doc.where === "shared" ? " (partagé avec la page)." : " (sur cet appareil).") : "Dessin original généré par le jeu.");
  const file = el("input"); file.type = "file"; file.multiple = true; file.accept = ".xml,.png,.zip"; file.id = "fSprite"; file.className = "file-in";
  const fileBtn = el("label", "btn small"); fileBtn.htmlFor = "fSprite"; fileBtn.textContent = SPRITES[src.id] ? "Remplacer le sprite" : "Importer un sprite PMD";
  const rm = el("button", "btn small ghost", "Retirer le sprite"); rm.type = "button"; rm.hidden = !SPRITES[src.id];
  side.append(status, file, fileBtn, rm, el("p", "sheet-note", "Choisis AnimData.xml et les fichiers *-Anim.png (au moins Walk), ou directement le .zip du dossier. Ajoute Normal.png pour le portrait."));
  sp.append(pv, side);
  f.append(sp);
  ATL.preview = { canvas: pv, mid: src.id, t0: performance.now() };
  file.onchange = async () => {
    if (!file.files.length) return;
    status.textContent = "Import en cours…";
    try {
      const { doc, blobs } = await readSpriteFiles(Array.from(file.files));
      doc.mid = src.id;
      const stored = await Store.storeSprite(src.id, doc, blobs);
      loadSpriteDoc(stored);
      status.textContent = "Sprite importé : " + Object.keys(doc.anims).join(", ") + (stored.where === "shared" ? " · partagé avec la page." : stored.where === "local" ? " · gardé sur cet appareil." : " · non sauvegardé (stockage indisponible).");
      rm.hidden = false; fileBtn.textContent = "Remplacer le sprite";
      if (isNew) toast("Pense à enregistrer la créature.");
    } catch (e) {
      status.textContent = "Import impossible : " + (e && e.message ? e.message : e);
    }
    file.value = "";
  };
  rm.onclick = async () => {
    const s = SPRITES[src.id];
    await Store.removeSprite(src.id, s && s.doc);
    delete SPRITES[src.id];
    status.textContent = "Sprite retiré. Le dessin original est utilisé.";
    rm.hidden = true; fileBtn.textContent = "Importer un sprite PMD";
  };
  const save = async () => {
    const m = {
      id: src.id, name: name.value.trim() || "Sans nom",
      types: [t1.value].concat(t2.value && t2.value !== t1.value ? [t2.value] : []),
      hp: +nums.hp.value || 1, attack: +nums.attack.value || 1, defense: +nums.defense.value || 1, speed: +nums.speed.value || 1,
      moves: mvSel.map(s => s.value).filter(Boolean),
      description: desc.value.trim(), form: form.value, rarity: +rar.value || 1
    };
    if (rec.value !== "") m.recruit_rate = clamp(+rec.value, 0, 100);
    if (drp.value !== "") m.drop_rate = clamp(+drp.value, 0, 100);
    for (const k in src) if (!(k in m) && !(k === "recruit_rate" && rec.value === "") && !(k === "drop_rate" && drp.value === "")) m[k] = src[k];
    const mods = currentMods();
    const i = mods.monsters.findIndex(x => x.id === m.id);
    if (i >= 0) mods.monsters[i] = m; else mods.monsters.push(m);
    if (await commitMods(mods, m.name + " enregistré.", (i >= 0 ? "Créature modifiée : " : "Créature créée : ") + m.name)) { ATL.preview = null; closeSheet(); }
  };
  const acts = [{ label: "Annuler", cls: "ghost", fn: () => { ATL.preview = null; } }, { label: "Enregistrer", cls: "primary", fn: save, keep: true }];
  if (!isNew && DATA.monsters.length > 2) acts.unshift({ label: "Supprimer", cls: "danger", keep: true, fn: () => confirmDeleteMon(src.id) });
  openSheet({ title: isNew ? "Nouvelle créature" : src.name, body: f, actions: acts, tall: true, onClose: () => { ATL.preview = null; } });
}
function confirmDeleteMon(mid) {
  const m = MON[mid];
  openSheet({
    title: "Mettre " + m.name + " à la corbeille ?", body: el("p", "sheet-text", "La créature quitte les donjons et va dans la corbeille de l’Atelier (onglet Historique). Tu peux la restaurer quand tu veux."), actions: [
      { label: "Annuler", cls: "ghost", fn: () => editMonster(mid) },
      {
        label: "Mettre à la corbeille", cls: "danger", fn: async () => {
          const mods = currentMods();
          mods.monsters = mods.monsters.filter(x => x.id !== mid);
          mods.trash.monsters.push(Object.assign({}, m, { deletedAt: Date.now() }));
          for (const l of mods.locations) { l.common_monsters = l.common_monsters.filter(id => id !== mid); if (!l.common_monsters.length) l.common_monsters = [mods.monsters[0].id]; if (l.boss === mid) delete l.boss; }
          await commitMods(mods, m.name + " est dans la corbeille.", "Créature à la corbeille : " + m.name);
        }
      }
    ]
  });
}
function newMonster() { editMonster(nextMonId(), true); }
function atelierTick(now) {
  const p = ATL.preview;
  if (!p || !p.canvas.isConnected) return;
  const { ctx, w, h, dpr } = fitCanvas(p.canvas);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#0f2a36"; ctx.fillRect(0, 0, w, h);
  const k = ((now - p.t0) / 1600) | 0;
  const dirs = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
  const d = dirs[k % 8];
  const s = Math.min(w, h) * 0.62;
  drawShadow(ctx, w / 2, h * 0.8, s);
  drawCreature(ctx, p.mid, w / 2, h * 0.8, s, { t: now, dir: d, moving: true, anim: "Walk" });
}
// ---- JSON ----
function renderJson() {
  for (const b of $$("#jsonKinds button")) b.classList.toggle("on", b.dataset.kind === ATL.jsonKind);
  const ta = $("#jsonText");
  ta.value = JSON.stringify(DATA[ATL.jsonKind], null, 2);
  $("#jsonErr").textContent = "";
  $("#btnJsonDl").hidden = !Store.downloads;
}
async function applyJson() {
  let arr;
  try { arr = JSON.parse($("#jsonText").value); }
  catch (e) { $("#jsonErr").textContent = "JSON invalide : " + e.message; return; }
  const mods = currentMods();
  // ce qui disparaît de la liste part à la corbeille (rien n'est perdu)
  const kind = ATL.jsonKind;
  if (mods.trash[kind]) { const keep = new Set((Array.isArray(arr) ? arr : []).map(x => x && String(x.id))); for (const o of mods[kind]) if (!keep.has(String(o.id))) mods.trash[kind].push(Object.assign({}, o, { deletedAt: Date.now() })); }
  mods[kind] = arr;
  const err = validateAll(mods);
  if (err) { $("#jsonErr").textContent = err; return; }
  await commitMods(mods, kind + ".json appliqué.", "JSON modifié : " + kind);
}
function resetJson() {
  openSheet({ title: "Revenir aux valeurs d’origine ?", body: el("p", "sheet-text", "La liste " + ATL.jsonKind + " reprend les valeurs du jeu. Tes versions actuelles sont gardées dans l’historique et les éléments ajoutés vont dans la corbeille : tu pourras tout récupérer."), actions: [
    { label: "Annuler", cls: "ghost" },
    { label: "Revenir à l’origine", cls: "danger", fn: async () => {
      const mods = currentMods(); const kind = ATL.jsonKind;
      const defIds = new Set(DEFAULT_DATA[kind].map(x => String(x.id)));
      if (mods.trash[kind]) for (const o of mods[kind]) if (!defIds.has(String(o.id))) mods.trash[kind].push(Object.assign({}, o, { deletedAt: Date.now() }));
      mods[kind] = JSON.parse(JSON.stringify(DEFAULT_DATA[kind]));
      if (kind === "monsters") { const ids = new Set(mods.monsters.map(m => m.id)); for (const l of mods.locations) { l.common_monsters = l.common_monsters.filter(id => ids.has(id)); if (!l.common_monsters.length) l.common_monsters = [mods.monsters[0].id]; } }
      await commitMods(mods, "Valeurs d’origine rétablies.", "Retour aux valeurs d’origine : " + kind);
    } }
  ] });
}
async function copyJson() {
  const ta = $("#jsonText");
  try { await navigator.clipboard.writeText(ta.value); toast("Copié."); }
  catch (e) { ta.focus(); ta.select(); toast("Texte sélectionné : copie-le avec ton téléphone."); }
}
async function downloadJson() {
  const r = await Store.download(ATL.jsonKind + ".json", $("#jsonText").value);
  if (r === "ok") toast("Fichier enregistré.");
  else if (r === "error") toast("Le téléchargement n’a pas marché. Utilise « Copier ».");
}
// ---- lecture des sprites PMD ----
let JSZIP_P = null;
function loadJSZip() {
  if (window.JSZip) return Promise.resolve(window.JSZip);
  if (!JSZIP_P) JSZIP_P = new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    s.onload = () => res(window.JSZip); s.onerror = () => { JSZIP_P = null; rej(new Error("impossible de lire le .zip ici, choisis les fichiers un par un")); };
    document.head.append(s);
  });
  return JSZIP_P;
}
async function readSpriteFiles(files) {
  const map = {};
  for (const f of files) {
    if (/\.zip$/i.test(f.name)) {
      const JSZip = await loadJSZip();
      const zip = await JSZip.loadAsync(f);
      for (const z of Object.values(zip.files)) {
        if (z.dir) continue;
        const base = z.name.split("/").pop();
        if (/\.(xml|png)$/i.test(base)) map[base.toLowerCase()] = await z.async("blob");
      }
    } else map[f.name.toLowerCase()] = f;
  }
  const xml = map["animdata.xml"];
  if (!xml) throw new Error("AnimData.xml introuvable.");
  const text = await xml.text();
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new Error("AnimData.xml illisible.");
  const anims = {};
  for (const a of Array.from(doc.getElementsByTagName("Anim"))) {
    const g = tag => { const n = a.getElementsByTagName(tag)[0]; return n ? n.textContent.trim() : null; };
    const name = g("Name"); if (!name) continue;
    const copy = g("CopyOf");
    if (copy) { anims[name] = { copyOf: copy }; continue; }
    const durs = Array.from(a.getElementsByTagName("Duration")).map(d => +d.textContent || 1);
    anims[name] = { fw: +g("FrameWidth"), fh: +g("FrameHeight"), durs };
  }
  const out = { anims: {} }, blobs = {};
  for (const n of ["Idle", "Walk", "Attack", "Hurt", "Sleep"]) {
    let a = anims[n], srcName = n;
    if (a && a.copyOf) { srcName = a.copyOf; a = anims[a.copyOf]; }
    if (!a || !a.fw || !a.fh) continue;
    const png = map[(srcName + "-anim.png").toLowerCase()];
    if (!png) continue;
    out.anims[n] = { fw: a.fw, fh: a.fh, durs: a.durs.length ? a.durs : [8] };
    blobs[n] = png;
  }
  if (!out.anims.Walk && !out.anims.Idle) throw new Error("il faut au moins Walk-Anim.png (ou Idle-Anim.png) en plus d’AnimData.xml.");
  if (map["normal.png"]) blobs.portrait = map["normal.png"];
  return { doc: out, blobs };
}
