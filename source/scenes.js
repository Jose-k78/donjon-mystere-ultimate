// ============================================================
//  SCÈNES : lancement, voix, chapitre 1 (mise en scène sur canvas)
// ============================================================
const SC = { bg: "black", actors: {}, props: {}, t0: 0, shakeT0: 0, wind: 0 };
function sceneReset(bg) { SC.bg = bg; SC.actors = {}; SC.props = {}; SC.t0 = performance.now(); SC.wind = 0; }
function actor(key, mid, x, y, opt) {
  SC.actors[key] = Object.assign({ mid, x, y, dir: [0, 1], sc: 1, alpha: 1, tw: null, hopT0: 0 }, opt || {});
  return SC.actors[key];
}
function moveA(key, x, y, ms) {
  const a = SC.actors[key]; if (!a) return wait(0);
  a.tw = { fx: a.x, fy: a.y, tx: x, ty: y == null ? a.y : y, t0: performance.now(), dur: ms };
  if (x !== a.x) a.dir = [x > a.x ? 1 : -1, 0];
  return wait(ms);
}
function hop(key) { const a = SC.actors[key]; if (a) a.hopT0 = performance.now(); }
function sceneShake() { SC.shakeT0 = performance.now(); sfx("quake"); }
async function flashWhite(inMs, holdMs, outMs, mid) {
  const f = $("#flash");
  f.hidden = false; f.style.transition = "opacity " + inMs + "ms ease-in"; f.style.opacity = "0";
  await wait(20); f.style.opacity = "1"; sfx("level");
  await wait(inMs + (holdMs || 0));
  if (mid) await mid();
  f.style.transition = "opacity " + outMs + "ms ease-out"; f.style.opacity = "0";
  await wait(outMs); f.hidden = true;
}
async function blackCard(text, ms, sub) {
  const fc = $("#floorCard");
  $("#fcLoc").textContent = text; $("#fcFloor").textContent = sub || "";
  fc.hidden = false; fc.classList.remove("out");
  await wait(ms || 1800);
  fc.classList.add("out"); await wait(380); fc.hidden = true;
}

