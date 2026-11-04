// ============================================================
//  SAUVEGARDE : stockage Claude (db/assets) si disponible,
//  sinon stockage du navigateur. Tout est en try/catch.
// ============================================================
const LS_SAVE = "ddb-save-v1", LS_MODS = "ddb-mods-v1", LS_OPTS = "ddb-opts-v1";
function lsGet(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { } }

// Petit IndexedDB pour les images de sprites quand le stockage Claude n'est pas là
const IDB = {
  _db: null,
  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise(res => {
      try {
        const rq = indexedDB.open("ddb-sprites", 1);
        rq.onupgradeneeded = () => rq.result.createObjectStore("s");
        rq.onsuccess = () => { this._db = rq.result; res(this._db); };
        rq.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  },
  async op(mode, fn) {
    const db = await this.open(); if (!db) return null;
    return new Promise(res => {
      try {
        const tx = db.transaction("s", mode); const st = tx.objectStore("s");
        const rq = fn(st); rq.onsuccess = () => res(rq.result); rq.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  },
  get(k) { return this.op("readonly", s => s.get(k)); },
  set(k, v) { return this.op("readwrite", s => s.put(v, k)); },
  del(k) { return this.op("readwrite", s => s.delete(k)); },
  keys() { return this.op("readonly", s => s.getAllKeys()); }
};

const Store = {
  isOwner: false,
  db: null, user: null, assets: null, downloads: null, uid: null, canEdit: false, ready: false,
  writing: false, pending: null,
  async init() {
    const c = window.claude;
    // fichier ouvert directement sur ton ordinateur : tu es le seul joueur, donc le modo
    if (!c || typeof c.use !== "function") { this.isOwner = true; this.ready = true; return; }
    try {
      const [db, user, assets, downloads, sample] = await Promise.all([
        c.use("db").catch(() => null), c.use("user").catch(() => null),
        c.use("assets").catch(() => null), c.use("downloads").catch(() => null), c.use("sample").catch(() => null)
      ]);
      this.db = db; this.user = user; this.assets = assets; this.downloads = downloads; this.sample = sample;
      if (user) {
        try { this.uid = await user.id(); } catch (e) { this.uid = null; }
        try { this.canEdit = !!(await user.canEdit()); } catch (e) { this.canEdit = false; }
        try { this.isOwner = !!(await user.isOwner()); } catch (e) { this.isOwner = false; }
      }
    } catch (e) { }
    this.ready = true;
  },
  saveRef() { return this.db && this.uid ? this.db.doc("data/users/" + this.uid + "/save") : null; },
  async loadSave() {
    const local = lsGet(LS_SAVE);
    let remote = null;
    const ref = this.saveRef();
    if (ref) {
      try {
        const snap = await withTimeout(ref.get(), 8000);
        if (snap && snap.exists) { const d = snap.data(); if (d && d.json) remote = JSON.parse(d.json); }
      } catch (e) { }
    }
    if (remote && (!local || (remote.savedAt || 0) >= (local.savedAt || 0))) return remote;
    return local;
  },
  saveGame(g) {
    if (!g) return;
    g.savedAt = Date.now();
    const json = JSON.stringify(g);
    lsSet(LS_SAVE, g);
    const ref = this.saveRef();
    if (!ref) return;
    this.pending = json;
    this._flush();
  },
  async _flush() {
    if (this.writing || !this.pending) return;
    const ref = this.saveRef(); if (!ref) return;
    const json = this.pending; this.pending = null; this.writing = true;
    try { await ref.set({ json, savedAt: Date.now() }); }
    catch (e) { if (e && e.code === "invalid_argument") this.uid = null; }
    this.writing = false;
    if (this.pending) setTimeout(() => this._flush(), 400);
  },
  async deleteSave() {
    lsDel(LS_SAVE);
    const ref = this.saveRef();
    if (ref) { try { await ref.delete(); } catch (e) { } }
  },
  // ---- modifications du jeu (données + sprites) ----
  modsShared() { return !!(this.db); },
  async loadMods() {
    let mods = null;
    if (this.db) {
      try {
        const snap = await withTimeout(this.db.doc("mods/data").get(), 8000);
        if (snap && snap.exists) { const d = snap.data(); if (d && d.json) mods = JSON.parse(d.json); }
      } catch (e) { }
    }
    if (!mods) mods = lsGet(LS_MODS);
    return mods;
  },
  async saveMods(mods) {
    lsSet(LS_MODS, mods);
    if (this.db && this.canEdit) {
      try { await this.db.doc("mods/data").set({ json: JSON.stringify(mods), at: Date.now() }); return "shared"; }
      catch (e) { return "local"; }
    }
    return "local";
  },
  async loadSpriteDocs() {
    const out = {};
    if (this.db) {
      try {
        const q = await withTimeout(this.db.collection("mods").get(), 8000);
        for (const d of q.docs) if (d.id.startsWith("sprite_") && d.exists) { const v = d.data(); if (v && v.mid) out[v.mid] = v; }
      } catch (e) { }
    }
    // sprites locaux (navigateur)
    try {
      const keys = (await IDB.keys()) || [];
      for (const k of keys) if (String(k).startsWith("sprite_")) {
        const v = await IDB.get(k);
        if (v && v.mid && !out[v.mid]) out[v.mid] = v;
      }
    } catch (e) { }
    return out;
  },
  canShareSprites() { return !!(this.assets && this.db && this.canEdit); },
  async storeSprite(mid, doc, blobs) {
    // blobs : { "Walk": Blob, ..., "portrait": Blob } (un même fichier peut servir à plusieurs anims)
    if (this.canShareSprites()) {
      try {
        const idByBlob = new Map(), ids = {};
        for (const k in blobs) {
          const b = blobs[k];
          if (!idByBlob.has(b)) { const r = await this.assets.upload(b, { type: "image/png" }); idByBlob.set(b, r.id); }
          ids[k] = idByBlob.get(b);
        }
        const d2 = JSON.parse(JSON.stringify(doc));
        for (const a in d2.anims) d2.anims[a].src = { asset: ids[a] };
        if (blobs.portrait) d2.portrait = { asset: ids.portrait };
        d2.where = "shared";
        await this.db.doc("mods/sprite_" + mid).set(d2);
        await IDB.del("sprite_" + mid);
        return d2;
      } catch (e) { /* repli local */ }
    }
    const urlByBlob = new Map();
    const url = async b => { if (!urlByBlob.has(b)) urlByBlob.set(b, await blobToDataURL(b)); return urlByBlob.get(b); };
    for (const a in doc.anims) doc.anims[a].src = { data: await url(blobs[a]) };
    if (blobs.portrait) doc.portrait = { data: await url(blobs.portrait) };
    doc.where = "local";
    const ok = await IDB.set("sprite_" + mid, doc);
    if (ok === null) doc.where = "memory";
    return doc;
  },
  async removeSprite(mid, doc) {
    await IDB.del("sprite_" + mid);
    if (doc && doc.where === "shared" && this.db && this.canEdit) {
      try { await this.db.doc("mods/sprite_" + mid).delete(); } catch (e) { }
      if (this.assets) {
        const ids = [];
        for (const a in doc.anims) if (doc.anims[a].src && doc.anims[a].src.asset) ids.push(doc.anims[a].src.asset);
        if (doc.portrait && doc.portrait.asset) ids.push(doc.portrait.asset);
        for (const id of new Set(ids)) { try { await this.assets.delete(id); } catch (e) { } }
      }
    }
  },
  // ---- images et musiques (Graphics) ----
  async readMediaDoc() {
    if (!this.db) return {};
    try { const snap = await withTimeout(this.db.doc("mods/media").get(), 8000); if (snap && snap.exists) { const d = snap.data(); if (d && d.json) return JSON.parse(d.json) || {}; } } catch (e) { }
    return {};
  },
  async loadMediaIndex() {
    const idx = await this.readMediaDoc();
    try {
      const keys = (await IDB.keys()) || [];
      for (const k of keys) if (String(k).startsWith("media:")) { const v = await IDB.get(k); if (v && v.blob) idx[String(k).slice(6)] = v; }
    } catch (e) { }
    return idx;
  },
  async saveMedia(key, file, kind) {
    try {
      let blob = file, mime = file.type || "";
      if (kind === "img") { blob = await prepareImage(file); mime = blob.type || "image/png"; }
      else {
        if (file.size > 14.5 * 1024 * 1024) return { error: "Fichier trop lourd : 14 Mo maximum par musique." };
        mime = (file.type && file.type.startsWith("audio/")) ? file.type : guessAudioMime(file.name);
      }
      if (this.canShareSprites()) {
        let d;
        if (kind === "img") { const r = await this.assets.upload(blob, { type: mime }); d = { kind, asset: r.id, mime }; }
        else { const b64 = await blobToBase64(blob); const r = await this.assets.upload(new Blob([b64], { type: "text/plain" }), { type: "text/plain" }); d = { kind, asset: r.id, mime, b64: true }; }
        const idx = await this.readMediaDoc();
        const old = idx[key]; idx[key] = d;
        await this.db.doc("mods/media").set({ json: JSON.stringify(idx), at: Date.now() });
        if (old && old.asset && old.asset !== d.asset) { try { await this.assets.delete(old.asset); } catch (e) { } }
        await IDB.del("media:" + key);
        return { where: "shared" };
      }
      const ok = await IDB.set("media:" + key, { kind, mime, blob });
      return ok === null ? { error: "Impossible d’enregistrer sur cet appareil." } : { where: "local" };
    } catch (e) { return { error: "Envoi impossible : " + ((e && (e.message || e.code)) || e) }; }
  },
  async removeMedia(key) {
    await IDB.del("media:" + key);
    if (this.canShareSprites()) {
      const idx = await this.readMediaDoc();
      const old = idx[key];
      if (old) {
        delete idx[key];
        try { await this.db.doc("mods/media").set({ json: JSON.stringify(idx), at: Date.now() }); } catch (e) { }
        if (old.asset) { try { await this.assets.delete(old.asset); } catch (e) { } }
      }
    }
  },
  async download(filename, text) {
    if (!this.downloads) return "none";
    try { await this.downloads.save({ filename, data: text }); return "ok"; }
    catch (e) { return e && e.code === "declined" ? "declined" : "error"; }
  }
};
function withTimeout(p, ms) { return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]); }
function blobToBase64(b) { return blobToDataURL(b).then(u => String(u).split(",")[1] || ""); }
function guessAudioMime(name) {
  const ext = String(name || "").split(".").pop().toLowerCase();
  return { mp3: "audio/mpeg", ogg: "audio/ogg", oga: "audio/ogg", wav: "audio/wav", m4a: "audio/mp4", aac: "audio/aac", flac: "audio/flac", opus: "audio/ogg", webm: "audio/webm" }[ext] || "audio/mpeg";
}
// Réduit les très grandes images et convertit les formats non pris en charge
async function prepareImage(file) {
  const okType = ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type);
  let bmp;
  try { bmp = await createImageBitmap(file); } catch (e) { if (okType) return file; throw new Error("image illisible (utilise PNG ou JPG)"); }
  const k = Math.min(1, 2048 / Math.max(bmp.width, bmp.height));
  if (okType && k === 1) return file;
  const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  const type = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
  return await new Promise(res => c.toBlob(b => res(b || file), type, 0.9));
}
function blobToDataURL(b) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(b); }); }
function srcURL(src) { if (!src) return null; if (src.asset) return "/_blob/" + src.asset; return src.data || null; }

