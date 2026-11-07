// ============================================================
//  ORDRES AUX ALLIÉS (tout le jeu)
//  Roue → « Ordres » : Nous suivre · Attaquer · Ne plus bouger
//  (+ Défendre la base en Capture de Relique). Maintenir un allié : son ordre à lui.
//  Donner un ordre ne coûte pas de tour.
// ============================================================
const ALLY_ORDERS = {
  suivre: { label: "Nous suivre", short: "Suivre", col: "#7adcff", icon: "➜" },
  attaquer: { label: "Attaquer", short: "Attaquer", col: "#ff8a6a", icon: "⚔" },
  rester: { label: "Ne plus bouger", short: "Rester", col: "#c9d2e0", icon: "■" },
  defendre: { label: "Défendre la base", short: "Défendre", col: "#8cf0aa", icon: "⛨", ctf: true }
};
function orderList() { return Object.keys(ALLY_ORDERS).filter(k => !ALLY_ORDERS[k].ctf || (R && R.ctf)); }
function orderLabel(k) {
  if (R && R.ctf && k === "attaquer") return "Prendre la relique";
  return (ALLY_ORDERS[k] || ALLY_ORDERS.suivre).label;
}
function orderOf(u) {
  if (!u) return "suivre";
  if (R && R.ctf) return u.ctfOrder || "attaquer";
  return ALLY_ORDERS[u.order] && !ALLY_ORDERS[u.order].ctf ? u.order : "suivre";
}
function setOrder(u, k) {
  if (!u || !ALLY_ORDERS[k]) return;
  if (R && R.ctf) u.ctfOrder = k; else u.order = k;
}
// alliés concernés (les K.O. de la Capture de Relique gardent l'ordre pour leur retour)
function orderAllies() { return G.team.slice(1).filter(u => u && (R && R.ctf ? true : !u.ko && u.hp > 0)); }
function teamOrderKey() {
  const al = orderAllies(); if (!al.length) return null;
  const k = orderOf(al[0]);
  return al.every(u => orderOf(u) === k) ? k : "mixte";
}
function teamOrderText() { const k = teamOrderKey(); return !k ? "" : k === "mixte" ? "Mixte" : (ALLY_ORDERS[k].short); }
function giveOrder(k, units) {
  const list = units || orderAllies(); if (!list.length) return;
  for (const u of list) {
    setOrder(u, k);
    if (R && R.ctf) u.ctfAuto = false;   // ordre donné par le joueur : on n'y touche plus
    u.wp = null; u.hold = null;
    if (R && !u.ko && u.hp > 0) TL.note(() => popup(u, ALLY_ORDERS[k].icon, ALLY_ORDERS[k].col, true));
  }
  const who = list.length === 1 ? unitName(list[0]) : "L’équipe";
  msgNow({ t: "Ordre", c: "mv" }, " · " + who + " : " + orderLabel(k) + ".");
  toast(who + " : " + orderLabel(k), 1600);
  if (navigator.vibrate) { try { navigator.vibrate(10); } catch (_) { } }
  if (typeof Store !== "undefined" && !(R && R.ctf)) Store.saveGame(G);
}
// sous-roue des ordres
function orderWheelOptions() {
  const cur = teamOrderKey();
  const o = orderList().map(k => ({ k: "ord-" + k, label: orderLabel(k), sub: cur === k ? "✓ en cours" : "Toute l’équipe", col: ALLY_ORDERS[k].col, fn: () => giveOrder(k) }));
  o.push({ k: "back", label: "Retour", sub: "Roue", col: "#b8c0d0", fn: () => openWheel(WHEEL.cx, WHEEL.cy, false) });
  return o;
}
// bloc « Ordre » dans la fiche d'un allié (maintenir l'allié)
function orderPicker(u, after) {
  const box = el("div", "order-pick");
  box.append(el("h4", "fld-h", "Ordre pour " + unitName(u)));
  const row = el("div", "order-row");
  for (const k of orderList()) {
    const b = el("button", "btn small" + (orderOf(u) === k ? " primary" : ""), orderLabel(k)); b.type = "button";
    b.style.setProperty("--oc", ALLY_ORDERS[k].col);
    b.onclick = () => { sfx("tap"); giveOrder(k, [u]); if (after) after(); };
    row.append(b);
  }
  box.append(row);
  return box;
}
// ---------- comportement des alliés selon l'ordre (hors Capture de Relique) ----------
// renvoie true si l'ordre a décidé de l'action du tour
function allyOrderAct(p) {
  const ord = orderOf(p);
  if (ord === "rester") {
    const foes = R.enemies.filter(e => !e.dormant && cheb(e, p) <= 5);
    if (foes.length && rnd() < 0.7 && tryLineMove(p, foes)) return true;
    return true;   // ne bouge pas
  }
  if (ord === "attaquer") {
    const foes = R.enemies.filter(e => !e.dormant && cheb(e, p) <= 14 && (isVisible(e.x, e.y) || cheb(e, p) <= 8 || sameArea(e, p)));
    if (foes.length) {
      if (rnd() < 0.4 && tryLineMove(p, foes)) return true;
      foes.sort((a, b) => cheb(a, p) - cheb(b, p));
      if (stepUnit(p, stepToward(p, foes[0].x, foes[0].y, { maxD: 30 }))) return true;
    }
    return false;  // personne à attaquer : il suit l'équipe
  }
  return false;
}
