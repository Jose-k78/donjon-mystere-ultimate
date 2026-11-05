// ------------------------------------------------------------
//  DONJON
// ------------------------------------------------------------
const DG = { cv: null, ctx: null, w: 0, h: 0, dpr: 1, P: 36, T: 36, shakeAmp: 0, shakeT0: 0, held: null, path: null, pending: null, transition: false, masks: null, maskGrid: null, stairsAsked: false, lastSave: 0, dispHP: {}, hud: {}, snow: null };
function popup(u, text, col, big) { FX.push({ k: "pop", x: u.x, y: u.y, text, col, big, t0: performance.now(), dur: 900 }); }
function shake(a) { if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return; DG.shakeAmp = a; DG.shakeT0 = performance.now(); }

function layoutDungeon() {
  const cv = $("#dgCanvas"); if (!cv) return;
  DG.cv = cv;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, cv.clientWidth), h = Math.max(1, cv.clientHeight);
  const portrait = h > w * 0.9;
  const Tc = clamp(portrait ? w / 9.2 : Math.min(w / 14, h / 8.5), 30, 76);
  DG.P = Math.round(Tc * dpr); DG.dpr = dpr; DG.T = DG.P / dpr;
  DG.w = w; DG.h = h;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  DG.ctx = cv.getContext("2d");
}
function ensureMasks() {
  if (DG.maskGrid === R.grid && DG.masks) return;
  DG.masks = new Uint8Array(R.w * R.h);
  for (let y = 0; y < R.h; y++) for (let x = 0; x < R.w; x++) if (R.grid[I(x, y)] === "#") DG.masks[I(x, y)] = wallMask(x, y);
  DG.maskGrid = R.grid;
}
function renderDungeon(now) {
  if (!R || !DG.ctx) return;
  const ctx = DG.ctx, P = DG.P, T = DG.T, dpr = DG.dpr, w = DG.w, h = DG.h;
  const th = themeOf(R.loc);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = th.bg; ctx.fillRect(0, 0, DG.cv.width, DG.cv.height);
  const H0 = hero();
  const [hx, hy] = visPos(H0, now);
  let sx = 0, sy = 0;
  if (DG.shakeAmp > 0) { const k = (now - DG.shakeT0) / 380; if (k < 1) { sx = (Math.random() - 0.5) * DG.shakeAmp * (1 - k); sy = (Math.random() - 0.5) * DG.shakeAmp * (1 - k); } else DG.shakeAmp = 0; }
  const camX = Math.round(((hx + 0.5) * T - w / 2 + sx) * dpr);
  const camY = Math.round(((hy + 0.5) * T - h * 0.46 + sy) * dpr);
  const ts = getTileset(R.loc, T, dpr);
  const CT = { mur: customTile(R.loc, "mur"), sol: customTile(R.loc, "sol"), couloir: customTile(R.loc, "couloir"), escalier: customTile(R.loc, "escalier"), glace: mediaImg("tile.glace"), dalle: mediaImg("tile.dalle"), pics: mediaImg("tile.piege.pics"), tp: mediaImg("tile.piege.tp") };
  ensureMasks();
  const x0 = Math.floor(camX / P) - 1, y0 = Math.floor(camY / P) - 1;
  const x1 = x0 + Math.ceil(DG.cv.width / P) + 2, y1 = y0 + Math.ceil(DG.cv.height / P) + 2;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!inb(x, y)) continue;
    const t = R.grid[I(x, y)];
    let ti;
    if (t === "#") ti = 16 + DG.masks[I(x, y)];
    else if (t === ",") ti = 4; else if (t === "i") ti = 5; else if (t === "e") ti = 6;
    else ti = ((Math.imul(x, 7349) ^ Math.imul(y, 9157)) >>> 3) & 3;
    const cimg = ti >= 16 ? CT.mur : ti === 4 ? (CT.couloir || CT.sol) : ti === 5 ? CT.glace : ti === 6 ? CT.dalle : ti < 4 ? CT.sol : null;
    if (cimg) { ctx.drawImage(cimg, x * P - camX, y * P - camY, P, P); continue; }
    const [tx, ty] = ts.at(ti);
    ctx.drawImage(ts.cv, tx, ty, P, P, x * P - camX, y * P - camY, P, P);
  }
  if (R.stairs && (R.explored[I(R.stairs.x, R.stairs.y)] || R.revealed)) { if (CT.escalier) ctx.drawImage(CT.escalier, R.stairs.x * P - camX, R.stairs.y * P - camY, P, P); else { const [tx, ty] = ts.at(7); ctx.drawImage(ts.cv, tx, ty, P, P, R.stairs.x * P - camX, R.stairs.y * P - camY, P, P); } }
  for (const tr of R.traps) if (tr.seen) { const ci = tr.kind === "spike" ? CT.pics : CT.tp; if (ci) ctx.drawImage(ci, tr.x * P - camX, tr.y * P - camY, P, P); else { const [tx, ty] = ts.at(tr.kind === "spike" ? 8 : 9); ctx.drawImage(ts.cv, tx, ty, P, P, tr.x * P - camX, tr.y * P - camY, P, P); } }
  // monde en px CSS
  ctx.setTransform(dpr, 0, 0, dpr, -camX, -camY);
  for (const it of R.items) if (R.explored[I(it.x, it.y)] || R.revealed) {
    ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.beginPath(); ctx.ellipse((it.x + 0.5) * T, (it.y + 0.78) * T, T * 0.18, T * 0.06, 0, 0, 7); ctx.fill();
    drawItem(ctx, it.id, (it.x + 0.5) * T, (it.y + 0.52) * T, T, now + it.x * 100);
  }
  if (th.electric) {
    for (let y = Math.max(0, Math.floor(y0)); y <= y1; y++) for (let x = Math.max(0, x0); x <= x1; x++) {
      if (!inb(x, y) || R.grid[I(x, y)] !== "e" || !isVisible(x, y)) continue;
      if (((now / 120 + x * 3 + y * 5) | 0) % 7 === 0) {
        ctx.strokeStyle = "rgba(255,240,140,0.9)"; ctx.lineWidth = 1.5; ctx.beginPath();
        ctx.moveTo((x + 0.2) * T, (y + 0.3) * T); ctx.lineTo((x + 0.5) * T, (y + 0.55) * T); ctx.lineTo((x + 0.4) * T, (y + 0.65) * T); ctx.lineTo((x + 0.8) * T, (y + 0.8) * T); ctx.stroke();
      }
    }
  }
  // entités
  const list = [];
  for (const u of activeTeam()) list.push({ u });
  for (const e of R.enemies) list.push({ u: e });
  GHOSTS = GHOSTS.filter(g => !g.fade || now - g.fade < 480);
  for (const g of GHOSTS) list.push({ u: g.u, ghost: g });
  for (const o of list) { const p = visPos(o.u, now); o.vx = p[0]; o.vy = p[1]; }
  list.sort((a, b) => a.vy - b.vy);
  for (const o of list) {
    const u = o.u;
    if (u.kind === "enemy" && !isVisible(Math.round(o.vx), Math.round(o.vy)) && !isVisible(u.x, u.y)) continue;
    const v = vis(u);
    let ox = 0, oy = 0, anim = null;
    if (v.atk) {
      const k = (now - v.atk.t0) / 230;
      if (k >= 1) v.atk = null; else { const a = Math.sin(k * Math.PI) * T * 0.34; ox += v.atk.dir[0] * a; oy += v.atk.dir[1] * a; anim = "Attack"; }
    }
    let flash = 0;
    if (v.hurt && now - v.hurt < 340) { const k = (now - v.hurt) / 340; flash = (Math.floor(k * 8) % 2 === 0) ? 0.85 : 0.1; ox += Math.sin(k * 40) * T * 0.05; anim = anim || "Hurt"; }
    let alpha = 1;
    if (o.ghost) { alpha = o.ghost.fade ? clamp(1 - (now - o.ghost.fade) / 480, 0, 1) : 1; oy -= o.ghost.fade ? (now - o.ghost.fade) / 480 * T * 0.2 : 0; }
    const fx = (o.vx + 0.5) * T + ox, fy = (o.vy + 0.84) * T + oy;
    const sc = u.boss ? 1.45 : 1;
    if (u.kind !== "enemy" && !o.ghost) {
      ctx.strokeStyle = u.kind === "hero" ? "rgba(255,179,71,0.9)" : u.kind === "ally" ? "rgba(140,240,170,0.85)" : "rgba(122,220,255,0.85)";
      ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(fx, fy - T * 0.04, T * 0.34, T * 0.12, 0, 0, 7); ctx.stroke();
    } else {
      drawShadow(ctx, fx, fy, T, sc);
      if (u.fac && !o.ghost) { const tm = tourTeam(u.fac); ctx.strokeStyle = (tm && tm.col) || "#ff6f61"; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.ellipse(fx, fy - T * 0.04, T * 0.34, T * 0.12, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    }
    drawCreature(ctx, u.mid, fx, fy, T, { t: now + (hashStr(u.uid) % 1000), dir: u.dir, moving: isMoving(u, now), flash, alpha, sleep: (u.st.sleep > 0) || (u.dormant && false), scale: sc, anim, shadow: u.shadow });
    if (u.st.frozen > 0) { ctx.fillStyle = "rgba(170,230,255,0.45)"; ctx.fillRect(fx - T * 0.36 * sc, fy - T * 0.78 * sc, T * 0.72 * sc, T * 0.74 * sc); }
    const badges = [];
    if (u.st.para > 0) badges.push(["⚡", "#ffd23f"]);
    if (u.st.burn > 0) badges.push(["♨", "#ff8a4a"]);
    if (u.st.slow > 0) badges.push(["≈", "#9fd0ff"]);
    if ((u.st.acc || 0) > 0) badges.push(["?", "#c7b8ff"]);
    if (badges.length && alpha > 0.5) {
      ctx.font = `700 ${Math.round(T * 0.26)}px "Pixelify Sans", monospace`; ctx.textAlign = "center";
      badges.forEach((b, i) => { ctx.fillStyle = b[1]; ctx.fillText(b[0], fx - T * 0.3 + i * T * 0.24, fy - T * 0.86 * sc); });
      ctx.textAlign = "left";
    }
    if (u.kind === "enemy" && !o.ghost && u.hp < maxHP(u)) {
      const bw = T * 0.66 * sc, bx = fx - bw / 2, by = fy - T * 0.98 * sc;
      ctx.fillStyle = "rgba(10,14,20,0.75)"; ctx.fillRect(bx - 1, by - 1, bw + 2, 6);
      const r = clamp(u.hp / maxHP(u), 0, 1);
      ctx.fillStyle = r > 0.5 ? "#7ce38a" : r > 0.25 ? "#ffcf3d" : "#ff6f61"; ctx.fillRect(bx, by, bw * r, 4);
    }
  }
  // effets
  for (let i = FX.length - 1; i >= 0; i--) {
    const f = FX[i]; const k = (now - f.t0) / f.dur;
    if (k < 0) continue;
    if (k >= 1) { FX.splice(i, 1); continue; }
    if (f.k === "pop") {
      ctx.save(); ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      ctx.font = `700 ${Math.round(T * (f.big ? 0.42 : 0.34))}px "Pixelify Sans", monospace`; ctx.textAlign = "center";
      const x = (f.x + 0.5) * T, y = (f.y + 0.1) * T - k * T * 0.55;
      ctx.lineWidth = 3; ctx.strokeStyle = "rgba(8,12,18,0.85)"; ctx.strokeText(f.text, x, y);
      ctx.fillStyle = f.col; ctx.fillText(f.text, x, y); ctx.restore();
    } else if (f.k === "proj") {
      const x = (f.fx + (f.tx - f.fx) * k + 0.5) * T, y = (f.fy + (f.ty - f.fy) * k + 0.45) * T;
      if (f.item) drawItem(ctx, f.item, x, y, T * 0.9, 0);
      else { ctx.fillStyle = f.col; ctx.shadowColor = f.col; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x, y, T * 0.13, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
    } else if (f.k === "burst") {
      const x = (f.x + 0.5) * T, y = (f.y + 0.45) * T;
      ctx.strokeStyle = f.col; ctx.globalAlpha = 1 - k; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y, T * (0.15 + k * 0.45), 0, 7); ctx.stroke();
      for (let j = 0; j < 6; j++) { const a = j * 1.047 + f.t0; ctx.fillStyle = f.col; ctx.fillRect(x + Math.cos(a) * T * k * 0.6 - 2, y + Math.sin(a) * T * k * 0.6 - 2, 4, 4); }
      ctx.globalAlpha = 1;
    } else if (f.k === "wave") {
      const x = (f.x + 0.5) * T, y = (f.y + 0.5) * T;
      ctx.strokeStyle = f.col; ctx.globalAlpha = (1 - k) * 0.8; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(x, y, T * (0.4 + k * 4), T * (0.2 + k * 2.4), 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
  // obscurité
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "rgba(4,7,11,0.52)"; ctx.beginPath();
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inb(x, y) && !isVisible(x, y) && R.explored[I(x, y)]) ctx.rect(x * P - camX, y * P - camY, P, P);
  ctx.fill();
  ctx.fillStyle = "rgba(4,7,11,0.88)"; ctx.beginPath();
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!inb(x, y) || (!isVisible(x, y) && !R.explored[I(x, y)])) ctx.rect(x * P - camX, y * P - camY, P, P);
  ctx.fill();
  // ambiances
  const pxh = ((hx + 0.5) * T) * dpr - camX, pyh = ((hy + 0.5) * T) * dpr - camY;
  if (th.fog && !R.boss) {
    const rg = ctx.createRadialGradient(pxh, pyh, P * 1.8, pxh, pyh, P * 4.4);
    rg.addColorStop(0, "rgba(200,225,215,0)"); rg.addColorStop(1, "rgba(150,180,170,0.3)");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, DG.cv.width, DG.cv.height);
    for (let k = 0; k < 4; k++) {
      const xx = ((now / (40 + k * 17) + k * 300) % (DG.cv.width + 600)) - 300, yy = DG.cv.height * (0.2 + k * 0.2);
      ctx.fillStyle = "rgba(210,235,225,0.045)"; ctx.beginPath(); ctx.ellipse(xx, yy, 260 * dpr, 50 * dpr, 0, 0, 7); ctx.fill();
    }
  }
  if (th.ice) {
    if (!DG.snow) { DG.snow = []; for (let i = 0; i < 50; i++) DG.snow.push([Math.random(), Math.random(), 0.5 + Math.random()]); }
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    for (const s of DG.snow) {
      const x = ((s[0] + now / 9000 * s[2] * 1.6) % 1) * DG.cv.width, y = ((s[1] + now / 6000 * s[2]) % 1) * DG.cv.height;
      ctx.fillRect(x, y, 2 * dpr * s[2], 2 * dpr * s[2]);
    }
  }
  if (R.boss) {
    const rg = ctx.createRadialGradient(DG.cv.width / 2, DG.cv.height / 2, DG.cv.height * 0.3, DG.cv.width / 2, DG.cv.height / 2, DG.cv.height * 0.8);
    rg.addColorStop(0, "rgba(40,0,40,0)"); rg.addColorStop(1, "rgba(40,0,50,0.35)");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, DG.cv.width, DG.cv.height);
  }
}
function renderMini(now) {
  const cv = $("#miniCanvas");
  if (!R) { cv.hidden = true; return; }
  cv.hidden = false;
  const scale = Math.max(2, Math.floor(Math.min(150 / R.w, 110 / R.h)));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = R.w * scale, H = R.h * scale;
  if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px"; }
  const c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
  c.fillStyle = "rgba(191,233,228,0.38)";
  for (let y = 0; y < R.h; y++) for (let x = 0; x < R.w; x++) if (R.explored[I(x, y)] && R.grid[I(x, y)] !== "#") c.fillRect(x * scale, y * scale, scale, scale);
  if (R.stairs && (R.explored[I(R.stairs.x, R.stairs.y)] || R.revealed)) { c.fillStyle = "#ffb347"; c.fillRect(R.stairs.x * scale - 1, R.stairs.y * scale - 1, scale + 2, scale + 2); }
  c.fillStyle = "#7ce3ff";
  for (const it of R.items) if (R.explored[I(it.x, it.y)] || R.revealed) c.fillRect(it.x * scale + scale * 0.25, it.y * scale + scale * 0.25, scale * 0.5 + 1, scale * 0.5 + 1);
  for (const e of R.enemies) if (isVisible(e.x, e.y)) { const tm = e.fac ? tourTeam(e.fac) : null; c.fillStyle = tm ? tm.col : "#ff6f61"; c.fillRect(e.x * scale, e.y * scale, scale, scale); }
  for (const p of teamAllies()) { c.fillStyle = p.kind === "ally" ? "#8cf0aa" : "#7adcff"; c.fillRect(p.x * scale, p.y * scale, scale, scale); }
  const hh = hero(); const blink = Math.floor(now / 300) % 2;
  c.fillStyle = blink ? "#ffffff" : "#ffb347"; c.fillRect(hh.x * scale - 1, hh.y * scale - 1, scale + 2, scale + 2);
}
function setTxt(key, node, v) { if (DG.hud[key] !== v) { DG.hud[key] = v; node.textContent = v; } }
function setW(key, node, v) { if (DG.hud[key] !== v) { DG.hud[key] = v; node.style.width = v; } }
function updateHud(dt) {
  if (!R) return;
  const loc = locById(R.loc);
  setTxt("loc", $("#hudLoc"), loc.name);
  setTxt("floor", $("#hudFloor"), R.arena ? "Arène" : R.boss ? (R.loc === "TOURNOI" ? "Finale" : R.siege ? "Siège" : "Gardien") : "É" + R.floor + "/" + (R.loc === "TOURNOI" ? 7 : R.floors));
  $("#huRecruit").hidden = !G.team[2];
  setTxt("bagn", $("#btnBag b"), G.bag.length + "/" + BAG_MAX);
  const tt = typeof tourHudText === "function" ? tourHudText() : null;
  const tb = $("#hudTour"); tb.hidden = !tt;
  if (tt) { const key = JSON.stringify(tt); if (DG.hud.tour !== key) { DG.hud.tour = key; tb.replaceChildren(...tt.map(t => { const c = el("span", "tt" + (t.here ? " here" : "") + (t.st === "✗" || t.st === "Fuite" ? " out" : "")); c.style.setProperty("--tc", t.col); c.append(el("i"), document.createTextNode(t.name + " "), el("b", "pix", t.st)); return c; })); } }
  for (const [u, id] of [[hero(), "#huHero"], [partner(), "#huPartner"], [G.team[2], "#huRecruit"]]) {
    if (!u) continue;
    const box = $(id); const mx = maxHP(u);
    const d = DG.dispHP[u.uid] == null ? u.hp : DG.dispHP[u.uid];
    const nd = Math.abs(d - u.hp) < 0.6 ? u.hp : d + (u.hp - d) * Math.min(1, dt / 120);
    DG.dispHP[u.uid] = nd;
    const hp = Math.max(0, Math.round(nd));
    setTxt(id + "n", $(".hu-name", box), unitName(u));
    setTxt(id + "l", $(".hu-lv", box), "Nv" + u.lv);
    setTxt(id + "h", $(".hu-hp", box), u.ko ? "K.O." : hp + "/" + mx);
    setW(id + "w", $(".hpbar i", box), clamp(hp / mx * 100, 0, 100) + "%");
    box.classList.toggle("low", hp / mx < 0.25);
    box.classList.toggle("ko", !!u.ko);
  }
  setTxt("belly", $("#huBelly b"), String(R.belly));
  $("#huBelly").classList.toggle("low", R.belly <= 20);
  $("#btnStairs").hidden = !(heroOnStairs() && !TL.busy() && !DG.transition);
}
function renderLog() {
  const lg = $("#log"); if (!lg) return;
  const now = performance.now();
  const recent = LOGBUF.slice(-3);
  lg.replaceChildren();
  for (const m of recent) {
    const line = el("div", "log-line" + (now - m.t > 5000 ? " old" : ""));
    for (const p of m.parts) {
      if (typeof p === "string") line.append(document.createTextNode(p));
      else line.append(el("span", "c-" + p.c, p.t));
    }
    lg.append(line);
  }
  lg.hidden = !recent.length;
}
let onLog = () => { renderLog(); };
function openLog() {
  const body = el("div", "log-full");
  for (const m of LOGBUF.slice().reverse()) {
    const line = el("div", "log-line");
    for (const p of m.parts) { if (typeof p === "string") line.append(document.createTextNode(p)); else line.append(el("span", "c-" + p.c, p.t)); }
    body.append(line);
  }
  if (!LOGBUF.length) body.append(el("p", "empty", "Rien pour l’instant."));
  openSheet({ title: "Journal", body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}

function blocked() { return !R || TL.busy() || SHEET_OPEN || DIALOG_OPEN || WHEEL.open || DG.transition || DG.running || !!DG.pending || !!R.heroSkip; }
function dungeonAct(fn) {
  if (blocked()) return false;
  DG.path = null;
  const used = fn();
  if (used) endTurn();
  return used;
}
onTurnEnd = () => {
  const sf = (R.story && !R.gameOver && typeof storyTurnHook === "function") ? storyTurnHook() : null;
  if (R.gameOver) DG.pending = seqGameOver;
  else if (sf) DG.pending = sf;
  else if (R.recruitOffer) DG.pending = seqRecruitOffer;
  else if (R.tourAllOut === true && !R.boss) { R.tourAllOut = "done"; DG.pending = seqTourFinal; }
  else if (R.bossDefeated) DG.pending = seqCleared;
  else if (R.escaped) DG.pending = seqEscape;
  else if (heroOnStairs() && !DG.stairsAsked) { DG.stairsAsked = true; DG.pending = askStairs; }
  if (!heroOnStairs()) DG.stairsAsked = false;
  if (performance.now() - DG.lastSave > 20000) { DG.lastSave = performance.now(); Store.saveGame(G); }
};
function askStairs() {
  if (R.tour && !R.tour.arena && R.floor >= 7) {
    const n = R.tour.teams.filter(t => t.state === "in").length;
    if (n > 0) { openSheet({ title: "Portail de l’arène", body: el("p", "sheet-text", fillTpl(TOUR_ANNOUNCES.sealed.replace("{n}", n))), actions: [{ label: "Compris", cls: "primary" }] }); return; }
  }
  if (R.tour && !R.tour.arena) {
    openSheet({ title: "Escalier", body: el("p", "sheet-text", "Un escalier descend vers l’étage " + (R.floor + 1) + " du tournoi."), actions: [{ label: "Rester ici", cls: "ghost" }, { label: "Descendre", cls: "primary", fn: goDown }] });
    return;
  }
  openSheet({
    title: "Escalier", body: el("p", "sheet-text", R.floor + 1 >= R.floors ? "L’escalier descend vers l’antre du gardien. Tu te sens prêt ?" : "Un escalier descend vers l’étage suivant."), actions: [
      { label: "Rester ici", cls: "ghost" },
      { label: "Descendre", cls: "primary", fn: goDown }
    ]
  });
}
async function floorCard(text1, text2) {
  const fc = $("#floorCard");
  $("#fcLoc").textContent = text1; $("#fcFloor").textContent = text2;
  fc.hidden = false; fc.classList.remove("out");
  await wait(1100);
  fc.classList.add("out");
  await wait(380);
  fc.hidden = true;
}
const wait = ms => new Promise(r => setTimeout(r, ms));
async function goDown() {
  if (DG.transition) return;
  DG.transition = true; DG.path = null; DG.held = null;
  sfx("stairs");
  const loc = locById(R.loc);
  const fc = $("#floorCard"); fc.hidden = false; fc.classList.remove("out");
  $("#fcLoc").textContent = loc.name; $("#fcFloor").textContent = R.floor + 1 >= R.floors ? (R.loc === "TOURNOI" ? "Arène finale" : loc.tower ? "Étage 100 · Le sommet" : loc.siege ? "Cœur du glacier" : "Antre du gardien") : "Étage " + (R.floor + 1) + (loc.tower ? " / 100" : "");
  await wait(250);
  nextFloor();
  DG.maskGrid = null; DG.snow = null; DG.stairsAsked = false;
  Store.saveGame(G);
  await wait(900);
  fc.classList.add("out"); await wait(380); fc.hidden = true;
  DG.transition = false;
  if (R.story && typeof storyOnFloor === "function") await storyOnFloor();
  if (R.boss && !R.siege && R.enemies.some(e => e.boss && e.dormant)) { setMusic("bgm.boss"); await bossIntro(); }
}
async function bossIntro() {
  const b = R.enemies.find(e => e.boss);
  if (!b) return;
  DG.transition = true;
  const sl = R.story && typeof storyBossLines === "function" ? storyBossLines() : null;
  await runDialog(sl || (R.loc === "TOURNOI" ? CH2.finalIntro : R.crew ? CH1.bossIntro : STORY.bossIntro), { bossMid: b.mid, bossName: b.nick || null });
  for (const e of R.enemies) { e.dormant = false; e.aware = true; }
  DG.transition = false;
}
async function enterDungeon(locId, startFloor) {
  MAPSEL = null;
  startRun(locId, startFloor);
  Store.saveGame(G);
  showScreen("dungeon");
  DG.transition = true; DG.pending = null; DG.path = null; DG.maskGrid = null; DG.snow = null; DG.dispHP = {}; DG.hud = {}; DG.stairsAsked = false;
  renderLog();
  const loc = locById(locId);
  await floorCard(loc.name, R.boss && loc.tower ? "Étage 100 · Le sommet" : "Étage " + R.floor + (loc.tower ? " / 100" : ""));
  DG.transition = false;
  setMusic(locId === "ARENE" ? "bgm.boss" : "bgm.donjon." + locId);
  msgNow("Tu entres dans ", { t: loc.name, c: "mv" }, ".");
  if (R.arena) { DG.transition = true; await runDialog([{ who: "presenter", text: "Match d’arène ! L’équipe de {name} contre " + R.tour.teams.map(t => t.name).join(", ") + " ! Que le meilleur gagne !" }]); DG.transition = false; }
  else if (R.tour) msgNow({ t: "Trois équipes rôdent dans le donjon. Élimine-les toutes !", c: "good" });
  if (!OPTS.hintSeen) showHint();
  if (locId === "L00" && !G.story.ch1Done && CH1.floor1 && !G.story.floor1Seen) { G.story.floor1Seen = true; DG.transition = true; await runDialog(CH1.floor1); DG.transition = false; }
  if (R.story && typeof storyOnFloor === "function") { await storyOnFloor(); if (R && R.boss && !R.siege && R.enemies.some(e => e.boss && e.dormant)) { setMusic("bgm.boss"); await bossIntro(); } }
}
// Toutes les équipes ont quitté le donjon : téléportation vers l'arène finale
async function seqTourFinal() {
  DG.transition = true;
  await wait(500);
  await runDialog(CH2.allOut);
  R.floor = R.floors - 1;
  DG.transition = false;
  await goDown();
}
function showHint() {
  const hn = $("#hint"); hn.hidden = false;
  const close = () => { hn.hidden = true; OPTS.hintSeen = true; saveOpts(); };
  hn.onclick = close; setTimeout(close, 9000);
}
function resumeDungeon() {
  restoreRun();
  showScreen("dungeon");
  DG.transition = false; DG.pending = null; DG.path = null; DG.maskGrid = null; DG.snow = null; DG.dispHP = {}; DG.hud = {}; DG.stairsAsked = heroOnStairs();
  msgNow("Exploration reprise : ", { t: locById(R.loc).name, c: "mv" }, ".");
  setMusic(R.boss ? "bgm.boss" : "bgm.donjon." + R.loc);
  if (R.boss && R.enemies.some(e => e.dormant)) bossIntro();
}
// Défaite : on recommence le donjon depuis le début
async function seqGameOver() {
  DG.transition = true;
  await wait(700);
  const locId = R.loc, bag = R.bagStart || [], money = R.moneyStart || 0, lostBy = R.lostBy, wasStory = !!R.story, wasReplay = !!R.replay;
  endRun();
  G.bag = bag.slice(); G.money = money;
  Store.saveGame(G);
  DG.transition = false; DG.pending = null;
  openSheet({
    title: "K.O. !", body: el("p", "sheet-text", (lostBy === "partner" ? fillTpl("{partner} est tombé K.O. : sans ton partenaire, l’exploration s’arrête. ") : "") + (locId === "TOURNOI" ? "L’équipe est éliminée du tournoi." : CH1.defeat)), noDismiss: true, actions: [
      { label: wasStory && locId === "S_TOUR" ? "Reprendre au relais (étage " + ((G.story.c5 && G.story.c5.ck) || 1) + ")" : "Recommencer", cls: "primary", fn: async () => { if (wasStory) { startStoryMission(locId, locId === "S_TOUR" ? (G.story.c5 && G.story.c5.ck) || 1 : 1, { replay: wasReplay, arc: typeof arcOfMission === "function" ? arcOfMission(locId) : null }); return; } if (locId === "TOURNOI" && !G.story.ch2Done) { showScreen("scene"); sceneReset("arena"); await runDialog(CH2.retry); } enterDungeon(locId); } }
    ].concat(G.story.ch1Done && (G.story.step || "").startsWith("ch2") || G.story.ch2Done ? [{ label: "Retour au Royaume", cls: "ghost", fn: () => goRoyaume() }] : [])
  });
}
async function seqEscape() {
  DG.transition = true;
  await wait(400);
  const loc = locById(R.loc);
  endRun(); Store.saveGame(G);
  DG.transition = false; DG.pending = null;
  const toTown = SPECIAL_LOCS[loc.id] || (G.story.step || "").startsWith("ch2");
  openSheet({ title: "Évasion", body: el("p", "sheet-text", "L’équipe quitte " + loc.name + " avec tout le sac." + (loc.id === "TOURNOI" ? " Tu pourras retenter le tournoi à l’Arène." : "")), actions: [{ label: toTown ? "Retour au Royaume" : "Retour à la carte", cls: "primary", fn: toTown ? goRoyaume : goMap }], noDismiss: true });
}
async function seqCleared() {
  DG.transition = true;
  await wait(700);
  if (R.story && typeof storyCleared === "function") { DG.transition = false; await storyCleared(); return; }
  const loc = locById(R.loc);
  const money = R.money || 0, startLv = R.startLv;
  const called = G.team.find(u => u.oathFriend); if (called && typeof bondAdd === "function") bondAdd(called.oathFriend, 3);
  if (G.story.ch2Done && typeof bondAdd === "function") bondAdd("partner", 2);
  if (loc.crew && !G.story.ch1Done) {
    endRun();
    DG.transition = false; DG.pending = null;
    await playChapter1End();
    return;
  }
  if (loc.id === "TOURNOI" && !G.story.ch2Done) {
    endRun();
    DG.transition = false; DG.pending = null;
    await playChapter2End();
    return;
  }
  if (loc.id === "TOURNOI" || loc.id === "ARENE") {
    const prize = (loc.id === "TOURNOI" ? 300 : (120 + hero().lv * 5) * clamp(G.story.arenaN || 1, 1, 3)) * (loc.id === "ARENE" && G.story.arenaBoom ? 2 : 1);
    if (loc.id === "ARENE") await runDialog([{ who: "presenter", text: "Victoire de l’équipe de {name} ! La foule est en délire !" }]);
    endRun();
    G.money = (G.money || 0) + prize; G.shards = (G.shards || 0) + (loc.id === "TOURNOI" ? 5 : 1);
    Store.saveGame(G);
    DG.transition = false; DG.pending = null;
    openSheet({ title: loc.id === "TOURNOI" ? "Tournoi remporté !" : "Match gagné !", body: el("p", "sheet-text", "+" + prize + " pièces · " + money + " pièces ramassées"), actions: [{ label: "Retour au Royaume", cls: "primary", fn: goRoyaume }], noDismiss: true });
    return;
  }
  if (!R.bonusBoss && await freeModeEndRoll()) return;
  const first = !G.progress.cleared.includes(loc.id);
  if (first && !SPECIAL_LOCS[loc.id]) G.progress.cleared.push(loc.id);
  if (!loc.crew) await runDialog([{ who: "boss", text: "Merci… Je me sens beaucoup mieux." }, { who: "partner", text: "Bien joué, {name} ! On rentre ?" }], { bossMid: R.bossMid });
  else await runDialog([{ who: "chef", text: "Encore vous ?! Bon, bon… on s’en va !" }, { who: "partner", text: "Ils ne changeront jamais, ceux-là ! Bien joué, {name} !" }]);
  endRun();
  G.shards = (G.shards || 0) + 2;
  Store.saveGame(G);
  const body = el("div", "result");
  body.append(el("p", "sheet-text", loc.name + " : exploration terminée !"));
  body.append(el("p", "sheet-text dim", unitName(hero()) + " : niveau " + startLv + " → " + hero().lv + " · " + money + " pièces ramassées · +2 Éclats d’étoile"));
  DG.transition = false; DG.pending = null;
  const backTown = loc.id === "INCONNU" || (G.story.ch2Done && G.story.rmPos);
  openSheet({ title: "Exploration réussie !", body, actions: [{ label: backTown ? "Retour au Royaume" : "Continuer", cls: "primary", fn: () => backTown ? goRoyaume() : G.story.ch1Done ? goHub() : goMap() }], noDismiss: true });
}
// Menu du héros (appui long sur soi)
function openHeroMenu() {
  const h = hero();
  const body = el("div", "hero-menu");
  const mx = maxHP(h);
  const top = el("div", "bar-row"); top.append(el("span", "pix", "PV")); const hb = el("span", "hpbar"); const hi = el("i"); hi.style.width = clamp(h.hp / mx * 100, 0, 100) + "%"; hb.append(hi); top.append(hb, el("span", "pix", Math.max(0, h.hp) + "/" + mx));
  body.append(top);
  const mvs = el("div", "move-pick");
  const mk = (mv, ppTxt, disabled, fn) => {
    const b = el("button", "move-btn"); b.type = "button"; b.disabled = disabled;
    b.style.setProperty("--tc", TYPE_COLORS[mv.type] || "#999");
    const l1 = el("span", "mvb-top"); l1.append(el("b", null, mv.name), el("span", "pix", ppTxt));
    const bits = [mv.type, mv.power ? "Puiss. " + mv.power : "Statut", RANGE_LABELS[moveRange(mv)]];
    if (mv.effect && EFFECT_LABELS[mv.effect] && mv.effect !== "hit_all") bits.push(EFFECT_LABELS[mv.effect]);
    b.append(l1, el("small", null, bits.join(" · ")));
    b.onclick = () => { closeSheet(); fn(); };
    return b;
  };
  mvs.append(mk(BASIC_ATTACK, "∞", false, () => dungeonAct(() => heroAttack(null))));
  for (const id of unitMoves(h)) { const mv = ATK[id]; mvs.append(mk(mv, (h.pp[id] || 0) + "/" + mv.pp, (h.pp[id] || 0) <= 0, () => dungeonAct(() => heroAttack(id)))); }
  body.append(el("h4", "fld-h", "Capacités"), mvs);
  const grid = el("div", "pause-grid");
  const add = (label, fn, cls) => { const b = el("button", "btn small " + (cls || ""), label); b.type = "button"; b.onclick = () => { sfx("tap"); fn(); }; grid.append(b); };
  add("Sac (" + G.bag.length + "/" + BAG_MAX + ")", () => openBag(true));
  add("Équipe", openTeam);
  add("Attendre un tour", () => { closeSheet(); dungeonAct(() => true); });
  add("Journal", openLog);
  add(OPTS.sound ? "Son : activé" : "Son : coupé", () => { OPTS.sound = !OPTS.sound; saveOpts(); if (OPTS.sound) unlockAudio(); openHeroMenu(); });
  add("Abandonner", confirmGiveUp, "danger");
  body.append(el("h4", "fld-h", "Menu"), grid);
  openSheet({ title: unitName(h) + " · Niv. " + h.lv, body, actions: [{ label: "Fermer", cls: "ghost" }], tall: true });
}
function openPause() { openHeroMenu(); }
function openPartnerInfo(u) {
  const p = u || partner(); if (!p || p.ko) return;
  const body = el("div", "team-list"); body.append(unitCard(p));
  const acts = [{ label: "Fermer", cls: "ghost" }];
  const bi = G.bag.findIndex(x => x === "baie" || x === "baieor");
  if (bi >= 0 && p.hp < maxHP(p)) acts.unshift({ label: "Donner : " + ITEMS[G.bag[bi]].name, cls: "primary", fn: () => dungeonAct(() => useItem(bi, p)) });
  acts.splice(acts.length - 1, 0, { label: "Son sac (" + (p.bag || []).length + ")", fn: () => openAllyBag(p) });
  openSheet({ title: unitName(p) + (p.kind === "partner" ? " · ton partenaire" : " · coéquipier"), body, actions: acts, tall: true });
}
function openEnemyInfo(e) {
  const m = monById(e.mid);
  const body = el("div", "ucard");
  const top = el("div", "ucard-top"); const cv = el("canvas", "ucard-face"); top.append(cv);
  const info = el("div", "ucard-info");
  info.append(el("h4", null, unitName(e) + " · Niv. " + e.lv));
  if (e.teamName) info.append(el("p", "sheet-note", e.teamName));
  const ty = el("div", "types"); for (const t of m.types || []) ty.append(typeChip(t)); info.append(ty);
  const mx = maxHP(e);
  const hp = el("div", "bar-row"); hp.append(el("span", "pix", "PV")); const hb = el("span", "hpbar"); const hi = el("i"); hi.style.width = clamp(e.hp / mx * 100, 0, 100) + "%"; hb.append(hi); hp.append(hb, el("span", "pix", Math.max(0, e.hp) + "/" + mx));
  info.append(hp); top.append(info); body.append(top, el("p", "sheet-text dim", m.description || ""));
  if (e.st.sleep > 0) body.append(el("p", "sheet-note", "Endormi."));
  requestAnimationFrame(() => paintPortrait(cv, e.mid, { still: true }));
  openSheet({ title: "Ennemi", body, actions: [{ label: "Fermer", cls: "ghost" }] });
}
const TILE_NAMES = {
  verdant: ["Arbres touffus", "Herbe fleurie"], forest: ["Arbres brumeux", "Herbe humide"], cave: ["Paroi rocheuse", "Terre battue"],
  ruins: ["Mur ancien", "Dalles anciennes"], glacier: ["Mur de glace", "Neige tassée"]
};
function describeTile(x, y) {
  if (!inb(x, y)) return null;
  if (!R.explored[I(x, y)] && !isVisible(x, y)) return { t: "Zone inconnue" };
  const it = R.items.find(i => i.x === x && i.y === y);
  if (it) return it.id === "or" ? { t: (it.amount || 0) + " pièces", d: "Marche dessus pour les ramasser." } : { t: ITEMS[it.id].name + (it.dropped ? " (posé)" : ""), d: ITEMS[it.id].desc + " Marche dessus pour le ramasser." };
  if (R.stairs && R.stairs.x === x && R.stairs.y === y) return { t: "Escalier", d: "Mène à l’étage suivant." };
  const tr = R.traps.find(t => t.seen && t.x === x && t.y === y);
  if (tr) return { t: tr.kind === "spike" ? "Piège à pics" : "Piège de téléportation" };
  const names = TILE_NAMES[themeOf(R.loc).key] || ["Mur", "Sol"];
  const t = tile(x, y);
  if (t === "#") return { t: names[0] };
  if (t === ",") return { t: "Sentier" };
  if (t === "i") return { t: "Glace glissante", d: "On glisse jusqu’au bout." };
  if (t === "e") return { t: "Dalle électrifiée", d: "Fait mal en marchant dessus." };
  return { t: names[1] };
}
function showTip(px, py, info) {
  const tp = $("#tip"); if (!info) return;
  tp.replaceChildren(el("b", null, info.t)); if (info.d) tp.append(el("small", null, info.d));
  tp.hidden = false;
  const r = DG.cv.getBoundingClientRect();
  tp.style.left = clamp(px - r.left, 70, r.width - 70) + "px"; tp.style.top = Math.max(60, py - r.top - 70) + "px";
  clearTimeout(tp._h); tp._h = setTimeout(() => { tp.hidden = true; }, 2600);
}
function confirmGiveUp() {
  openSheet({
    title: "Abandonner ?", body: el("p", "sheet-text", "Tu quittes le donjon et tu reviens à la carte. Le sac redevient comme à l’entrée."), actions: [
      { label: "Continuer l’exploration", cls: "ghost" },
      { label: "Abandonner", cls: "danger", fn: () => { const bag = R.bagStart || [], money = R.moneyStart || 0; endRun(); G.bag = bag.slice(); G.money = money; Store.saveGame(G); goMap(); } }
    ]
  });
}

// Contrôles du donjon
const DIR_BY_SECTOR = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
// Gestes : glisser = pad virtuel, toucher = attaquer / aller, appui long = infos et menus
const GS = { id: null, x0: 0, y0: 0, moved: false, long: false, timer: 0 };
function screenTile(cx, cy) {
  const r = DG.cv.getBoundingClientRect();
  const [hx, hy] = visPos(hero(), performance.now());
  const T = DG.T;
  const camX = (hx + 0.5) * T - DG.w / 2, camY = (hy + 0.5) * T - DG.h * 0.46;
  return [Math.floor((cx - r.left + camX) / T), Math.floor((cy - r.top + camY) / T)];
}
function setupGestures() {
  const cv = $("#dgCanvas"), stick = $("#stick"), knob = $("#stickKnob");
  const R0 = 46;
  cv.addEventListener("pointerdown", e => {
    unlockAudio();
    if (GS.id !== null) return;
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (_) { }
    Object.assign(GS, { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, long: false });
    clearTimeout(GS.timer);
    GS.timer = setTimeout(() => { if (!GS.moved && GS.id !== null) { GS.long = true; onLongPress(GS.x0, GS.y0); } }, 430);
  });
  cv.addEventListener("pointermove", e => {
    if (e.pointerId !== GS.id) return;
    if (WHEEL.open && WHEEL.drag) { wheelHover(e.clientX, e.clientY); return; }
    const dx = e.clientX - GS.x0, dy = e.clientY - GS.y0, d = Math.hypot(dx, dy);
    if (!GS.moved && !GS.long && d > 14) {
      GS.moved = true; clearTimeout(GS.timer); DG.path = null;
      const r = cv.getBoundingClientRect();
      stick.style.left = (GS.x0 - r.left) + "px"; stick.style.top = (GS.y0 - r.top) + "px"; stick.hidden = false;
    }
    if (!GS.moved) return;
    const k = Math.min(1, R0 / Math.max(d, 1));
    knob.style.transform = "translate(" + (dx * k) + "px," + (dy * k) + "px)";
    if (d < 14) { DG.held = null; return; }
    const sec = ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8;
    DG.held = DIR_BY_SECTOR[sec];
  });
  const end = e => {
    if (e.pointerId !== GS.id) return;
    clearTimeout(GS.timer);
    if (WHEEL.open && WHEEL.drag) { if (e.type === "pointerup") wheelRelease(); else closeWheel(); }
    else if (GS.moved) { DG.held = null; stick.hidden = true; knob.style.transform = ""; }
    else if (!GS.long && e.type === "pointerup") onTap(e.clientX, e.clientY);
    GS.id = null;
    try { cv.releasePointerCapture(e.pointerId); } catch (_) { }
  };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
}
function onLongPress(cx, cy) {
  if (!R || DG.transition || SHEET_OPEN || DIALOG_OPEN) return;
  if (navigator.vibrate) { try { navigator.vibrate(15); } catch (_) { } }
  const [tx, ty] = screenTile(cx, cy);
  const u = unitAt(tx, ty);
  if (u && u.kind === "hero") { openWheel(cx, cy, true); return; }
  if (u && isAllyKind(u)) { sfx("tap"); openPartnerInfo(u); return; }
  if (u && u.kind === "enemy" && unitVisible(u)) { sfx("tap"); openEnemyInfo(u); return; }
  showTip(cx, cy, describeTile(tx, ty));
}
function lineMoveToward(h, t) {
  for (const id of unitMoves(h)) {
    const mv = ATK[id];
    if ((h.pp[id] || 0) <= 0 || moveRange(mv) !== "line" || !(mv.power > 0)) continue;
    for (const d of DIRS8) { const ts = targetsFor(h, mv, d); if (ts[0] === t) return [mv, d]; }
  }
  return null;
}
function onTap(cx, cy) {
  if (!R || blocked()) return;
  const [tx, ty] = screenTile(cx, cy);
  const h = hero();
  if (tx === h.x && ty === h.y) {
    // double tape sur soi = attaque de base ; simple tape = ramasser / aide
    const now = performance.now();
    if (DG.selfTap && now - DG.selfTap < 320) { clearTimeout(DG.selfTapT); DG.selfTap = 0; dungeonAct(() => heroAttack(null)); return; }
    DG.selfTap = now;
    clearTimeout(DG.selfTapT);
    DG.selfTapT = setTimeout(() => { DG.selfTap = 0; if (blocked()) return; if (itemUnderHero()) dungeonAct(() => pickUpHere()); else toast("Double-tape sur toi : attaque · Maintiens : roue d’actions", 1800); }, 330);
    return;
  }
  const dx = tx - h.x, dy = ty - h.y;
  const u = unitAt(tx, ty);
  if (u && u.kind === "enemy" && unitVisible(u)) {
    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) { dungeonAct(() => { if (!diagOK(h.x, h.y, [dx, dy])) return false; doAttack(h, BASIC_ATTACK, [dx, dy]); return true; }); return; }
    const lm = lineMoveToward(h, u);
    if (lm) { dungeonAct(() => { doAttack(h, lm[0], lm[1]); return true; }); return; }
  }
  if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) { dungeonAct(() => heroMove([dx, dy])); return; }
  if (!inb(tx, ty) || isWall(tx, ty) || !(R.explored[I(tx, ty)] || isVisible(tx, ty))) return;
  DG.path = { x: tx, y: ty, seen: R.enemies.filter(en => isVisible(en.x, en.y)).length };
}
function heroAutoStep() {
  const h = hero(); const p = DG.path;
  if (h.x === p.x && h.y === p.y) { DG.path = null; return; }
  const seen = R.enemies.filter(en => isVisible(en.x, en.y)).length;
  if (seen > p.seen || adjacentFoes(h).length) { DG.path = null; msgNow("Un ennemi est en vue !"); return; }
  const d = stepToward(h, p.x, p.y, { maxD: 60, ignoreAllies: true, avoidTraps: true });
  if (!d) { DG.path = null; return; }
  const used = heroMove(d);
  if (!used) { DG.path = null; return; }
  endTurn();
  if (R && heroOnStairs()) DG.path = null;
}
const KEYMAP = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  z: [0, -1], s: [0, 1], q: [-1, 0], d: [1, 0], w: [0, -1], a: [-1, 0],
  Home: [-1, -1], PageUp: [1, -1], End: [-1, 1], PageDown: [1, 1],
  "7": [-1, -1], "8": [0, -1], "9": [1, -1], "4": [-1, 0], "6": [1, 0], "1": [-1, 1], "2": [0, 1], "3": [1, 1]
};
const KEYS_DOWN = new Set();
function onKey(e, down) {
  if (SCREEN !== "dungeon") return;
  if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (KEYMAP[k]) { e.preventDefault(); down ? KEYS_DOWN.add(k) : KEYS_DOWN.delete(k); return; }
  if (!down) return;
  if (WHEEL.open) { if (k === "Escape") closeWheel(); return; }
  if (SHEET_OPEN) { if (k === "Escape") closeSheet(); return; }
  if (DIALOG_OPEN) return;
  if (k === " " || k === "Enter") { e.preventDefault(); dungeonAct(() => heroAttack(null)); }
  else if (k === "m" || k === "c") openHeroMenu();
  else if (k === "e" || k === "r") { const r = DG.cv.getBoundingClientRect(); openWheel(r.left + DG.w / 2, r.top + DG.h * 0.46, false); }
  else if (k === "g" || k === ",") dungeonAct(() => pickUpHere());
  else if (k === "i" || k === "b") openBag(true);
  else if (k === "t" || k === ".") dungeonAct(() => true);
  else if (k === "Escape") openHeroMenu();
  else if (k === ">" || k === "<") { if (heroOnStairs()) askStairs(); }
}
function keyDir() {
  if (!KEYS_DOWN.size) return null;
  let dx = 0, dy = 0;
  for (const k of KEYS_DOWN) { dx += KEYMAP[k][0]; dy += KEYMAP[k][1]; }
  dx = sgn(dx); dy = sgn(dy);
  return dx || dy ? [dx, dy] : null;
}
function dungeonTick(now, dt) {
  if (!R) return;
  TL.update();
  if (DG.pending && !DG.running && !TL.busy() && !SHEET_OPEN && !DIALOG_OPEN) {
    const f = DG.pending; DG.pending = null;
    if (f === askStairs) f();
    else { DG.running = true; Promise.resolve().then(f).catch(e => console.error(e)).finally(() => { DG.running = false; }); }
  }
  if (R.heroSkip && !TL.busy() && !SHEET_OPEN && !DIALOG_OPEN && !DG.transition && !DG.running && !DG.pending) { R.heroSkip = false; endTurn(); }
  else if (!blocked()) {
    {
      const d = DG.held || keyDir();
      if (d) { DG.path = null; const used = heroMove(d); if (used) endTurn(); }
      else if (DG.path) heroAutoStep();
    }
  }
  renderDungeon(now);
  updateHud(dt);
  if (!DG._lm || now - DG._lm > 120) { DG._lm = now; renderMini(now); }
  if (!DG._ll || now - DG._ll > 1000) { DG._ll = now; renderLog(); }
}

function resizeAll() {
  if (SCREEN === "dungeon") layoutDungeon();
  if (SCREEN === "map") renderMap();
  if (SCREEN === "royaume") layoutTown();
}
