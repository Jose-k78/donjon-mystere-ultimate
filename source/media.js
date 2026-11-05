// ============================================================
//  GRAPHICS & SONS : images et musiques personnalisées
//  Chaque « emplacement » (slot) a une clé. Si une image est mise
//  dans un emplacement, le jeu l'utilise à la place de son dessin.
// ============================================================
const TITLE_DECOR_NAMES = { nuit: "nuit", foret: "forêt", coucher: "coucher de soleil", neige: "neige", grotte: "grotte" };
function mediaSlots() {
  const S = [];
  const add = (g, k, n, size, kind) => S.push({ g, k, n, size, kind: kind || "img" });
  for (const d of DECORS) add("decors", "bg.title." + d.key, "Écran titre : " + TITLE_DECOR_NAMES[d.key], "1080 × 1920");
  add("decors", "bg.beachDay", "Lancement : plage de jour", "1080 × 1920");
  add("decors", "bg.psy", "La voix (fond psychédélique)", "1080 × 1920");
  add("decors", "bg.beachSunset", "Plage au coucher du soleil", "1080 × 1920");
  add("decors", "bg.beachRocks", "Plage avec rochers (les voleurs)", "1080 × 1920");
  add("decors", "bg.entrance", "Entrée de la Forêt Verdoyante", "1080 × 1920");
  add("decors", "bg.clearing", "Clairière (fin du chapitre)", "1080 × 1920");
  add("decors", "bg.sky", "Ciel étoilé", "1080 × 1920");
  add("decors", "bg.dark", "Forêt sombre (la silhouette)", "1080 × 1920");
  add("decors", "bg.logo", "Fond derrière le logo", "1080 × 1920");
  add("decors", "bg.hub", "Menu d’accueil", "1080 × 1920");
  add("decors", "bg.map", "Carte de l’île", "1080 × 1920");
  add("decors", "bg.house", "Chapitre 2 : maison du partenaire", "1080 × 1920");
  add("decors", "bg.kingdom", "Chapitre 2 : portes du Royaume", "1080 × 1920");
  add("decors", "bg.arena", "Chapitre 2 : arène (tribunes)", "1080 × 1920");
  add("decors", "bg.balcony", "Chapitre 2 : balcon des capitaines", "1080 × 1920");
  add("elements", "deco.soleil", "Soleil", "256 × 256, fond transparent");
  add("elements", "deco.lune", "Lune", "256 × 256, fond transparent");
  add("elements", "deco.nuage", "Nuage", "512 × 256, fond transparent");
  add("elements", "deco.lettre", "Lettre de la Guilde", "256 × 256, fond transparent");
  add("elements", "deco.pendentif", "Pendentif d’Étoile", "256 × 256, fond transparent");
  add("elements", "deco.silhouette", "Silhouette mystérieuse", "512 × 512, fond transparent");
  for (const l of DATA.locations.concat([SPECIAL_LOCS.TOURNOI])) {
    add("donjons", "tile." + l.id + ".mur", l.name + " : mur", "96 × 96");
    add("donjons", "tile." + l.id + ".sol", l.name + " : sol", "96 × 96");
    add("donjons", "tile." + l.id + ".couloir", l.name + " : couloir", "96 × 96");
    add("donjons", "tile." + l.id + ".escalier", l.name + " : escalier", "96 × 96");
  }
  add("donjons", "tile.glace", "Glace glissante", "96 × 96");
  add("donjons", "tile.dalle", "Dalle électrifiée", "96 × 96");
  add("donjons", "tile.piege.pics", "Piège à pics", "96 × 96, fond transparent");
  add("donjons", "tile.piege.tp", "Piège de téléportation", "96 × 96, fond transparent");
  for (const id in ITEMS) add("objets", "item." + id, ITEMS[id].name, "128 × 128, fond transparent");
  for (const m of DATA.monsters) add("creatures", "mon." + m.id, m.name, "256 × 256, tourné vers la droite, fond transparent");
  add("interface", "ui.logo", "Logo du jeu", "1024 × 640, fond transparent");
  add("royaume", "town.herbe", "Royaume : herbe", "96 × 96");
  add("royaume", "town.pave", "Royaume : pavés", "96 × 96");
  add("royaume", "town.eau", "Royaume : eau de la fontaine", "96 × 96");
  add("royaume", "town.arbre", "Royaume : arbre", "128 × 128, fond transparent");
  add("royaume", "town.etal", "Royaume : étal du marché", "128 × 128, fond transparent");
  for (const b of TOWN_BUILDING_SKINS) add("royaume", "town." + b[0], "Royaume : " + b[1], "512 × 384, fond transparent");
  const music = [["bgm.titre", "Écran titre"], ["bgm.voix", "La voix"], ["bgm.histoire", "Scènes du chapitre"], ["bgm.carte", "Carte"], ["bgm.accueil", "Menu d’accueil"], ["bgm.donjon", "Donjons (par défaut)"]];
  for (const [k, n] of music) add("sons", k, n, "MP3, OGG, WAV ou M4A", "audio");
  for (const l of DATA.locations) add("sons", "bgm.donjon." + l.id, "Donjon : " + l.name, "MP3, OGG, WAV ou M4A", "audio");
  add("sons", "bgm.royaume", "Le Royaume (ville)", "MP3, OGG, WAV ou M4A", "audio");
  add("sons", "bgm.donjon.TOURNOI", "Donjon du Tournoi", "MP3, OGG, WAV ou M4A", "audio");
  add("sons", "bgm.chapitre2", "Scènes du chapitre 2", "MP3, OGG, WAV ou M4A", "audio");
  add("sons", "bgm.boss", "Combat de boss", "MP3, OGG, WAV ou M4A", "audio");
  add("sons", "bgm.fin", "Fin du chapitre", "MP3, OGG, WAV ou M4A", "audio");
  add("sons", "bgm.ombre", "La silhouette", "MP3, OGG, WAV ou M4A", "audio");
  for (const [k, n] of [["bgm.chapitre3", "Scènes du chapitre 3"], ["bgm.chapitre4", "Scènes du chapitre 4"], ["bgm.chapitre5", "Scènes du chapitre 5"], ["bgm.epilogue", "Épilogue"]]) add("sons", k, n, "MP3, OGG, WAV ou M4A", "audio");
  for (const [k, n] of [["bg.throne", "Salle du trône"], ["bg.council", "Salle du Conseil"], ["bg.guildhall", "Maison des Guildes"], ["bg.abyss", "Abysse des Tempêtes"], ["bg.crater", "Cratère des Champions"], ["bg.garden", "Jardin des Cœurs"], ["bg.glacier", "Glacier"], ["bg.clock", "Ruines du Temps"], ["bg.night", "Tour des Échos (nuit)"], ["bg.circus", "Cirque des Anneaux"], ["bg.sewer", "Bas-Fonds"], ["bg.library", "Archives Interdites"], ["bg.rift", "Cœur de la Faille"], ["bg.towerbase", "Pied de la Tour Céleste"], ["bg.towertop", "Sommet de la Tour Céleste"], ["bg.festival", "Fête des Serments"], ["bg.rooftop", "Toit de l’auberge"], ["bg.beachDawn", "Plage à l’aube"]]) add("decors", k, "Histoire : " + n, "1080 × 1920");
  for (const id in STORY_MISSIONS) {
    const n = STORY_MISSIONS[id].name;
    add("sons", "bgm.donjon." + id, "Mission : " + n, "MP3, OGG, WAV ou M4A", "audio");
    for (const [part, lab] of [["mur", "mur"], ["sol", "sol"], ["couloir", "couloir"], ["escalier", "escalier"]]) add("donjons", "tile." + id + "." + part, "Mission " + n + " : " + lab, "96 × 96");
  }
  return S;
}
function slugName(n) { return String(n || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, ""); }
const SLOT_FOLDERS = { decors: "decors", elements: "elements", donjons: "donjons", objets: "objets", creatures: "creatures", interface: "interface", royaume: "royaume" };
// nom du fichier modèle sur l'ordinateur (dossier graphics / sons)
function slotFile(s) {
  if (s.kind === "audio") return "sons/" + s.k + ".mp3";
  return "graphics/" + SLOT_FOLDERS[s.g] + "/" + s.k + (s.g === "creatures" ? "-" + slugName(s.n) : "") + ".png";
}
function slotPixelSize(s) {
  const m = /(\d+)\s*×\s*(\d+)/.exec(s.size || ""); return m ? [+m[1], +m[2]] : [256, 256];
}
const STUDIO_TABS = [["decors", "Décors"], ["elements", "Éléments"], ["donjons", "Donjons"], ["objets", "Objets"], ["creatures", "Créatures"], ["interface", "Logo"], ["royaume", "Royaume"], ["sons", "Sons"]];

