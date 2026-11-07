// ============================================================
//  ROUE D'ACTIONS : maintenir le doigt sur soi (ou le bouton Menu)
//  Glisser vers une case puis lâcher, ou toucher une case.
// ============================================================
const WHEEL = { open: false, drag: false, cx: 0, cy: 0, opts: [], hover: -1, t0: 0 };
function wheelOptions() {
  if (WHEEL.sub === "orders" && typeof orderWheelOptions === "function") return orderWheelOptions();
  const h = hero();
  const o = [];
  if (R && R.ctf && h.ko) {   // Capture de Relique : héros K.O., on regarde l'équipe
    o.push({ k: "orders", label: "Ordres", sub: teamOrderText(), col: "#8cf0aa", fn: () => openWheel(WHEEL.cx, WHEEL.cy, false, "orders") });
    o.push({ k: "team", label: "Équipe", sub: G.team.length + " membres", col: "#7adcff", fn: openTeam });
    o.push({ k: "fast", label: R.ctf.fast ? "Vitesse normale" : "Accélérer", sub: R.ctf.fast ? "×1" : "×4", col: "#ffd166", fn: () => { R.ctf.fast = !R.ctf.fast; } });
    o.push({ k: "menu", label: "Menu", sub: "Plus…", col: "#d6c6ff", fn: openHeroMenu });
    return o;
  }
  o.push({ k: "atk", label: "Attaque", sub: "∞", col: "#ffb347", fn: () => dungeonAct(() => heroAttack(null)) });
  for (const id of unitMoves(h)) {
    const mv = ATK[id]; const pp = h.pp[id] || 0;
    o.push({ k: "mv", label: mv.name, sub: pp + "/" + mv.pp, col: TYPE_COLORS[mv.type] || "#999", disabled: pp <= 0, fn: () => dungeonAct(() => heroAttack(id)) });
  }
  o.push({ k: "bag", label: "Sac", sub: G.bag.length + "/" + BAG_MAX, col: "#c9a46a", fn: () => openBag(true) });
  const it = itemUnderHero();
  if (it) o.push({ k: "pick", label: "Ramasser", sub: it.id === "or" ? (it.amount || 0) + " p." : ITEMS[it.id].name, col: "#7ce3ff", fn: () => dungeonAct(() => pickUpHere()) });
  if (heroOnStairs()) o.push({ k: "stairs", label: "Escalier", sub: "Descendre", col: "#ffd166", fn: () => askStairs() });
  if (G.team.length > 1 && typeof orderWheelOptions === "function") o.push({ k: "orders", label: "Ordres", sub: teamOrderText(), col: "#8cf0aa", fn: () => openWheel(WHEEL.cx, WHEEL.cy, false, "orders") });
  o.push({ k: "team", label: "Équipe", sub: G.team.length + " membres", col: "#7adcff", fn: openTeam });
  if (typeof canCallOath === "function" && canCallOath()) o.push({ k: "oath", label: "Serment", sub: "Appeler", col: "#ffd166", fn: openOathCall });
  o.push({ k: "wait", label: "Attendre", sub: "1 tour", col: "#b8c0d0", fn: () => dungeonAct(() => true) });
  o.push({ k: "menu", label: "Menu", sub: "Plus…", col: "#d6c6ff", fn: openHeroMenu });
  return o;
}
function openWheel(cx, cy, drag, sub) {
  if (!R || DG.transition || SHEET_OPEN || DIALOG_OPEN) return;
  const wh = $("#wheel"); const ring = $("#wheelRing");
  WHEEL.sub = sub || null;
  WHEEL.opts = wheelOptions();
  const n = WHEEL.opts.length;
  const vw = window.innerWidth, vh = window.innerHeight;
  const rad = clamp(Math.min(vw, vh) * 0.31, 92, 128);
  const bs = clamp(rad * 0.62, 56, 74);
  WHEEL.rad = rad;
  WHEEL.cx = clamp(cx, rad + bs / 2 + 6, vw - rad - bs / 2 - 6);
  WHEEL.cy = clamp(cy, rad + bs / 2 + 60, vh - rad - bs / 2 - 10);
  WHEEL.drag = !!drag; WHEEL.hover = -1; WHEEL.open = true; WHEEL.t0 = performance.now();
  ring.replaceChildren();
  ring.style.left = WHEEL.cx + "px"; ring.style.top = WHEEL.cy + "px";
  ring.style.setProperty("--rad", rad + "px"); ring.style.setProperty("--bs", bs + "px");
  const center = el("button", "wh-center", "×"); center.type = "button"; center.setAttribute("aria-label", "Fermer la roue");
  center.onclick = e => { e.stopPropagation(); closeWheel(); };
  ring.append(center);
  WHEEL.opts.forEach((o, i) => {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / n);
    o.a = a;
    const b = el("button", "wh-opt" + (o.disabled ? " off" : "")); b.type = "button";
    b.style.setProperty("--tc", o.col);
    b.style.transform = `translate(${Math.cos(a) * rad}px, ${Math.sin(a) * rad}px)`;
    b.append(el("b", null, o.label), el("small", null, o.sub || ""));
    b.disabled = !!o.disabled;
    b.onclick = e => { e.stopPropagation(); chooseWheel(i); };
    o.btn = b;
    ring.append(b);
  });
  wh.hidden = false;
  wh.classList.toggle("dragging", WHEEL.drag);
  sfx("tap");
  if (navigator.vibrate) { try { navigator.vibrate(12); } catch (_) { } }
}
function closeWheel() {
  WHEEL.open = false; WHEEL.drag = false; WHEEL.hover = -1;
  const wh = $("#wheel"); if (wh) wh.hidden = true;
}
function wheelHover(px, py) {
  if (!WHEEL.open) return;
  const dx = px - WHEEL.cx, dy = py - WHEEL.cy, d = Math.hypot(dx, dy);
  let idx = -1;
  if (d > WHEEL.rad * 0.42) {
    const n = WHEEL.opts.length;
    let a = Math.atan2(dy, dx) + Math.PI / 2;
    a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    idx = Math.round(a / (Math.PI * 2 / n)) % n;
    if (WHEEL.opts[idx].disabled) idx = -1;
  }
  if (idx !== WHEEL.hover) {
    WHEEL.hover = idx;
    WHEEL.opts.forEach((o, i) => o.btn.classList.toggle("hov", i === idx));
    if (idx >= 0 && navigator.vibrate) { try { navigator.vibrate(6); } catch (_) { } }
  }
}
function wheelRelease() {
  if (!WHEEL.open) return;
  if (WHEEL.hover >= 0) { chooseWheel(WHEEL.hover); return; }
  // lâché au centre : la roue reste ouverte, on peut toucher une case
  WHEEL.drag = false; $("#wheel").classList.remove("dragging");
}
function chooseWheel(i) {
  const o = WHEEL.opts[i]; if (!o || o.disabled) return;
  closeWheel();
  sfx("tap");
  o.fn();
}
function setupWheel() {
  const wh = $("#wheel");
  wh.addEventListener("click", e => { if (e.target === wh) closeWheel(); });
}
