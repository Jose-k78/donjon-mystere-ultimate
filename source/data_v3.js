// ============================================================
//  DONNÉES v3 : objets (modifiables), équipements, raretés,
//  créatures légendaires, nouveaux donjons, table des types
// ============================================================
// kind : heal (value PV) · fullheal · food (value ventre) · fullfood · pp · revive · light · escape
//        throw (value dégâts) · sleepseed · teamheal (value %) · roomsleep · roomdmg (value) · equip (bonus) · treasure (value pièces) · money
DEFAULT_DATA.items = [
  { id: "baie", name: "Baie Vive", desc: "Rend 40 PV.", icon: "berry", color: "#ff5f86", w: 26, kind: "heal", value: 40, price: 30, shop: "objets" },
  { id: "baieor", name: "Baie Dorée", desc: "Rend tous les PV et soigne les statuts.", icon: "berry", color: "#ffcf3d", w: 4, kind: "fullheal", price: 260, rare: true, shop: "objets" },
  { id: "pomme", name: "Pomme Sylve", desc: "Remplit le ventre de 50.", icon: "apple", color: "#ff5546", w: 14, kind: "food", value: 50, price: 25, shop: "objets" },
  { id: "grossepomme", name: "Grosse Pomme", desc: "Remplit tout le ventre.", icon: "apple", color: "#ffa23a", w: 4, kind: "fullfood", price: 70, shop: "objets" },
  { id: "graine", name: "Graine de Vie", desc: "Relève automatiquement un membre K.O.", icon: "seed", color: "#7ce38a", w: 5, kind: "revive", price: 220, rare: true, shop: "objets" },
  { id: "elixir", name: "Élixir Bleu", desc: "Restaure les PP de toutes les capacités.", icon: "potion", color: "#58b6ff", w: 8, kind: "pp", price: 80, shop: "objets" },
  { id: "caillou", name: "Caillou", desc: "À lancer : 20 dégâts en ligne droite.", icon: "stone", color: "#b9b2a6", w: 12, kind: "throw", value: 20, throw: true, price: 15, shop: "objets" },
  { id: "grainesom", name: "Graine Sommeil", desc: "À lancer : endort la première cible en ligne.", icon: "seed", color: "#8fa3ff", w: 7, kind: "sleepseed", throw: true, price: 60, shop: "objets" },
  { id: "orbefuite", name: "Orbe Fuite", desc: "Fait sortir l’équipe du donjon en gardant le sac.", icon: "orb", color: "#c39cff", w: 4, kind: "escape", price: 150, shop: "orbes" },
  { id: "orbelum", name: "Orbe Lumière", desc: "Révèle le plan de l’étage.", icon: "orb", color: "#fff1a1", w: 6, kind: "light", price: 90, shop: "orbes" },
  { id: "orbesoin", name: "Orbe Soin", desc: "Rend la moitié des PV à toute l’équipe.", icon: "orb", color: "#7ce38a", w: 3, kind: "teamheal", value: 50, price: 180, shop: "orbes" },
  { id: "orbetorpeur", name: "Orbe Torpeur", desc: "Endort tous les ennemis de la salle.", icon: "orb", color: "#8fa3ff", w: 3, kind: "roomsleep", price: 160, shop: "orbes" },
  { id: "orbefoudre", name: "Orbe Foudre", desc: "Frappe tous les ennemis de la salle (30 dégâts).", icon: "orb", color: "#ffd23f", w: 3, kind: "roomdmg", value: 30, price: 200, shop: "orbes" },
  { id: "rubanrouge", name: "Ruban Rouge", desc: "À équiper : +4 en attaque.", icon: "ribbon", color: "#ff5f6d", w: 2, kind: "equip", bonus: { attack: 4 }, price: 240, shop: "objets" },
  { id: "foulardbleu", name: "Foulard Bleu", desc: "À équiper : +4 en défense.", icon: "scarf", color: "#58b6ff", w: 2, kind: "equip", bonus: { defense: 4 }, price: 240, shop: "objets" },
  { id: "badgeeclair", name: "Badge Éclair", desc: "À équiper : +4 en vitesse.", icon: "badge", color: "#ffd23f", w: 2, kind: "equip", bonus: { speed: 4 }, price: 240, shop: "objets" },
  { id: "rubanvital", name: "Ruban Vital", desc: "À équiper : +15 PV max.", icon: "ribbon", color: "#7ce38a", w: 2, kind: "equip", bonus: { hp: 15 }, price: 260, shop: "objets" },
  { id: "foulardpro", name: "Foulard Pro", desc: "À équiper : +3 attaque, +3 défense.", icon: "scarf", color: "#c39cff", w: 1, kind: "equip", bonus: { attack: 3, defense: 3 }, price: 420, rare: true },
  { id: "badgeroyal", name: "Badge Royal", desc: "À équiper : +3 partout et +10 PV max.", icon: "badge", color: "#ffb347", w: 0, kind: "equip", bonus: { attack: 3, defense: 3, speed: 3, hp: 10 }, price: 900, rare: true },
  { id: "cristal", name: "Cristal Étoile", desc: "Un trésor rare. Se revend 500 pièces.", icon: "gem", color: "#a3ecff", w: 1, kind: "treasure", value: 500, price: 1000, rare: true },
  { id: "or", name: "Pièces", desc: "De l’argent, ramassé automatiquement.", icon: "coin", color: "#ffcf3d", w: 16, kind: "money" }
];
const ITEM_KINDS = { heal: "Soin (PV)", fullheal: "Soin complet", food: "Nourriture (ventre)", fullfood: "Ventre plein", pp: "Restaure les PP", revive: "Relève un K.O.", light: "Révèle l’étage", escape: "Sortie du donjon", throw: "À lancer (dégâts)", sleepseed: "À lancer (endort)", teamheal: "Soin de l’équipe (%)", roomsleep: "Endort la salle", roomdmg: "Dégâts dans la salle", equip: "Équipement (bonus)", treasure: "Trésor (revente)", money: "Pièces" };
const ITEM_ICONS = ["berry", "apple", "seed", "potion", "orb", "stone", "coin", "ribbon", "scarf", "badge", "gem"];
// Rareté des créatures : plus elle est rare, plus elle est forte et rare à croiser
const RARITY = { 1: { name: "Commune", mul: 1, weight: 100, recruit: 18, col: "#cbbfa6" }, 2: { name: "Rare", mul: 1.14, weight: 20, recruit: 8, col: "#58b6ff" }, 3: { name: "Légendaire", mul: 1.32, weight: 3, recruit: 3, col: "#ffcf3d" } };
for (const m of DEFAULT_DATA.monsters) { if (["007", "008", "010", "023"].includes(m.id)) m.rarity = 2; }
DEFAULT_DATA.monsters.push(
  { id: "031", name: "Astralion", types: ["Fée", "Feu"], hp: 70, attack: 34, defense: 26, speed: 28, moves: ["A29", "A22", "A20", "A01"], description: "Lion d’étoiles dont la crinière s’allume à la tombée de la nuit. On dit qu’il veille sur les explorateurs perdus.", form: "fox", stage: 3, rarity: 3, recruit_rate: 3 },
  { id: "032", name: "Abyssoral", types: ["Eau", "Ténèbres"], hp: 78, attack: 32, defense: 30, speed: 20, moves: ["A09", "A21", "A28", "A01"], description: "Serpent des profondeurs qui dort sous les ruines englouties. Son chant fait monter la marée.", form: "fish", stage: 3, rarity: 3, recruit_rate: 3 },
  { id: "033", name: "Chronoplume", types: ["Vol", "Acier"], hp: 66, attack: 30, defense: 28, speed: 34, moves: ["A25", "A37", "A11", "A01"], description: "Oiseau d’acier aux ailes d’horloge. Chaque battement fait reculer le temps d’une seconde.", form: "bird", stage: 3, rarity: 3, recruit_rate: 3 }
);
// ---- nouveaux donjons : moitié classiques, moitié originaux ----
DEFAULT_DATA.locations.push(
  { id: "L05", name: "Mont Braise", theme: ["Feu", "Roche"], difficulty: 2, common_monsters: ["012", "006", "026", "016", "002"], description: "Un volcan endormi. La roche est chaude sous les pattes.", floors: 6, boss: "026" },
  { id: "L06", name: "Plage Corail", theme: ["Eau", "Roche"], difficulty: 2, common_monsters: ["013", "022", "029", "007", "017"], description: "Des grottes marines creusées dans le corail.", floors: 5, boss: "022" },
  { id: "L07", name: "Marais Brumeux", theme: ["Eau", "Plante", "Ténèbres"], difficulty: 2, common_monsters: ["029", "014", "027", "030", "001"], description: "Un marais où la brume cache les escaliers.", floors: 6, boss: "029" },
  { id: "L08", name: "Pic Venteux", theme: ["Vol", "Glace"], difficulty: 3, common_monsters: ["009", "017", "019", "021", "004"], description: "Une montagne balayée par le vent, jusqu’au sommet.", floors: 7, boss: "019" },
  { id: "L09", name: "Grotte Cristalline", theme: ["Roche", "Fée"], difficulty: 3, common_monsters: ["005", "016", "024", "018", "028"], description: "Des cristaux géants éclairent les galeries.", floors: 6, boss: "005" },
  { id: "L10", name: "Bibliothèque Engloutie", theme: ["Eau", "Spectre"], difficulty: 3, common_monsters: ["001", "023", "013", "007", "032"], description: "Une bibliothèque tombée sous la mer. Les livres murmurent encore.", floors: 7, boss: "023" },
  { id: "L11", name: "Horloge des Rêves", theme: ["Acier", "Fée"], difficulty: 3, common_monsters: ["024", "010", "018", "005", "015", "033"], description: "Une horloge géante où chaque étage est une heure différente.", floors: 7, boss: "010" },
  { id: "L12", name: "Jardin Renversé", theme: ["Plante", "Vol"], difficulty: 2, common_monsters: ["014", "027", "018", "025", "017"], description: "Un jardin suspendu la tête en bas, au-dessus des nuages.", floors: 6, boss: "018" },
  { id: "L13", name: "Cirque Abandonné", theme: ["Ténèbres", "Fée"], difficulty: 3, common_monsters: ["030", "021", "026", "011", "023"], description: "Un chapiteau désert où quelqu’un joue encore de la musique.", floors: 6, boss: "030" },
  { id: "L14", name: "Tour des Échos", theme: ["Spectre", "Électrique"], difficulty: 3, common_monsters: ["003", "015", "004", "023", "021", "031"], description: "Chaque pas résonne mille fois. Au sommet, quelque chose écoute.", floors: 8, boss: "003" }
);
Object.assign(THEMES, {
  L05: { key: "volcano", style: "cave", floor: "#6e4636", floor2: "#744b39", corridor: "#5e3c2e", wall: "#2b130d", wallTop: "#7a2f1c", wallFace: "#1a0b07", accent: "#ff9a4a", quake: true, bg: "#140705" },
  L06: { key: "coral", style: "arena", floor: "#d9c08e", floor2: "#dcc594", corridor: "#cdb380", wall: "#2f6f80", wallTop: "#ff8f8f", wallFace: "#1e4b57", accent: "#7ae3ff", bg: "#0c2530" },
  L07: { key: "marsh", style: "forest", floor: "#46553a", floor2: "#4a5a3d", corridor: "#3e4b33", wall: "#1c2617", wallTop: "#3c5230", wallFace: "#121a0f", accent: "#c7e38a", fog: true, bg: "#0b110a" },
  L08: { key: "peak", style: "cave", floor: "#9aa3ad", floor2: "#9fa8b2", corridor: "#8c959f", wall: "#3f4a57", wallTop: "#dfe7ef", wallFace: "#2a323c", accent: "#ffffff", bg: "#141a22" },
  L09: { key: "crystal", style: "cave", floor: "#4d4a6b", floor2: "#524f71", corridor: "#45425f", wall: "#211f36", wallTop: "#8f7fe0", wallFace: "#151326", accent: "#c8b6ff", bg: "#0c0b18" },
  L10: { key: "library", style: "ruins", floor: "#3a5a66", floor2: "#3d5e6a", corridor: "#34515c", wall: "#3b2a1f", wallTop: "#7a5636", wallFace: "#24190f", accent: "#9ff0ff", bg: "#081418" },
  L11: { key: "clock", style: "ruins", floor: "#6a5c3e", floor2: "#6e6041", corridor: "#5f5338", wall: "#2a2418", wallTop: "#c9a14a", wallFace: "#1a160e", accent: "#ffe08a", bg: "#120f08" },
  L12: { key: "garden", style: "verdant", floor: "#6b8f5a", floor2: "#70945e", corridor: "#628551", wall: "#4a2f63", wallTop: "#a77bd0", wallFace: "#2f1d40", accent: "#ffd1f0", bg: "#140c1c" },
  L13: { key: "circus", style: "arena", floor: "#7a3b45", floor2: "#7e3f49", corridor: "#6e343d", wall: "#2a1a35", wallTop: "#ffcf3d", wallFace: "#1a0f22", accent: "#ff7eb6", bg: "#12081a" },
  L14: { key: "echo", style: "ruins", floor: "#3e3a5a", floor2: "#423e5f", corridor: "#38344f", wall: "#16142a", wallTop: "#5d55a0", wallFace: "#0e0c1c", accent: "#b8a6ff", electric: true, bg: "#08071a" }
});
Object.assign(UNLOCKS, { L05: ["@ch2", "L02"], L06: ["@ch2", "L01"], L07: ["@ch2", "L01"], L08: ["@ch2", "L04"], L09: ["@ch2", "L02"], L10: ["@ch2", "L06"], L11: ["@ch2", "L03"], L12: ["@ch2", "L07"], L13: ["@ch2", "L05"], L14: ["@ch2", "L08", "L11"] });
// ---- table des types : ×1.5 très efficace, ×0.7 pas très efficace, ×0.4 presque sans effet ----
const TYPE_CHART3 = {
  "Normal": [[], ["Roche", "Acier"], ["Spectre"]],
  "Feu": [["Plante", "Glace", "Insecte", "Acier"], ["Feu", "Eau", "Roche"], []],
  "Eau": [["Feu", "Roche", "Terre"], ["Eau", "Plante"], []],
  "Plante": [["Eau", "Roche", "Terre"], ["Feu", "Plante", "Vol", "Insecte", "Acier"], []],
  "Électrique": [["Eau", "Vol"], ["Électrique", "Plante"], ["Terre"]],
  "Glace": [["Plante", "Terre", "Vol"], ["Feu", "Eau", "Glace", "Acier"], []],
  "Roche": [["Feu", "Glace", "Vol", "Insecte"], ["Terre", "Acier"], []],
  "Terre": [["Feu", "Électrique", "Roche", "Acier"], ["Plante", "Insecte"], ["Vol"]],
  "Vol": [["Plante", "Insecte"], ["Électrique", "Roche", "Acier"], []],
  "Insecte": [["Plante", "Ténèbres"], ["Feu", "Vol", "Spectre", "Acier", "Fée"], []],
  "Spectre": [["Spectre"], ["Ténèbres"], ["Normal"]],
  "Ténèbres": [["Spectre"], ["Ténèbres", "Fée"], []],
  "Acier": [["Glace", "Roche", "Fée"], ["Feu", "Eau", "Électrique", "Acier"], []],
  "Fée": [["Ténèbres", "Insecte"], ["Feu", "Acier"], []]
};
for (const t of TYPES) TYPE_CHART[t] = TYPE_CHART3[t];
const TYPE_MULT = { super: 1.5, resist: 0.7, weak: 0.4 };