// ------------------------------------------------------------
//  CHARGEMENT
// ------------------------------------------------------------
const MEDIA = { idx: {}, img: {}, audioURL: {} };
function mediaImg(key) {
  const im = MEDIA.img[key];
  return im && im.complete && im.naturalWidth ? im : null;
}
function mediaURL(d) { return d.asset ? "/_blob/" + d.asset : null; }
async function loadAllMedia() {
  const idx = await Store.loadMediaIndex();
  MEDIA.idx = idx;
  for (const k in MEDIA.audioURL) { try { URL.revokeObjectURL(MEDIA.audioURL[k]); } catch (e) { } }
  MEDIA.img = {}; MEDIA.audioURL = {};
  for (const key in idx) {
    const d = idx[key];
    if (d.kind === "img") {
      const im = new Image();
      if (d.asset) im.src = mediaURL(d);
      else if (d.blob) im.src = URL.createObjectURL(d.blob);
      MEDIA.img[key] = im;
    }
  }
  applyCustomLogo();
  if (typeof syncApplyMedia === "function" && typeof SYNC !== "undefined" && SYNC.status !== "off") await syncApplyMedia();
}
async function audioURLFor(key) {
  if (MEDIA.audioURL[key]) return MEDIA.audioURL[key];
  const d = MEDIA.idx[key]; if (!d || d.kind !== "audio") return null;
  let blob = null;
  try {
    if (d.repo) blob = await syncAudioBlob(d);
    else if (d.blob) blob = d.blob;
    else if (d.asset && d.b64) {
      const txt = await (await fetch(mediaURL(d))).text();
      const bin = atob(txt.trim()); const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      blob = new Blob([arr], { type: d.mime || "audio/mpeg" });
    } else if (d.asset) return (MEDIA.audioURL[key] = mediaURL(d));
  } catch (e) { return null; }
  if (!blob) return null;
  return (MEDIA.audioURL[key] = URL.createObjectURL(blob));
}
function applyCustomLogo() {
  const im = mediaImg("ui.logo") || (MEDIA.img["ui.logo"] || null);
  for (const lg of $$(".logo")) {
    let img = lg.querySelector(".logo-img");
    if (im) {
      if (!img) { img = el("img", "logo-img"); img.alt = ""; lg.append(img); }
      img.src = im.src; lg.classList.add("custom");
    } else { lg.classList.remove("custom"); if (img) img.remove(); }
  }
}
// Dessine une image en remplissant toute la zone (comme un fond d'écran)
function drawCover(ctx, im, w, h) {
  const r = Math.max(w / im.naturalWidth, h / im.naturalHeight);
  const iw = im.naturalWidth * r, ih = im.naturalHeight * r;
  ctx.drawImage(im, (w - iw) / 2, (h - ih) / 2, iw, ih);
}
function drawContain(ctx, im, cx, cy, size) {
  const r = size / Math.max(im.naturalWidth, im.naturalHeight);
  const iw = im.naturalWidth * r, ih = im.naturalHeight * r;
  ctx.drawImage(im, cx - iw / 2, cy - ih / 2, iw, ih);
}
// Image de fond personnalisée ? (sinon on garde le dessin du jeu)
function customBg(ctx, key, w, h) {
  const im = mediaImg(key); if (!im) return false;
  drawCover(ctx, im, w, h); return true;
}

