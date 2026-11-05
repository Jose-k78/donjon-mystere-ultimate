// ============================================================
//  CHAPITRE 2 : mise en scène (maison, Royaume, arène, balcon)
// ============================================================
const EXTRA_BG = {
  house(ctx, w, h, now) {
    // murs en planches
    for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? "#7a5233" : "#80583a"; ctx.fillRect(i * w / 12, 0, w / 12 + 1, h * 0.7); }
    ctx.fillStyle = "rgba(0,0,0,0.12)"; for (let i = 1; i < 12; i++) ctx.fillRect(i * w / 12, 0, 2, h * 0.7);
    // fenêtre sur la mer
    const wx = w * 0.56, wy = h * 0.12, ww = w * 0.34, wh = h * 0.24;
    const sky = ctx.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, "#ffb37a"); sky.addColorStop(0.6, "#ffd9a0"); sky.addColorStop(0.61, "#3d7fb0"); sky.addColorStop(1, "#2b5f8a");
    ctx.fillStyle = sky; ctx.fillRect(wx, wy, ww, wh);
    ctx.fillStyle = "rgba(255,255,255,0.4)"; for (let k = 0; k < 4; k++) ctx.fillRect(wx + ((now / 3000 + k * 0.27) % 1) * ww, wy + wh * (0.68 + k * 0.07), ww * 0.12, 2);
    ctx.strokeStyle = "#4a2e18"; ctx.lineWidth = 6; ctx.strokeRect(wx, wy, ww, wh); ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.stroke();
    // cadre : le père explorateur (silhouette avec chapeau)
    const fx = w * 0.14, fy = h * 0.14, fw = w * 0.22, fh = h * 0.2;
    ctx.fillStyle = "#c9a14a"; ctx.fillRect(fx - 6, fy - 6, fw + 12, fh + 12); ctx.fillStyle = "#e9dcc0"; ctx.fillRect(fx, fy, fw, fh);
    ctx.fillStyle = "#5c4a36"; ctx.beginPath(); ctx.ellipse(fx + fw / 2, fy + fh * 0.95, fw * 0.32, fh * 0.42, 0, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.arc(fx + fw / 2, fy + fh * 0.42, fw * 0.17, 0, 7); ctx.fill();
    ctx.fillRect(fx + fw * 0.22, fy + fh * 0.24, fw * 0.56, fh * 0.06); ctx.fillRect(fx + fw * 0.36, fy + fh * 0.1, fw * 0.28, fh * 0.16);
    const g = 0.5 + Math.sin(now / 600) * 0.3; ctx.fillStyle = "rgba(255,230,140," + (0.15 * g) + ")"; ctx.fillRect(fx, fy, fw, fh);
    // sol
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#9a6b3f" : "#a3744a"; ctx.fillRect(0, h * 0.7 + i * h * 0.05, w, h * 0.05); }
    ctx.fillStyle = "#c0503c"; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.84, w * 0.42, h * 0.07, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = "#f0c36a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.84, w * 0.36, h * 0.055, 0, 0, 7); ctx.stroke();
    // lampe
    const lg = ctx.createRadialGradient(w * 0.08, h * 0.5, 4, w * 0.08, h * 0.5, w * 0.5); lg.addColorStop(0, "rgba(255,210,120,0.35)"); lg.addColorStop(1, "rgba(255,210,120,0)");
    ctx.fillStyle = lg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#5a3a20"; ctx.fillRect(w * 0.07, h * 0.5, w * 0.02, h * 0.2); ctx.fillStyle = "#ffd98a"; ctx.beginPath(); ctx.moveTo(w * 0.03, h * 0.5); ctx.lineTo(w * 0.13, h * 0.5); ctx.lineTo(w * 0.11, h * 0.44); ctx.lineTo(w * 0.05, h * 0.44); ctx.fill();
  },
  kingdom(ctx, w, h, now) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55); sky.addColorStop(0, "#6fb7f0"); sky.addColorStop(1, "#d9f0ff");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    drawSun(ctx, w * 0.82, h * 0.1, Math.min(w, h) * 0.06, "rgba(255,240,190,0.95)");
    for (let i = 0; i < 3; i++) drawCloud(ctx, ((now / 60000 + i * 0.37) % 1.3) * w * 1.1 - w * 0.15, h * (0.08 + i * 0.06), w * 0.22);
    // collines et palais
    ctx.fillStyle = "#8cc77a"; ctx.beginPath(); ctx.moveTo(0, h * 0.5); ctx.quadraticCurveTo(w * 0.5, h * 0.3, w, h * 0.5); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    const px = w * 0.5, py = h * 0.4;
    ctx.fillStyle = "#efe6d2"; ctx.fillRect(px - w * 0.2, py - h * 0.08, w * 0.4, h * 0.1);
    for (const [tx, th] of [[-0.2, 0.16], [-0.08, 0.2], [0.08, 0.2], [0.2, 0.16], [0, 0.26]]) {
      const x = px + tx * w, tw = w * 0.07;
      ctx.fillStyle = "#e6dcc6"; ctx.fillRect(x - tw / 2, py - h * th, tw, h * th);
      ctx.fillStyle = "#3e64b8"; ctx.beginPath(); ctx.moveTo(x - tw * 0.65, py - h * th); ctx.lineTo(x, py - h * th - h * 0.07); ctx.lineTo(x + tw * 0.65, py - h * th); ctx.fill();
      ctx.fillStyle = "#ffd94a"; ctx.fillRect(x - 1, py - h * th - h * 0.1, 2, h * 0.03);
      ctx.fillStyle = "#ff8a3d"; ctx.fillRect(x + 1, py - h * th - h * 0.1, w * 0.02, h * 0.012);
    }
    // remparts + bannières des guildes
    ctx.fillStyle = "#cbbd9f"; ctx.fillRect(0, h * 0.5, w, h * 0.12);
    for (let x = 0; x < w; x += w / 14) { ctx.fillStyle = "#bbad8c"; ctx.fillRect(x, h * 0.48, w / 28, h * 0.02); }
    GUILDS.forEach((g, i) => {
      const bx = w * (0.06 + i * 0.125), by = h * 0.5, wv = Math.sin(now / 500 + i) * 2;
      ctx.fillStyle = g.col; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + w * 0.07 + wv, by); ctx.lineTo(bx + w * 0.07 + wv, by + h * 0.09); ctx.lineTo(bx + w * 0.035, by + h * 0.075); ctx.lineTo(bx, by + h * 0.09); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.font = `700 ${Math.round(w * 0.04)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText(g.icon, bx + w * 0.035 + wv / 2, by + h * 0.05); ctx.textAlign = "left";
    });
    // porte et pavés
    ctx.fillStyle = "#6b5236"; ctx.beginPath(); ctx.moveTo(w * 0.4, h * 0.62); ctx.lineTo(w * 0.4, h * 0.55); ctx.quadraticCurveTo(w * 0.5, h * 0.49, w * 0.6, h * 0.55); ctx.lineTo(w * 0.6, h * 0.62); ctx.fill();
    ctx.fillStyle = "#c9b48c"; ctx.fillRect(0, h * 0.62, w, h * 0.38);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 10; x++) { ctx.fillStyle = (x + y) % 2 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"; ctx.fillRect(x * w / 10 + (y % 2) * w / 20, h * 0.62 + y * h * 0.048, w / 10 - 2, h * 0.046); }
    // foule
    drawCrowd(ctx, w, h * 0.66, h * 0.08, now, 18, 0.5);
  },
  arena(ctx, w, h, now) {
    ctx.fillStyle = "#3d2a1a"; ctx.fillRect(0, 0, w, h);
    for (let r = 0; r < 6; r++) { const y = h * (0.05 + r * 0.075); ctx.fillStyle = r % 2 ? "#8a6a48" : "#7d5f3f"; ctx.fillRect(0, y, w, h * 0.075); drawCrowd(ctx, w, y + h * 0.06, h * 0.05, now + r * 300, 16 + r, 0.4 + r * 0.03); }
    GUILDS.forEach((g, i) => { const bx = w * (0.03 + i * 0.125); ctx.fillStyle = g.col; ctx.fillRect(bx, 0, w * 0.06, h * 0.06); ctx.fillStyle = "#fff"; ctx.font = `700 ${Math.round(w * 0.035)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText(g.icon, bx + w * 0.03, h * 0.045); ctx.textAlign = "left"; });
    ctx.fillStyle = "#5a4330"; ctx.fillRect(0, h * 0.5, w, h * 0.03);
    const sand = ctx.createLinearGradient(0, h * 0.53, 0, h); sand.addColorStop(0, "#d9b77c"); sand.addColorStop(1, "#e8cf9a");
    ctx.fillStyle = sand; ctx.fillRect(0, h * 0.53, w, h * 0.47);
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.78, w * 0.4, h * 0.13, 0, 0, 7); ctx.stroke();
    for (let i = 0; i < 3; i++) { const a = now / 3000 + i * 2.1; const rg = ctx.createLinearGradient(w * (0.5 + Math.sin(a) * 0.3), 0, w * 0.5, h); rg.addColorStop(0, "rgba(255,240,200,0.12)"); rg.addColorStop(1, "rgba(255,240,200,0)"); ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(w * (0.45 + Math.sin(a) * 0.3), 0); ctx.lineTo(w * (0.55 + Math.sin(a) * 0.3), 0); ctx.lineTo(w * 0.7, h); ctx.lineTo(w * 0.3, h); ctx.fill(); }
  },
  balcony(ctx, w, h, now) {
    const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, "#1e2350"); sky.addColorStop(0.5, "#6b4a7a"); sky.addColorStop(1, "#e08a5a");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    drawMoon(ctx, w * 0.8, h * 0.1, Math.min(w, h) * 0.05, "#1e2350");
    ctx.fillStyle = "#efe6d2"; ctx.fillRect(0, h * 0.22, w, h * 0.06);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = "#e3d7bd"; ctx.fillRect(w * (0.02 + i * 0.17), h * 0.28, w * 0.07, h * 0.4); }
    const cap = [[0.09, "kyogre"], [0.22, "victini"], [0.35, "dialga"], [0.65, "amovenus"], [0.78, "lunala"], [0.91, "hoopa"]];
    const S = Math.min(w * 0.13, h * 0.1, 80);
    for (const [x, gid] of cap) {
      const g = GUILDS.find(q => q.id === gid);
      const cx = w * x, by = h * 0.62;
      ctx.fillStyle = g.col; ctx.fillRect(cx - S * 0.45, by - S * 0.15, S * 0.9, S * 0.12);
      drawShadow(ctx, cx, by, S);
      drawCreature(ctx, castMid("cap_" + gid), cx, by, S, { t: now + x * 900, dir: [0, 1] });
      const r = S * 0.16; ctx.fillStyle = g.col; ctx.beginPath(); ctx.arc(cx, by - S * 1.1, r, 0, 7); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = `700 ${Math.round(r * 1.2)}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(g.icon, cx, by - S * 1.1 + 1); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    }
    { const cx = w * 0.5, by = h * 0.6, S2 = S * 1.25; ctx.fillStyle = "#b8202f"; ctx.fillRect(cx - S2 * 0.6, by - S2 * 0.9, S2 * 1.2, S2 * 0.9); ctx.fillStyle = "#ffd94a"; ctx.fillRect(cx - S2 * 0.6, by - S2 * 0.92, S2 * 1.2, S2 * 0.08); drawShadow(ctx, cx, by, S2); drawCreature(ctx, castMid("king"), cx, by, S2, { t: now, dir: [0, 1] }); drawCrown(ctx, cx, by - S2 * 1.02, S2 * 0.34); }
    if (SC.hood) { const cx = w * 0.3, by = h * 0.7; ctx.save(); ctx.globalAlpha = Math.min(1, (now - SC.hood) / 800); drawShadowFigure(ctx, cx, by, h * 0.17, now); ctx.restore(); }
    ctx.fillStyle = "#d8ccb0"; ctx.fillRect(0, h * 0.62, w, h * 0.06);
    for (let i = 0; i < 18; i++) { ctx.fillStyle = "#c6b896"; ctx.fillRect(i * w / 18 + 2, h * 0.68, w / 36, h * 0.1); }
    ctx.fillStyle = "#b9a986"; ctx.fillRect(0, h * 0.78, w, h * 0.04);
    drawCrowd(ctx, w, h * 0.96, h * 0.1, now, 14, 0.55);
  }
};
// Le public : de vraies créatures tirées au hasard (pré-dessinées pour rester fluide)
const CROWD_CACHE = {};
function crowdMids() { if (!SC.crowd || !SC.crowd.length) { const ids = DATA.monsters.filter(m => (m.rarity || 1) < 3 && !m.story).map(m => m.id); SC.crowd = ids.sort(() => rnd() - 0.5); } return SC.crowd; }
function drawCrowd(ctx, w, baseY, size, now, n, alpha) {
  const mids = crowdMids();
  const key = Math.round(w) + "|" + Math.round(baseY) + "|" + Math.round(size) + "|" + n + "|" + mids.slice(0, 3).join("");
  let c = CROWD_CACHE[key];
  if (!c) {
    for (const k in CROWD_CACHE) if (Object.keys(CROWD_CACHE).length > 24) delete CROWD_CACHE[k];
    c = []; const count = Math.max(6, Math.round(n * 1.6));
    for (let half = 0; half < 2; half++) {
      const cv = document.createElement("canvas"); cv.width = Math.ceil(w); cv.height = Math.ceil(size * 1.9);
      const x2 = cv.getContext("2d");
      for (let i = half; i < count; i += 2) {
        const x = ((i + 0.5) / count) * w + (Math.sin(i * 12.9898 + baseY) * 0.5) * (w / count) * 0.5;
        const mid = mids[(i + Math.floor(baseY)) % mids.length];
        try { drawCreature(x2, mid, x, cv.height - 2, size * 0.95, { t: i * 137, dir: [i % 3 - 1 || 1, 1], still: true }); } catch (e) { }
      }
      c.push(cv);
    }
    CROWD_CACHE[key] = c;
  }
  ctx.save(); ctx.globalAlpha = Math.min(1, alpha + 0.35);
  for (let half = 0; half < 2; half++) {
    const bob = Math.abs(Math.sin(now / 280 + half * 1.7)) * size * 0.14;
    ctx.drawImage(c[half], 0, baseY - c[half].height + 2 - bob);
  }
  ctx.restore();
}
function drawCrown(ctx, x, y, s) {
  ctx.fillStyle = "#ffd94a"; ctx.strokeStyle = "#a8781a"; ctx.lineWidth = Math.max(1, s * 0.08);
  ctx.beginPath(); ctx.moveTo(x - s * 0.5, y + s * 0.25); ctx.lineTo(x - s * 0.5, y - s * 0.15); ctx.lineTo(x - s * 0.25, y + s * 0.05); ctx.lineTo(x, y - s * 0.35); ctx.lineTo(x + s * 0.25, y + s * 0.05); ctx.lineTo(x + s * 0.5, y - s * 0.15); ctx.lineTo(x + s * 0.5, y + s * 0.25); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ff5f6d"; ctx.beginPath(); ctx.arc(x, y + s * 0.08, s * 0.08, 0, 7); ctx.fill();
}
function cheer() { sfx("level"); setTimeout(() => sfx("pick"), 180); setTimeout(() => sfx("pick"), 340); }
function showGuildBoard() {
  return new Promise(resolve => {
    openSheet({ title: "Les huit grandes guildes", body: guildBoardBody(), actions: [{ label: "Continuer", cls: "primary" }], tall: true, onClose: resolve });
  });
}
async function fadeTo(fn, ms) {
  const f = $("#fade"); f.hidden = false; f.style.transition = "opacity " + (ms || 700) + "ms"; f.style.opacity = "0";
  await wait(30); f.style.opacity = "1"; await wait((ms || 700) + 50);
  if (fn) await fn();
  f.style.opacity = "0"; await wait((ms || 700) + 50); f.hidden = true;
}
function genVagabonds() { ensureTownCast(); }
// ---- Introduction : chez le partenaire → arrivée au Royaume ----
async function playChapter2Intro() {
  const h = hero(), p = partner();
  G.story.step = "ch2_intro"; Store.saveGame(G);
  showScreen("scene"); sceneReset("black"); setMusic("bgm.chapitre2");
  await blackCard(CH2.title, 2600);
  sceneReset("house");
  actor("hero", h.mid, 0.3, 0.82, { dir: [1, 0] }); actor("partner", p.mid, 0.66, 0.84, { dir: [-1, 0] });
  await wait(400);
  await runDialog(CH2.home, { onCue: async cue => { if (cue === "father") { SC.actors.partner.dir = [-1, -1]; await wait(500); SC.actors.partner.dir = [-1, 0]; } } });
  await runDialog(CH2.world, { onCue: async cue => { if (cue === "guilds") await showGuildBoard(); if (cue === "map") { hop("partner"); await wait(300); } } });
  await runDialog(CH2.world2);
  await runChoice(CH2.homeChoice);
  await runDialog(CH2.home2, { onCue: async cue => { if (cue === "hop") { hop("partner"); hop("hero"); await wait(400); } } });
  await fadeTo(async () => {
    sceneReset("kingdom");
    actor("hero", h.mid, -0.1, 0.84, { dir: [1, 0] }); actor("partner", p.mid, -0.25, 0.86, { dir: [1, 0] });
  }, 900);
  moveA("partner", 0.42, 0.86, 1800); await moveA("hero", 0.28, 0.84, 1600);
  actor("herald", castMid("herald"), 0.72, 0.8, { dir: [-1, 0], sc: 0.9 });
  await runDialog(CH2.arrival, { onCue: async cue => { if (cue === "banners") { hop("partner"); await wait(500); } } });
  G.story.step = "ch2_recruit";
  genVagabonds();
  G.story.rmPos = { x: 23, y: 33 };
  Store.saveGame(G);
  await fadeTo(async () => { goRoyaume(); }, 600);
  setTimeout(() => toast(CH2.objRecruit, 4200), 400);
}
// ---- Inscription à l'arène : les voyous reviennent ----
async function playRegistration() {
  const h = hero(), p = partner(), r = G.team[2], th = G.thieves;
  showScreen("scene"); sceneReset("kingdom"); setMusic("bgm.chapitre2");
  actor("hero", h.mid, 0.26, 0.84, { dir: [1, 0] }); actor("partner", p.mid, 0.4, 0.86, { dir: [1, 0] });
  if (r) actor("recruit", r.mid, 0.14, 0.82, { dir: [1, 0] });
  actor("registrar", castMid("registrar"), 0.56, 0.7, { dir: [-1, 0], sc: 0.85 });
  await runDialog(CH2.register, {
    onCue: async cue => {
      if (cue === "thieves") {
        actor("chef", th[0], 1.2, 0.8, { dir: [-1, 0], sc: 1.1 }); actor("s1", th[1], 1.35, 0.74, { dir: [-1, 0] }); actor("s2", th[2], 1.3, 0.88, { dir: [-1, 0] });
        moveA("s1", 0.84, 0.74, 900); moveA("s2", 0.8, 0.88, 1000); await moveA("chef", 0.68, 0.8, 1000);
        for (const k of ["hero", "partner", "recruit"]) if (SC.actors[k]) SC.actors[k].dir = [1, 0];
        hop("partner"); await wait(300);
      }
      if (cue === "thievesLeave") { for (const k of ["chef", "s1", "s2"]) SC.actors[k].dir = [1, 0]; moveA("s1", 1.3, 0.74, 1000); moveA("s2", 1.3, 0.88, 1100); await moveA("chef", 1.35, 0.8, 1100); }
    }
  });
  await fadeTo(async () => {
    sceneReset("arena");
    actor("hero", h.mid, 0.5, 0.82, { dir: [0, -1] }); actor("partner", p.mid, 0.66, 0.84, { dir: [0, -1] });
    if (r) actor("recruit", r.mid, 0.34, 0.84, { dir: [0, -1] });
  }, 700);
  actor("presenter", castMid("presenter"), 0.5, 0.62, { dir: [0, 1], sc: 0.85 });
  await runDialog(CH2.rules, { onCue: async cue => { if (cue === "crowd") { cheer(); hop("presenter"); await wait(600); } if (cue === "king") { actor("king", castMid("king"), 0.82, 0.58, { dir: [-1, 1], sc: 0.9, crown: true }); hop("king"); await wait(500); } } });
  await runChoice(CH2.rulesChoice);
  G.story.step = "ch2_tournoi";
  Store.saveGame(G);
  enterDungeon("TOURNOI");
}
// ---- Fin du chapitre 2 ----
async function playChapter2End() {
  const h = hero(), p = partner(), r = G.team[2], th = G.thieves;
  showScreen("scene"); sceneReset("arena"); setMusic("bgm.fin");
  actor("hero", h.mid, 0.3, 0.82, { dir: [1, 0] }); actor("partner", p.mid, 0.2, 0.86, { dir: [1, 0] });
  if (r) actor("recruit", r.mid, 0.16, 0.76, { dir: [1, 0] });
  actor("chef", th[0], 0.74, 0.8, { dir: [-1, 0], sc: 1.1 }); actor("s1", th[1], 0.86, 0.74, { dir: [-1, 0] }); actor("s2", th[2], 0.84, 0.88, { dir: [-1, 0] });
  actor("presenter", castMid("presenter"), 0.5, 0.62, { dir: [0, 1], sc: 0.85 });
  await wait(500);
  await runDialog(CH2.victory, {
    onCue: async cue => {
      if (cue === "crowd") { cheer(); hop("presenter"); }
      if (cue === "king") { actor("king", castMid("king"), 0.5, 0.56, { dir: [0, 1], sc: 0.9, crown: true }); if (SC.actors.presenter) SC.actors.presenter.hidden = true; hop("king"); await wait(500); }
      if (cue === "thievesLeave") { for (const k of ["chef", "s1", "s2"]) SC.actors[k].dir = [1, 0]; moveA("s1", 1.3, 0.74, 900); moveA("s2", 1.3, 0.88, 1000); await moveA("chef", 1.35, 0.8, 1000); }
    }
  });
  await fadeTo(async () => { sceneReset("balcony"); SC.hood = 0; }, 700);
  await runDialog(CH2.captains, { onCue: async cue => { if (cue === "hood") { SC.hood = performance.now(); await wait(900); } } });
  SC.hood = 0;
  await fadeTo(async () => {
    sceneReset("arena");
    actor("hero", h.mid, 0.42, 0.82, { dir: [1, 0] }); actor("partner", p.mid, 0.6, 0.84, { dir: [-1, 0] });
    if (r) actor("recruit", r.mid, 0.76, 0.8, { dir: [-1, 0] });
  }, 600);
  await runDialog(CH2.after, { onCue: async cue => { if (cue === "hop") { hop("partner"); hop("hero"); cheer(); await wait(450); } } });
  if (r) {
    const ch = await runChoice(CH2.recruitChoice);
    if (ch === 0) { await runDialog(CH2.recruitStays); hop("recruit"); }
    else {
      await runDialog(CH2.recruitLeaves);
      SC.actors.recruit.dir = [1, 0]; await moveA("recruit", 1.25, 0.8, 1400);
      const u = G.team.splice(2, 1)[0];
      if (u) { u.hp = maxHP(u); u.ko = false; G.story.innFriend = u; }
    }
  }
  await fadeTo(async () => { sceneReset("dark"); actor("shadow", null, 0.62, 0.86, { shadowFigure: true }); setMusic("bgm.ombre"); }, 1200);
  await runDialog(CH2.shadow);
  await blackCard(CH2.end, 3200, CH2.endSub);
  G.story.ch2Done = true; G.story.step = "ch2_done";
  if (!G.progress.cleared.includes("TOURNOI")) G.progress.cleared.push("TOURNOI");
  G.badges = (G.badges || 0) + 1; G.shards = (G.shards || 0) + 15; G.money = (G.money || 0) + 500;
  G.story.rmPos = { x: 23, y: 21 };
  Store.saveGame(G);
  goRoyaume();
  setTimeout(() => toast("Badge du Tournoi obtenu ! +500 pièces, +15 Éclats d’étoile · Mode libre débloqué", 4500), 600);
}