// ------------------------------------------------------------
//  DÉCORS
// ------------------------------------------------------------
function drawScene(now) {
  const cv = $("#sceneCanvas"); const { ctx, w, h, dpr } = fitCanvas(cv);
  let sx = 0, sy = 0;
  const sk = (now - SC.shakeT0) / 500; if (sk < 1) { sx = (Math.random() - 0.5) * 14 * (1 - sk); sy = (Math.random() - 0.5) * 10 * (1 - sk); }
  ctx.setTransform(dpr, 0, 0, dpr, sx * dpr, sy * dpr);
  const t = (now - SC.t0) / 1000;
  if (!customBg(ctx, "bg." + SC.bg, w, h)) switch (SC.bg) {
    case "psy": bgPsy(ctx, w, h, now); break;
    case "beachDay": bgBeach(ctx, w, h, now, "day"); break;
    case "beachSunset": bgBeach(ctx, w, h, now, "sunset"); break;
    case "beachRocks": bgBeach(ctx, w, h, now, "sunset", true); break;
    case "beachNight": bgBeach(ctx, w, h, now, "night"); break;
    case "entrance": bgEntrance(ctx, w, h, now); break;
    case "clearing": bgClearing(ctx, w, h, now); break;
    case "sky": bgSky(ctx, w, h, now); break;
    case "dark": bgDark(ctx, w, h, now); break;
    case "logo": bgLogo(ctx, w, h, now); break;
    default: if (EXTRA_BG[SC.bg]) EXTRA_BG[SC.bg](ctx, w, h, now); else { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h); }
  }
  // vent
  if (SC.wind && now - SC.wind < 2200) {
    const k = (now - SC.wind) / 2200;
    ctx.strokeStyle = "rgba(255,255,255," + (0.5 * (1 - k)) + ")"; ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) { const y = h * (0.2 + i * 0.08), x = ((k * 1.6 + i * 0.13) % 1.3) * w - w * 0.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 60, y - 10, x + 120, y); ctx.stroke(); }
  }
  // acteurs
  const S = Math.min(w * 0.24, h * 0.17, 140);
  const list = Object.entries(SC.actors).filter(([, a]) => !a.hidden).sort((a, b) => a[1].y - b[1].y);
  for (const [, a] of list) {
    let x = a.x, y = a.y, moving = false;
    if (a.tw) {
      const p = clamp((now - a.tw.t0) / a.tw.dur, 0, 1);
      x = a.x = a.tw.fx + (a.tw.tx - a.tw.fx) * p; y = a.y = a.tw.fy + (a.tw.ty - a.tw.fy) * p;
      moving = p < 1; if (p >= 1) a.tw = null;
    }
    let hy = 0; const hk = (now - a.hopT0) / 380; if (hk < 1) hy = -Math.sin(hk * Math.PI) * S * 0.25;
    const s = S * a.sc * (0.75 + y * 0.35);
    ctx.save(); ctx.globalAlpha = a.alpha;
    if (a.shadowFigure) drawShadowFigure(ctx, x * w, y * h, s * 2.2, now);
    else { drawShadow(ctx, x * w, y * h, s); drawCreature(ctx, a.mid, x * w, y * h + hy, s, { t: now + (hashStr(a.mid || "s") % 900), dir: a.dir, moving, sleep: a.sleep, still: a.sleep }); }
    ctx.restore();
    if (a.crown) drawCrown(ctx, x * w, y * h - s * 0.84 + hy, s * 0.3);
    if (a.badge) { const r = s * 0.13, bx = x * w, by = y * h - s * 0.92 + hy; ctx.fillStyle = a.badge.col; ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = `700 ${Math.round(r * 1.2)}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(a.badge.icon, bx, by + 1); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; }
    if (a.holding) drawProp(ctx, a.holding, x * w, y * h - s * 0.95 + hy, s * 0.5, now);
  }
  for (const k in SC.props) {
    const p = SC.props[k]; if (p.hidden) continue;
    if (p.kind === "letter" && p.fall) {
      const k2 = clamp((now - p.fall.t0) / p.fall.dur, 0, 1);
      p.x = p.fall.x0 + (p.fall.x1 - p.fall.x0) * k2 + Math.sin(k2 * 9) * 0.05 * (1 - k2);
      p.y = -0.08 + (p.fall.y1 + 0.08) * (1 - Math.pow(1 - k2, 1.4));
      p.rot = Math.sin(k2 * 11) * 0.6 * (1 - k2);
      if (k2 >= 1) p.fall = null;
    }
    drawProp(ctx, p, p.x * w, p.y * h, S * 0.42, now);
  }
}
function drawProp(ctx, p, x, y, s, now) {
  const cim = !MEDIA.noCustom && mediaImg(p.kind === "letter" ? "deco.lettre" : "deco.pendentif");
  if (cim) { ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot || 0); drawContain(ctx, cim, 0, 0, s * 1.2); ctx.restore(); return; }
  ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot || 0);
  if (p.kind === "letter") {
    ctx.fillStyle = "#fbf6e8"; ctx.strokeStyle = "#8a7a5a"; ctx.lineWidth = 1.5;
    ctx.fillRect(-s * 0.5, -s * 0.33, s, s * 0.66); ctx.strokeRect(-s * 0.5, -s * 0.33, s, s * 0.66);
    ctx.beginPath(); ctx.moveTo(-s * 0.5, -s * 0.33); ctx.lineTo(0, s * 0.05); ctx.lineTo(s * 0.5, -s * 0.33); ctx.stroke();
    ctx.fillStyle = "#c8323a"; ctx.beginPath(); ctx.arc(0, s * 0.03, s * 0.09, 0, 7); ctx.fill();
  } else if (p.kind === "pendant") {
    const g = 0.6 + Math.sin(now / 250) * 0.4;
    ctx.fillStyle = "rgba(255,240,150," + (0.35 * g) + ")"; ctx.beginPath(); ctx.arc(0, 0, s * 0.7, 0, 7); ctx.fill();
    ctx.fillStyle = "#ffd94a"; ctx.strokeStyle = "#9a6a00"; ctx.lineWidth = 1.5;
    ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * 0.16 : s * 0.38; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
function bgPsy(ctx, w, h, now) {
  const t = now / 1000;
  ctx.fillStyle = "#12002a"; ctx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h * 0.42, R = Math.hypot(w, h);
  for (let i = 18; i >= 0; i--) {
    const r = ((i * 0.055 + t * 0.06) % 1) * R;
    ctx.fillStyle = "hsla(" + ((i * 37 + t * 50) % 360) + ",80%," + (40 + (i % 3) * 8) + "%,0.55)";
    ctx.beginPath();
    for (let a = 0; a <= 64; a++) { const an = a / 64 * Math.PI * 2; const rr = r * (1 + Math.sin(an * 6 + t * 1.5 + i) * 0.06); ctx.lineTo(cx + Math.cos(an + t * 0.2) * rr, cy + Math.sin(an + t * 0.2) * rr); }
    ctx.fill();
  }
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.15);
  for (let k = 0; k < 12; k++) { ctx.rotate(Math.PI / 6); ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R, -40); ctx.lineTo(R, 40); ctx.fill(); }
  ctx.restore();
  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.min(w, h) * 0.35);
  g.addColorStop(0, "rgba(255,255,255,0.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
function bgBeach(ctx, w, h, now, mode, rocks) {
  const HZ = 0.36, SH = 0.52;
  const sky = ctx.createLinearGradient(0, 0, 0, h * HZ);
  if (mode === "day") { sky.addColorStop(0, "#4aa3e0"); sky.addColorStop(1, "#bfe8ff"); }
  else if (mode === "night") { sky.addColorStop(0, "#0b1430"); sky.addColorStop(1, "#33406e"); }
  else { sky.addColorStop(0, "#2b3d63"); sky.addColorStop(0.6, "#c9877a"); sky.addColorStop(1, "#f6b27a"); }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h * HZ + 1);
  if (mode === "day") {
    for (const [cx, cy, s] of [[0.2, 0.1, 1], [0.7, 0.16, 0.8], [0.45, 0.06, 0.6]]) { const x = ((cx + now / 90000) % 1.2) * w - 0.1 * w; drawCloud(ctx, x + 33 * s, cy * h, 120 * s); }
    drawSun(ctx, w * 0.82, h * 0.09, Math.min(w, h) * 0.06, "#fff6c4");
  } else if (mode === "sunset") {
    drawSun(ctx, w * 0.3, h * HZ, Math.min(w, h) * 0.09, "#ffd9a0");
  } else {
    const rr = seeded(3); ctx.fillStyle = "#fff";
    for (let i = 0; i < 50; i++) { ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(now / 700 + i)); ctx.fillRect(rr() * w, rr() * h * HZ, 1.5, 1.5); }
    ctx.globalAlpha = 1;
  }
  const sea = ctx.createLinearGradient(0, h * HZ, 0, h * SH);
  if (mode === "day") { sea.addColorStop(0, "#2f86c4"); sea.addColorStop(1, "#46a8d6"); }
  else if (mode === "night") { sea.addColorStop(0, "#14284a"); sea.addColorStop(1, "#1d3a5c"); }
  else { sea.addColorStop(0, "#3b6f8f"); sea.addColorStop(1, "#2a5b78"); }
  ctx.fillStyle = sea; ctx.fillRect(0, h * HZ, w, h * (SH - HZ) + 4);
  ctx.strokeStyle = "rgba(255,240,220,0.35)"; ctx.lineWidth = 2;
  for (let k = 0; k < 5; k++) { const y = h * (HZ + 0.02 + k * 0.03); ctx.beginPath(); for (let x = 0; x <= w; x += 10) ctx.lineTo(x, y + Math.sin(x / 30 + now / 600 + k) * 2); ctx.stroke(); }
  const shore = h * SH + Math.sin(now / 900) * h * 0.012;
  ctx.fillStyle = mode === "night" ? "#8f8466" : "#e8cf9a"; ctx.fillRect(0, shore, w, h - shore);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath(); ctx.moveTo(0, shore); for (let x = 0; x <= w; x += 12) ctx.lineTo(x, shore + 4 + Math.sin(x / 24 + now / 500) * 3); ctx.lineTo(w, shore - 2); ctx.closePath(); ctx.fill();
  const rr = seeded(7); ctx.fillStyle = "rgba(160,120,70,0.25)";
  for (let i = 0; i < 40; i++) ctx.fillRect(rr() * w, shore + 14 + rr() * (h - shore), 3, 2);
  if (rocks) {
    for (const [x, y, s] of [[0.92, 0.6, 1.2], [0.08, 0.66, 0.8], [0.98, 0.78, 1.5]]) {
      ctx.fillStyle = "#6b6258"; ctx.beginPath(); ctx.ellipse(x * w, y * h, 60 * s, 34 * s, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#8a8074"; ctx.beginPath(); ctx.ellipse(x * w - 10 * s, y * h - 8 * s, 34 * s, 18 * s, 0, Math.PI, 0); ctx.fill();
    }
  }
}
function treeRow(ctx, w, y, size, col, seed, count) {
  const rr = seeded(seed); ctx.fillStyle = col;
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * w + (rr() - 0.5) * 30, s = size * (0.7 + rr() * 0.6);
    ctx.beginPath(); ctx.moveTo(x, y - s * 1.6); ctx.lineTo(x + s * 0.6, y); ctx.lineTo(x - s * 0.6, y); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y - s * 0.9, s * 0.55, 0, 7); ctx.fill();
  }
}
function bgEntrance(ctx, w, h, now) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.5);
  sky.addColorStop(0, "#3a3466"); sky.addColorStop(1, "#d88a6a");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  treeRow(ctx, w, h * 0.5, 70, "#2b4a35", 4, 9);
  ctx.fillStyle = "#3f6b3f"; ctx.fillRect(0, h * 0.5, w, h * 0.5);
  // entrée sombre
  ctx.fillStyle = "#1a2f1c"; ctx.beginPath(); ctx.ellipse(w * 0.78, h * 0.55, w * 0.2, h * 0.18, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "#050a06"; ctx.beginPath(); ctx.ellipse(w * 0.78, h * 0.57, w * 0.12, h * 0.12, 0, Math.PI, 0); ctx.fill();
  treeRow(ctx, w, h * 0.62, 50, "#203a26", 9, 6);
  ctx.fillStyle = "#c8a874"; ctx.beginPath(); ctx.moveTo(0, h * 0.8); ctx.quadraticCurveTo(w * 0.5, h * 0.72, w * 0.78, h * 0.57); ctx.lineTo(w * 0.84, h * 0.58); ctx.quadraticCurveTo(w * 0.55, h * 0.8, w * 0.15, h); ctx.lineTo(0, h); ctx.fill();
}
function bgClearing(ctx, w, h, now) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.4);
  sky.addColorStop(0, "#7fc8f0"); sky.addColorStop(1, "#d8f2ff");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  treeRow(ctx, w, h * 0.42, 80, "#2f6e3a", 12, 10);
  treeRow(ctx, w, h * 0.5, 60, "#3f8a45", 21, 8);
  ctx.fillStyle = "#6fae5a"; ctx.fillRect(0, h * 0.5, w, h * 0.5);
  const rr = seeded(19);
  for (let i = 0; i < 40; i++) { ctx.fillStyle = ["#fff6c9", "#ffd1e6", "#ffe066"][i % 3]; ctx.beginPath(); ctx.arc(rr() * w, h * 0.55 + rr() * h * 0.45, 3, 0, 7); ctx.fill(); }
  for (let i = 0; i < 6; i++) { const x = ((i * 0.19 + now / 20000) % 1) * w; ctx.fillStyle = "rgba(255,255,220,0.25)"; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x - 60, h * 0.6); ctx.lineTo(x - 90, h * 0.6); ctx.fill(); }
}
function bgSky(ctx, w, h, now) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#14204a"); sky.addColorStop(0.55, "#6a4a7a"); sky.addColorStop(1, "#f0a070");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  const rr = seeded(8);
  for (let i = 0; i < 80; i++) { const x = rr() * w, y = rr() * h * 0.6, a = Math.min(1, (now - SC.t0) / 2500) * (0.4 + 0.6 * Math.abs(Math.sin(now / 600 + i))); ctx.fillStyle = "rgba(255,255,240," + a + ")"; ctx.fillRect(x, y, 2, 2); }
  ctx.fillStyle = "#1c1430"; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, h * 0.86); ctx.quadraticCurveTo(w * 0.5, h * 0.8, w, h * 0.88); ctx.lineTo(w, h); ctx.fill();
}
function bgDark(ctx, w, h, now) {
  ctx.fillStyle = "#06040c"; ctx.fillRect(0, 0, w, h);
  treeRow(ctx, w, h * 0.55, 110, "#120c22", 31, 7);
  treeRow(ctx, w, h * 0.75, 90, "#0c0818", 44, 6);
  for (let k = 0; k < 3; k++) {
    const x = ((now / (8000 + k * 3000) + k * 0.3) % 1.4) * w - w * 0.2;
    const g = ctx.createRadialGradient(x, h * (0.6 + k * 0.1), 10, x, h * (0.6 + k * 0.1), 200);
    g.addColorStop(0, "rgba(120,80,160,0.18)"); g.addColorStop(1, "rgba(120,80,160,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
}
function bgLogo(ctx, w, h, now) {
  const g = ctx.createRadialGradient(w / 2, h * 0.4, 10, w / 2, h * 0.4, Math.max(w, h) * 0.8);
  g.addColorStop(0, "#2a6f7a"); g.addColorStop(1, "#08161d");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.translate(w / 2, h * 0.4); ctx.rotate(now / 9000);
  for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.fillStyle = "rgba(255,230,160,0.05)"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.max(w, h), -50); ctx.lineTo(Math.max(w, h), 50); ctx.fill(); }
  ctx.restore();
}
// Silhouette mystérieuse (originale)
function drawShadowFigure(ctx, x, feetY, s, now) {
  const sim = !MEDIA.noCustom && mediaImg("deco.silhouette");
  if (sim) { const r = s / sim.naturalHeight; ctx.drawImage(sim, x - sim.naturalWidth * r / 2, feetY - s, sim.naturalWidth * r, s); return; }
  const t = now / 1000;
  ctx.save(); ctx.translate(x, feetY);
  ctx.fillStyle = "rgba(90,40,140,0.25)"; ctx.beginPath(); ctx.ellipse(0, -s * 0.5, s * 0.5 + Math.sin(t * 2) * 4, s * 0.55, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#05030a";
  ctx.beginPath();
  ctx.moveTo(-s * 0.3, 0); ctx.quadraticCurveTo(-s * 0.38, -s * 0.5, -s * 0.22, -s * 0.72);
  ctx.lineTo(-s * 0.32, -s * 1.02); ctx.lineTo(-s * 0.12, -s * 0.86); ctx.quadraticCurveTo(0, -s * 0.92, s * 0.12, -s * 0.86);
  ctx.lineTo(s * 0.32, -s * 1.02); ctx.lineTo(s * 0.22, -s * 0.72); ctx.quadraticCurveTo(s * 0.38, -s * 0.5, s * 0.3, 0);
  for (let i = 0; i < 5; i++) ctx.lineTo(s * (0.3 - (i + 0.5) * 0.12), Math.sin(t * 3 + i) * s * 0.03 + (i % 2 ? -s * 0.05 : 0));
  ctx.closePath(); ctx.fill();
  const e = 0.6 + Math.sin(t * 3) * 0.4;
  ctx.fillStyle = "rgba(255,60,90," + e + ")"; ctx.shadowColor = "#ff3a5a"; ctx.shadowBlur = s * 0.1;
  ctx.beginPath(); ctx.ellipse(-s * 0.1, -s * 0.68, s * 0.05, s * 0.02, 0.3, 0, 7); ctx.ellipse(s * 0.1, -s * 0.68, s * 0.05, s * 0.02, -0.3, 0, 7); ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------
//  LOGO (HTML) et lettre
// ------------------------------------------------------------
async function showLogo(sub, ms) {
  const lw = $("#logoWrap");
  $("#logoSub").textContent = sub || ""; $("#logoSub").hidden = !sub;
  lw.hidden = false; lw.classList.remove("out"); lw.classList.remove("in"); void lw.offsetWidth; lw.classList.add("in");
  await wait(ms || 2200);
  lw.classList.add("out"); await wait(450); lw.hidden = true;
}
function showLetter() {
  return new Promise(resolve => {
    const lp = $("#letterPanel");
    $("#ltHead").textContent = CH1.letter.head; $("#ltTitle").textContent = CH1.letter.title; $("#ltBody").textContent = CH1.letter.body;
    const f = $("#ltFields"); f.replaceChildren();
    for (const name of CH1.letter.fields) { const r = el("div", "lt-field"); r.append(el("span", null, name), el("i")); f.append(r); }
    lp.hidden = false; sfx("pick");
    lp.onclick = () => { sfx("tap"); lp.hidden = true; lp.onclick = null; resolve(); };
  });
}

// ------------------------------------------------------------
//  ANIMATION DE LANCEMENT
// ------------------------------------------------------------
const BOOT = { done: false, skipped: false };
async function playBoot() {
  BOOT.done = false; BOOT.skipped = false;
  showScreen("scene"); sceneReset("black");
  setMusic("bgm.titre");
  $("#skipHint").hidden = false;
  const scr = $("#scr-scene");
  const skip = () => { if (!BOOT.done) { BOOT.skipped = true; finishBoot(); } };
  scr.addEventListener("pointerdown", skip, { once: true });
  const sp = $("#splash"); sp.textContent = SPLASH_TEXT; sp.hidden = false; sp.classList.remove("show"); void sp.offsetWidth; sp.classList.add("show");
  await wait(2600); if (BOOT.skipped) return;
  sp.classList.remove("show"); await wait(700); sp.hidden = true; if (BOOT.skipped) return;
  sceneReset("beachDay");
  SC.props.letter = { kind: "letter", x: 0.62, y: -0.1, fall: { t0: performance.now(), dur: 2600, x0: 0.66, x1: 0.5, y1: 0.74 } };
  await wait(2800); if (BOOT.skipped) return;
  const pool = baseForms();
  const who = pick(pool).id;
  actor("boot", who, 1.15, 0.76, { dir: [-1, 0] });
  await moveA("boot", 0.6, 0.76, 1500); if (BOOT.skipped) return;
  SC.actors.boot.dir = [-1, 1]; await wait(350);
  hop("boot"); SC.props.letter.hidden = true; SC.actors.boot.holding = { kind: "letter", rot: 0 }; sfx("pick");
  await wait(900); if (BOOT.skipped) return;
  await flashWhite(700, 200, 800, async () => { sceneReset("logo"); });
  if (BOOT.skipped) return;
  await showLogo(null, 2000);
  finishBoot();
}
function finishBoot() {
  if (BOOT.done) return;
  BOOT.done = true;
  $("#splash").hidden = true; $("#skipHint").hidden = true; $("#logoWrap").hidden = true;
  const f = $("#flash"); f.hidden = true; f.style.opacity = "0";
  goTitle();
}

// ------------------------------------------------------------
//  NOUVELLE PARTIE : LA VOIX
// ------------------------------------------------------------
function runHold() {
  return new Promise(resolve => {
    const wrap = $("#holdWrap"), ring = $("#holdRing"), txt = $("#holdText"), btn = $("#holdBtn");
    const C = 2 * Math.PI * 54;
    ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C;
    txt.textContent = CH1.holdPrompt; wrap.hidden = false; wrap.classList.remove("ok");
    let t0 = 0, raf = 0, done = false;
    const tick = () => {
      const k = clamp((performance.now() - t0) / 5000, 0, 1);
      ring.style.strokeDashoffset = C * (1 - k);
      if (k >= 1) { done = true; wrap.classList.add("ok"); txt.textContent = "…Tu peux lâcher."; sfx("level"); return; }
      raf = requestAnimationFrame(tick);
    };
    const down = e => { if (done) return; e.preventDefault(); unlockAudio(); t0 = performance.now(); wrap.classList.add("holding"); sfx("tap"); try { btn.setPointerCapture(e.pointerId); } catch (_) { } tick(); };
    const up = () => {
      wrap.classList.remove("holding"); cancelAnimationFrame(raf);
      if (done) { cleanup(); setTimeout(resolve, 500); return; }
      if (t0) { txt.textContent = CH1.holdEarly; ring.style.strokeDashoffset = C; t0 = 0; }
    };
    const kd = e => { if (e.key === " " && !e.repeat && !t0) down(e); };
    const ku = e => { if (e.key === " ") up(); };
    const cleanup = () => { btn.removeEventListener("pointerdown", down); btn.removeEventListener("pointerup", up); btn.removeEventListener("pointercancel", up); document.removeEventListener("keydown", kd); document.removeEventListener("keyup", ku); setTimeout(() => { wrap.hidden = true; }, 450); };
    btn.addEventListener("pointerdown", down); btn.addEventListener("pointerup", up); btn.addEventListener("pointercancel", up);
    document.addEventListener("keydown", kd); document.addEventListener("keyup", ku);
  });
}
function monCardBtn(m, onPick) {
  const b = el("button", "pk-mon"); b.type = "button";
  const cv = el("canvas", "pk-face");
  const ty = el("span", "types"); for (const t of m.types || []) ty.append(typeChip(t));
  b.append(cv, el("b", null, m.name), ty);
  b.onclick = () => { sfx("tap"); onPick(m.id); };
  requestAnimationFrame(() => paintPortrait(cv, m.id, { still: true, body: true }));
  return b;
}
function runPicker(title, exclude) {
  return new Promise(resolve => {
    const pk = $("#picker"), grid = $("#pkGrid"), more = $("#pkMore");
    $("#pkTitle").textContent = title;
    const pool = baseForms().filter(m => !exclude.includes(m.id));
    const five = pool.slice().sort(() => rnd() - 0.5).slice(0, 5);
    const done = id => { pk.hidden = true; more.onclick = null; resolve(id); };
    const fill = list => { grid.replaceChildren(); for (const m of list) grid.append(monCardBtn(m, done)); grid.scrollTop = 0; };
    fill(five);
    pk.classList.remove("all"); more.hidden = false;
    more.textContent = "Voir toutes les créatures de base";
    more.onclick = () => { sfx("tap"); pk.classList.add("all"); fill(pool); more.hidden = true; };
    pk.hidden = false;
  });
}
async function chooseCreature(title, exclude, confirmText) {
  for (;;) {
    const id = await runPicker(title, exclude);
    SC.actors.pick = { mid: id, x: 0.5, y: 0.4, dir: [0, 1], sc: 1.6, alpha: 1, tw: null, hopT0: performance.now() };
    const c = await runChoice(["Oui", "Non, un autre"], confirmText + "\n" + MON[id].name);
    delete SC.actors.pick;
    if (c === 0) return id;
  }
}
async function playNewGame() {
  NG = { hero: null, name: "" };
  G = null; R = null;
  showScreen("scene"); sceneReset("psy");
  setMusic("bgm.voix");
  await wait(600);
  await runDialog(CH1.voice1);
  await runHold();
  await runDialog(CH1.voice2);
  const heroId = await chooseCreature("Ah oui… tu es…", [], CH1.confirmHero);
  NG.hero = heroId;
  await runDialog(CH1.voice3);
  const name = await runNameInput("Ton nom", MON[heroId].name);
  NG.name = name;
  newGame(heroId, heroId, name);
  await runDialog(CH1.voice4);
  const partnerId = await chooseCreature("Ton ami en danger, c’est…", [heroId], CH1.confirmPartner);
  G.team[1] = makeUnit(partnerId, 1, "partner");
  G.thieves = pickThieves([heroId, partnerId]);
  NG = null;
  await runDialog(CH1.voice5);
  await flashWhite(900, 300, 900, async () => { sceneReset("logo"); });
  await showLogo(CH1.title, 2800);
  G.story.step = "ch1_beach";
  Store.saveGame(G);
  await playChapter1Intro();
}

// ------------------------------------------------------------
//  CHAPITRE 1 : SCÈNES 1 À 3
// ------------------------------------------------------------
async function playChapter1Intro(opts) {
  opts = opts || {};
  const h = hero(), p = partner(), th = G.thieves;
  showScreen("scene"); sceneReset("beachSunset");
  setMusic("bgm.histoire");
  actor("hero", h.mid, 0.42, 0.72, { sleep: true, dir: [0, 1] });
  await wait(900);
  await runDialog(CH1.scene1, {
    onCue: async cue => {
      if (cue === "wake") { const a = SC.actors.hero; a.sleep = false; a.dir = [1, 1]; hop("hero"); await wait(700); }
      if (cue === "letter") {
        SC.wind = performance.now(); sfx("tp");
        SC.props.letter = { kind: "letter", x: 0.8, y: -0.1, fall: { t0: performance.now(), dur: 2300, x0: 0.85, x1: 0.53, y1: 0.75 } };
        await wait(2500);
      }
      if (cue === "read") { SC.actors.hero.dir = [1, 1]; hop("hero"); SC.props.letter.hidden = true; SC.actors.hero.holding = { kind: "letter" }; await wait(500); }
    }
  });
  await showLetter();
  SC.actors.hero.holding = null;
  await runDialog(CH1.scene1b);
  // scène 2
  await runDialog(CH1.scene2, {
    onCue: async cue => {
      if (cue === "shake") { sceneShake(); await wait(600); }
      if (cue === "run") { SC.actors.hero.dir = [1, 0]; await moveA("hero", 1.2, 0.72, 900); }
      if (cue === "surround") {
        sceneReset("beachRocks");
        actor("partner", p.mid, 0.6, 0.72, { dir: [-1, 1] });
        actor("s2", th[2], 0.42, 0.75, { dir: [1, 0] });
        actor("chef", th[0], 0.8, 0.73, { dir: [-1, 0], sc: 1.12 });
        actor("s1", th[1], 0.68, 0.6, { dir: [-1, 1] });
        SC.actors.partner.holding = { kind: "pendant" };
        await wait(700);
      }
      if (cue === "shove") {
        await moveA("s2", 0.53, 0.75, 250); hop("partner"); sfx("hit"); sceneShake();
        await moveA("partner", 0.64, 0.76, 250);
        SC.actors.partner.holding = null; SC.actors.chef.holding = { kind: "pendant" }; hop("chef");
        await moveA("s2", 0.45, 0.75, 300);
      }
      if (cue === "intervene") {
        actor("hero", h.mid, -0.15, 0.74, { dir: [1, 0] });
        await moveA("hero", 0.25, 0.74, 900); hop("hero");
        SC.actors.s2.dir = [-1, 0]; SC.actors.s1.dir = [-1, 0];
      }
      if (cue === "flee") {
        for (const k of ["chef", "s1", "s2"]) SC.actors[k].dir = [1, 0];
        moveA("s2", 1.3, 0.7, 1300); moveA("s1", 1.3, 0.62, 1100); await moveA("chef", 1.35, 0.72, 1200);
      }
    }
  });
  // scène 3
  await runDialog(CH1.scene3, {
    onCue: async cue => { if (cue === "face") { await moveA("partner", 0.42, 0.74, 700); SC.actors.partner.dir = [-1, 0]; SC.actors.hero.dir = [1, 0]; } }
  });
  if (!opts.replay || !G.partnerName) {
    const pn = await runNameInput("Le nom de ton partenaire", MON[p.mid].name);
    G.partnerName = pn;
  }
  await runDialog(CH1.scene3b);
  for (;;) {
    const c = await runChoice(CH1.askHelp);
    if (c === 0) break;
    await runDialog(CH1.askHelpAgain);
  }
  await runDialog(CH1.scene3c, {
    onCue: async cue => {
      if (cue === "walk") {
        sceneReset("entrance");
        actor("hero", h.mid, -0.1, 0.86, { dir: [1, 0] }); actor("partner", p.mid, -0.25, 0.9, { dir: [1, 0] });
        moveA("partner", 0.42, 0.78, 2000); await moveA("hero", 0.55, 0.74, 2000);
      }
    }
  });
  moveA("partner", 0.74, 0.6, 1400); await moveA("hero", 0.78, 0.58, 1400);
  await blackCard(CH1.toDungeon, 2200);
  if (opts.replay) { goHub(); return; }
  G.story.step = "ch1_map";
  Store.saveGame(G);
  goMap();
}

// ------------------------------------------------------------
//  CHAPITRE 1 : FIN
// ------------------------------------------------------------
async function playChapter1End() {
  const h = hero(), p = partner(), th = G.thieves;
  showScreen("scene"); sceneReset("clearing");
  setMusic("bgm.fin");
  actor("hero", h.mid, 0.28, 0.76, { dir: [1, 0] }); actor("partner", p.mid, 0.4, 0.8, { dir: [1, 0] });
  actor("chef", th[0], 0.72, 0.74, { dir: [-1, 0], sc: 1.12 }); actor("s1", th[1], 0.86, 0.66, { dir: [-1, 0] }); actor("s2", th[2], 0.6, 0.84, { dir: [-1, 0] });
  SC.actors.chef.holding = { kind: "pendant" };
  await wait(600);
  await runDialog(CH1.victory.slice(0, 3));
  SC.actors.chef.holding = null; SC.actors.partner.holding = { kind: "pendant" }; hop("partner"); sfx("pick");
  await runDialog([CH1.victory[3]]);
  for (const k of ["chef", "s1", "s2"]) SC.actors[k].dir = [1, 0];
  moveA("s1", 1.3, 0.66, 1000); moveA("s2", 1.3, 0.84, 1200); await moveA("chef", 1.35, 0.74, 1100);
  await runDialog(CH1.victory.slice(4));
  SC.actors.partner.dir = [-1, 0];
  await runDialog(CH1.victory2, {
    onCue: async cue => {
      if (cue === "turn") { SC.actors.partner.holding = null; await moveA("partner", 0.66, 0.78, 1200); await wait(300); SC.actors.partner.dir = [-1, 0]; hop("partner"); await wait(300); }
      if (cue === "sky") { sceneReset("sky"); await wait(1600); }
    }
  });
  await runChoice(CH1.joinChoice);
  sceneReset("beachSunset");
  actor("hero", h.mid, 0.3, 0.76, { dir: [1, 0] }); actor("partner", p.mid, 0.5, 0.78, { dir: [-1, 0] });
  await runDialog(CH1.victory3, { onCue: async () => { hop("partner"); await wait(400); } });
  SC.actors.partner.dir = [1, 0];
  moveA("partner", 1.2, 0.78, 2600); await wait(500); moveA("hero", 1.2, 0.76, 2600);
  const f = $("#fade"); f.hidden = false; f.style.opacity = "0"; await wait(30);
  f.style.transition = "opacity 2000ms"; f.style.opacity = "1"; await wait(2200);
  sceneReset("dark"); actor("shadow", null, 0.5, 0.86, { shadowFigure: true }); setMusic("bgm.ombre");
  f.style.transition = "opacity 1500ms"; f.style.opacity = "0"; await wait(1600); f.hidden = true;
  await runDialog(CH1.shadow);
  await blackCard(CH1.end, 3000);
  // récompenses
  G.story.ch1Done = true; G.story.step = "ch1_done";
  if (!G.progress.cleared.includes("L00")) G.progress.cleared.push("L00");
  G.badges = (G.badges || 0) + 1; G.shards = (G.shards || 0) + 10; G.money = (G.money || 0) + 200;
  Store.saveGame(G);
  goHub();
  setTimeout(() => toast("Badge de la Forêt obtenu ! +200 pièces, +10 Éclats d’étoile", 4000), 600);
}
