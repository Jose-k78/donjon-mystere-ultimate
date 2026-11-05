// ============================================================
//  DÉCORS DES CHAPITRES 3 À 5 (dessinés par le jeu, remplaçables
//  dans Graphics : bg.<nom>)
// ============================================================
function gradV(ctx, w, h, stops, y0, y1) { const g = ctx.createLinearGradient(0, y0 || 0, 0, y1 == null ? h : y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }
function floorTiles(ctx, w, h, y0, c1, c2, rows) {
  rows = rows || 7;
  for (let r = 0; r < rows; r++) for (let x = 0; x < 10; x++) { ctx.fillStyle = (x + r) % 2 ? c1 : c2; ctx.fillRect(x * w / 10 + (r % 2) * w / 20, y0 + r * (h - y0) / rows, w / 10 + 1, (h - y0) / rows + 1); }
}
function stars(ctx, w, h, n, now, seed) {
  const rr = seeded(seed || 77);
  for (let i = 0; i < n; i++) { const x = rr() * w, y = rr() * h, tw = 0.5 + Math.sin(now / 500 + i) * 0.5; ctx.fillStyle = "rgba(255,255,255," + (0.3 + tw * 0.6) + ")"; ctx.fillRect(x, y, 2, 2); }
}
function pillar(ctx, x, y, pw, ph, col) { ctx.fillStyle = col; ctx.fillRect(x - pw / 2, y, pw, ph); ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(x + pw * 0.2, y, pw * 0.3, ph); ctx.fillStyle = light(col, 0.15); ctx.fillRect(x - pw * 0.65, y - pw * 0.25, pw * 1.3, pw * 0.3); ctx.fillRect(x - pw * 0.65, y + ph - pw * 0.1, pw * 1.3, pw * 0.3); }
function drawTowerSil(ctx, x, base, hgt, wdt, col, now) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(x - wdt * 0.5, base); ctx.lineTo(x - wdt * 0.32, base - hgt); ctx.lineTo(x + wdt * 0.32, base - hgt); ctx.lineTo(x + wdt * 0.5, base); ctx.fill();
  for (let i = 1; i < 8; i++) { ctx.fillStyle = "rgba(255,240,180," + (0.25 + 0.2 * Math.sin(now / 400 + i)) + ")"; ctx.fillRect(x - wdt * 0.05, base - hgt * i / 8, wdt * 0.1, hgt * 0.02); }
  const g = ctx.createRadialGradient(x, base - hgt, 2, x, base - hgt, wdt * 1.4); g.addColorStop(0, "rgba(255,240,170,0.8)"); g.addColorStop(1, "rgba(255,240,170,0)");
  ctx.fillStyle = g; ctx.fillRect(x - wdt * 1.5, base - hgt - wdt * 1.5, wdt * 3, wdt * 3);
}
Object.assign(EXTRA_BG, {
  throne(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h, ["#3a2a4a", "#5a4060", "#2a1f30"]); ctx.fillRect(0, 0, w, h);
    // vitraux aux couleurs des guildes
    GUILDS.forEach((g, i) => {
      const x = w * (0.06 + i * 0.12), y = h * 0.06, ww = w * 0.08, hh = h * 0.22;
      ctx.fillStyle = g.col; ctx.globalAlpha = 0.55 + 0.15 * Math.sin(now / 900 + i); ctx.beginPath(); ctx.moveTo(x, y + hh); ctx.lineTo(x, y + ww * 0.5); ctx.quadraticCurveTo(x + ww / 2, y - ww * 0.3, x + ww, y + ww * 0.5); ctx.lineTo(x + ww, y + hh); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = "#1a1220"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = `700 ${Math.round(ww * 0.5)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText(g.icon, x + ww / 2, y + hh * 0.6); ctx.textAlign = "left";
      const lg = ctx.createLinearGradient(x, y + hh, x + ww * 1.4, h * 0.7); lg.addColorStop(0, g.col + "40"); lg.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(x, y + hh); ctx.lineTo(x + ww, y + hh); ctx.lineTo(x + ww * 2.2, h * 0.75); ctx.lineTo(x + ww * 0.6, h * 0.75); ctx.fill();
    });
    for (const px of [0.04, 0.96]) pillar(ctx, w * px, h * 0.08, w * 0.06, h * 0.62, "#e8dcc4");
    floorTiles(ctx, w, h, h * 0.62, "#c9bba0", "#bfb092");
    ctx.fillStyle = "#a01f2e"; ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.62); ctx.lineTo(w * 0.58, h * 0.62); ctx.lineTo(w * 0.72, h); ctx.lineTo(w * 0.28, h); ctx.fill();
    ctx.fillStyle = "#ffd94a"; ctx.fillRect(w * 0.41, h * 0.62, w * 0.01, h * 0.38 * 0.1);
    // trône
    const tx = w * 0.82, ty = h * 0.48; ctx.fillStyle = "#b8202f"; ctx.fillRect(tx - w * 0.07, ty - h * 0.14, w * 0.14, h * 0.18); ctx.fillStyle = "#ffd94a"; ctx.fillRect(tx - w * 0.08, ty - h * 0.16, w * 0.16, h * 0.025); ctx.fillRect(tx - w * 0.09, ty + h * 0.03, w * 0.18, h * 0.03);
  },
  council(ctx, w, h, now) {
    EXTRA_BG.throne(ctx, w, h, now);
    ctx.fillStyle = "rgba(20,8,40,0.45)"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) { const a = now / 1600 + i * 1.3; ctx.fillStyle = "rgba(60,20,90,0.25)"; ctx.beginPath(); ctx.ellipse(w * (0.5 + Math.sin(a) * 0.35), h * (0.55 + Math.cos(a * 0.7) * 0.15), w * 0.22, h * 0.05, 0, 0, 7); ctx.fill(); }
  },
  guildhall(ctx, w, h, now) {
    for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? "#5c4630" : "#644c34"; ctx.fillRect(i * w / 12, 0, w / 12 + 1, h * 0.64); }
    ctx.fillStyle = "#3a2a1a"; ctx.fillRect(0, h * 0.04, w, h * 0.03); ctx.fillRect(0, h * 0.6, w, h * 0.04);
    GUILDS.forEach((g, i) => { const x = w * (0.05 + i * 0.12), y = h * 0.1, wv = Math.sin(now / 700 + i) * 2; ctx.fillStyle = g.col; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * 0.09, y); ctx.lineTo(x + w * 0.09 + wv, y + h * 0.18); ctx.lineTo(x + w * 0.045, y + h * 0.15); ctx.lineTo(x + wv, y + h * 0.18); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `700 ${Math.round(w * 0.045)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText(g.icon, x + w * 0.045, y + h * 0.09); ctx.textAlign = "left"; });
    // grande table
    floorTiles(ctx, w, h, h * 0.64, "#8a6444", "#93694a", 6);
    ctx.fillStyle = "#6b4426"; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.7, w * 0.3, h * 0.05, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#4a2e18"; ctx.fillRect(w * 0.22, h * 0.7, w * 0.03, h * 0.08); ctx.fillRect(w * 0.75, h * 0.7, w * 0.03, h * 0.08);
    ctx.fillStyle = "#f3ead8"; ctx.fillRect(w * 0.42, h * 0.675, w * 0.16, h * 0.02);
    const lg = ctx.createRadialGradient(w * 0.5, h * 0.3, 10, w * 0.5, h * 0.3, w * 0.6); lg.addColorStop(0, "rgba(255,210,130,0.22)"); lg.addColorStop(1, "rgba(255,210,130,0)"); ctx.fillStyle = lg; ctx.fillRect(0, 0, w, h);
  },
  abyss(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h, ["#0b4a6a", "#06283e", "#020c16"]); ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) { const x = ((now / 7000 + i * 0.19) % 1.2) * w - w * 0.1; ctx.fillStyle = "rgba(160,230,255,0.07)"; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + w * 0.08, 0); ctx.lineTo(x + w * 0.3, h); ctx.lineTo(x + w * 0.18, h); ctx.fill(); }
    for (let i = 0; i < 14; i++) { const y = h - ((now / 30 + i * 97) % h), x = w * ((i * 0.137) % 1) + Math.sin(now / 600 + i) * 6; ctx.strokeStyle = "rgba(200,240,255,0.5)"; ctx.beginPath(); ctx.arc(x, y, 3 + (i % 3), 0, 7); ctx.stroke(); }
    ctx.fillStyle = "#123447"; ctx.beginPath(); ctx.moveTo(0, h * 0.7); for (let x = 0; x <= w; x += w / 10) ctx.lineTo(x, h * (0.68 + Math.sin(x * 0.03) * 0.04)); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    for (let i = 0; i < 7; i++) { const x = w * (0.08 + i * 0.14); ctx.strokeStyle = "#2e7d5b"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, h * 0.74); ctx.quadraticCurveTo(x + Math.sin(now / 700 + i) * 14, h * 0.62, x + Math.sin(now / 500 + i) * 8, h * 0.54); ctx.stroke(); }
  },
  crater(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h, ["#3a0d08", "#8a2a10", "#2a0a06"]); ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1e0b07"; ctx.beginPath(); ctx.moveTo(0, h * 0.5); ctx.lineTo(w * 0.25, h * 0.3); ctx.lineTo(w * 0.42, h * 0.45); ctx.lineTo(w * 0.6, h * 0.25); ctx.lineTo(w, h * 0.48); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    for (let i = 0; i < 4; i++) { const x = w * (0.15 + i * 0.25); ctx.strokeStyle = "rgba(255,120,40," + (0.6 + Math.sin(now / 300 + i) * 0.3) + ")"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, h * 0.62); ctx.lineTo(x + w * 0.05, h * 0.75); ctx.lineTo(x - w * 0.02, h * 0.88); ctx.stroke(); }
    for (let i = 0; i < 20; i++) { const y = h - ((now / 12 + i * 61) % h), x = w * ((i * 0.173) % 1); ctx.fillStyle = "rgba(255," + (120 + (i % 5) * 20) + ",40,0.8)"; ctx.fillRect(x, y, 3, 3); }
  },
  garden(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h, ["#ffd1f0", "#c9a6ff", "#7a5aa8"]); ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) drawCloud(ctx, ((now / 50000 + i * 0.3) % 1.3) * w * 1.1 - w * 0.1, h * (0.12 + i * 0.07), w * 0.24);
    // fleurs à l'envers suspendues
    for (let i = 0; i < 9; i++) { const x = w * (0.06 + i * 0.11), len = h * (0.1 + (i % 3) * 0.05); ctx.strokeStyle = "#5a8a4a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + Math.sin(now / 900 + i) * 4, len); ctx.stroke(); ctx.fillStyle = ["#ff7eb6", "#ffd23f", "#fff", "#c39cff"][i % 4]; for (let a = 0; a < 5; a++) { ctx.beginPath(); ctx.arc(x + Math.cos(a * 1.26) * 8, len + Math.sin(a * 1.26) * 8, 6, 0, 7); ctx.fill(); } }
    ctx.fillStyle = "#6b8f5a"; ctx.fillRect(0, h * 0.66, w, h * 0.34); ctx.fillStyle = "#7aa365"; for (let i = 0; i < 30; i++) ctx.fillRect(w * ((i * 0.037) % 1), h * (0.66 + (i % 6) * 0.05), 3, 8);
  },
  glacier(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h, ["#9fc4de", "#dceefa", "#eaf6ff"]); ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#c4dcef"; ctx.beginPath(); ctx.moveTo(0, h * 0.55); ctx.lineTo(w * 0.2, h * 0.3); ctx.lineTo(w * 0.35, h * 0.45); ctx.lineTo(w * 0.55, h * 0.22); ctx.lineTo(w * 0.75, h * 0.42); ctx.lineTo(w, h * 0.28); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    ctx.fillStyle = "#f4fbff"; ctx.fillRect(0, h * 0.62, w, h * 0.38);
    for (let i = 0; i < 40; i++) { const x = ((i * 0.071 + now / 9000) % 1) * w, y = ((i * 0.13 + now / 2600) % 1) * h; ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fillRect(x, y, 3, 3); }
  },
  clock(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h, ["#2a2418", "#4a3c22", "#1a160e"]); ctx.fillRect(0, 0, w, h);
    const cx = w * 0.5, cy = h * 0.3, r = Math.min(w, h) * 0.24;
    ctx.fillStyle = "#e8dcbc"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.strokeStyle = "#c9a14a"; ctx.lineWidth = 8; ctx.stroke();
    ctx.fillStyle = "#3a2e1a"; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.fillRect(cx + Math.cos(a) * r * 0.82 - 3, cy + Math.sin(a) * r * 0.82 - 3, 6, 6); }
    const a1 = now / 4000, a2 = now / 600; ctx.strokeStyle = "#3a2e1a"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a1) * r * 0.5, cy + Math.sin(a1) * r * 0.5); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a2) * r * 0.75, cy + Math.sin(a2) * r * 0.75); ctx.stroke();
    for (const [gx, gy, gr, sp] of [[0.12, 0.62, 0.1, 1], [0.88, 0.58, 0.12, -1], [0.3, 0.8, 0.07, -1.5]]) { ctx.save(); ctx.translate(w * gx, h * gy); ctx.rotate(now / 1500 * sp); ctx.fillStyle = "#8a6a3e"; for (let k = 0; k < 10; k++) { ctx.rotate(Math.PI / 5); ctx.fillRect(-w * gr * 0.12, -w * gr * 1.1, w * gr * 0.24, w * gr * 0.3); } ctx.beginPath(); ctx.arc(0, 0, w * gr * 0.85, 0, 7); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = "#5f5338"; ctx.fillRect(0, h * 0.7, w, h * 0.3);
  },
  night(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h, ["#05040f", "#1b1840", "#2d2a48"]); ctx.fillRect(0, 0, w, h);
    stars(ctx, w, h * 0.6, 60, now, 31);
    drawMoon(ctx, w * 0.75, h * 0.15, Math.min(w, h) * 0.08, "#05040f");
    ctx.fillStyle = "#16142a"; ctx.fillRect(w * 0.32, h * 0.18, w * 0.36, h * 0.6); for (let i = 0; i < 6; i++) { ctx.fillStyle = "rgba(185,168,255," + (0.2 + 0.2 * Math.sin(now / 500 + i)) + ")"; ctx.fillRect(w * 0.47, h * (0.22 + i * 0.09), w * 0.06, h * 0.03); }
    ctx.fillStyle = "#38344f"; ctx.fillRect(0, h * 0.72, w, h * 0.28);
  },
  circus(ctx, w, h, now) {
    ctx.fillStyle = "#12081a"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? "#7a3b45" : "#e8d3a6"; ctx.beginPath(); ctx.moveTo(w * 0.5, -h * 0.05); ctx.lineTo(w * i / 10, h * 0.55); ctx.lineTo(w * (i + 1) / 10, h * 0.55); ctx.fill(); }
    ctx.fillStyle = "rgba(10,4,20,0.45)"; ctx.fillRect(0, 0, w, h * 0.55);
    for (let i = 0; i < 3; i++) { const x = w * (0.2 + i * 0.3); ctx.strokeStyle = "#ffcf3d"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, h * 0.45 + Math.sin(now / 600 + i) * 10, w * 0.06, 0, 7); ctx.stroke(); }
    ctx.fillStyle = "#6e343d"; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.8, w * 0.55, h * 0.22, 0, 0, 7); ctx.fill(); ctx.strokeStyle = "#ffcf3d"; ctx.lineWidth = 3; ctx.stroke();
    const sl = ctx.createRadialGradient(w * 0.5, h * 0.78, 10, w * 0.5, h * 0.78, w * 0.4); sl.addColorStop(0, "rgba(255,240,200,0.25)"); sl.addColorStop(1, "rgba(255,240,200,0)"); ctx.fillStyle = sl; ctx.fillRect(0, 0, w, h);
  },
  sewer(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h, ["#1d1e16", "#2d2e22", "#11120c"]); ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#3a3b2e"; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.45, w * 0.48, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#16170f"; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.48, w * 0.36, Math.PI, 0); ctx.fill();
    for (let i = 0; i < 9; i++) { ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 2; ctx.beginPath(); const a = Math.PI + i * Math.PI / 9; ctx.moveTo(w * 0.5 + Math.cos(a) * w * 0.36, h * 0.48 + Math.sin(a) * w * 0.36); ctx.lineTo(w * 0.5 + Math.cos(a) * w * 0.48, h * 0.45 + Math.sin(a) * w * 0.48); ctx.stroke(); }
    ctx.fillStyle = "#4a4a3a"; ctx.fillRect(0, h * 0.62, w, h * 0.38);
    ctx.fillStyle = "#3d5a2a"; ctx.fillRect(w * 0.25, h * 0.7, w * 0.5, h * 0.12);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = "rgba(182,227,106,0.4)"; ctx.fillRect(((now / 3000 + i * 0.2) % 1) * w * 0.5 + w * 0.25, h * (0.72 + (i % 3) * 0.03), w * 0.05, 2); }
  },
  library(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h, ["#081418", "#16323a", "#0a1a1e"]); ctx.fillRect(0, 0, w, h);
    for (let s = 0; s < 4; s++) for (let i = 0; i < 16; i++) { const x = w * (0.02 + i * 0.06), y = h * (0.05 + s * 0.14); ctx.fillStyle = ["#7a3b3b", "#3b5a7a", "#7a6a3b", "#4a7a3b", "#5a3b7a"][(i + s) % 5]; ctx.fillRect(x, y, w * 0.045, h * 0.11); }
    for (let s = 0; s < 5; s++) { ctx.fillStyle = "#3b2a1f"; ctx.fillRect(0, h * (0.16 + s * 0.14), w, h * 0.012); }
    ctx.fillStyle = "rgba(60,160,200,0.22)"; ctx.fillRect(0, h * 0.62, w, h * 0.38);
    for (let i = 0; i < 8; i++) { const x = (i * 0.13 + now / 20000) % 1 * w, y = h * 0.3 + Math.sin(now / 900 + i) * h * 0.1; ctx.fillStyle = "rgba(160,240,255,0.5)"; ctx.fillRect(x, y, 4, 2); }
    ctx.fillStyle = "#34515c"; ctx.fillRect(0, h * 0.74, w, h * 0.26);
  },
  rift(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h, ["#06030e", "#24124a", "#06030e"]); ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 7; i++) { const a = now / 2000 + i; ctx.strokeStyle = "rgba(" + (120 + i * 15) + ",80,255,0.35)"; ctx.lineWidth = 2 + i; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.4, w * (0.1 + i * 0.06), h * (0.2 + i * 0.03), a * 0.2, 0, 7); ctx.stroke(); }
    const g = ctx.createRadialGradient(w * 0.5, h * 0.4, 4, w * 0.5, h * 0.4, w * 0.25); g.addColorStop(0, "rgba(160,240,255,0.9)"); g.addColorStop(1, "rgba(80,40,200,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 10; i++) { ctx.fillStyle = "rgba(255,255,255,0.08)"; const x = w * ((i * 0.11 + now / 15000) % 1), y = h * (0.6 + (i % 4) * 0.08); ctx.fillRect(x, y, w * 0.12, h * 0.02); }
    ctx.fillStyle = "#1a1030"; ctx.fillRect(0, h * 0.72, w, h * 0.28);
  },
  towerbase(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h * 0.6, ["#2a1e4a", "#7a4a7a", "#e08a5a"]); ctx.fillRect(0, 0, w, h);
    drawTowerSil(ctx, w * 0.5, h * 0.62, h * 0.62, w * 0.22, "#e8e0c8", now);
    ctx.fillStyle = "#3a6f9a"; ctx.fillRect(0, h * 0.58, w, h * 0.08);
    ctx.fillStyle = "#d9c08e"; ctx.fillRect(0, h * 0.66, w, h * 0.34);
    // l'armée de l'Ombre : yeux rouges
    for (let i = 0; i < 60; i++) { const x = w * ((i * 0.0617) % 1), y = h * (0.66 + (i % 7) * 0.012), bl = Math.sin(now / 300 + i * 2) > -0.8; if (bl) { ctx.fillStyle = "#ff3a4a"; ctx.fillRect(x, y, 3, 2); ctx.fillRect(x + 6, y, 3, 2); } }
  },
  towertop(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h, ["#0e1030", "#2a2a6a", "#e9d8a6"]); ctx.fillRect(0, 0, w, h);
    stars(ctx, w, h * 0.5, 50, now, 9);
    for (let i = 0; i < 4; i++) drawCloud(ctx, ((now / 40000 + i * 0.28) % 1.3) * w * 1.1 - w * 0.1, h * (0.55 + i * 0.04), w * 0.3);
    const g = ctx.createRadialGradient(w * 0.5, h * 0.3, 5, w * 0.5, h * 0.3, w * 0.35); g.addColorStop(0, "rgba(255,244,194,0.9)"); g.addColorStop(0.3, "rgba(255,200,120,0.35)"); g.addColorStop(1, "rgba(255,200,120,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.translate(w * 0.5, h * 0.3); ctx.rotate(now / 3000); ctx.fillStyle = "rgba(255,255,255,0.8)"; star(ctx, 0, 0, w * 0.05); ctx.restore();
    floorTiles(ctx, w, h, h * 0.68, "#d9d3c2", "#cfc8b4", 6);
    ctx.fillStyle = "#f2e3a8"; ctx.fillRect(0, h * 0.68, w, h * 0.012);
  },
  festival(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h, ["#0f1640", "#2a2a6a", "#3a2a4a"]); ctx.fillRect(0, 0, w, h);
    stars(ctx, w, h * 0.4, 40, now, 5);
    for (let r = 0; r < 2; r++) { ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, h * (0.18 + r * 0.12)); ctx.quadraticCurveTo(w / 2, h * (0.28 + r * 0.12), w, h * (0.18 + r * 0.12)); ctx.stroke(); for (let i = 1; i < 9; i++) { const x = w * i / 9, y = h * (0.18 + r * 0.12) + Math.sin(i / 9 * Math.PI) * h * 0.05; const c = ["#ff8a3d", "#ffd23f", "#ff7eb6", "#7ce38a", "#58b6ff"][(i + r) % 5]; const gl = ctx.createRadialGradient(x, y + 8, 1, x, y + 8, 18); gl.addColorStop(0, c); gl.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = gl; ctx.fillRect(x - 18, y - 10, 36, 36); ctx.fillStyle = c; ctx.fillRect(x - 5, y, 10, 14); } }
    ctx.fillStyle = "#c9b48c"; ctx.fillRect(0, h * 0.62, w, h * 0.38);
    for (let i = 0; i < 6; i++) { const x = w * (0.08 + i * 0.17); ctx.fillStyle = ["#a2462f", "#3e64b8", "#557a4a"][i % 3]; ctx.fillRect(x, h * 0.5, w * 0.12, h * 0.12); ctx.fillStyle = "#f3ead8"; ctx.fillRect(x - 4, h * 0.48, w * 0.12 + 8, h * 0.03); }
    for (let i = 0; i < 3; i++) { const k = ((now / 2200 + i * 0.37) % 1); if (k < 0.5) { const x = w * (0.2 + i * 0.3), y = h * (0.35 - k * 0.4); ctx.fillStyle = ["#ffd23f", "#ff7eb6", "#7ce3ff"][i]; for (let a = 0; a < 10; a++) ctx.fillRect(x + Math.cos(a * 0.63) * k * 90, y + Math.sin(a * 0.63) * k * 90, 3, 3); } }
  },
  rooftop(ctx, w, h, now) {
    ctx.fillStyle = gradV(ctx, w, h, ["#05081e", "#1b2248", "#3a3f7a"]); ctx.fillRect(0, 0, w, h);
    stars(ctx, w, h * 0.7, 90, now, 13);
    drawMoon(ctx, w * 0.2, h * 0.14, Math.min(w, h) * 0.06, "#05081e");
    const k = (now / 6000) % 1; if (k < 0.15) { ctx.strokeStyle = "rgba(255,255,255," + (1 - k / 0.15) + ")"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * (0.9 - k * 3), h * (0.1 + k)); ctx.lineTo(w * (0.95 - k * 3), h * (0.08 + k)); ctx.stroke(); }
    ctx.fillStyle = "#a2462f"; ctx.beginPath(); ctx.moveTo(0, h * 0.7); ctx.lineTo(w, h * 0.62); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(0, h * (0.74 + i * 0.04)); ctx.lineTo(w, h * (0.66 + i * 0.04)); ctx.stroke(); }
  },
  beachDawn(ctx, w, h, now) {
    bgBeach(ctx, w, h, now, "sunset");
    drawTowerSil(ctx, w * 0.78, h * 0.5, h * 0.45, w * 0.08, "rgba(240,230,210,0.85)", now);
  }
});
