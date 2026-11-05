// ============================================================
//  SYNCHRO : ton dépôt GitHub privé = les mêmes données partout
//  creatures/NNNN/…   sprites (PMD ou image) + creature.json
//  sons/…             musiques (bgm.royaume.mp3…)
//  graphics/…         images modifiées (mêmes noms que le dossier graphics)
//  partie/user_save.json · partie/atelier.json · partie/reglages.json
//  Le jeton reste sur l'appareil. Les fichiers sont gardés en cache
//  (par empreinte « sha ») : rien n'est retéléchargé s'il n'a pas changé.
// ============================================================
const SYNC_KEY = "dmu-sync", SYNC_STATE_KEY = "dmu-sync-state";
const SYNC_ANIMS = ["Idle", "Walk", "Attack", "Hurt", "Sleep"];
const SYNC = {
  cfg: null, st: null, index: null, crea: new Map(), media: new Map(), partie: {},
  layer: [], loading: new Set(), failed: new Set(), done: new Set(), emo: {}, jsonMem: {},
  q: [], active: 0, status: "off", msg: "", rate: null, lastSync: 0, writing: Promise.resolve(), timer: null, dl: null, conflictOpen: false
};
function syncAvailable() { return typeof fetch === "function" && !(typeof Store !== "undefined" && Store.db); }
function syncCfg() { if (!SYNC.cfg) SYNC.cfg = Object.assign({ repo: "Jose-k78/donjon-donnees", branch: "main", token: "", on: false }, lsGet(SYNC_KEY) || {}); return SYNC.cfg; }
function syncSaveCfg() { lsSet(SYNC_KEY, SYNC.cfg); }
function syncState() { if (!SYNC.st) SYNC.st = Object.assign({ save: {}, mods: {}, opts: {} }, lsGet(SYNC_STATE_KEY) || {}); return SYNC.st; }
function syncSaveState() { lsSet(SYNC_STATE_KEY, SYNC.st); }
function syncOn() { const c = syncCfg(); return !!(c.on && c.token && c.repo && syncAvailable()); }
function syncSetStatus(status, msg) { SYNC.status = status; SYNC.msg = msg || ""; if (typeof onSyncStatus === "function") onSyncStatus(); }