// ------------------------------------------------------------
//  MUSIQUE
// ------------------------------------------------------------
const MUSIC = { want: null, key: null, el: null, blocked: false, seq: 0 };
function resolveMusic(key) {
  if (!key) return null;
  if (MEDIA.idx[key]) return key;
  if (key.startsWith("bgm.donjon.") && MEDIA.idx["bgm.donjon"]) return "bgm.donjon";
  return null;
}
function setMusic(key) { MUSIC.want = key; refreshMusic(); }
async function refreshMusic() {
  const key = OPTS.music === false ? null : resolveMusic(MUSIC.want);
  if (key === MUSIC.key && MUSIC.el && !MUSIC.blocked) return;
  const seq = ++MUSIC.seq;
  const old = MUSIC.el; MUSIC.el = null; MUSIC.key = key;
  if (old) fadeOutAudio(old);
  if (!key) return;
  const url = await audioURLFor(key);
  if (seq !== MUSIC.seq || !url) return;
  const a = new Audio(url); a.loop = true; a.volume = 0;
  MUSIC.el = a;
  try { await a.play(); MUSIC.blocked = false; fadeInAudio(a); }
  catch (e) { MUSIC.blocked = true; }
}
function fadeInAudio(a) { const target = OPTS.musicVol == null ? 0.6 : OPTS.musicVol; let v = 0; const t = setInterval(() => { v = Math.min(target, v + 0.05); a.volume = v; if (v >= target) clearInterval(t); }, 60); }
function fadeOutAudio(a) { let v = a.volume; const t = setInterval(() => { v = Math.max(0, v - 0.08); a.volume = v; if (v <= 0) { clearInterval(t); a.pause(); } }, 60); }
// le navigateur bloque le son avant le premier toucher : on réessaie à ce moment-là
document.addEventListener("pointerdown", () => { if (MUSIC.blocked && MUSIC.el) { MUSIC.el.play().then(() => { MUSIC.blocked = false; fadeInAudio(MUSIC.el); }).catch(() => { }); } else if (MUSIC.want && !MUSIC.el) refreshMusic(); }, true);