// Applique les modifs de l'utilisateur sur les données d'origine
let MODS = null;
// Les modifs de l'Atelier se fusionnent par id avec les données d'origine :
// une créature ou un lieu ajouté plus tard au jeu apparaît toujours, sauf s'il a été supprimé exprès.
function mergeList(def, mod, removed) {
  const rm = new Set((removed || []).map(String));
  const out = def.slice();
  if (Array.isArray(mod)) {
    const idx = new Map(out.map((x, i) => [String(x.id), i]));
    for (const m of mod) {
      if (!m || m.id == null) continue;
      const id = String(m.id);
      if (idx.has(id)) out[idx.get(id)] = m; else { idx.set(id, out.length); out.push(m); }
    }
  }
  return out.filter(x => !rm.has(String(x.id)));
}
function applyMods(mods) {
  MODS = mods || null;
  const base = JSON.parse(JSON.stringify(DEFAULT_DATA));
  if (mods) {
    const rm = mods.removed || {};
    for (const k of ["monsters", "attacks", "locations", "items"]) {
      const merged = mergeList(base[k], mods[k], rm[k]);
      if (merged.length) base[k] = merged;
    }
    // le lieu du chapitre 1 doit toujours exister
    if (!base.locations.some(l => l.id === "L00")) base.locations.unshift(JSON.parse(JSON.stringify(DEFAULT_DATA.locations.find(l => l.id === "L00"))));
  }
  DATA = base;
  indexData();
  for (const k in TILESET_CACHE) delete TILESET_CACHE[k];
}
// Calcule ce qui a été retiré par rapport aux données d'origine
function withRemoved(mods) {
  const removed = {};
  for (const k of ["monsters", "attacks", "locations", "items"]) {
    if (k === "items" && !Array.isArray(mods.items)) { removed.items = []; continue; }
    const have = new Set((mods[k] || []).map(x => String(x.id)));
    removed[k] = DEFAULT_DATA[k].map(x => String(x.id)).filter(id => !have.has(id) && !(k === "locations" && id === "L00"));
  }
  return Object.assign({}, mods, { removed });
}
// Charge un document sprite en images utilisables
function loadSpriteDoc(doc) {
  if (!doc || !doc.anims) return;
  const spr = { anims: {}, portrait: null, doc };
  for (const name in doc.anims) {
    const a = doc.anims[name]; const url = srcURL(a.src); if (!url) continue;
    const img = new Image(); img.src = url;
    spr.anims[name] = { img, fw: a.fw, fh: a.fh, durs: a.durs || [8], total: (a.durs || [8]).reduce((s, v) => s + v, 0) };
  }
  if (doc.portrait) { const url = srcURL(doc.portrait); if (url) { spr.portrait = new Image(); spr.portrait.src = url; } }
  if (spr.anims.Walk || spr.anims.Idle) SPRITES[doc.mid] = spr;
}
