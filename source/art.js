// ============================================================
//  DESSIN : créatures originales, objets, tuiles, sprites PMD
// ============================================================
function hexRgb(h) {
  h = h.replace("#", "");
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbHex(r, g, b) { return "#" + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join(""); }
function mix(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
const dark = (c, t) => mix(c, "#000000", t);
const light = (c, t) => mix(c, "#ffffff", t);
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ------------------------------------------------------------
//  CRÉATURES PROCÉDURALES
//  (cx, feetY) = pieds ; s = taille de case
// ------------------------------------------------------------
function monColors(m) {
  const t = m.types || ["Normal"];
  const c1 = TYPE_COLORS[t[0]] || "#c0b0a0";
  const c2 = TYPE_COLORS[t[1] || t[0]] || c1;
  return { c1, c2 };
}
function drawMonster(ctx, m, cx, feetY, s, o) {
  o = o || {};
  const t = (o.t || 0) / 1000;
  const form = formOf(m);
  let { c1, c2 } = monColors(m);
  const fl = o.flash || 0;
  if (fl > 0) { c1 = mix(c1, "#ffffff", fl); c2 = mix(c2, "#ffffff", fl); }
  const dir = o.dir || [0, 1];
  const back = dir[1] < 0 && dir[0] === 0;
  const flip = dir[0] < 0 ? -1 : 1;
  const sc = (o.scale || 1);
  const r = s * 0.3 * sc;
  const seed = hashStr(m.id || m.name || "x");
  const floaty = ["ghost", "orb", "crystal", "fish", "swirl", "bat"].includes(form);
  const bob = o.still ? 0 : (floaty ? Math.sin(t * 3 + seed % 7) * r * 0.12 - r * 0.18 : Math.abs(Math.sin(t * (o.moving ? 12 : 2.4))) * r * (o.moving ? 0.12 : 0.05));
  const cy = feetY - r - bob;
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.translate(cx, cy);
  ctx.scale(flip, 1);
  if (o.sleep) ctx.rotate(0.12);
  const ol = dark(c1, 0.55);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, r * 0.09);
  ctx.strokeStyle = ol;
  const fillStroke = (fill) => { ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); };
  const eyeX = back ? 0 : (dir[0] !== 0 ? r * 0.18 : 0);
  let eyes = { y: -r * 0.1, gap: r * 0.36, size: r * 0.2, style: "round" };

  switch (form) {
    case "ghost": {
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.arc(0, -r * 0.05, r, Math.PI, 0);
      const wv = Math.sin(t * 5) * r * 0.08;
      ctx.lineTo(r, r * 0.55);
      ctx.quadraticCurveTo(r * 0.7, r * 0.95 + wv, r * 0.4, r * 0.6);
      ctx.quadraticCurveTo(r * 0.15, r * 1.0 - wv, -r * 0.1, r * 0.62);
      ctx.quadraticCurveTo(-r * 0.4, r * 1.0 + wv, -r * 0.6, r * 0.6);
      ctx.quadraticCurveTo(-r * 0.85, r * 0.85, -r, r * 0.5);
      ctx.closePath();
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.5, r * 0.1, 0, 0, r * 1.2);
      g.addColorStop(0, light(c1, 0.5)); g.addColorStop(1, c1);
      fillStroke(g);
      if ((m.types || []).includes("Feu")) { // flammèche sur la tête
        const fh = 1 + Math.sin(t * 10) * 0.15;
        const fg = ctx.createLinearGradient(0, -r * 1.9, 0, -r * 0.8); fg.addColorStop(0, "#fff7b0"); fg.addColorStop(1, "#ff8a3a");
        ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-r * 0.35, -r * 0.9); ctx.quadraticCurveTo(-r * 0.3, -r * 1.5 * fh, 0, -r * 1.85 * fh); ctx.quadraticCurveTo(r * 0.3, -r * 1.5 * fh, r * 0.35, -r * 0.9); ctx.closePath(); ctx.fill();
      } else if (!back) { // croissant
        ctx.beginPath(); ctx.arc(r * 0.05, -r * 0.72, r * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = light(c2, 0.2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.13, -r * 0.78, r * 0.17, 0, Math.PI * 2);
        ctx.fillStyle = light(c1, 0.35); ctx.fill();
      }
      eyes = { y: -r * 0.12, gap: r * 0.36, size: r * 0.22, style: "tall" };
      break;
    }
    case "rock": {
      const rr = seeded(seed);
      ctx.beginPath();
      const n = 9;
      for (let i = 0; i <= n; i++) {
        const a = Math.PI * 2 * i / n - Math.PI / 2;
        const k = 0.88 + rr() * 0.22;
        const x = Math.cos(a) * r * 1.08 * k, y = Math.sin(a) * r * 0.98 * k;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      const g = ctx.createLinearGradient(0, -r, 0, r);
      g.addColorStop(0, light(c1, 0.25)); g.addColorStop(1, dark(c1, 0.15));
      fillStroke(g);
      ctx.strokeStyle = dark(c1, 0.4); ctx.lineWidth = r * 0.07;
      ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.5); ctx.lineTo(-r * 0.3, -r * 0.2); ctx.lineTo(-r * 0.45, r * 0.15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(r * 0.55, r * 0.2); ctx.lineTo(r * 0.3, r * 0.45); ctx.stroke();
      ctx.fillStyle = c2;
      ctx.beginPath(); ctx.ellipse(r * 0.45, -r * 0.6, r * 0.22, r * 0.12, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = dark(c1, 0.35);
      ctx.beginPath(); ctx.ellipse(-r * 0.5, r * 0.9, r * 0.25, r * 0.14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(r * 0.5, r * 0.9, r * 0.25, r * 0.14, 0, 0, Math.PI * 2); ctx.fill();
      eyes = { y: -r * 0.05, gap: r * 0.34, size: r * 0.15, style: "brow" };
      break;
    }
    case "leaf": {
      // jambes
      ctx.strokeStyle = dark(c1, 0.5); ctx.lineWidth = r * 0.12;
      const st = o.moving ? Math.sin(t * 14) * r * 0.15 : 0;
      ctx.beginPath(); ctx.moveTo(-r * 0.25, r * 0.6); ctx.lineTo(-r * 0.3 + st, r); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(r * 0.25, r * 0.6); ctx.lineTo(r * 0.3 - st, r); ctx.stroke();
      // ombre spectrale
      ctx.fillStyle = c2; ctx.globalAlpha *= 0.55;
      ctx.beginPath(); ctx.ellipse(-r * 0.15, r * 0.1, r * 0.95, r * 0.75, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha /= 0.55;
      ctx.strokeStyle = ol; ctx.lineWidth = Math.max(1, r * 0.09);
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.25);
      ctx.bezierCurveTo(r * 1.0, -r * 0.7, r * 0.95, r * 0.5, 0, r * 0.75);
      ctx.bezierCurveTo(-r * 0.95, r * 0.5, -r * 1.0, -r * 0.7, 0, -r * 1.25);
      const g = ctx.createLinearGradient(-r, -r, r, r);
      g.addColorStop(0, light(c1, 0.3)); g.addColorStop(1, dark(c1, 0.1));
      fillStroke(g);
      ctx.strokeStyle = dark(c1, 0.35); ctx.lineWidth = r * 0.07;
      ctx.beginPath(); ctx.moveTo(0, -r * 1.1); ctx.lineTo(0, r * 0.65); ctx.stroke();
      for (const k of [-0.6, -0.15, 0.3]) {
        ctx.beginPath(); ctx.moveTo(0, r * k); ctx.lineTo(r * 0.45, r * (k - 0.25)); ctx.moveTo(0, r * k); ctx.lineTo(-r * 0.45, r * (k - 0.25)); ctx.stroke();
      }
      eyes = { y: -r * 0.2, gap: r * 0.42, size: r * 0.17, style: "half" };
      break;
    }
    case "orb": {
      const fl2 = Math.sin(t * 18) * 0.35;
      ctx.fillStyle = light(c2, 0.2); ctx.strokeStyle = dark(c2, 0.45);
      for (const sx of [-1, 1]) {
        ctx.save(); ctx.scale(sx, 1); ctx.rotate(fl2 * sx * 0.5);
        ctx.beginPath(); ctx.ellipse(r * 1.05, -r * 0.35, r * 0.55, r * 0.28, -0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      // queue éclair
      ctx.strokeStyle = dark(c1, 0.2); ctx.lineWidth = r * 0.16;
      ctx.beginPath(); ctx.moveTo(-r * 0.6, r * 0.5); ctx.lineTo(-r * 1.0, r * 0.4); ctx.lineTo(-r * 0.9, r * 0.75); ctx.lineTo(-r * 1.35, r * 0.7); ctx.stroke();
      ctx.strokeStyle = ol; ctx.lineWidth = Math.max(1, r * 0.09);
      ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
      g.addColorStop(0, light(c1, 0.6)); g.addColorStop(1, c1);
      fillStroke(g);
      if (!back) { ctx.fillStyle = "#ff8a6a"; ctx.globalAlpha *= 0.7; ctx.beginPath(); ctx.arc(eyeX - r * 0.55, r * 0.2, r * 0.13, 0, 7); ctx.arc(eyeX + r * 0.55, r * 0.2, r * 0.13, 0, 7); ctx.fill(); ctx.globalAlpha /= 0.7; }
      eyes = { y: -r * 0.1, gap: r * 0.34, size: r * 0.17, style: "round" };
      break;
    }
    case "crystal": {
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.2); ctx.lineTo(r * 0.8, -r * 0.35); ctx.lineTo(r * 0.6, r * 0.75); ctx.lineTo(0, r * 1.0); ctx.lineTo(-r * 0.6, r * 0.75); ctx.lineTo(-r * 0.8, -r * 0.35); ctx.closePath();
      const g = ctx.createLinearGradient(-r, -r, r, r);
      g.addColorStop(0, light(c1, 0.55)); g.addColorStop(1, mix(c1, c2, 0.3));
      fillStroke(g);
      ctx.strokeStyle = light(c1, 0.7); ctx.lineWidth = r * 0.06;
      ctx.beginPath(); ctx.moveTo(0, -r * 1.2); ctx.lineTo(-r * 0.25, -r * 0.35); ctx.lineTo(-r * 0.8, -r * 0.35); ctx.moveTo(-r * 0.25, -r * 0.35); ctx.lineTo(0, r * 1.0); ctx.stroke();
      if (!back) { // cœur
        ctx.fillStyle = c2;
        const hx = eyeX * 0.5, hy = r * 0.42, hs = r * 0.16;
        ctx.beginPath(); ctx.moveTo(hx, hy + hs); ctx.bezierCurveTo(hx - hs * 2, hy - hs * 0.5, hx - hs * 0.6, hy - hs * 1.6, hx, hy - hs * 0.4); ctx.bezierCurveTo(hx + hs * 0.6, hy - hs * 1.6, hx + hs * 2, hy - hs * 0.5, hx, hy + hs); ctx.fill();
      }
      // étincelles
      const sp = (Math.sin(t * 4 + seed) + 1) / 2;
      ctx.save(); ctx.fillStyle = "#ffffff"; ctx.globalAlpha *= sp;
      star(ctx, r * 0.95, -r * 0.95, r * 0.18); star(ctx, -r * 0.9, r * 0.3, r * 0.12);
      ctx.restore();
      eyes = { y: -r * 0.2, gap: r * 0.34, size: r * 0.15, style: "sparkle" };
      break;
    }
    case "bug": {
      // corps d'insecte (c2) + thorax en flammes (c1)
      const body = c2 !== c1 ? c2 : dark(c1, 0.2);
      ctx.strokeStyle = dark(body, 0.5); ctx.lineWidth = r * 0.09;
      const st = o.moving ? Math.sin(t * 16) * r * 0.12 : 0;
      for (const k of [-0.45, 0, 0.45]) { ctx.beginPath(); ctx.moveTo(r * k, r * 0.4); ctx.lineTo(r * k * 1.3 + st, r * 0.98); ctx.stroke(); }
      if (!(m.types || []).includes("Feu")) {
        // ailes translucides
        const fw = Math.sin(t * 30) * 0.2;
        ctx.save(); ctx.fillStyle = "rgba(230,245,255,0.6)"; ctx.strokeStyle = "rgba(120,150,170,0.8)"; ctx.lineWidth = r * 0.05;
        for (const k of [0, 1]) { ctx.save(); ctx.translate(-r * 0.25, -r * 0.2); ctx.rotate(-0.9 + k * 0.45 + fw); ctx.beginPath(); ctx.ellipse(0, -r * 0.45, r * 0.22, r * 0.5, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
        ctx.restore();
      } else {
      // flamme
      const fh = 1 + Math.sin(t * 12) * 0.12;
      ctx.beginPath(); ctx.moveTo(-r * 0.7, r * 0.0);
      ctx.quadraticCurveTo(-r * 1.0, -r * 0.9 * fh, -r * 0.45, -r * 1.25 * fh);
      ctx.quadraticCurveTo(-r * 0.4, -r * 0.7, -r * 0.1, -r * 1.05 * fh);
      ctx.quadraticCurveTo(r * 0.0, -r * 0.5, -r * 0.05, r * 0.0);
      ctx.closePath();
      const fg = ctx.createLinearGradient(0, -r * 1.2, 0, 0); fg.addColorStop(0, "#fff3a0"); fg.addColorStop(1, c1);
      ctx.fillStyle = fg; ctx.fill();
      }
      ctx.strokeStyle = dark(body, 0.5); ctx.lineWidth = Math.max(1, r * 0.09);
      ctx.beginPath(); ctx.ellipse(-r * 0.35, r * 0.25, r * 0.6, r * 0.45, 0, 0, Math.PI * 2);
      fillStroke(mix(body, c1, 0.35));
      ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.1, r * 0.55, 0, Math.PI * 2);
      fillStroke(light(body, 0.15));
      ctx.strokeStyle = dark(body, 0.5); ctx.lineWidth = r * 0.07;
      ctx.beginPath(); ctx.moveTo(r * 0.45, -r * 0.6); ctx.quadraticCurveTo(r * 0.6, -r * 1.1, r * 0.95, -r * 1.05); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(r * 0.25, -r * 0.62); ctx.quadraticCurveTo(r * 0.2, -r * 1.1, r * 0.45, -r * 1.2); ctx.stroke();
      ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(r * 0.95, -r * 1.05, r * 0.09, 0, 7); ctx.arc(r * 0.45, -r * 1.2, r * 0.09, 0, 7); ctx.fill();
      eyes = { y: -r * 0.15, gap: r * 0.3, size: r * 0.14, style: "round", ox: r * 0.35 };
      break;
    }
    case "fish": {
      const tw = Math.sin(t * 6) * 0.25;
      // queue
      ctx.save(); ctx.translate(-r * 0.85, r * 0.05); ctx.rotate(tw);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-r * 0.55, -r * 0.45); ctx.lineTo(-r * 0.45, 0); ctx.lineTo(-r * 0.55, r * 0.45); ctx.closePath();
      fillStroke(mix(c1, c2, 0.5)); ctx.restore();
      // nageoire dorsale
      ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.6); ctx.quadraticCurveTo(-r * 0.1, -r * 1.05, r * 0.25, -r * 0.65); ctx.closePath();
      fillStroke(dark(c2, 0.1));
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0, 0, Math.PI * 2);
      const g = ctx.createLinearGradient(0, -r * 0.7, 0, r * 0.7);
      g.addColorStop(0, c1); g.addColorStop(1, mix(c1, c2, 0.6));
      fillStroke(g);
      // lanterne
      ctx.strokeStyle = dark(c1, 0.4); ctx.lineWidth = r * 0.06;
      ctx.beginPath(); ctx.moveTo(r * 0.4, -r * 0.6); ctx.quadraticCurveTo(r * 0.7, -r * 1.3, r * 1.05, -r * 1.0); ctx.stroke();
      const glow = 0.6 + Math.sin(t * 3) * 0.4;
      ctx.fillStyle = "rgba(220,255,255," + (0.35 * glow) + ")"; ctx.beginPath(); ctx.arc(r * 1.05, -r * 1.0, r * 0.3, 0, 7); ctx.fill();
      ctx.fillStyle = "#f4ffff"; ctx.beginPath(); ctx.arc(r * 1.05, -r * 1.0, r * 0.12, 0, 7); ctx.fill();
      // bouche
      if (!back) { ctx.strokeStyle = dark(c1, 0.6); ctx.lineWidth = r * 0.06; ctx.beginPath(); ctx.moveTo(r * 0.95, r * 0.15); ctx.lineTo(r * 0.7, r * 0.2); ctx.stroke(); }
      eyes = { y: -r * 0.15, gap: r * 0.3, size: r * 0.18, style: "white", ox: r * 0.35 };
      break;
    }
    case "mole": {
      ctx.beginPath(); ctx.ellipse(0, r * 0.1, r * 0.95, r * 0.85, 0, 0, Math.PI * 2);
      fillStroke(c1);
      ctx.fillStyle = light(c1, 0.25); ctx.beginPath(); ctx.ellipse(0, r * 0.35, r * 0.55, r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
      // casque / foreuse
      ctx.strokeStyle = dark(c2, 0.5);
      ctx.beginPath(); ctx.moveTo(-r * 0.85, -r * 0.25); ctx.quadraticCurveTo(0, -r * 1.25, r * 0.85, -r * 0.25); ctx.closePath();
      fillStroke(c2);
      if (!back) {
        ctx.beginPath(); ctx.moveTo(r * 0.55, r * 0.0); ctx.lineTo(r * 1.35, r * 0.18); ctx.lineTo(r * 0.55, r * 0.38); ctx.closePath();
        fillStroke(light(c2, 0.2));
        ctx.strokeStyle = dark(c2, 0.4); ctx.lineWidth = r * 0.05;
        ctx.beginPath(); ctx.moveTo(r * 0.8, r * 0.07); ctx.lineTo(r * 0.8, r * 0.3); ctx.moveTo(r * 1.05, r * 0.12); ctx.lineTo(r * 1.05, r * 0.25); ctx.stroke();
      }
      // griffes
      ctx.fillStyle = light(c2, 0.4);
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * r * 0.75, r * 0.8, r * 0.28, r * 0.14, 0, 0, 7); ctx.fill(); }
      eyes = { y: -r * 0.05, gap: r * 0.3, size: r * 0.1, style: "dot", ox: r * 0.1 };
      break;
    }
    case "swirl": {
      ctx.beginPath(); ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      g.addColorStop(0, light(c1, 0.55)); g.addColorStop(1, c1);
      fillStroke(g);
      ctx.save(); ctx.rotate(t * 2.5);
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = r * 0.1;
      for (let k = 0; k < 3; k++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.arc(r * 0.35, 0, r * 0.5, -0.6, 1.4); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle = c2; ctx.lineWidth = r * 0.1;
      ctx.beginPath(); ctx.ellipse(0, r * 0.55, r * 1.15, r * 0.25, 0, 0, Math.PI); ctx.stroke();
      eyes = { y: -r * 0.05, gap: r * 0.32, size: r * 0.16, style: "round" };
      break;
    }
    case "armor": {
      const metal = c2 !== c1 ? c2 : "#9eaab8";
      // aura d'ombre
      ctx.fillStyle = c1; ctx.globalAlpha *= 0.5;
      ctx.beginPath(); ctx.ellipse(0, -r * 0.1, r * 1.15 + Math.sin(t * 4) * r * 0.05, r * 1.1, 0, 0, 7); ctx.fill();
      ctx.globalAlpha /= 0.5;
      ctx.strokeStyle = dark(metal, 0.55);
      // corps
      ctx.beginPath(); ctx.moveTo(-r * 0.7, r * 0.1); ctx.lineTo(-r * 0.55, r * 0.95); ctx.lineTo(r * 0.55, r * 0.95); ctx.lineTo(r * 0.7, r * 0.1); ctx.closePath();
      fillStroke(dark(metal, 0.15));
      // casque
      ctx.beginPath(); ctx.moveTo(-r * 0.75, r * 0.15); ctx.lineTo(-r * 0.75, -r * 0.55); ctx.quadraticCurveTo(0, -r * 1.35, r * 0.75, -r * 0.55); ctx.lineTo(r * 0.75, r * 0.15); ctx.closePath();
      const g = ctx.createLinearGradient(-r, 0, r, 0);
      g.addColorStop(0, light(metal, 0.35)); g.addColorStop(1, dark(metal, 0.2));
      fillStroke(g);
      // crête
      ctx.fillStyle = c1 === metal ? "#7a3cff" : light(c1, 0.25);
      ctx.beginPath(); ctx.moveTo(-r * 0.08, -r * 1.0); ctx.lineTo(r * 0.0, -r * 1.45); ctx.lineTo(r * 0.12, -r * 1.0); ctx.fill();
      if (!back) {
        ctx.fillStyle = "#0b0912"; ctx.fillRect(-r * 0.6 + eyeX * 0.5, -r * 0.4, r * 1.2, r * 0.32);
      }
      eyes = { y: -r * 0.24, gap: r * 0.3, size: r * 0.1, style: "glow" };
      break;
    }
    case "fox": {
      const accent = c2 !== c1 ? c2 : light(c1, 0.55);
      const st = o.moving ? Math.sin(t * 14) * r * 0.1 : 0;
      // queue
      const tw = Math.sin(t * 3) * 0.12;
      ctx.save(); ctx.translate(-r * 0.6, r * 0.25); ctx.rotate(tw);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-r * 0.9, -r * 0.1, -r * 0.75, -r * 0.95);
      ctx.quadraticCurveTo(-r * 0.35, -r * 0.65, -r * 0.05, -r * 0.2); ctx.closePath();
      fillStroke(c1);
      ctx.beginPath(); ctx.moveTo(-r * 0.62, -r * 0.62); ctx.quadraticCurveTo(-r * 0.85, -r * 0.8, -r * 0.75, -r * 0.95); ctx.quadraticCurveTo(-r * 0.55, -r * 0.82, -r * 0.48, -r * 0.6); ctx.closePath();
      ctx.fillStyle = (monById(m.id).types || [])[0] === "Feu" ? "#ffe27a" : accent; ctx.fill();
      ctx.restore();
      // pattes
      ctx.fillStyle = dark(c1, 0.25);
      for (const [lx, ph] of [[-0.5, 1], [-0.2, -1], [0.2, 1], [0.45, -1]]) ctx.fillRect(r * lx - r * 0.09 + st * ph, r * 0.55, r * 0.18, r * 0.45);
      // corps
      ctx.beginPath(); ctx.ellipse(-r * 0.05, r * 0.35, r * 0.72, r * 0.42, 0, 0, 7); fillStroke(c1);
      ctx.fillStyle = accent; ctx.beginPath(); ctx.ellipse(r * 0.3, r * 0.42, r * 0.28, r * 0.24, 0, 0, 7); ctx.fill();
      // tête
      ctx.beginPath(); ctx.arc(r * 0.42, -r * 0.3, r * 0.5, 0, 7); fillStroke(c1);
      for (const [a, b, c] of [[[0.08, -0.6], [0.18, -1.15], [0.42, -0.72]], [[0.5, -0.76], [0.78, -1.15], [0.82, -0.55]]]) {
        ctx.beginPath(); ctx.moveTo(r * a[0], r * a[1]); ctx.lineTo(r * b[0], r * b[1]); ctx.lineTo(r * c[0], r * c[1]); ctx.closePath(); fillStroke(c1);
        ctx.beginPath(); ctx.moveTo(r * (a[0] + 0.07), r * (a[1] - 0.02)); ctx.lineTo(r * b[0], r * (b[1] + 0.18)); ctx.lineTo(r * (c[0] - 0.05), r * (c[1] - 0.04)); ctx.closePath(); ctx.fillStyle = accent; ctx.fill();
      }
      if (!back) {
        ctx.fillStyle = light(c1, 0.55); ctx.beginPath(); ctx.ellipse(r * 0.75, -r * 0.18, r * 0.22, r * 0.16, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "#1a1420"; ctx.beginPath(); ctx.arc(r * 0.93, -r * 0.22, r * 0.06, 0, 7); ctx.fill();
      }
      eyes = { y: -r * 0.38, gap: r * 0.19, size: r * 0.11, style: "round", ox: r * 0.4 };
      break;
    }
    case "bird": {
      const flap = Math.sin(t * (o.moving ? 16 : 5)) * 0.35;
      ctx.fillStyle = "#e89a3a"; ctx.strokeStyle = dark("#e89a3a", 0.4); ctx.lineWidth = r * 0.07;
      ctx.beginPath(); ctx.moveTo(-r * 0.2, r * 0.75); ctx.lineTo(-r * 0.25, r * 1.0); ctx.moveTo(r * 0.2, r * 0.75); ctx.lineTo(r * 0.25, r * 1.0); ctx.stroke();
      ctx.strokeStyle = ol; ctx.lineWidth = Math.max(1, r * 0.09);
      for (const k of [-0.25, 0, 0.25]) { ctx.beginPath(); ctx.moveTo(-r * 0.65, r * 0.2); ctx.lineTo(-r * 1.15, r * (0.05 + k)); ctx.lineTo(-r * 0.7, r * (0.35 + k * 0.3)); ctx.closePath(); fillStroke(dark(c1, 0.12)); }
      ctx.beginPath(); ctx.ellipse(0, r * 0.12, r * 0.78, r * 0.72, 0, 0, 7);
      const g = ctx.createLinearGradient(0, -r * 0.6, 0, r * 0.8); g.addColorStop(0, light(c1, 0.15)); g.addColorStop(1, c1);
      fillStroke(g);
      ctx.fillStyle = light(c1, 0.6); ctx.beginPath(); ctx.ellipse(r * 0.18, r * 0.3, r * 0.42, r * 0.38, 0, 0, 7); ctx.fill();
      ctx.save(); ctx.translate(-r * 0.15, r * 0.1); ctx.rotate(-0.5 + flap);
      ctx.beginPath(); ctx.ellipse(-r * 0.25, 0, r * 0.5, r * 0.26, 0, 0, 7); fillStroke(c2 !== c1 ? c2 : dark(c1, 0.15)); ctx.restore();
      ctx.fillStyle = c2 !== c1 ? c2 : dark(c1, 0.2);
      ctx.beginPath(); ctx.moveTo(-r * 0.05, -r * 0.55); ctx.quadraticCurveTo(r * 0.0, -r * 1.05, r * 0.2, -r * 0.95); ctx.quadraticCurveTo(r * 0.1, -r * 0.75, r * 0.15, -r * 0.55); ctx.fill();
      if (!back) { ctx.fillStyle = "#ffb347"; ctx.strokeStyle = "#8a4b10"; ctx.lineWidth = r * 0.05; ctx.beginPath(); ctx.moveTo(r * 0.68, -r * 0.2); ctx.lineTo(r * 1.08, -r * 0.08); ctx.lineTo(r * 0.68, r * 0.05); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      eyes = { y: -r * 0.25, gap: r * 0.24, size: r * 0.14, style: "round", ox: r * 0.22 };
      break;
    }
    case "turtle": {
      const two = (m.types || []).length > 1;
      const shell = two ? c2 : dark(c1, 0.1), body = two ? c1 : light(c1, 0.3);
      const st = o.moving ? Math.sin(t * 12) * r * 0.08 : 0;
      ctx.fillStyle = body; ctx.strokeStyle = dark(body, 0.5);
      for (const [lx, ph] of [[-0.6, 1], [-0.25, -1], [0.25, 1], [0.55, -1]]) { ctx.beginPath(); ctx.ellipse(r * lx + st * ph, r * 0.8, r * 0.15, r * 0.2, 0, 0, 7); ctx.fill(); ctx.stroke(); }
      if (!back) { ctx.beginPath(); ctx.arc(r * 0.88, r * 0.12, r * 0.36, 0, 7); fillStroke(body); }
      ctx.strokeStyle = dark(shell, 0.5);
      ctx.beginPath(); ctx.moveTo(-r * 0.95, r * 0.55); ctx.quadraticCurveTo(-r * 0.95, -r * 0.75, 0, -r * 0.78); ctx.quadraticCurveTo(r * 0.95, -r * 0.75, r * 0.95, r * 0.55); ctx.closePath();
      const g = ctx.createLinearGradient(0, -r * 0.8, 0, r * 0.6); g.addColorStop(0, light(shell, 0.2)); g.addColorStop(1, dark(shell, 0.1));
      fillStroke(g);
      ctx.strokeStyle = dark(shell, 0.35); ctx.lineWidth = r * 0.06;
      ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.45); ctx.lineTo(r * 0.3, -r * 0.45); ctx.lineTo(r * 0.45, r * 0.05); ctx.lineTo(0, r * 0.3); ctx.lineTo(-r * 0.45, r * 0.05); ctx.closePath(); ctx.stroke();
      ctx.fillStyle = light(shell, 0.35); ctx.fillRect(-r * 0.95, r * 0.45, r * 1.9, r * 0.12);
      eyes = { y: r * 0.05, gap: r * 0.12, size: r * 0.09, style: "round", ox: r * 0.92 };
      if (back) eyes = null;
      break;
    }
    case "mushroom": {
      const cap = c2 !== c1 ? c2 : c1;
      ctx.fillStyle = "#e9dcc3"; ctx.strokeStyle = "#7a6a52";
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * r * 0.28, r * 0.92, r * 0.2, r * 0.1, 0, 0, 7); ctx.fill(); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-r * 0.42, -r * 0.1); ctx.lineTo(-r * 0.48, r * 0.75); ctx.quadraticCurveTo(0, r * 1.0, r * 0.48, r * 0.75); ctx.lineTo(r * 0.42, -r * 0.1); ctx.closePath();
      ctx.fillStyle = "#f4ead6"; ctx.fill(); ctx.stroke();
      ctx.strokeStyle = dark(cap, 0.5);
      const wob = Math.sin(t * 2.5) * 0.04;
      ctx.save(); ctx.rotate(wob);
      ctx.beginPath(); ctx.moveTo(-r * 1.05, r * 0.0); ctx.quadraticCurveTo(-r * 1.05, -r * 1.15, 0, -r * 1.15); ctx.quadraticCurveTo(r * 1.05, -r * 1.15, r * 1.05, r * 0.0); ctx.quadraticCurveTo(0, r * 0.18, -r * 1.05, 0);
      const g = ctx.createLinearGradient(0, -r * 1.1, 0, 0); g.addColorStop(0, light(cap, 0.2)); g.addColorStop(1, cap);
      fillStroke(g);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (const [x, y, rr] of [[-0.55, -0.45, 0.17], [0.05, -0.78, 0.2], [0.55, -0.4, 0.15], [-0.2, -0.25, 0.1]]) { ctx.beginPath(); ctx.arc(r * x, r * y, r * rr, 0, 7); ctx.fill(); }
      ctx.restore();
      eyes = { y: r * 0.32, gap: r * 0.17, size: r * 0.11, style: "round" };
      break;
    }
    case "bat": {
      const fl3 = Math.sin(t * 9);
      ctx.fillStyle = dark(c1, 0.15); ctx.strokeStyle = ol;
      for (const sx of [-1, 1]) {
        ctx.save(); ctx.scale(sx, 1); ctx.rotate(fl3 * 0.25);
        ctx.beginPath(); ctx.moveTo(r * 0.35, -r * 0.2); ctx.quadraticCurveTo(r * 1.0, -r * 0.9, r * 1.45, -r * 0.35);
        ctx.quadraticCurveTo(r * 1.2, -r * 0.1, r * 1.2, r * 0.15); ctx.quadraticCurveTo(r * 0.95, -r * 0.05, r * 0.85, r * 0.25); ctx.quadraticCurveTo(r * 0.65, r * 0.05, r * 0.45, r * 0.25); ctx.closePath();
        ctx.fill(); ctx.stroke();
        if (c2 !== c1) { ctx.strokeStyle = c2; ctx.lineWidth = r * 0.05; ctx.beginPath(); ctx.moveTo(r * 0.4, -r * 0.1); ctx.lineTo(r * 1.2, -r * 0.3); ctx.stroke(); ctx.strokeStyle = ol; ctx.lineWidth = Math.max(1, r * 0.09); }
        ctx.restore();
      }
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * r * 0.18, -r * 0.45); ctx.lineTo(sx * r * 0.42, -r * 0.95); ctx.lineTo(sx * r * 0.48, -r * 0.35); ctx.closePath(); fillStroke(c1); }
      ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, 7);
      const g = ctx.createRadialGradient(-r * 0.15, -r * 0.2, r * 0.05, 0, 0, r * 0.6); g.addColorStop(0, light(c1, 0.35)); g.addColorStop(1, c1);
      fillStroke(g);
      if (!back) { ctx.fillStyle = "#fff"; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(eyeX + sx * r * 0.12 - r * 0.05, r * 0.18); ctx.lineTo(eyeX + sx * r * 0.12, r * 0.32); ctx.lineTo(eyeX + sx * r * 0.12 + r * 0.05, r * 0.18); ctx.fill(); } }
      eyes = { y: -r * 0.08, gap: r * 0.2, size: r * 0.13, style: "round" };
      break;
    }
    case "seal": {
      const accent = c2 !== c1 ? c2 : light(c1, 0.55);
      const sw = Math.sin(t * 4) * 0.15;
      ctx.save(); ctx.translate(-r * 0.95, r * 0.65); ctx.rotate(sw);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-r * 0.35, -r * 0.25); ctx.lineTo(-r * 0.3, r * 0.2); ctx.closePath(); fillStroke(dark(c1, 0.1)); ctx.restore();
      ctx.beginPath(); ctx.ellipse(-r * 0.1, r * 0.35, r * 0.95, r * 0.55, 0, 0, 7); fillStroke(c1);
      ctx.beginPath(); ctx.arc(r * 0.45, -r * 0.25, r * 0.52, 0, 7); fillStroke(c1);
      ctx.fillStyle = light(c1, 0.6); ctx.beginPath(); ctx.ellipse(r * 0.15, r * 0.5, r * 0.55, r * 0.32, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(r * 0.35, r * 0.8, r * 0.22, r * 0.12, 0.4, 0, 7); fillStroke(dark(c1, 0.1));
      if (!back) {
        ctx.fillStyle = accent; ctx.beginPath(); ctx.ellipse(r * 0.78, -r * 0.1, r * 0.22, r * 0.16, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "#1a1420"; ctx.beginPath(); ctx.arc(r * 0.9, -r * 0.16, r * 0.06, 0, 7); ctx.fill();
        ctx.strokeStyle = "rgba(30,20,30,0.6)"; ctx.lineWidth = r * 0.03;
        for (const k of [-0.05, 0.05]) { ctx.beginPath(); ctx.moveTo(r * 0.85, -r * (0.05 - k)); ctx.lineTo(r * 1.15, -r * (0.1 - k * 3)); ctx.stroke(); }
      }
      eyes = { y: -r * 0.36, gap: r * 0.18, size: r * 0.12, style: "round", ox: r * 0.42 };
      break;
    }
    case "sprout": {
      const sway = Math.sin(t * 2.2) * 0.15;
      ctx.fillStyle = dark(c1, 0.3);
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * r * 0.32, r * 0.92, r * 0.18, r * 0.1, 0, 0, 7); ctx.fill(); }
      ctx.save(); ctx.translate(0, -r * 0.45); ctx.rotate(sway);
      ctx.strokeStyle = dark(c1, 0.35); ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.35); ctx.stroke();
      ctx.strokeStyle = ol; ctx.lineWidth = Math.max(1, r * 0.08);
      for (const sx of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(0, -r * 0.35); ctx.quadraticCurveTo(sx * r * 0.45, -r * 0.85, sx * r * 0.85, -r * 0.55); ctx.quadraticCurveTo(sx * r * 0.4, -r * 0.3, 0, -r * 0.35);
        fillStroke(light(c1, 0.15));
      }
      if (c2 !== c1) { ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(0, -r * 0.4, r * 0.12, 0, 7); ctx.fill(); }
      ctx.restore();
      ctx.beginPath(); ctx.ellipse(0, r * 0.2, r * 0.78, r * 0.72, 0, 0, 7);
      const g = ctx.createRadialGradient(-r * 0.25, -r * 0.15, r * 0.1, 0, r * 0.2, r * 0.85); g.addColorStop(0, light(c1, 0.45)); g.addColorStop(1, c1);
      fillStroke(g);
      eyes = { y: r * 0.1, gap: r * 0.28, size: r * 0.15, style: "round" };
      break;
    }
    default: { // blob
      ctx.fillStyle = c2; ctx.strokeStyle = ol;
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * r * 0.35, -r * 0.6); ctx.lineTo(sx * r * 0.75, -r * 1.2); ctx.lineTo(sx * r * 0.8, -r * 0.45); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.beginPath();
      ctx.moveTo(-r, r * 0.7); ctx.quadraticCurveTo(-r * 1.1, -r * 0.9, 0, -r * 0.85); ctx.quadraticCurveTo(r * 1.1, -r * 0.9, r, r * 0.7); ctx.quadraticCurveTo(0, r * 1.05, -r, r * 0.7);
      const g = ctx.createLinearGradient(0, -r, 0, r);
      g.addColorStop(0, light(c1, 0.3)); g.addColorStop(1, c1);
      fillStroke(g);
      eyes = { y: -r * 0.1, gap: r * 0.36, size: r * 0.17, style: "round" };
    }
  }
  if (!back && eyes) drawEyes(ctx, eyes, eyeX + (eyes.ox || 0), r, t, seed, o);
  ctx.restore();
  if (o.sleep) {
    ctx.save(); ctx.fillStyle = "#e8f0ff"; ctx.font = `700 ${Math.round(s * 0.28)}px "Pixelify Sans", monospace`;
    const zz = (t * 0.8) % 1;
    ctx.globalAlpha = 1 - zz; ctx.fillText("z", cx + r * 0.8, cy - r - zz * s * 0.3);
    ctx.restore();
  }
}
function star(ctx, x, y, s) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? s * 0.35 : s; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function drawEyes(ctx, e, ex, r, t, seed, o) {
  const blink = !o.still && ((t + (seed % 100) / 37) % 3.4) < 0.12;
  const od = o.dir || [0, 1];
  const px = Math.abs(od[0]) * e.size * 0.3, py = Math.max(0, od[1]) * e.size * 0.2;
  const E = o.emo;
  for (const sx of [-1, 1]) {
    const x = ex + sx * e.gap, y = e.y;
    if (E && E !== "Normal" && !o.sleep && !o.ko && drawEmotionEye(ctx, E, x, y, e.size, sx, r)) continue;
    if (o.sleep || blink || o.ko) {
      ctx.strokeStyle = "#1a1420"; ctx.lineWidth = Math.max(1, r * 0.08);
      ctx.beginPath(); ctx.moveTo(x - e.size, y); ctx.quadraticCurveTo(x, y + e.size * 0.6, x + e.size, y); ctx.stroke();
      continue;
    }
    if (e.style === "glow") {
      ctx.fillStyle = "#b07cff"; ctx.shadowColor = "#b07cff"; ctx.shadowBlur = r * 0.5;
      ctx.beginPath(); ctx.ellipse(x, y, e.size * 1.4, e.size * 0.8, 0, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      continue;
    }
    if (e.style === "white") {
      ctx.fillStyle = "#f4ffff"; ctx.beginPath(); ctx.arc(x, y, e.size, 0, 7); ctx.fill();
      ctx.strokeStyle = "#1a1420"; ctx.lineWidth = Math.max(1, r * 0.05); ctx.stroke();
      continue;
    }
    if (e.style === "dot") { ctx.fillStyle = "#1a1420"; ctx.beginPath(); ctx.arc(x, y, e.size, 0, 7); ctx.fill(); continue; }
    const tall = e.style === "tall" ? 1.35 : 1;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.ellipse(x, y, e.size, e.size * tall, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#1a1420";
    ctx.beginPath(); ctx.ellipse(x + px, y + py, e.size * 0.62, e.size * 0.72 * tall, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(x + px - e.size * 0.2, y + py - e.size * 0.3, e.size * 0.22, 0, 7); ctx.fill();
    if (e.style === "brow") {
      ctx.strokeStyle = "#2a1e14"; ctx.lineWidth = Math.max(1, r * 0.09);
      ctx.beginPath(); ctx.moveTo(x - e.size * 1.2, y - e.size * (sx > 0 ? 1.6 : 1.1)); ctx.lineTo(x + e.size * 1.2, y - e.size * (sx > 0 ? 1.1 : 1.6)); ctx.stroke();
    }
    if (e.style === "half") { ctx.fillStyle = "rgba(40,20,60,0.55)"; ctx.fillRect(x - e.size, y - e.size * 1.05, e.size * 2, e.size * 0.75); }
    if (o.shadow) { ctx.fillStyle = "rgba(255,40,60,0.85)"; ctx.beginPath(); ctx.ellipse(x + px, y + py, e.size * 0.5, e.size * 0.6, 0, 0, 7); ctx.fill(); }
  }
}
// expressions des portraits dessinés par le jeu (émotions de sprite_config.json)
function drawEmotionEye(ctx, E, x, y, s, sx, r) {
  const ink = "#1a1420"; ctx.lineCap = "round";
  const lw = Math.max(1, r * 0.08);
  const brow = (inner, outer) => { ctx.strokeStyle = "#2a1e14"; ctx.lineWidth = Math.max(1, r * 0.08); ctx.beginPath(); ctx.moveTo(x - sx * s * 1.1, y - s * (1.3 + inner)); ctx.lineTo(x + sx * s * 1.1, y - s * (1.3 + outer)); ctx.stroke(); };
  const base = (pScale) => { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(x, y, s, s, 0, 0, 7); ctx.fill(); ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(x, y + s * 0.1, s * 0.62 * pScale, s * 0.72 * pScale, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x - s * 0.2, y - s * 0.2, s * 0.2, 0, 7); ctx.fill(); };
  const tear = () => { ctx.fillStyle = "#7ad0ff"; ctx.beginPath(); ctx.moveTo(x + sx * s * 0.6, y + s * 0.6); ctx.quadraticCurveTo(x + sx * s * 0.95, y + s * 1.25, x + sx * s * 0.6, y + s * 1.35); ctx.quadraticCurveTo(x + sx * s * 0.25, y + s * 1.25, x + sx * s * 0.6, y + s * 0.6); ctx.fill(); };
  switch (E) {
    case "Happy": case "Joyous": ctx.strokeStyle = ink; ctx.lineWidth = lw * 1.2; ctx.beginPath(); ctx.moveTo(x - s, y + s * 0.3); ctx.quadraticCurveTo(x, y - s * 0.9, x + s, y + s * 0.3); ctx.stroke(); if (E === "Joyous") { ctx.fillStyle = "rgba(255,120,140,0.5)"; ctx.beginPath(); ctx.arc(x + sx * s * 0.6, y + s * 1.2, s * 0.45, 0, 7); ctx.fill(); } return true;
    case "Inspired": base(0.9); ctx.fillStyle = "#ffe680"; star(ctx, x + s * 0.15, y - s * 0.1, s * 0.45); return true;
    case "Sad": case "Worried": base(0.85); brow(0.45, -0.1); return true;
    case "Teary-Eyed": base(0.9); brow(0.4, -0.1); ctx.fillStyle = "rgba(140,210,255,0.55)"; ctx.beginPath(); ctx.ellipse(x, y + s * 0.55, s * 0.85, s * 0.35, 0, 0, 7); ctx.fill(); tear(); return true;
    case "Crying": ctx.strokeStyle = ink; ctx.lineWidth = lw * 1.2; ctx.beginPath(); ctx.moveTo(x - s, y - s * 0.1); ctx.quadraticCurveTo(x, y + s * 0.6, x + s, y - s * 0.1); ctx.stroke(); brow(0.45, -0.1); tear(); ctx.fillStyle = "#7ad0ff"; ctx.fillRect(x + sx * s * 0.5, y + s * 0.4, s * 0.25, s * 1.6); return true;
    case "Angry": case "Shouting": base(E === "Shouting" ? 0.55 : 0.75); brow(-0.35, 0.25); return true;
    case "Determined": base(0.8); brow(-0.2, 0.1); ctx.fillStyle = "rgba(40,20,60,0.5)"; ctx.fillRect(x - s, y - s * 1.05, s * 2, s * 0.55); return true;
    case "Surprised": case "Stunned": ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(x, y, s * 1.1, s * 1.2, 0, 0, 7); ctx.fill(); ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(x, y, s * (E === "Stunned" ? 0.18 : 0.3), 0, 7); ctx.fill(); brow(0.55, 0.55); return true;
    case "Pain": ctx.strokeStyle = ink; ctx.lineWidth = lw * 1.2; ctx.beginPath(); ctx.moveTo(x - sx * s * 0.8, y - s * 0.6); ctx.lineTo(x + sx * s * 0.6, y); ctx.lineTo(x - sx * s * 0.8, y + s * 0.6); ctx.stroke(); return true;
    case "Dizzy": ctx.strokeStyle = ink; ctx.lineWidth = lw; ctx.beginPath(); for (let a = 0; a < 12; a += 0.4) ctx.lineTo(x + Math.cos(a) * s * a / 12, y + Math.sin(a) * s * a / 12); ctx.stroke(); return true;
    case "Sigh": ctx.strokeStyle = ink; ctx.lineWidth = lw * 1.2; ctx.beginPath(); ctx.moveTo(x - s, y + s * 0.1); ctx.lineTo(x + s, y + s * 0.1); ctx.stroke(); return true;
  }
  return false;
}

// ------------------------------------------------------------
//  SPRITES PMD (AnimData.xml + *-Anim.png) importés par l'utilisateur
// ------------------------------------------------------------
const SPRITES = {}; // mid → { anims: {Walk:{img,fw,fh,durs,total,rows}}, portrait: img }
const PMD_DIR_ROW = (d) => { // ordre PMD : Bas, Bas-Droite, Droite, Haut-Droite, Haut, Haut-Gauche, Gauche, Bas-Gauche
  const k = (d[0] + 1) + "," + (d[1] + 1);
  return { "1,2": 0, "2,2": 1, "2,1": 2, "2,0": 3, "1,0": 4, "0,0": 5, "0,1": 6, "0,2": 7 }[k] ?? 0;
};
function drawPMD(ctx, spr, animName, d, tms, cx, feetY, s, o) {
  const a = spr.anims[animName] || spr.anims.Idle || spr.anims.Walk;
  if (!a || !a.img || !a.img.complete || !a.img.naturalWidth) return false;
  const frames = a.durs.length || 1;
  let f = 0;
  if (a.total > 0) {
    let tt = Math.floor(tms / 1000 * 60) % a.total;
    for (let i = 0; i < frames; i++) { tt -= a.durs[i]; if (tt < 0) { f = i; break; } }
  }
  const rows = Math.max(1, Math.round(a.img.naturalHeight / a.fh));
  const row = rows >= 8 ? PMD_DIR_ROW(d) : 0;
  const k = s / 24 * (o.scale || 1);
  const w = a.fw * k, h = a.fh * k;
  const x = cx - w / 2, y = feetY - s * 0.36 * (o.scale || 1) - h / 2;
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.imageSmoothingEnabled = false;
  if (o.flash > 0) {
    const off = flashCanvas(a.fw, a.fh);
    const oc = off.getContext("2d");
    oc.clearRect(0, 0, a.fw, a.fh);
    oc.globalCompositeOperation = "source-over";
    oc.drawImage(a.img, f * a.fw, row * a.fh, a.fw, a.fh, 0, 0, a.fw, a.fh);
    oc.globalCompositeOperation = "source-atop";
    oc.fillStyle = "rgba(255,255,255," + o.flash + ")"; oc.fillRect(0, 0, a.fw, a.fh);
    ctx.drawImage(off, x, y, w, h);
  } else {
    ctx.drawImage(a.img, f * a.fw, row * a.fh, a.fw, a.fh, x, y, w, h);
  }
  ctx.restore();
  return true;
}
let _flashC = null;
function flashCanvas(w, h) {
  if (!_flashC) _flashC = document.createElement("canvas");
  if (_flashC.width < w) _flashC.width = w;
  if (_flashC.height < h) _flashC.height = h;
  return _flashC;
}
// Dessine une créature (sprite importé si présent, sinon art procédural)
function drawCreature(ctx, mid, cx, feetY, s, o) {
  o = o || {};
  if (o.shadow) drawShadowAura(ctx, cx, feetY, s, o.t || 0);
  const spr = SPRITES[mid];
  if (spr) {
    let anim = o.anim || (o.moving ? "Walk" : "Idle");
    if (o.sleep && spr.anims.Sleep) anim = "Sleep";
    if (drawPMD(ctx, spr, anim, o.dir || [0, 1], o.t || 0, cx, feetY, s, o)) return;
  }
  const cim = !MEDIA.noCustom && mediaImg("mon." + mid);
  if (cim) { drawCustomCreature(ctx, cim, cx, feetY, s, o); return; }
  drawMonster(ctx, monById(mid), cx, feetY, s, o);
}
// aura des créatures possédées par l'Ombre
function drawShadowAura(ctx, cx, feetY, s, t) {
  const cy = feetY - s * 0.35;
  const g = ctx.createRadialGradient(cx, cy, s * 0.05, cx, cy, s * 0.62);
  g.addColorStop(0, "rgba(70,20,110,0.55)"); g.addColorStop(0.6, "rgba(40,8,70,0.35)"); g.addColorStop(1, "rgba(20,0,40,0)");
  ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, s * 0.62, s * 0.55, 0, 0, 7); ctx.fill();
  for (let i = 0; i < 4; i++) { const k = ((t / 1400) + i * 0.25) % 1; ctx.fillStyle = "rgba(60,10,90," + (0.7 * (1 - k)) + ")"; ctx.beginPath(); ctx.arc(cx + Math.sin(i * 2.1 + t / 600) * s * 0.3, feetY - s * (0.1 + k * 0.8), s * 0.05 * (1 - k * 0.5), 0, 7); ctx.fill(); }
  ctx.restore();
}
// créature en image fixe (dessinée tournée vers la droite)
function drawCustomCreature(ctx, im, cx, feetY, s, o) {
  const t = (o.t || 0) / 1000;
  const size = s * 0.95 * (o.scale || 1);
  const r = size / Math.max(im.naturalWidth, im.naturalHeight);
  const iw = im.naturalWidth * r, ih = im.naturalHeight * r;
  const bob = o.still ? 0 : (o.moving ? Math.abs(Math.sin(t * 12)) * s * 0.05 : Math.sin(t * 2.4) * s * 0.015);
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.translate(cx, feetY - bob);
  if (o.dir && o.dir[0] < 0) ctx.scale(-1, 1);
  if (o.sleep) ctx.rotate(0.15);
  if (o.flash > 0) {
    const off = flashCanvas(Math.ceil(iw), Math.ceil(ih)); const oc = off.getContext("2d");
    oc.clearRect(0, 0, off.width, off.height); oc.globalCompositeOperation = "source-over"; oc.drawImage(im, 0, 0, iw, ih);
    oc.globalCompositeOperation = "source-atop"; oc.fillStyle = "rgba(255,255,255," + o.flash + ")"; oc.fillRect(0, 0, iw, ih);
    ctx.drawImage(off, 0, 0, iw, ih, -iw / 2, -ih, iw, ih);
  } else ctx.drawImage(im, -iw / 2, -ih, iw, ih);
  ctx.restore();
}
function drawShadow(ctx, cx, feetY, s, scale) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.ellipse(cx, feetY - s * 0.04, s * 0.3 * (scale || 1), s * 0.1 * (scale || 1), 0, 0, 7); ctx.fill();
}
// Portrait (pour dialogues / cartes) dans un canvas
function paintPortrait(canvas, mid, opts) {
  opts = opts || {};
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cw = canvas.clientWidth || canvas.width, ch = canvas.clientHeight || canvas.height;
  if (canvas.width !== Math.round(cw * dpr)) { canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr); }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  const spr = SPRITES[mid];
  const emo = opts.emotion || "Normal";
  // 1) portrait d'émotion importé (Happy.png, Crying.png…) · 2) planche de portraits (sprite_config.json)
  const ei = !MEDIA.noCustom && opts.emotion && mediaImg("emo." + mid + "." + emo);
  if (ei && !opts.body) { ctx.imageSmoothingEnabled = false; ctx.drawImage(ei, 0, 0, cw, ch); return; }
  const sheet = (!MEDIA.noCustom && mediaImg("psheet." + mid)) || (spr && spr.portrait && spr.portrait.complete && spr.portrait.naturalWidth ? spr.portrait : null);
  if (sheet && !opts.body) {
    ctx.imageSmoothingEnabled = false;
    const W = sheet.naturalWidth || sheet.width, H = sheet.naturalHeight || sheet.height;
    if (W >= SPRITE_CONFIG.portrait_size * 2) { const tl = emotionTile(emo, W, H); ctx.drawImage(sheet, tl.x, tl.y, tl.sz, tl.sz, 0, 0, cw, ch); }
    else { const side = Math.min(W, H); ctx.drawImage(sheet, 0, 0, side, side, 0, 0, cw, ch); }
    return;
  }
  const s = Math.min(cw, ch) * 1.25;
  drawCreature(ctx, mid, cw / 2, ch * 0.9, s, { t: opts.t || 0, dir: opts.dir || [0, 1], still: opts.still, moving: false, emo: opts.emotion || null });
}