// ---------- API GitHub ----------
function ghMsg(s) { return s === 401 ? "jeton refusé : vérifie-le ou crée-en un nouveau" : s === 403 ? "accès refusé (droits du jeton) ou limite GitHub atteinte" : s === 404 ? "dépôt ou fichier introuvable (nom du dépôt, ou jeton sans accès à ce dépôt)" : s === 409 ? "le dépôt est vide" : s === 422 ? "GitHub a refusé la modification" : "GitHub a répondu " + s; }
async function ghApi(path, opts) {
  opts = opts || {};
  const c = syncCfg();
  const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const tm = ctl ? setTimeout(() => ctl.abort(), opts.timeout || 25000) : 0;
  let r;
  try {
    r = await fetch("https://api.github.com/repos/" + c.repo + path, {
      method: opts.method || "GET", cache: "no-store", signal: ctl ? ctl.signal : undefined,
      headers: Object.assign({ Authorization: "Bearer " + c.token, Accept: opts.accept || "application/vnd.github+json" }, opts.body ? { "Content-Type": "application/json" } : {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
  } catch (e) { throw new Error(e && e.name === "AbortError" ? "GitHub ne répond pas (connexion lente ?)" : "pas de connexion à GitHub"); }
  finally { if (tm) clearTimeout(tm); }
  const left = r.headers.get("x-ratelimit-remaining"), reset = r.headers.get("x-ratelimit-reset");
  if (left != null) SYNC.rate = { left: +left, reset: +reset * 1000 };
  if (!r.ok) { const e = new Error(ghMsg(r.status)); e.status = r.status; throw e; }
  if (opts.raw) return await r.blob();
  return r.status === 204 ? null : await r.json();
}
function mimeOf(name) {
  const ext = String(name).split(".").pop().toLowerCase();
  return { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", xml: "text/xml", json: "application/json", txt: "text/plain" }[ext] || guessAudioMime(name);
}
// un fichier du dépôt, gardé en cache par son empreinte
async function blobBySha(sha, name, onlyCache) {
  const k = "sha:" + sha;
  const c = await IDB.get(k);
  if (c) return c;
  if (onlyCache) return null;
  await syncWaitRate();
  const raw = await ghApi("/git/blobs/" + sha, { accept: "application/vnd.github.raw+json", raw: true, timeout: 60000 });
  const b = new Blob([raw], { type: mimeOf(name) });
  await IDB.set(k, b);
  return b;
}
async function jsonBySha(sha, onlyCache) {
  if (SYNC.jsonMem[sha] !== undefined) return SYNC.jsonMem[sha];
  const b = await blobBySha(sha, "x.json", onlyCache);
  if (!b) return undefined;
  let v = null; try { v = JSON.parse(await b.text()); } catch (e) { v = null; }
  SYNC.jsonMem[sha] = v;
  return v;
}
// beaucoup de creature.json d'un coup : une seule requête GraphQL pour 100 fichiers (sinon 1 requête par fichier)
async function syncBatchJson(shas, onEach) {
  const c = syncCfg(), [owner, name] = c.repo.split("/");
  const list = shas.filter(s => /^[0-9a-f]{40}$/.test(s));
  for (let i = 0; i < list.length; i += 100) {
    const part = list.slice(i, i + 100);
    const q = "query{repository(owner:" + JSON.stringify(owner) + ",name:" + JSON.stringify(name) + "){" + part.map((s, j) => "b" + j + ":object(oid:\"" + s + "\"){...on Blob{text}}").join(" ") + "}}";
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const tm = ctl ? setTimeout(() => ctl.abort(), 30000) : 0;
    let r;
    try { r = await fetch("https://api.github.com/graphql", { method: "POST", cache: "no-store", signal: ctl ? ctl.signal : undefined, headers: { Authorization: "Bearer " + c.token, "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) }); }
    finally { if (tm) clearTimeout(tm); }
    if (!r.ok) throw new Error("graphql " + r.status);
    const j = await r.json(), R = j && j.data && j.data.repository;
    if (!R) throw new Error("graphql vide");
    for (let k = 0; k < part.length; k++) {
      const o = R["b" + k];
      if (o && typeof o.text === "string") await IDB.set("sha:" + part[k], new Blob([o.text], { type: "application/json" }));
      if (onEach) onEach();
    }
  }
}
function blobImage(b) { return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = URL.createObjectURL(b); }); }
async function syncWaitRate() {
  const r = SYNC.rate;
  if (r && r.left < 15 && r.reset > Date.now()) { const e = new Error("limite GitHub atteinte : reprise à " + new Date(r.reset).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })); e.rate = true; throw e; }
}
// petite file d'attente : 6 téléchargements en même temps maximum
function syncRun(fn) { return new Promise((res, rej) => { SYNC.q.push({ fn, res, rej }); syncPump(); }); }
function syncPump() {
  while (SYNC.active < 6 && SYNC.q.length) {
    const t = SYNC.q.shift(); SYNC.active++;
    Promise.resolve().then(t.fn).then(t.res, t.rej).finally(() => { SYNC.active--; syncPump(); });
  }
}
// écritures dans le dépôt, une à la fois (sinon GitHub refuse)
function syncWrite(fn) { const p = SYNC.writing.then(fn, fn); SYNC.writing = p.catch(() => { }); return p; }
async function syncPutFile(path, blob, message, sha) {
  const content = await blobToBase64(blob);
  const body = { message: message || "Mise à jour depuis le jeu", content, branch: syncCfg().branch };
  if (sha) body.sha = sha;
  const r = await ghApi("/contents/" + path.split("/").map(encodeURIComponent).join("/"), { method: "PUT", body, timeout: 90000 });
  const nsha = r && r.content && r.content.sha;
  if (SYNC.index && nsha) {
    const f = SYNC.index.files.find(x => x[0] === path);
    if (f) f[1] = nsha; else SYNC.index.files.push([path, nsha, blob.size]);
    IDB.set("sha:" + nsha, blob);
  }
  return nsha;
}
async function syncDeleteFile(path, sha) {
  await ghApi("/contents/" + path.split("/").map(encodeURIComponent).join("/"), { method: "DELETE", body: { message: "Retiré depuis le jeu", sha, branch: syncCfg().branch } });
  if (SYNC.index) SYNC.index.files = SYNC.index.files.filter(x => x[0] !== path);
}
// ---------- l'index du dépôt ----------
async function syncFetchIndex() {
  const c = syncCfg();
  let br;
  try { br = await ghApi("/branches/" + encodeURIComponent(c.branch)); }
  catch (e) { if (e.status === 404 || e.status === 409) { const repo = await ghApi(""); if (repo && repo.default_branch && repo.default_branch !== c.branch) { c.branch = repo.default_branch; syncSaveCfg(); br = await ghApi("/branches/" + encodeURIComponent(c.branch)); } else { const er = new Error("le dépôt est vide : envoie d’abord tes fichiers avec GitHub Desktop"); er.empty = true; throw er; } } else throw e; }
  const commit = br.commit.sha;
  if (SYNC.index && SYNC.index.commit === commit) return false;
  const t = await ghApi("/git/trees/" + br.commit.commit.tree.sha + "?recursive=1", { timeout: 60000 });
  SYNC.index = { commit, at: Date.now(), truncated: !!t.truncated, files: t.tree.filter(e => e.type === "blob").map(e => [e.path, e.sha, e.size || 0]) };
  await IDB.set("sync:index", SYNC.index);
  syncBuildMaps();
  return true;
}
function syncMidOf(folder) { const m = /^(?:id)?0*(\d{1,4})$/i.exec(folder); return m && +m[1] >= 1 ? String(+m[1]).padStart(3, "0") : null; }
function syncBuildMaps() {
  SYNC.crea = new Map(); SYNC.media = new Map(); SYNC.partie = {}; SYNC.donjonsF = null;
  if (!SYNC.index) return;
  const slots = mediaSlots(), keys = new Set(slots.map(s => s.k));
  for (const [path, sha, size] of SYNC.index.files) {
    const p = path.split("/"), top = p[0].toLowerCase();
    if (top === "creatures" && p.length === 3) {           // seulement les fichiers directs (pas les sous-dossiers de formes)
      const mid = syncMidOf(p[1]); if (!mid) continue;
      let C = SYNC.crea.get(mid); if (!C) SYNC.crea.set(mid, C = { mid, folder: p[1], f: {} });
      C.f[p[2].toLowerCase()] = { name: p[2], sha, size, path };
    } else if ((top === "sons" || top === "graphics") && p.length >= 2) {
      const base = p[p.length - 1], noext = base.replace(/\.[^.]+$/, "");
      const key = keys.has(noext) ? noext : keys.has(noext.split("-")[0]) ? noext.split("-")[0] : null;
      if (!key) continue;
      SYNC.media.set(key, { path, sha, size, name: base, kind: top === "sons" ? "audio" : "img" });
    } else if (top === "partie" && p.length === 2) SYNC.partie[p[1].toLowerCase()] = { path, sha, size };
    else if (p.length === 1 && top === "donjons.json") SYNC.donjonsF = { path, sha, size };
  }
  for (const C of SYNC.crea.values()) {
    C.pmd = !!C.f["animdata.xml"];
    C.imgs = Object.keys(C.f).filter(n => /\.(png|webp|jpe?g|gif)$/.test(n));
    C.json = C.f["creature.json"] || null;
    C.emos = SPRITE_CONFIG.emotions.filter(e => C.f[e.toLowerCase() + ".png"]);
  }
}
// ---------- les créatures du dépôt ----------
function creatureFromJson(mid, js, existing) {
  const base = existing ? JSON.parse(JSON.stringify(existing)) : { id: mid, name: "Créature #" + (+mid), types: ["Normal"], hp: 40, attack: 20, defense: 20, speed: 20, moves: ["A01"], description: "", form: "blob", stage: 1 };
  base.id = mid;
  // un creature.json encore vide (« actif »: false et sans nom) ne change rien : la créature garde ses vraies valeurs
  const filled = js && typeof js === "object" && (js.actif === true || (typeof js.name === "string" && js.name.trim()));
  if (filled) {
    const atkIds = new Set(DEFAULT_DATA.attacks.map(a => a.id).concat(((typeof MODS !== "undefined" && MODS && MODS.attacks) || []).map(a => a.id)));
    if (typeof js.name === "string" && js.name.trim()) base.name = js.name.trim().slice(0, 24);
    if (Array.isArray(js.types)) { const t = js.types.filter(x => TYPES.includes(x)).slice(0, 2); if (t.length) base.types = t; }
    for (const k of ["hp", "attack", "defense", "speed"]) if (typeof js[k] === "number" && js[k] > 0) base[k] = Math.round(js[k]);
    if (Array.isArray(js.moves)) { const mv = js.moves.map(String).filter(id => atkIds.has(id)).slice(0, 4); if (mv.length) base.moves = mv; }
    if (typeof js.description === "string" && js.description.trim()) base.description = js.description.slice(0, 200);
    if (FORMS.includes(js.form)) base.form = js.form;
    if (typeof js.stage === "number") base.stage = js.stage;
    if (typeof js.drop_rate === "number") base.drop_rate = clamp(js.drop_rate, 0, 100);
    if ([1, 2, 3].includes(+js.rarity)) base.rarity = +js.rarity;
    if (typeof js.recruit_rate === "number") base.recruit_rate = clamp(js.recruit_rate, 0, 100);
  }
  return base;
}
async function syncBuildLayer(fetchMissing, onProg) {
  const todo = [];
  for (const C of SYNC.crea.values()) if (C.json && C.js === undefined) { const v = await jsonBySha(C.json.sha, true); if (v === undefined) todo.push(C); else C.js = v; }
  if (fetchMissing && todo.length) {
    let n = 0;
    const tick = () => { n++; if (onProg && (n % 10 === 0 || n === todo.length)) onProg(n, todo.length); };
    if (todo.length > 6) { try { await syncBatchJson(todo.map(C => C.json.sha), tick); } catch (e) { } }
    n = 0;
    await Promise.all(todo.map(C => syncRun(async () => { try { C.js = await jsonBySha(C.json.sha); } catch (e) { /* réessayé à la prochaine synchro */ } tick(); })));
  }
  const def = {}; for (const m of DEFAULT_DATA.monsters) def[m.id] = m;
  const out = [];
  for (const C of SYNC.crea.values()) {
    const js = C.js || null;
    const named = js && typeof js.name === "string" && js.name.trim();
    const active = (js && js.actif === true) || named || C.imgs.length;
    if (!active || (js && js.actif === false && !C.imgs.length)) continue;
    out.push(creatureFromJson(C.mid, js, def[C.mid]));
  }
  SYNC.layer = out;
}
// une créature du dépôt n'est enregistrée dans l'Atelier que si tu l'as vraiment modifiée
function syncStripLayer(mods) {
  if (!mods || !Array.isArray(mods.monsters) || !SYNC.layer.length) return mods;
  const L = new Map(SYNC.layer.map(m => [String(m.id), JSON.stringify(m)]));
  return Object.assign({}, mods, { monsters: mods.monsters.filter(m => !L.has(String(m.id)) || JSON.stringify(m) !== L.get(String(m.id))) });
}
// ---------- sprites à la demande ----------
function syncWantSprite(mid) {
  if (SYNC.status === "off" || SPRITES[mid] || SYNC.loading.has(mid) || SYNC.failed.has(mid) || SYNC.done.has(mid)) return;
  const C = SYNC.crea.get(mid); if (!C || (!C.pmd && !C.imgs.length)) return;
  SYNC.loading.add(mid);
  syncRun(() => syncLoadSprite(mid)).then(() => { SYNC.done.add(mid); if (SYNC.lastPortrait && SYNC.lastPortrait[1] === mid) repaintLastPortrait(); }).catch(e => { if (!(e && e.rate)) SYNC.failed.add(mid); }).finally(() => SYNC.loading.delete(mid));
}
function parseAnimDataXml(text) {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new Error("AnimData.xml illisible.");
  const anims = {};
  for (const a of Array.from(doc.getElementsByTagName("Anim"))) {
    const g = tag => { const n = a.getElementsByTagName(tag)[0]; return n ? n.textContent.trim() : null; };
    const name = g("Name"); if (!name) continue;
    const copy = g("CopyOf");
    if (copy) { anims[name] = { copyOf: copy }; continue; }
    anims[name] = { fw: +g("FrameWidth"), fh: +g("FrameHeight"), durs: Array.from(a.getElementsByTagName("Duration")).map(d => +d.textContent || 1) };
  }
  return anims;
}
function syncNeededFiles(C, anims) {
  const out = {};
  for (const n of SYNC_ANIMS) {
    let a = anims[n], src = n;
    for (let k = 0; k < 4 && a && a.copyOf; k++) { src = a.copyOf; a = anims[a.copyOf]; }
    if (!a || !a.fw || !a.fh) continue;
    const F = C.f[(src + "-anim.png").toLowerCase()];
    if (F) out[n] = { F, a };
  }
  return out;
}
function syncStillFile(C) {
  const names = ["sprite.png", C.folder.toLowerCase() + ".png", C.mid + ".png", "portrait.png", "normal.png"];
  for (const n of names) if (C.f[n]) return C.f[n];
  const first = C.imgs.find(n => !SPRITE_CONFIG.emotions.some(e => e.toLowerCase() + ".png" === n));
  return C.f[first || C.imgs[0]] || null;
}
// mode : rien = charger (et télécharger si besoin) · "cache" = seulement depuis l'appareil · "fetch" = télécharger sans afficher
async function syncLoadSprite(mid, mode) {
  const C = SYNC.crea.get(mid); if (!C) return;
  const oc = mode === "cache", show = mode !== "fetch";
  if (C.pmd) {
    const xb = await blobBySha(C.f["animdata.xml"].sha, "AnimData.xml", oc); if (!xb) return;
    const anims = parseAnimDataXml(await xb.text());
    const need = syncNeededFiles(C, anims);
    const spr = { anims: {}, portrait: null, doc: { mid, repo: true } };
    await Promise.all(Object.keys(need).map(async n => {
      const { F, a } = need[n];
      const b = await blobBySha(F.sha, F.name, oc); if (!b || !show) return;
      const img = await blobImage(b); if (!img) return;
      const durs = a.durs.length ? a.durs : [8];
      spr.anims[n] = { img, fw: a.fw, fh: a.fh, durs, total: durs.reduce((x, v) => x + v, 0) };
    }));
    const pf = C.f["normal.png"] || C.f["portrait.png"];
    if (pf) { const b = await blobBySha(pf.sha, pf.name, oc); if (b && show) spr.portrait = await blobImage(b); }
    if (show && (spr.anims.Walk || spr.anims.Idle)) SPRITES[mid] = spr;
  } else {
    const F = syncStillFile(C); if (!F) return;
    const b = await blobBySha(F.sha, F.name, oc); if (!b || !show) return;
    const im = await blobImage(b); if (im) MEDIA.img["mon." + mid] = im;
  }
}
// portraits d'émotion (Happy.png, Crying.png…) : chargés quand un dialogue en a besoin
function syncEmotion(mid, emo) {
  if (SYNC.status === "off" || !emo) return null;
  const C = SYNC.crea.get(mid); if (!C) return null;
  const F = C.f[String(emo).toLowerCase() + ".png"]; if (!F) return null;
  const k = mid + "|" + emo, v = SYNC.emo[k];
  if (v && v !== "loading") return v.complete && v.naturalWidth ? v : null;
  if (!v) {
    SYNC.emo[k] = "loading";
    syncRun(async () => { const b = await blobBySha(F.sha, F.name); const im = await blobImage(b); SYNC.emo[k] = im || null; repaintLastPortrait(); }).catch(() => { SYNC.emo[k] = null; });
  }
  return null;
}
function repaintLastPortrait() { const L = SYNC.lastPortrait; if (L && L[0].isConnected) paintPortrait(L[0], L[1], L[2]); }
// ---------- images et sons du dépôt ----------
async function syncApplyMedia() {
  if (SYNC.status === "off") return;
  const jobs = [];
  for (const [key, M] of SYNC.media) {
    if (M.kind === "audio") { MEDIA.idx[key] = { kind: "audio", repo: true, sha: M.sha, name: M.name, mime: mimeOf(M.name) }; delete MEDIA.audioURL[key]; continue; }
    jobs.push(syncRun(async () => { const b = await blobBySha(M.sha, M.name); const im = await blobImage(b); if (im) { MEDIA.img[key] = im; MEDIA.idx[key] = { kind: "img", repo: true, sha: M.sha }; } }).catch(() => { }));
  }
  await Promise.all(jobs);
  applyCustomLogo();
  for (const k in TILESET_CACHE) delete TILESET_CACHE[k];
}
async function syncAudioBlob(d) { return blobBySha(d.sha, d.name); }
// quand tu changes une image ou une musique dans Graphics : elle part aussi dans le dépôt
function syncMediaChanged(key, blob, kind, fileName) {
  if (!syncOn() || SYNC.status === "off") return;
  syncWrite(async () => {
    const cur = SYNC.media.get(key);
    const path = (cur && cur.path) || syncMediaPath(key, kind, fileName);
    const sha = await syncPutFile(path, blob, "Graphics : " + key, cur && cur.sha);
    SYNC.media.set(key, { path, sha, size: blob.size, name: path.split("/").pop(), kind });
    toast("Envoyé dans ton dépôt : " + path, 2200);
  }).catch(e => toast("Synchro : " + e.message, 3200));
}
function syncMediaPath(key, kind, fileName) {
  const s = mediaSlots().find(x => x.k === key);
  if (kind === "audio") return "sons/" + key + "." + (String(fileName || "").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3");
  return s ? slotFile(s) : "graphics/" + key + ".png";
}
// images et musiques déjà changées sur cet appareil avant la synchro : envoyées une fois dans le dépôt
async function syncPushLocalMedia() {
  let keys = []; try { keys = (await IDB.keys()) || []; } catch (e) { return; }
  const st = syncState(); st.mediaUp = st.mediaUp || {};
  for (const k of keys) {
    if (!String(k).startsWith("media:")) continue;
    const key = String(k).slice(6);
    if (SYNC.media.has(key) || st.mediaUp[key]) continue;
    const v = await IDB.get(k); if (!v || !v.blob) continue;
    const kind = v.kind === "audio" ? "audio" : "img";
    const ext = kind === "audio" ? (v.name || ("x." + ((v.mime || v.blob.type || "audio/mpeg").split("/")[1] || "mp3").replace("mpeg", "mp3"))) : null;
    const path = syncMediaPath(key, kind, ext);
    try {
      const sha = await syncWrite(() => syncPutFile(path, v.blob, "Graphics : " + key));
      SYNC.media.set(key, { path, sha, size: v.blob.size, name: path.split("/").pop(), kind });
      st.mediaUp[key] = Date.now(); syncSaveState();
    } catch (e) { if (e && e.rate) return; }
  }
}
function syncMediaRemoved(key) {
  if (!syncOn() || SYNC.status === "off") return;
  const cur = SYNC.media.get(key); if (!cur) return;
  syncWrite(async () => { await syncDeleteFile(cur.path, cur.sha); SYNC.media.delete(key); }).catch(e => toast("Synchro : " + e.message, 3200));
}
// ---------- partie, Atelier, réglages ----------
const SYNC_DOCS = {
  save: { file: "user_save.json", label: "ta partie", local: () => lsGet(LS_SAVE), wrap: g => ({ format: "donjon-mystere-ultimate", savedAt: g && g.savedAt, save: g }), unwrap: d => (d && d.save) || d },
  mods: { file: "atelier.json", label: "tes modifs de l’Atelier", local: () => lsGet(LS_MODS), wrap: m => ({ format: "donjon-mystere-ultimate-atelier", at: Date.now(), mods: m }), unwrap: d => (d && d.mods) || d },
  opts: { file: "reglages.json", label: "tes réglages", local: () => lsGet(LS_OPTS), wrap: o => ({ format: "donjon-mystere-ultimate-reglages", at: Date.now(), opts: o }), unwrap: d => (d && d.opts) || d }
};
function syncMarkDirty(kind) {
  if (!syncOn()) return;
  const st = syncState(); st[kind] = st[kind] || {}; st[kind].dirty = true; syncSaveState();
  clearTimeout(SYNC.timer); SYNC.timer = setTimeout(() => syncPushAll().catch(() => { }), 12000);
}
async function syncPushDoc(kind) {
  const D = SYNC_DOCS[kind], st = syncState(); st[kind] = st[kind] || {};
  let data = D.local(); if (data == null) return;
  if (kind === "mods") data = syncStripLayer(data);
  const remote = SYNC.partie[D.file];
  if (remote && st[kind].sha && remote.sha !== st[kind].sha) { const e = new Error("conflit"); e.conflict = kind; throw e; }
  const blob = new Blob([JSON.stringify(D.wrap(data))], { type: "application/json" });
  const sha = await syncPutFile("partie/" + D.file, blob, "Sauvegarde : " + D.label, remote && remote.sha);
  SYNC.partie[D.file] = { path: "partie/" + D.file, sha, size: blob.size };
  st[kind].sha = sha; st[kind].dirty = false; syncSaveState();
}
async function syncPushAll() {
  if (!syncOn() || SYNC.status === "off") return;
  const st = syncState();
  for (const kind of ["save", "mods", "opts"]) {
    if (!(st[kind] && st[kind].dirty)) continue;
    try { await syncWrite(() => syncPushDoc(kind)); }
    catch (e) {
      if (e.conflict) { await syncResolveConflict(kind); continue; }
      if (e.status === 409 || e.status === 422) { try { await syncFetchIndex(); } catch (e2) { } await syncResolveConflict(kind); continue; }
      syncSetStatus("error", e.message); return;
    }
  }
  SYNC.lastSync = Date.now(); syncSetStatus("ok", "");
}
async function syncPullDoc(kind) {
  const D = SYNC_DOCS[kind], st = syncState(); st[kind] = st[kind] || {};
  const remote = SYNC.partie[D.file];
  const local = D.local();
  if (!remote) { if (local != null) { st[kind].dirty = true; syncSaveState(); } return "push"; }
  if (remote.sha === st[kind].sha) return st[kind].dirty ? "push" : "same";
  if (st[kind].dirty && local != null) return "conflict";
  const data = D.unwrap(await jsonBySha(remote.sha));
  if (data == null) return "same";
  // premier branchement d'un appareil qui a déjà ses propres données : on demande, rien n'est écrasé en silence
  if (!st[kind].sha && local != null && kind !== "opts" && syncSame(kind, local, data) === false) { st[kind].first = true; st[kind].dirty = true; syncSaveState(); return "conflict"; }
  syncApplyDoc(kind, data);
  st[kind].sha = remote.sha; st[kind].dirty = false; syncSaveState();
  return "pulled";
}
function syncApplyDoc(kind, data) {
  if (kind === "save") {
    const s = sanitizeSave(data); if (!s) return;
    lsSet(LS_SAVE, s);
    const safe = typeof SCREEN === "undefined" || SCREEN === "title" || (SCREEN === "scene" && typeof BOOT !== "undefined" && BOOT && !BOOT.done) || SCREEN === "hub";
    if (safe && !(typeof NG !== "undefined" && NG)) { G = s; if (SCREEN === "title") refreshTitle(); if (SCREEN === "hub") refreshHub(); }
    else toast("Une partie plus récente est arrivée de ton autre appareil : retourne à l’écran titre pour la charger.", 4200);
  } else if (kind === "mods") { lsSet(LS_MODS, data); applyMods(data); }
  else if (kind === "opts") { const keep = { hintSeen: OPTS.hintSeen }; OPTS = Object.assign({ sound: true, mini: true, fastText: false }, data, keep); lsSet(LS_OPTS, OPTS); MUSIC.key = null; refreshMusic(); }
}
// réunit deux versions de l'Atelier sans rien perdre (a passe devant b ; une suppression n'est gardée que si les deux l'ont faite)
function syncMergeMods(a, b) {
  a = a || {}; b = b || {};
  const out = Object.assign({}, b, a), rm = {}, ra = a.removed || {}, rb = b.removed || {};
  for (const k of ["monsters", "attacks", "locations", "items"]) {
    const A = Array.isArray(a[k]) ? a[k] : null, B = Array.isArray(b[k]) ? b[k] : null;
    if (A || B) { const seen = new Set((A || []).map(x => String(x.id))); out[k] = (A || []).concat((B || []).filter(x => !seen.has(String(x.id)))); }
    const sb = new Set((rb[k] || []).map(String));
    rm[k] = (ra[k] || []).map(String).filter(id => sb.has(id) && !(out[k] || []).some(x => String(x.id) === id));
  }
  out.removed = rm;
  return out;
}
function syncSame(kind, a, b) {
  const norm = x => { if (!x || typeof x !== "object") return JSON.stringify(x); const c = Object.assign({}, x); delete c.savedAt; return JSON.stringify(c); };
  if (kind === "mods") { const L = syncStripLayer(a); return JSON.stringify(L) === JSON.stringify(b) || JSON.stringify(a) === JSON.stringify(b); }
  if (kind === "save" && a && !(a.team && a.team.length) ) return true; // pas de vraie partie ici
  return norm(a) === norm(b);
}
function syncSummary(kind, data) {
  if (kind === "save") { const g = sanitizeSave(data); if (!g) return "illisible"; return unitName(g.team[0]) + " · Niv. " + g.team[0].lv + " · " + (typeof storyChapterLabel === "function" ? (() => { const keep = G; G = g; const l = storyChapterLabel(); G = keep; return l; })() : "") + " · " + (g.savedAt ? new Date(g.savedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "?"); }
  if (kind === "mods") return ((data && data.monsters) || []).length + " créatures et " + ((data && data.attacks) || []).length + " attaques dans l’Atelier";
  return "réglages";
}
// les deux appareils ont changé la même chose : on te demande, et l'autre version est gardée en secours
async function syncResolveConflict(kind) {
  if (SYNC.conflictOpen) return;
  const D = SYNC_DOCS[kind], st = syncState();
  const remote = SYNC.partie[D.file]; if (!remote) { st[kind].sha = null; syncSaveState(); return; }
  if (kind === "opts") { st[kind].sha = remote.sha; syncSaveState(); return syncPushAll(); }
  const rData = D.unwrap(await jsonBySha(remote.sha)); const lData = D.local();
  SYNC.conflictOpen = true;
  await new Promise(res => {
    const body = el("div", "result");
    const first = !!(st[kind] && st[kind].first);
    body.append(el("p", "sheet-text", first ? "Cet appareil et ton dépôt ont chacun leur version de " + D.label + ". Laquelle garder sur tous tes appareils ?" : "Les deux versions de " + D.label + " ont changé depuis la dernière synchro. Laquelle garder ?"),
      el("p", "sheet-text dim", "Sur cet appareil : " + syncSummary(kind, lData)), el("p", "sheet-text dim", "En ligne (ton autre appareil) : " + syncSummary(kind, rData)),
      el("p", "sheet-note", "L’autre version n’est pas perdue : elle est rangée dans partie/secours/ de ton dépôt."));
    const keep = async which => {
      try {
        const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
        const other = which === "local" ? rData : lData;
        await syncWrite(() => syncPutFile("partie/secours/" + D.file.replace(".json", "") + "-" + (which === "local" ? "en-ligne" : "appareil") + "-" + stamp + ".json", new Blob([JSON.stringify(D.wrap(other))], { type: "application/json" }), "Copie de secours"));
        if (which === "merge") { const m = syncMergeMods(lData, rData); lsSet(LS_MODS, m); applyMods(m); st[kind].sha = remote.sha; st[kind].dirty = true; syncSaveState(); await syncWrite(() => syncPushDoc(kind)); }
        else if (which === "remote") { syncApplyDoc(kind, rData); st[kind].sha = remote.sha; st[kind].dirty = false; syncSaveState(); }
        else { st[kind].sha = remote.sha; st[kind].dirty = true; syncSaveState(); await syncWrite(() => syncPushDoc(kind)); }
        toast("Synchro faite. L’autre version est gardée en secours.", 3000);
      } catch (e) { toast("Synchro : " + e.message, 3600); }
      if (st[kind]) { delete st[kind].first; syncSaveState(); }
      SYNC.conflictOpen = false; res();
    };
    const acts = [{ label: "Garder celle en ligne", fn: () => keep("remote") }, { label: "Garder celle-ci", cls: kind === "mods" ? "" : "primary", fn: () => keep("local") }];
    if (kind === "mods") { body.append(el("p", "sheet-note", "« Tout garder » réunit les deux : chaque créature, attaque ou lieu modifié d’un côté ou de l’autre est gardé (celle de cet appareil passe en premier si les deux ont changé la même)."));
      acts.push({ label: "Tout garder (fusion)", cls: "primary", fn: () => keep("merge") }); }
    openSheet({ title: "Deux versions différentes", body, noDismiss: true, actions: acts });
  });
}
// ---------- donjons.json (créatures de chaque donjon) ----------
async function syncLoadDonjons(fetchIt) {
  if (typeof donjonsSetRepo !== "function") return false;
  const F = SYNC.donjonsF, before = SYNC.donjonsSha || null;
  if (!F) { SYNC.donjonsSha = null; SYNC.donjonsErr = ""; if (DONJONS.repo) { donjonsSetRepo(null); return true; } return false; }
  if (F.sha === before && DONJONS.repo) return false;
  let b, js;
  try { b = await blobBySha(F.sha, "donjons.json", !fetchIt); } catch (e) { return false; }
  if (!b) return false;
  SYNC.donjonsSha = F.sha;
  try { js = JSON.parse(await b.text()); }
  catch (e) { SYNC.donjonsErr = "donjons.json est illisible" + donjonsWhere(e, await b.text()) + " : vérifie les virgules, les guillemets et les crochets. Le jeu garde la version d’avant."; return false; }
  SYNC.donjonsErr = ""; SYNC.donjonsSha = F.sha; donjonsSetRepo(js);
  return true;
}
function donjonsWhere(e, text) {
  const m = /position (\d+)/.exec(String(e && e.message)); if (!m) { const l = /line (\d+)/.exec(String(e && e.message)); return l ? " (ligne " + l[1] + ")" : ""; }
  return " (ligne " + (String(text).slice(0, +m[1]).split("\n").length) + ")";
}
// ---------- démarrage et synchro complète ----------
async function syncBoot() {
  if (!syncOn()) { SYNC.status = "off"; return; }
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }
  // 1) tout de suite, avec ce qui est déjà sur l'appareil (marche hors ligne)
  const cached = await IDB.get("sync:index");
  if (cached && cached.files) { SYNC.index = cached; syncBuildMaps(); SYNC.status = "cache"; await syncBuildLayer(false); await syncLoadDonjons(false); applyMods(MODS); await syncApplyMedia(); }
  // 2) puis la version en ligne
  await syncNow(true);
}
async function syncNow(boot, onProg) {
  if (!syncOn()) return false;
  syncSetStatus("busy", "Synchronisation…");
  try {
    const changed = await syncFetchIndex();
    let reapply = await syncLoadDonjons(true);
    if (changed || !SYNC.layer.length || [...SYNC.crea.values()].some(C => C.json && C.js === undefined)) { await syncBuildLayer(true, onProg || ((n, t) => syncSetStatus("busy", "Lecture des créatures : " + n + "/" + t))); reapply = true; }
    if (reapply) applyMods(MODS);
    SYNC.status = "ok";
    await syncApplyMedia();
    if (changed) { SYNC.failed.clear(); SYNC.done.clear(); for (const mid in SPRITES) if (SPRITES[mid].doc && SPRITES[mid].doc.repo) delete SPRITES[mid]; SYNC.emo = {}; }
    for (const kind of ["mods", "opts", "save"]) {
      const r = await syncPullDoc(kind);
      if (r === "conflict") await syncResolveConflict(kind);
    }
    await syncPushAll();
    await syncPushLocalMedia();
    SYNC.lastSync = Date.now();
    syncSetStatus("ok", "");
    return true;
  } catch (e) {
    syncSetStatus(SYNC.index ? "cache" : "error", e.message);
    if (!boot) toast("Synchro : " + e.message, 3800);
    return false;
  }
}
// quand l'appli revient au premier plan, ou passe en arrière-plan
document.addEventListener("visibilitychange", () => {
  if (!syncOn() || SYNC.status === "off") return;
  if (document.visibilityState === "hidden") syncPushAll().catch(() => { });
  else if (Date.now() - SYNC.lastSync > 60000) syncNow(true).catch(() => { });
});
// ---------- tout télécharger (pour jouer hors ligne) ----------
async function syncDownloadAll(onProg) {
  if (SYNC.dl) return;
  const list = [...SYNC.crea.values()].filter(C => C.pmd || C.imgs.length);
  SYNC.dl = { n: 0, total: list.length, stop: false };
  try {
    for (const C of list) {
      if (SYNC.dl.stop) break;
      await syncRun(async () => {
        await syncLoadSprite(C.mid, "fetch");
        for (const e of C.emos) { const F = C.f[e.toLowerCase() + ".png"]; await blobBySha(F.sha, F.name); }
      });
      SYNC.dl.n++; if (onProg) onProg(SYNC.dl.n, SYNC.dl.total);
    }
    for (const [, M] of SYNC.media) if (M.kind === "audio" && !SYNC.dl.stop) await blobBySha(M.sha, M.name);
    return { ok: !SYNC.dl.stop, n: SYNC.dl.n, total: SYNC.dl.total };
  } catch (e) { return { ok: false, n: SYNC.dl.n, total: SYNC.dl.total, err: e.message }; }
  finally { SYNC.dl = null; }
}
async function syncCacheInfo() {
  const keys = (await IDB.keys()) || [];
  let n = 0; for (const k of keys) if (String(k).startsWith("sha:")) n++;
  let est = null; try { if (navigator.storage && navigator.storage.estimate) est = await navigator.storage.estimate(); } catch (e) { }
  return { files: n, usage: est && est.usage, quota: est && est.quota };
}
async function syncClearCache() {
  const keys = (await IDB.keys()) || [];
  for (const k of keys) if (String(k).startsWith("sha:")) await IDB.del(k);
  SYNC.jsonMem = {};
}
function syncStats() {
  let pmd = 0, still = 0, json = 0, created = 0;
  const def = new Set(DEFAULT_DATA.monsters.map(m => m.id));
  for (const C of SYNC.crea.values()) { if (C.pmd) pmd++; else if (C.imgs.length) still++; if (C.json) json++; }
  for (const m of SYNC.layer) if (!def.has(m.id)) created++;
  return { folders: SYNC.crea.size, pmd, still, json, created, media: SYNC.media.size, truncated: SYNC.index && SYNC.index.truncated };
}