// ------------------------------------------------------------
//  STUDIO « GRAPHICS » (réservé au propriétaire)
// ------------------------------------------------------------
const STUDIO = { tab: "decors", back: "title", playing: null };
function isModo() { return !!Store.isOwner; }
function refreshModoButtons() { for (const b of $$(".modo-only")) b.hidden = !isModo(); }
function openStudio(back) {
  if (!isModo()) return;
  STUDIO.back = back || (SCREEN === "hub" ? "hub" : "title");
  showScreen("studio");
  renderStudio();
}
function renderStudio() {
  const tabs = $("#stTabs"); tabs.replaceChildren();
  for (const [k, n] of STUDIO_TABS) {
    const b = el("button", k === STUDIO.tab ? "on" : "", n); b.type = "button";
    b.onclick = () => { STUDIO.tab = k; renderStudio(); };
    tabs.append(b);
  }
  $("#stWhere").textContent = Store.canShareSprites()
    ? "Tes images et musiques sont enregistrées avec la page : tout le monde les verra et les entendra."
    : "Tes images et musiques sont enregistrées dans ce navigateur.";
  const list = $("#stList"); list.replaceChildren();
  if (STUDIO.tab === "creatures") list.append(el("p", "sheet-note", "Une image fixe par créature. Pour une créature animée, utilise l’import de sprite PMD dans l’Atelier."));
  if (STUDIO.tab === "sons") list.append(el("p", "sheet-note", "Les musiques tournent en boucle. Sans musique pour un donjon précis, le jeu prend « Donjons (par défaut) »."));
  for (const s of mediaSlots().filter(x => x.g === STUDIO.tab)) list.append(studioRow(s));
}
function studioRow(s) {
  const row = el("div", "st-row");
  const has = !!MEDIA.idx[s.k];
  if (s.kind === "img") {
    const pv = el("canvas", "st-prev" + (s.g === "decors" ? " tall" : ""));
    row.append(pv);
    requestAnimationFrame(() => paintSlotPreview(pv, s.k));
  } else {
    const ic = el("span", "st-note-ic", "♪"); row.append(ic);
  }
  const tx = el("div", "st-tx");
  tx.append(el("b", null, s.n), el("small", null, s.size + " · " + (has ? "ton fichier" : (s.kind === "img" ? "dessin du jeu" : "aucune musique"))), el("small", "st-file", "Modèle : " + slotFile(s)));
  const acts = el("div", "st-acts");
  const inp = el("input"); inp.type = "file"; inp.className = "file-in"; inp.id = "f_" + s.k.replace(/\./g, "_");
  inp.accept = s.kind === "img" ? "image/png,image/jpeg,image/webp,image/gif" : "audio/*,.mp3,.ogg,.wav,.m4a";
  const lab = el("label", "btn small", has ? "Remplacer" : (s.kind === "img" ? "Mettre une image" : "Choisir un fichier"));
  lab.htmlFor = inp.id;
  inp.onchange = async () => {
    const f = inp.files && inp.files[0]; if (!f) return;
    lab.textContent = "Envoi…";
    const r = await Store.saveMedia(s.k, f, s.kind);
    if (r.error) toast(r.error, 4000); else toast(s.n + " : enregistré" + (r.where === "shared" ? " pour tout le monde." : " sur cet appareil."));
    await loadAllMedia();
    if (s.kind === "audio" && MUSIC.want) { MUSIC.key = null; refreshMusic(); }
    renderStudio();
  };
  acts.append(inp, lab);
  if (s.kind === "audio" && has) {
    const pl = el("button", "btn small ghost", STUDIO.playing && STUDIO.playing.key === s.k ? "Stop" : "Écouter"); pl.type = "button";
    pl.onclick = async () => {
      if (STUDIO.playing) { STUDIO.playing.a.pause(); const same = STUDIO.playing.key === s.k; STUDIO.playing = null; if (same) { renderStudio(); return; } }
      const url = await audioURLFor(s.k); if (!url) { toast("Impossible de lire ce fichier."); return; }
      const a = new Audio(url); a.volume = 0.8; a.play().catch(() => toast("Le navigateur refuse de jouer ce fichier."));
      STUDIO.playing = { key: s.k, a }; renderStudio();
    };
    acts.append(pl);
  }
  if (has) {
    const rm = el("button", "btn small danger", "Rétablir"); rm.type = "button";
    rm.onclick = async () => { await Store.removeMedia(s.k); await loadAllMedia(); if (s.kind === "audio") { MUSIC.key = null; refreshMusic(); } renderStudio(); toast(s.n + " : retour à l’original."); };
    acts.append(rm);
  }
  tx.append(acts);
  row.append(tx);
  return row;
}
function stopStudioPreview() { if (STUDIO.playing) { STUDIO.playing.a.pause(); STUDIO.playing = null; } }