// ------------------------------------------------------------
//  OBJETS
// ------------------------------------------------------------
function drawItem(ctx, id, cx, cy, s, tms) {
  const it = ITEMS[id]; if (!it) return;
  const cim = !MEDIA.noCustom && mediaImg("item." + id);
  if (cim) { drawContain(ctx, cim, cx, cy + Math.sin((tms || 0) / 300) * s * 0.02, s * 0.5); return; }
  const c = it.color; const r = s * 0.2;
  const b = Math.sin((tms || 0) / 300) * s * 0.02;
  ctx.save(); ctx.translate(cx, cy + b);
  ctx.lineWidth = Math.max(1, r * 0.15); ctx.strokeStyle = dark(c, 0.55);
  switch (it.icon) {
    case "berry":
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(-r * 0.35, r * 0.15, r * 0.6, 0, 7); ctx.arc(r * 0.35, r * 0.15, r * 0.6, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#4fbf5a"; ctx.beginPath(); ctx.ellipse(0, -r * 0.6, r * 0.5, r * 0.2, -0.4, 0, 7); ctx.fill();
      break;
    case "apple":
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, r * 0.1, r * (id === "grossepomme" ? 1.0 : 0.8), 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#6a4024"; ctx.beginPath(); ctx.moveTo(0, -r * 0.5); ctx.lineTo(r * 0.15, -r * 1.0); ctx.stroke();
      ctx.fillStyle = "#59c25e"; ctx.beginPath(); ctx.ellipse(r * 0.4, -r * 0.85, r * 0.35, r * 0.15, -0.3, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.15, r * 0.18, 0, 7); ctx.fill();
      break;
    case "seed":
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.5, r * 0.85, 0.5, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = light(c, 0.5); ctx.beginPath(); ctx.moveTo(-r * 0.2, r * 0.4); ctx.quadraticCurveTo(0, 0, r * 0.25, -r * 0.45); ctx.stroke();
      break;
    case "potion":
      ctx.fillStyle = "#e8eef8"; ctx.fillRect(-r * 0.25, -r * 1.0, r * 0.5, r * 0.4);
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.6); ctx.lineTo(-r * 0.8, r * 0.7); ctx.lineTo(r * 0.8, r * 0.7); ctx.lineTo(r * 0.3, -r * 0.6); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fillRect(-r * 0.45, r * 0.0, r * 0.18, r * 0.5);
      break;
    case "orb": {
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      g.addColorStop(0, "#ffffff"); g.addColorStop(1, c);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, 7); ctx.fill(); ctx.stroke();
      break;
    }
    case "coin":
      for (const [dx, dy] of [[-0.35, 0.35], [0.35, 0.3], [0, -0.05]]) {
        ctx.fillStyle = "#e0a823"; ctx.beginPath(); ctx.ellipse(r * dx, r * dy + r * 0.12, r * 0.55, r * 0.3, 0, 0, 7); ctx.fill();
        ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(r * dx, r * dy, r * 0.55, r * 0.3, 0, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.ellipse(r * dx - r * 0.15, r * dy - r * 0.06, r * 0.15, r * 0.07, 0, 0, 7); ctx.fill();
      }
      break;
    case "ribbon":
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-r * 0.9, -r * 0.55); ctx.lineTo(-r * 0.9, r * 0.45); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * 0.9, -r * 0.55); ctx.lineTo(r * 0.9, r * 0.45); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-r * 0.15, r * 0.1); ctx.lineTo(-r * 0.45, r * 0.95); ctx.lineTo(-r * 0.05, r * 0.75); ctx.moveTo(r * 0.15, r * 0.1); ctx.lineTo(r * 0.45, r * 0.95); ctx.lineTo(r * 0.05, r * 0.75); ctx.fill();
      ctx.fillStyle = light(c, 0.35); ctx.beginPath(); ctx.arc(0, 0, r * 0.25, 0, 7); ctx.fill(); ctx.stroke();
      break;
    case "scarf":
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -r * 0.35, r * 0.85, r * 0.35, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(r * 0.2, -r * 0.2); ctx.lineTo(r * 0.55, r * 0.9); ctx.lineTo(r * 0.05, r * 0.85); ctx.lineTo(-r * 0.1, -r * 0.1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = light(c, 0.45); ctx.beginPath(); ctx.moveTo(r * 0.12, r * 0.55); ctx.lineTo(r * 0.45, r * 0.6); ctx.stroke();
      break;
    case "badge":
      ctx.fillStyle = dark(c, 0.3); ctx.beginPath(); ctx.moveTo(-r * 0.35, r * 0.2); ctx.lineTo(-r * 0.5, r * 1.0); ctx.lineTo(-r * 0.1, r * 0.75); ctx.lineTo(r * 0.1, r * 0.75); ctx.lineTo(r * 0.5, r * 1.0); ctx.lineTo(r * 0.35, r * 0.2); ctx.fill();
      ctx.fillStyle = c; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.38 : r * 0.75; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr - r * 0.1); } ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    case "gem":
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, -r * 0.85); ctx.lineTo(r * 0.7, -r * 0.2); ctx.lineTo(0, r * 0.9); ctx.lineTo(-r * 0.7, -r * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.moveTo(0, -r * 0.85); ctx.lineTo(r * 0.25, -r * 0.2); ctx.lineTo(-r * 0.25, -r * 0.2); ctx.closePath(); ctx.fill();
      break;
    case "stone":
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-r * 0.8, r * 0.3); ctx.lineTo(-r * 0.4, -r * 0.5); ctx.lineTo(r * 0.5, -r * 0.6); ctx.lineTo(r * 0.85, r * 0.2); ctx.lineTo(r * 0.2, r * 0.65); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
  }
  ctx.restore();
}
function itemIconCanvas(id, px) {
  const c = document.createElement("canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = c.height = px * dpr; c.style.width = c.style.height = px + "px";
  const x = c.getContext("2d"); x.scale(dpr, dpr); drawItem(x, id, px / 2, px / 2, px * 1.6, 0);
  return c;
}

// ------------------------------------------------------------
//  TUILES (atlas pré-rendu par lieu)
// ------------------------------------------------------------
const TILESET_CACHE = {};
function getTileset(locId, T, dpr) {
  const th = themeOf(locId);
  const key = th.key + "|" + T + "|" + dpr;
  if (TILESET_CACHE[key]) return TILESET_CACHE[key];
  const P = Math.round(T * dpr);
  const cols = 8, n = 32;
  const cv = document.createElement("canvas");
  cv.width = cols * P; cv.height = Math.ceil(n / cols) * P;
  const c = cv.getContext("2d");
  const at = i => [(i % cols) * P, Math.floor(i / cols) * P];
  const rr = seeded(hashStr(th.key));
  // 0-3 sols de salle, 4 couloir, 5 glace, 6 dalle électrique, 7 escalier
  for (let v = 0; v < 4; v++) { const [x, y] = at(v); paintFloor(c, x, y, P, th, v, rr, false); }
  { const [x, y] = at(4); paintFloor(c, x, y, P, th, 9, rr, true); }
  { const [x, y] = at(5); paintIce(c, x, y, P); }
  { const [x, y] = at(6); paintFloor(c, x, y, P, th, 1, rr, false); paintElec(c, x, y, P); }
  { const [x, y] = at(7); paintFloor(c, x, y, P, th, 0, rr, false); paintStairs(c, x, y, P, th); }
  // 8 piège à pics, 9 téléport
  { const [x, y] = at(8); paintTrap(c, x, y, P, "spike"); }
  { const [x, y] = at(9); paintTrap(c, x, y, P, "tp"); }
  // 16-31 murs (masque NESO des voisins ouverts)
  for (let m = 0; m < 16; m++) { const [x, y] = at(16 + m); paintWall(c, x, y, P, th, m, rr); }
  const ts = { cv, P, at };
  TILESET_CACHE[key] = ts;
  return ts;
}
function paintFloor(c, x, y, P, th, v, rr, corridor) {
  c.fillStyle = corridor ? th.corridor : (v % 2 ? th.floor2 : th.floor);
  c.fillRect(x, y, P, P);
  const k = th.style || th.key;
  c.save(); c.beginPath(); c.rect(x, y, P, P); c.clip();
  if (k === "verdant") {
    c.fillStyle = light(th.floor, 0.16);
    for (let i = 0; i < 6; i++) { const gx = x + rr() * P, gy = y + rr() * P; c.fillRect(gx, gy, P * 0.045, P * 0.13); c.fillRect(gx + P * 0.06, gy + P * 0.03, P * 0.045, P * 0.1); }
    if (!corridor && v !== 1) {
      const fc = ["#fff6c9", "#ffd1e6", "#ffe066", "#d6ecff"][v];
      for (let i = 0; i < (v === 2 ? 3 : 1); i++) { const fx = x + P * (0.2 + rr() * 0.6), fy = y + P * (0.2 + rr() * 0.6); c.fillStyle = fc; for (let a = 0; a < 5; a++) { c.beginPath(); c.arc(fx + Math.cos(a * 1.26) * P * 0.035, fy + Math.sin(a * 1.26) * P * 0.035, P * 0.03, 0, 7); c.fill(); } c.fillStyle = "#f2b51f"; c.beginPath(); c.arc(fx, fy, P * 0.022, 0, 7); c.fill(); }
    }
    if (corridor) { c.fillStyle = "rgba(120,90,50,0.25)"; c.fillRect(x + P * 0.15, y, P * 0.7, P); }
  } else if (k === "forest") {
    c.fillStyle = light(th.floor, 0.12);
    for (let i = 0; i < 5; i++) { const gx = x + rr() * P, gy = y + rr() * P; c.fillRect(gx, gy, P * 0.05, P * 0.14); c.fillRect(gx + P * 0.06, gy + P * 0.03, P * 0.05, P * 0.11); }
    if (v === 2) { c.fillStyle = "#e8d76a"; c.beginPath(); c.arc(x + P * 0.7, y + P * 0.3, P * 0.05, 0, 7); c.fill(); }
  } else if (k === "cave") {
    c.fillStyle = dark(th.floor, 0.2);
    for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(x + rr() * P, y + rr() * P, P * 0.06, P * 0.04, 0, 0, 7); c.fill(); }
    c.fillStyle = light(th.floor, 0.12);
    for (let i = 0; i < 3; i++) c.fillRect(x + rr() * P, y + rr() * P, P * 0.04, P * 0.04);
  } else if (k === "ruins" || k === "arena") {
    c.strokeStyle = dark(th.floor, 0.35); c.lineWidth = Math.max(1, P * 0.04);
    c.strokeRect(x + P * 0.04, y + P * 0.04, P * 0.92, P * 0.92);
    if (!corridor) { c.strokeStyle = light(th.floor, 0.08); c.beginPath(); c.moveTo(x + P * 0.5, y + P * 0.04); c.lineTo(x + P * 0.5, y + P * 0.96); c.stroke(); }
    if (v === 3) { c.fillStyle = "rgba(111,243,255,0.25)"; c.fillRect(x + P * 0.2, y + P * 0.45, P * 0.6, P * 0.08); }
  } else if (k === "glacier") {
    c.fillStyle = "rgba(255,255,255,0.6)";
    for (let i = 0; i < 4; i++) c.fillRect(x + rr() * P, y + rr() * P, P * 0.04, P * 0.04);
    c.strokeStyle = "rgba(90,140,180,0.25)"; c.lineWidth = Math.max(1, P * 0.03);
    c.beginPath(); c.moveTo(x + rr() * P, y + rr() * P); c.lineTo(x + rr() * P, y + rr() * P); c.stroke();
  }
  if (corridor) { c.fillStyle = "rgba(0,0,0,0.08)"; c.fillRect(x, y, P, P); }
  c.restore();
}
function paintIce(c, x, y, P) {
  const g = c.createLinearGradient(x, y, x + P, y + P);
  g.addColorStop(0, "#e9fbff"); g.addColorStop(1, "#9fd8f2");
  c.fillStyle = g; c.fillRect(x, y, P, P);
  c.strokeStyle = "rgba(255,255,255,0.9)"; c.lineWidth = Math.max(1, P * 0.05);
  c.beginPath(); c.moveTo(x + P * 0.15, y + P * 0.35); c.lineTo(x + P * 0.4, y + P * 0.15); c.moveTo(x + P * 0.55, y + P * 0.8); c.lineTo(x + P * 0.85, y + P * 0.55); c.stroke();
  c.strokeStyle = "rgba(80,150,190,0.35)"; c.strokeRect(x + 0.5, y + 0.5, P - 1, P - 1);
}
function paintElec(c, x, y, P) {
  c.fillStyle = "#2a2f1a"; c.fillRect(x + P * 0.1, y + P * 0.1, P * 0.8, P * 0.8);
  c.strokeStyle = "#ffd23f"; c.lineWidth = Math.max(1, P * 0.07);
  c.beginPath(); c.moveTo(x + P * 0.55, y + P * 0.18); c.lineTo(x + P * 0.35, y + P * 0.52); c.lineTo(x + P * 0.6, y + P * 0.5); c.lineTo(x + P * 0.42, y + P * 0.84); c.stroke();
  c.strokeStyle = "rgba(255,210,63,0.5)"; c.strokeRect(x + P * 0.1, y + P * 0.1, P * 0.8, P * 0.8);
}
function paintStairs(c, x, y, P, th) {
  for (let i = 0; i < 4; i++) {
    c.fillStyle = mix(th.wallFace, "#000000", 0.2 + i * 0.12);
    c.fillRect(x + P * (0.12 + i * 0.04), y + P * (0.15 + i * 0.18), P * (0.76 - i * 0.08), P * 0.18);
    c.fillStyle = light(th.accent, 0.1); c.globalAlpha = 0.9 - i * 0.2;
    c.fillRect(x + P * (0.12 + i * 0.04), y + P * (0.15 + i * 0.18), P * (0.76 - i * 0.08), P * 0.04);
    c.globalAlpha = 1;
  }
  c.strokeStyle = th.accent; c.lineWidth = Math.max(1, P * 0.05); c.strokeRect(x + P * 0.08, y + P * 0.1, P * 0.84, P * 0.82);
}
function paintTrap(c, x, y, P, kind) {
  c.fillStyle = "rgba(0,0,0,0.35)"; c.beginPath(); c.arc(x + P / 2, y + P / 2, P * 0.36, 0, 7); c.fill();
  if (kind === "spike") {
    c.fillStyle = "#d9dde6";
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const px = x + P / 2 + Math.cos(a) * P * 0.16, py = y + P / 2 + Math.sin(a) * P * 0.16; c.beginPath(); c.moveTo(px - P * 0.07, py + P * 0.06); c.lineTo(px, py - P * 0.12); c.lineTo(px + P * 0.07, py + P * 0.06); c.fill(); }
  } else {
    c.strokeStyle = "#c39cff"; c.lineWidth = Math.max(1, P * 0.06);
    c.beginPath(); c.arc(x + P / 2, y + P / 2, P * 0.25, 0, 5); c.stroke();
    c.beginPath(); c.arc(x + P / 2, y + P / 2, P * 0.12, 1, 6); c.stroke();
  }
}
// masque : 1=N ouvert, 2=E, 4=S, 8=O
function paintWall(c, x, y, P, th, m, rr) {
  c.fillStyle = th.wall; c.fillRect(x, y, P, P);
  const k = th.style || th.key;
  c.save(); c.beginPath(); c.rect(x, y, P, P); c.clip();
  // texture de dessus
  if (k === "forest" || k === "verdant") {
    for (let i = 0; i < 4; i++) {
      c.fillStyle = i % 2 ? th.wallTop : dark(th.wallTop, 0.15);
      c.beginPath(); c.arc(x + P * (0.2 + rr() * 0.6), y + P * (0.2 + rr() * 0.5), P * (0.22 + rr() * 0.12), 0, 7); c.fill();
    }
  } else if (k === "cave") {
    c.fillStyle = th.wallTop;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(x + rr() * P, y + rr() * P * 0.7, P * 0.25, P * 0.15, rr(), 0, 7); c.fill(); }
  } else if (k === "ruins" || k === "arena") {
    c.strokeStyle = th.wallTop; c.lineWidth = Math.max(1, P * 0.04);
    c.strokeRect(x + P * 0.08, y + P * 0.08, P * 0.84, P * 0.5);
    if (m & 4) { c.fillStyle = "rgba(111,243,255,0.5)"; c.fillRect(x + P * 0.15, y + P * 0.3, P * 0.7, P * 0.05); }
  } else if (k === "glacier") {
    c.fillStyle = th.wallTop;
    c.beginPath(); c.moveTo(x + P * 0.1, y + P * 0.6); c.lineTo(x + P * 0.3, y + P * 0.1); c.lineTo(x + P * 0.5, y + P * 0.55); c.lineTo(x + P * 0.7, y + P * 0.05); c.lineTo(x + P * 0.9, y + P * 0.6); c.closePath(); c.fill();
    c.fillStyle = "rgba(255,255,255,0.45)"; c.beginPath(); c.moveTo(x + P * 0.3, y + P * 0.1); c.lineTo(x + P * 0.38, y + P * 0.35); c.lineTo(x + P * 0.25, y + P * 0.3); c.fill();
  }
  // bord haut éclairé si le sol est au-dessus
  if (m & 1) { c.fillStyle = light(th.wallTop, 0.25); c.fillRect(x, y, P, Math.max(1, P * 0.08)); }
  if (m & 2) { c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(x + P * 0.92, y, P * 0.08, P); }
  if (m & 8) { c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(x, y, P * 0.08, P); }
  // face avant si le sol est en dessous
  if (m & 4) {
    const fh = P * 0.42;
    const g = c.createLinearGradient(0, y + P - fh, 0, y + P);
    g.addColorStop(0, th.wallFace); g.addColorStop(1, dark(th.wallFace, 0.35));
    c.fillStyle = g; c.fillRect(x, y + P - fh, P, fh);
    c.fillStyle = light(th.wallTop, 0.1); c.fillRect(x, y + P - fh, P, Math.max(1, P * 0.05));
    if (k === "cave" || k === "ruins" || k === "arena") { c.fillStyle = "rgba(0,0,0,0.3)"; c.fillRect(x + P * 0.48, y + P - fh, Math.max(1, P * 0.04), fh); }
  }
  c.restore();
}
function wallMask(x, y) {
  let m = 0;
  if (!isWall(x, y - 1)) m |= 1;
  if (!isWall(x + 1, y)) m |= 2;
  if (!isWall(x, y + 1)) m |= 4;
  if (!isWall(x - 1, y)) m |= 8;
  return m;
}
