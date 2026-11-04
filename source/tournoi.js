// ============================================================
//  TOURNOI : 7 étages, 3 équipes adverses qui bougent en même temps
//  + matchs d'arène du mode libre
// ============================================================
function tourTeam(fac) { return R && R.tour ? R.tour.teams.find(t => t.fac === fac) : null; }
function tourMids(n, exclude) {
  const pool = DATA.monsters.filter(m => (m.rarity || 1) < 3).map(m => m.id).filter(id => !exclude.includes(id));
  const out = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  while (out.length < n) out.push(DATA.monsters[out.length % DATA.monsters.length].id);
  return out;
}
function makeRival(mid, lv, fac, teamName) {
  const u = makeUnit(mid, lv, "enemy");
  u.fac = fac; u.teamName = teamName; u.aware = true; u.asleep = false;
  return u;
}
function initTournament() {
  const lv = hero().lv;
  R.lvBase = lv;
  const used = G.team.map(u => u.mid).concat(G.thieves || []);
  const names = RIVAL_TEAM_NAMES.slice().sort(() => rnd() - 0.5);
  const teams = [];
  for (let k = 0; k < 2; k++) {
    const mids = tourMids(3, used); used.push(...mids);
    const fac = "t" + (k + 1);
    teams.push({
      fac, name: names[k].name, col: names[k].col, kind: "rival", floor: 1 + k, state: "in", onFloor: false, arrived: 0,
      bag: ["baie", "baie", rnd() < 0.6 ? "orbefuite" : "pomme"],
      members: mids.map((m, i) => makeRival(m, Math.max(1, lv + (i === 0 ? 0 : -1)), fac, names[k].name))
    });
  }
  const th = (G.thieves || tourMids(3, used)).map(id => MON[id] ? id : DATA.monsters[0].id);
  teams.push({
    fac: "t3", name: "Les voyous", col: "#c27cff", kind: "thieves", floor: 2, state: "in", onFloor: false, arrived: 0,
    bag: ["baie", "baieor"],
    members: th.map((m, i) => makeRival(m, Math.max(1, lv + (i === 0 ? 0 : -1)), "t3", "Les voyous"))
  });
  R.tour = { teams, log: [] };
  // cadeau du Roi à chaque équipe
  const gifts = [];
  for (const id of ["baie", "baie", "graine"]) if (G.bag.length < BAG_MAX) { G.bag.push(id); gifts.push(ITEMS[id].name); }
  if (gifts.length) msgNow({ t: "Cadeau du Roi à chaque équipe : " + gifts.join(", ") + " !", c: "good" });
}
// Place les équipes présentes à cet étage, loin du héros
function tourPopulateFloor(freeTileIn) {
  const h = hero();
  for (const team of R.tour.teams) {
    if (team.state !== "in" || team.floor !== R.floor || !team.members.length) continue;
    placeTeam(team, freeTileIn);
  }
}
function placeTeam(team, freeTileIn) {
  const h = hero();
  const rooms = R.rooms.slice().sort((a, b) => cheb({ x: b.x + (b.w >> 1), y: b.y + (b.h >> 1) }, h) - cheb({ x: a.x + (a.w >> 1), y: a.y + (a.h >> 1) }, h));
  const room = rooms[Math.min(rooms.length - 1, ri(0, 1))] || R.rooms[0];
  let placed = 0;
  for (const m of team.members) {
    let p = freeTileIn ? freeTileIn(room, true) : null;
    for (let k = 0; !p && k < 60; k++) {
      const x = room.x + ri(0, room.w - 1), y = room.y + ri(0, room.h - 1);
      if (!isWall(x, y) && !unitAt(x, y)) p = { x, y };
    }
    if (!p) continue;
    m.x = p.x; m.y = p.y; m.dir = pick(DIRS8); m.wp = null;
    R.enemies.push(m); placed++;
  }
  team.members = [];
  team.onFloor = placed > 0;
  team.arrived = R.turn || 0;
}
// Avant de changer d'étage : les équipes présentes retournent dans leur réserve
function tourStash() {
  if (!R || !R.tour) return;
  for (const team of R.tour.teams) {
    if (!team.onFloor) continue;
    const mates = R.enemies.filter(e => e.fac === team.fac);
    team.members = mates; team.onFloor = false;
    R.enemies = R.enemies.filter(e => e.fac !== team.fac);
    if (team.state === "in" && team.floor < R.floor + 1 && rnd() < 0.5 && team.floor < 7) team.floor++;
  }
}
function tourSay(text, important) {
  const t = fillTpl(text);
  R.tour.log.push(t);
  TL.note(() => { pushLog([{ t, c: "mv" }]); if (important) toast(t, 3200); });
}
function teamPower(units) { return units.reduce((s, m) => s + (m.lv + 4) * clamp(m.hp / maxHP(m), 0, 1), 0); }
function tourTeamLeaves(team, how) {
  const mates = R.enemies.filter(e => e.fac === team.fac);
  R.enemies = R.enemies.filter(e => e.fac !== team.fac);
  team.members = mates; team.onFloor = false;
  team.floor = Math.min(7, team.floor + 1);
  if (how === "orb") {
    TL.note(() => { for (const m of mates) if (isVisible(m.x, m.y)) FX.push({ k: "burst", x: m.x, y: m.y, col: "#c39cff", t0: performance.now(), dur: 420 }); sfx("tp"); });
    tourSay(TOUR_ANNOUNCES.rivalFled.replace("{team}", team.name).replace("{floor}", team.floor), true);
  } else if (mates.some(m => isVisible(m.x, m.y))) tourSay(TOUR_ANNOUNCES.descend.replace("{team}", team.name).replace("{floor}", team.floor));
}
function tourEliminate(team, byName) {
  team.members = []; team.onFloor = false;
  if (team.kind === "thieves") { team.state = "fled"; tourSay(TOUR_ANNOUNCES.thievesFled, true); }
  else {
    team.state = "out";
    if (byName === "us") { tourSay(TOUR_ANNOUNCES.weOut.replace("{loser}", team.name), true); G.money = (G.money || 0) + 50; R.money = (R.money || 0) + 50; }
    else tourSay(TOUR_ANNOUNCES.rivalOut.replace("{winner}", byName || "Une équipe").replace("{loser}", team.name).replace("{floor}", team.floor), true);
  }
  tourCheckDone();
}
function tourCheckDone() {
  if (R.tour.teams.every(t => t.state !== "in")) R.tourAllOut = true;
}
function tourOnKO(t, killer) {
  const team = tourTeam(t.fac); if (!team || R.tour.arena) return;
  if (R.enemies.some(e => e.fac === t.fac)) return;
  const by = !killer || killer.kind !== "enemy" ? "us" : (tourTeam(killer.fac) || {}).name;
  tourEliminate(team, by);
}
// Simulation des équipes qui ne sont pas à notre étage
function tourTick() {
  const T = R.tour; if (!T || T.arena) return;
  for (const team of T.teams) {
    if (team.state !== "in" || team.onFloor) continue;
    // repos et soins
    if (R.turn % 5 === 0) for (const m of team.members) m.hp = Math.min(maxHP(m), m.hp + 1);
    for (const m of team.members) if (m.hp < maxHP(m) * 0.4) { const bi = team.bag.findIndex(x => x === "baie" || x === "baieor"); if (bi >= 0) { const id = team.bag.splice(bi, 1)[0]; m.hp = id === "baieor" ? maxHP(m) : Math.min(maxHP(m), m.hp + 40); } }
    // progression dans les étages
    const behind = team.floor < R.floor;
    const p = R.floor === 7 ? 1 / 10 : behind ? 1 / 14 : 1 / 45;
    if (team.floor < 7 && rnd() < p) {
      team.floor++;
      if (team.floor === R.floor) {
        placeTeam(team, null);
        tourSay("📣 " + team.name + " arrive à ton étage !");
      }
    }
  }
  // affrontements entre équipes hors de notre étage
  const off = T.teams.filter(t => t.state === "in" && !t.onFloor && t.members.length);
  for (let i = 0; i < off.length; i++) for (let j = i + 1; j < off.length; j++) {
    const a = off[i], b = off[j];
    if (a.floor !== b.floor || a.state !== "in" || b.state !== "in" || rnd() > 1 / 40) continue;
    const pa = teamPower(a.members) * (0.7 + rnd() * 0.6), pb = teamPower(b.members) * (0.7 + rnd() * 0.6);
    const [win, lose] = pa >= pb ? [a, b] : [b, a];
    const ratio = Math.max(pa, pb) / Math.max(1, Math.min(pa, pb));
    for (const m of win.members) m.hp = Math.max(1, m.hp - Math.round(maxHP(m) * (0.15 + rnd() * 0.3)));
    if (ratio > 1.25 || lose.members.length <= 1) tourEliminate(lose, win.name);
    else {
      lose.members.sort((x, y) => x.hp - y.hp); lose.members.shift();
      for (const m of lose.members) m.hp = Math.max(1, Math.round(m.hp * 0.5));
      const oi = lose.bag.indexOf("orbefuite");
      if (oi >= 0 && lose.floor < 7) { lose.bag.splice(oi, 1); lose.floor++; tourSay(TOUR_ANNOUNCES.rivalFled.replace("{team}", lose.name).replace("{floor}", lose.floor)); if (lose.floor === R.floor) placeTeam(lose, null); }
      else tourSay("📣 " + win.name + " et " + lose.name + " se sont affrontées à l’étage " + lose.floor + " !");
    }
  }
  tourCheckDone();
}
// IA d'un membre d'équipe rivale
function rivalAct(u) {
  if (!canActStatus(u)) return;
  const team = tourTeam(u.fac) || { bag: [], floor: 7, kind: "rival" };
  const mates = R.enemies.filter(e => e.fac === u.fac);
  const foes = hostilesOf(u).filter(f => cheb(f, u) <= 9 && (sameArea(f, u) || cheb(f, u) <= 3));
  const seen = unitVisible(u);
  // 1. se soigner
  if (u.hp < maxHP(u) * 0.38) {
    const bi = team.bag.findIndex(x => x === "baie" || x === "baieor");
    if (bi >= 0) {
      const id = team.bag.splice(bi, 1)[0]; const b = u.hp;
      u.hp = id === "baieor" ? maxHP(u) : Math.min(maxHP(u), u.hp + 40);
      if (seen) { msg(N(u), " mange ", { t: ITEMS[id].name, c: "it" }, " !"); TL.note(() => { popup(u, "+" + (u.hp - b), "#7ce38a"); sfx("heal"); }); }
      return;
    }
    const healId = unitMoves(u).find(id => (u.pp[id] || 0) > 0 && ATK[id].effect === "heal");
    if (healId) { doAttack(u, ATK[healId], u.dir); return; }
  }
  // 2. fuir si l'équipe est dépassée
  if (foes.length && !R.tour.arena) {
    const myPow = teamPower(mates), foePow = teamPower(foes);
    if (myPow < foePow * 0.45 && u.hp < maxHP(u) * 0.5) {
      const oi = team.bag.indexOf("orbefuite");
      if (oi >= 0 && team.floor < 7) { team.bag.splice(oi, 1); if (seen) msg(N(u), " utilise ", { t: "Orbe Fuite", c: "it" }, " !"); tourTeamLeaves(team, "orb"); return; }
      const f = foes.slice().sort((a, b) => cheb(a, u) - cheb(b, u))[0];
      let best = null, bd = cheb(u, f);
      for (const d of DIRS8) {
        const nx = u.x + d[0], ny = u.y + d[1];
        if (isWall(nx, ny) || !diagOK(u.x, u.y, d) || unitAt(nx, ny)) continue;
        const dd = cheb({ x: nx, y: ny }, f); if (dd > bd) { bd = dd; best = d; }
      }
      if (best && rnd() < 0.7) { stepUnit(u, best); return; }
    }
  }
  // 3. attaquer au contact
  const adj = adjacentFoes(u);
  if (adj.length) {
    const ours = adj.filter(a => a[0].kind !== "enemy");
    const [t, d] = ours.length ? pick(ours) : adj.sort((a, b) => a[0].hp - b[0].hp)[0];
    doAttack(u, chooseMove(u, t, false), d);
    return;
  }
  // 4. traquer
  if (foes.length) {
    if (rnd() < 0.4 && tryLineMove(u, foes)) return;
    const f = foes.slice().sort((a, b) => cheb(a, u) - cheb(b, u))[0];
    if (stepUnit(u, stepToward(u, f.x, f.y, { maxD: 16, ignoreAllies: false }))) return;
  }
  // 5. suivre le chef d'équipe
  const leader = mates[0];
  if (leader && u !== leader) { if (cheb(u, leader) > 1) stepUnit(u, stepToward(u, leader.x, leader.y, { maxD: 40 })); return; }
  // 6. le chef explore : au dernier étage il cherche le héros, sinon il finit par descendre
  if (R.tour.arena) { const h = hero(); stepUnit(u, stepToward(u, h.x, h.y, { maxD: 40 })); return; }
  if (R.floor >= 7 || team.floor >= 7) { const h = hero(); stepUnit(u, stepToward(u, h.x, h.y, { maxD: 60 })); return; }
  if (R.stairs && R.turn - (team.arrived || 0) > 30) {
    if (u.x === R.stairs.x && u.y === R.stairs.y) { tourTeamLeaves(team, "stairs"); return; }
    if (stepUnit(u, stepToward(u, R.stairs.x, R.stairs.y, { maxD: 60 }))) return;
  }
  if (!u.wp || (u.wp.x === u.x && u.wp.y === u.y) || rnd() < 0.05) { const r = pick(R.rooms); u.wp = { x: r.x + ri(0, r.w - 1), y: r.y + ri(0, r.h - 1) }; }
  if (!stepUnit(u, stepToward(u, u.wp.x, u.wp.y, { maxD: 50 }))) u.wp = null;
}
// ---- Arène (mode libre) ----
function initArena() {
  R.arena = true;
  const n = clamp(G.story.arenaN || 1, 1, 3);
  R.lvBase = hero().lv + (n === 1 ? 1 : 0);
  const used = G.team.map(u => u.mid);
  const names = RIVAL_TEAM_NAMES.slice().sort(() => rnd() - 0.5);
  R.tour = { arena: true, log: [], teams: [] };
  R.arenaMids = [];
  for (let k = 0; k < n; k++) {
    R.tour.teams.push({ fac: "arena" + (k + 1), name: names[k].name, col: names[k].col, kind: "rival", floor: 1, state: "in", onFloor: true, bag: ["baie"], members: [] });
    const mids = tourMids(3, used); used.push(...mids); R.arenaMids.push(mids);
  }
}
function arenaPopulate() {
  const w = R.w, h = R.h;
  const spots = [[w >> 1, 5], [5, (h >> 1) - 1], [w - 6, (h >> 1) - 1]];
  R.tour.teams.forEach((team, k) => {
    const [cx, cy] = spots[k];
    R.arenaMids[k].forEach((mid, i) => {
      const u = makeRival(mid, R.lvBase + (i === 0 ? 1 : 0), team.fac, team.name);
      const dx = k === 0 ? (i - 1) * 3 : 0, dy = k === 0 ? 0 : (i - 1) * 2;
      u.x = clamp(cx + dx, 4, w - 5); u.y = clamp(cy + dy, 4, h - 5); u.dir = [0, 1]; u.aware = true;
      if (isWall(u.x, u.y) || unitAt(u.x, u.y)) { u.x = cx; u.y = cy + i; }
      R.enemies.push(u);
    });
  });
}
// Panneau du tournoi dans le HUD
function tourHudText() {
  if (!R || !R.tour || R.tour.arena) return null;
  return R.tour.teams.map(t => ({ name: t.name, col: t.col, st: t.state === "out" ? "✗" : t.state === "fled" ? "Fuite" : (t.onFloor ? "ICI" : "É" + t.floor), here: t.onFloor && t.state === "in" }));
}