// Aperçu d'un emplacement (image perso ou dessin d'origine)
function paintSlotPreview(cv, key, forceDefault) {
  const { ctx, w, h, dpr } = fitCanvas(cv);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  renderSlot(ctx, key, w, h, forceDefault);
}
// Rendu d'un emplacement dans une zone w×h (sert aussi à exporter les modèles)
function renderSlot(ctx, key, w, h, forceDefault) {
  const now = 4200;
  const im = !forceDefault && mediaImg(key);
  if (im && key.startsWith("bg.")) { drawCover(ctx, im, w, h); return; }
  if (im) { drawContain(ctx, im, w / 2, h / 2, Math.min(w, h)); return; }
  const save = { bg: SC.bg, actors: SC.actors, props: SC.props, t0: SC.t0 };
  if (key.startsWith("bg.title.")) { const d = DECORS.find(x => "bg.title." + x.key === key); MEDIA.noCustom = true; try { if (d) drawDecorRaw(ctx, w, h, d, now); } finally { MEDIA.noCustom = false; } return; }
  const bgMap = {
    "bg.beachDay": () => bgBeach(ctx, w, h, now, "day"), "bg.psy": () => bgPsy(ctx, w, h, now), "bg.beachSunset": () => bgBeach(ctx, w, h, now, "sunset"),
    "bg.beachRocks": () => bgBeach(ctx, w, h, now, "sunset", true), "bg.entrance": () => bgEntrance(ctx, w, h, now), "bg.clearing": () => bgClearing(ctx, w, h, now),
    "bg.sky": () => { SC.t0 = -1e6; bgSky(ctx, w, h, now); }, "bg.dark": () => bgDark(ctx, w, h, now), "bg.logo": () => bgLogo(ctx, w, h, now),
    "bg.hub": () => drawDecorRaw(ctx, w, h, DECORS[2], now), "bg.map": () => drawMapBase(ctx, w, h, now)
  };
  if (bgMap[key]) { MEDIA.noCustom = true; try { bgMap[key](); } finally { MEDIA.noCustom = false; Object.assign(SC, save); } return; }
  if (key.startsWith("bg.") && EXTRA_BG[key.slice(3)]) { MEDIA.noCustom = true; try { EXTRA_BG[key.slice(3)](ctx, w, h, now); } finally { MEDIA.noCustom = false; Object.assign(SC, save); } return; }
  if (key.startsWith("town.")) { MEDIA.noCustom = true; try { drawTownSlotDefault(ctx, key, w, h); } finally { MEDIA.noCustom = false; } return; }
  const s = Math.min(w, h);
  MEDIA.noCustom = true;
  try {
    if (key === "deco.soleil") { drawSunDefault(ctx, w / 2, h / 2, s * 0.42); }
    else if (key === "deco.lune") { drawMoonDefault(ctx, w / 2, h / 2, s * 0.4, "rgba(0,0,0,0)"); }
    else if (key === "deco.nuage") { drawCloudDefault(ctx, w / 2, h / 2, s * 0.9); }
    else if (key === "deco.lettre") drawProp(ctx, { kind: "letter" }, w / 2, h / 2, s * 0.8, now);
    else if (key === "deco.pendentif") drawProp(ctx, { kind: "pendant" }, w / 2, h / 2, s * 0.9, now);
    else if (key === "deco.silhouette") drawShadowFigure(ctx, w / 2, h * 0.98, h * 0.95, now);
    else if (key.startsWith("item.")) drawItem(ctx, key.slice(5), w / 2, h / 2, s * 1.9, 0);
    else if (key.startsWith("mon.")) drawMonster(ctx, monById(key.slice(4)), w / 2, h * 0.9, s * 0.95, { t: 600, dir: [1, 1], still: true });
    else if (key.startsWith("tile.")) drawTileDefault(ctx, key, w, h);
    else if (key === "ui.logo") { ctx.fillStyle = "#ffd35a"; ctx.font = "700 " + Math.round(h * 0.2) + "px " + "'Lilita One', 'Arial Black', sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("DONJON", w / 2, h * 0.3); ctx.fillText("MYSTÈRE", w / 2, h * 0.55); ctx.fillStyle = "#ff7a5c"; ctx.fillText("ULTIMATE", w / 2, h * 0.8); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; }
  } finally { MEDIA.noCustom = false; }
}
function drawTileDefault(ctx, key, w, h) {
  const parts = key.split(".");
  let locId = parts[1], kind = parts[2];
  if (parts[1] === "glace" || parts[1] === "dalle" || parts[1] === "piege") { locId = "L00"; kind = parts.slice(1).join("."); }
  const ts = getTileset(locId, 48, 2, true);
  const idx = { mur: 16 + 4, sol: 0, couloir: 4, escalier: 7, glace: 5, dalle: 6, "piege.pics": 8, "piege.tp": 9 }[kind];
  if (idx == null) return;
  const [tx, ty] = ts.at(idx);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(ts.cv, tx, ty, ts.P, ts.P, 0, 0, w, h);
}
// tuile personnalisée pour le donjon (null si aucune)
function customTile(locId, kind) {
  return mediaImg("tile." + locId + "." + kind);
}
