// ============================================================
//  PARAMÈTRES (refonte) : Jeu · Synchro · Sprites · Sons · Sauvegarde · Atelier
// ============================================================
const SET_TABS = [["jeu", "Jeu"], ["synchro", "Synchro"], ["sprites", "Sprites"], ["sons", "Sons"], ["sauvegarde", "Sauvegarde"], ["atelier", "Atelier"]];
const SETTINGS = { tab: "jeu", box: null, open: false };
function openSettings(tab) {
  SETTINGS.tab = tab || SETTINGS.tab || "jeu";
  const body = el("div", "settings");
  const tabs = el("div", "seg set-tabs");
  for (const [k, n] of SET_TABS) {
    const b = el("button", k === SETTINGS.tab ? "on" : "", n); b.type = "button";
    b.onclick = () => { sfx("tap"); SETTINGS.tab = k; for (const x of tabs.children) x.classList.toggle("on", x === b); renderSettingsTab(); };
    tabs.append(b);
  }
  const box = el("div", "set-box");
  body.append(tabs, box);
  SETTINGS.box = box; SETTINGS.open = true;
  openSheet({ title: "Paramètres", body, tall: true, actions: [{ label: "Fermer", cls: "ghost" }], onClose: () => { SETTINGS.open = false; } });
  renderSettingsTab();
}
function onSyncStatus() { if (SETTINGS.open && (SETTINGS.tab === "synchro" || SETTINGS.tab === "sprites")) renderSettingsTab(); }
function setRow(label, sub, ctrl) {
  const r = el("div", "set-row");
  const t = el("div", "set-tx"); t.append(el("b", null, label)); if (sub) t.append(el("small", null, sub));
  r.append(t); if (ctrl) r.append(ctrl);
  return r;
}
function setBtn(label, fn, cls) { const b = el("button", "btn small " + (cls || ""), label); b.type = "button"; b.onclick = () => { sfx("tap"); fn(b); }; return b; }
function setToggle(on, fn) { const b = el("button", "set-toggle" + (on ? " on" : ""), on ? "Oui" : "Non"); b.type = "button"; b.onclick = () => { sfx("tap"); fn(); renderSettingsTab(); }; return b; }
function fmtMo(n) { return n == null ? "?" : (n / 1048576).toFixed(n > 104857600 ? 0 : 1).replace(".", ",") + " Mo"; }
function fmtTime(t) { return t ? new Date(t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "jamais"; }
function renderSettingsTab() {
  const box = SETTINGS.box; if (!box) return;
  const scroll = box.parentElement && box.parentElement.parentElement ? box.parentElement.parentElement.scrollTop : 0;
  box.replaceChildren();
  ({ jeu: setTabJeu, synchro: setTabSync, sprites: setTabSprites, sons: setTabSons, sauvegarde: setTabSave, atelier: setTabAtelier }[SETTINGS.tab] || setTabJeu)(box);
  if (box.parentElement && box.parentElement.parentElement) box.parentElement.parentElement.scrollTop = scroll;
}
// ---------- Jeu ----------
function setTabJeu(box) {
  box.append(setRow("Bruitages", "Les sons des attaques, des menus…", setToggle(OPTS.sound, () => { OPTS.sound = !OPTS.sound; saveOpts(); if (OPTS.sound) unlockAudio(); })));
  box.append(setRow("Musique", "Les musiques que tu as ajoutées", setToggle(OPTS.music !== false, () => { OPTS.music = OPTS.music === false; saveOpts(); MUSIC.key = null; refreshMusic(); })));
  const vol = el("input", "set-range"); vol.type = "range"; vol.min = "0"; vol.max = "100"; vol.value = String(Math.round((OPTS.musicVol == null ? 0.6 : OPTS.musicVol) * 100));
  vol.oninput = () => { OPTS.musicVol = +vol.value / 100; if (MUSIC.el) MUSIC.el.volume = OPTS.musicVol; };
  vol.onchange = () => saveOpts();
  box.append(setRow("Volume de la musique", null, vol));
  box.append(setRow("Texte rapide", "Les dialogues s’affichent d’un coup", setToggle(!!OPTS.fastText, () => { OPTS.fastText = !OPTS.fastText; saveOpts(); })));
  box.append(setRow("Aide des commandes", "Réafficher l’aide au prochain donjon", setBtn("Revoir", () => { OPTS.hintSeen = false; saveOpts(); toast("L’aide réapparaîtra au prochain donjon."); })));
  box.append(el("p", "sheet-note", "Donjon Mystère Ultimate est un jeu fait par moi et pour moi — José. Version " + ((window.DMU_VERSION) || "en ligne") + "."));
}
// ---------- Synchro ----------
function setTabSync(box) {
  if (!syncAvailable()) {
    box.append(el("p", "sheet-text", "Tu joues sur la version Claude : ta partie, tes modifs et tes images y sont déjà synchronisées toutes seules entre tes appareils."));
    box.append(el("p", "sheet-note", "La synchro GitHub sert à l’application installée (PC et téléphone)."));
    return;
  }
  const c = syncCfg();
  const st = { off: "Pas encore activée", busy: SYNC.msg || "Synchronisation…", ok: "Synchronisé ✓", cache: "Hors ligne : données gardées sur l’appareil", error: "Erreur" }[syncOn() ? SYNC.status : "off"];
  const stat = el("div", "set-status " + (syncOn() ? SYNC.status : "off"));
  stat.append(el("b", null, "☁ " + st), el("small", null, syncOn() ? c.repo + " · dernière synchro " + fmtTime(SYNC.lastSync) + (SYNC.rate ? " · " + SYNC.rate.left + " requêtes restantes cette heure" : "") : "Une fois activée, ta partie, l’Atelier, tes sprites, tes sons et tes réglages sont les mêmes sur le PC et le téléphone."));
  if (SYNC.msg && SYNC.status !== "busy" && SYNC.status !== "ok") stat.append(el("small", "set-err", SYNC.msg));
  box.append(stat);
  const repo = el("input", "inp"); repo.value = c.repo; repo.placeholder = "compte/dépôt"; repo.autocapitalize = "off"; repo.spellcheck = false;
  const tok = el("input", "inp"); tok.type = "password"; tok.value = c.token; tok.placeholder = "github_pat_…"; tok.autocomplete = "off"; tok.spellcheck = false;
  box.append(el("small", "sheet-note", "Ton dépôt privé"), repo, el("small", "sheet-note", "Ton jeton GitHub (gardé seulement sur cet appareil)"), tok);
  const row = el("div", "pause-grid");
  row.append(setBtn(syncOn() ? "Enregistrer et resynchroniser" : "Activer la synchro", async b => {
    c.repo = repo.value.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/\/+$/, ""); c.token = tok.value.trim(); c.on = !!(c.repo && c.token);
    syncSaveCfg();
    if (!c.on) { toast("Il faut le nom du dépôt et le jeton."); return; }
    b.disabled = true; b.textContent = "Connexion…";
    const ok = await syncNow(false);
    if (ok) toast("Synchro activée !", 2400);
    renderSettingsTab();
  }, "primary"));
  if (syncOn()) {
    row.append(setBtn("Synchroniser maintenant", async b => { b.disabled = true; b.textContent = "…"; await syncNow(false); renderSettingsTab(); }));
    row.append(setBtn("Déconnecter cet appareil", () => openSheetConfirm("Déconnecter cet appareil ?", "Ta partie reste sur l’appareil et dans ton dépôt. Le jeu arrêtera simplement de synchroniser ici.", "Déconnecter", () => { c.on = false; syncSaveCfg(); SYNC.status = "off"; openSettings("synchro"); })));
  }
  box.append(row);
  const help = el("details", "set-help");
  help.append(el("summary", null, "Comment créer le jeton (une seule fois)"));
  const ol = el("ol");
  for (const t of ["Sur github.com : ta photo → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.",
    "Nom : « Donjon Mystère ». Expiration : la plus longue proposée (ou « No expiration »).",
    "Repository access : Only select repositories → choisis ton dépôt privé (donjon-donnees).",
    "Permissions → Repository permissions → Contents : Read and write.",
    "Generate token, puis copie-le et colle-le ici, sur le PC et sur le téléphone."]) ol.append(el("li", null, t));
  const a = el("a", null, "Ouvrir la page de création du jeton"); a.href = "https://github.com/settings/personal-access-tokens/new"; a.target = "_blank"; a.rel = "noopener";
  help.append(ol, a, el("p", "sheet-note", "Ce jeton n’ouvre que ce dépôt. Ne le partage avec personne. Si tu le perds, supprime-le sur GitHub et crée-en un autre."));
  box.append(help);
}
function openSheetConfirm(title, text, okLabel, fn) {
  openSheet({ title, body: el("p", "sheet-text", text), actions: [{ label: "Annuler", cls: "ghost", fn: () => openSettings(SETTINGS.tab) }, { label: okLabel, cls: "danger", fn }] });
}
// ---------- Sprites ----------
function setTabSprites(box) {
  box.append(el("p", "sheet-text dim", "Un dossier par créature : creatures/0001 → créature 001, creatures/0058 → créature 058, creatures/1999 → créature 1999. Le jeu prend AnimData.xml et les animations Idle, Walk, Attack, Hurt et Sleep (format PMD), ou sinon une image (sprite.png, portrait.png…). Normal.png, Happy.png, Crying.png… donnent les expressions des dialogues. Un dossier avec un sprite mais sans créature dans le jeu crée « Créature #N » : complète son creature.json quand tu veux."));
  if (syncOn() && SYNC.index) {
    const s = syncStats();
    const info = el("div", "set-status ok");
    info.append(el("b", null, s.folders + " dossiers dans ton dépôt"), el("small", null, s.pmd + " animés (PMD) · " + s.still + " en image · " + s.json + " creature.json · " + s.created + " créatures ajoutées au jeu · " + s.media + " images/sons dans graphics et sons"));
    if (s.truncated) info.append(el("small", "set-err", "Ton dépôt contient trop de fichiers pour être lu en une fois : garde seulement les fichiers utiles (voir LISEZMOI)."));
    box.append(info);
    const cache = el("p", "sheet-note", "Sur cet appareil : …"); box.append(cache);
    syncCacheInfo().then(ci => { cache.textContent = "Sur cet appareil : " + ci.files + " fichiers du dépôt en mémoire · " + fmtMo(ci.usage) + " utilisés" + (ci.quota ? " sur " + fmtMo(ci.quota) + " disponibles" : "") + "."; });
    const row = el("div", "pause-grid");
    const prog = el("p", "sheet-text", SYNC.dl ? "Téléchargement… " + SYNC.dl.n + "/" + SYNC.dl.total : "");
    if (!SYNC.dl) row.append(setBtn("Tout télécharger (jouer hors ligne)", async b => {
      b.disabled = true;
      const r = await syncDownloadAll((n, t) => { prog.textContent = "Téléchargement… " + n + "/" + t; });
      prog.textContent = r.ok ? "Tout est sur l’appareil : " + r.n + " créatures." : "Arrêté à " + r.n + "/" + r.total + (r.err ? " : " + r.err : "") + ". Tu peux relancer plus tard, ce qui est déjà téléchargé est gardé.";
      b.disabled = false;
    }, "primary"));
    else row.append(setBtn("Arrêter le téléchargement", () => { if (SYNC.dl) SYNC.dl.stop = true; }));
    row.append(setBtn("Vider la mémoire de l’appareil", () => openSheetConfirm("Vider la mémoire ?", "Les sprites et sons téléchargés seront effacés de cet appareil seulement. Ils restent dans ton dépôt et reviendront au besoin.", "Vider", async () => { await syncClearCache(); toast("Mémoire vidée."); openSettings("sprites"); })));
    box.append(row, prog);
  } else {
    box.append(el("p", "sheet-text", syncAvailable() ? "Active la synchro (onglet Synchro) pour que le jeu prenne tes sprites dans ton dépôt privé, sur tous tes appareils." : "Sur la version Claude, importe tes sprites avec l’Atelier (onglet Dossier)."));
    box.append(setBtn("Activer la synchro", () => { SETTINGS.tab = "synchro"; openSettings("synchro"); }, "primary"));
  }
  box.append(el("h4", "fld-h", "Sur cet appareil seulement"));
  box.append(setRow("Importer un dossier", "Ancienne méthode : lit un dossier creatures depuis cet appareil (pas synchronisé).", setBtn("Ouvrir", () => { closeSheet(); $("#atlBack").dataset.back = SCREEN === "hub" ? "hub" : "title"; ATL.tab = "folder"; openAtelier(); })));
}
// ---------- Sons ----------
function setTabSons(box) {
  box.append(el("p", "sheet-text dim", "Mets tes musiques dans le dossier sons/ de ton dépôt, avec le nom de l’emplacement (par exemple bgm.royaume.mp3). Elles se téléchargent la première fois qu’elles jouent, puis restent sur l’appareil."));
  const list = el("div", "chapters");
  for (const s of mediaSlots().filter(x => x.kind === "audio")) {
    const repo = syncOn() && SYNC.media.get(s.k), d = MEDIA.idx[s.k];
    const c = el("div", "chap" + (repo || d ? " done" : " locked"));
    c.append(el("b", null, s.n), el("small", null, s.k + " · " + (repo ? "dans ton dépôt (" + repo.name + ")" : d ? "sur cet appareil" : "aucune musique")));
    list.append(c);
  }
  box.append(list);
  if (isModo()) box.append(setBtn("Ouvrir Graphics → Sons", () => { closeSheet(); STUDIO.tab = "sons"; openStudio(SCREEN === "hub" ? "hub" : "title"); }));
}
// ---------- Sauvegarde ----------
function setTabSave(box) {
  box.append(el("p", "sheet-text dim", syncOn() ? "Ta partie est envoyée dans partie/user_save.json de ton dépôt à chaque sauvegarde importante, et récupérée au lancement." : "Ta partie est gardée sur cet appareil. Tu peux l’exporter en fichier user_save.json."));
  const row = el("div", "pause-grid");
  if (G) row.append(setBtn("Télécharger user_save.json", () => downloadBlob("user_save.json", new Blob([saveJson()], { type: "application/json" })), "primary"));
  row.append(setBtn("Importer un fichier", () => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json"; inp.onchange = async () => { const f = inp.files && inp.files[0]; if (f) importSaveText(await f.text()); }; inp.click(); }));
  box.append(row);
  if (syncOn() && SYNC.index) {
    const backups = SYNC.index.files.filter(f => /^partie\/secours\/.+\.json$/i.test(f[0])).sort((a, b) => a[0] < b[0] ? 1 : -1).slice(0, 10);
    if (backups.length) {
      box.append(el("h4", "fld-h", "Copies de secours (dans ton dépôt)"));
      for (const [path, sha] of backups) {
        const name = path.split("/").pop();
        box.append(setRow(name, null, setBtn("Charger", async () => { try { const d = await jsonBySha(sha); if (/atelier/.test(name)) { openSheetConfirm("Remettre ces modifs de l’Atelier ?", "Tes modifs actuelles seront remplacées (elles restent dans l’historique de l’Atelier).", "Remettre", async () => { const m = (d && d.mods) || d; await Store.saveMods(m); applyMods(m); toast("Modifs de l’Atelier remises."); }); } else importSaveText(JSON.stringify(d)); } catch (e) { toast("Lecture impossible : " + e.message); } })));
      }
    }
  }
  if (G) { box.append(el("h4", "fld-h", "Attention")); box.append(setRow("Effacer la sauvegarde", "Recommencer une partie à zéro (les modifs de l’Atelier sont gardées).", setBtn("Effacer", confirmErase, "danger"))); }
}
// ---------- Atelier ----------
function setTabAtelier(box) {
  box.append(setRow("Atelier", "Créatures, attaques, objets, donjons, types", setBtn("Ouvrir", () => { closeSheet(); $("#atlBack").dataset.back = SCREEN === "hub" ? "hub" : "title"; openAtelier(); }, "primary")));
  if (isModo()) box.append(setRow("Graphics", "Décors, tuiles, objets, images des créatures, sons", setBtn("Ouvrir", () => { closeSheet(); openStudio(SCREEN === "hub" ? "hub" : "title"); })));
  if (G && G.story.ch1Done) box.append(setRow("Trophées", null, setBtn("Voir", () => { closeSheet(); openTrophies(); })));
  box.append(el("p", "sheet-note", syncOn() ? "Avec la synchro, tes modifs de l’Atelier partent dans partie/atelier.json de ton dépôt : elles sont aussi sur ton autre appareil. Seules les créatures que tu as vraiment modifiées y sont enregistrées ; les autres suivent leur creature.json." : "Tes modifs de l’Atelier sont gardées sur cet appareil."));
}
