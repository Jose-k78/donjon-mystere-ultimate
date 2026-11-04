// ============================================================
//  DONNÉES PAR DÉFAUT — reprises de ton prototype Godot
//  (monsters.json, attacks.json, locations.json)
//  Champs optionnels ajoutés : monsters[].form, attacks[].range,
//  locations[].floors / boss. Tout est modifiable dans l'Atelier.
// ============================================================
const DEFAULT_DATA = {
  monsters: [
    { id: "001", name: "Brumelune", types: ["Spectre", "Eau"], hp: 42, attack: 18, defense: 12, speed: 22, moves: ["A02", "A03", "A01"], description: "Petit esprit brumeux qui se cache dans les flaques", form: "ghost" },
    { id: "002", name: "Rocailleux", types: ["Roche", "Terre"], hp: 55, attack: 25, defense: 30, speed: 8, moves: ["A04", "A01", "A10"], description: "Créature de pierre qui roule en boule", form: "rock" },
    { id: "003", name: "Feuillombre", types: ["Plante", "Spectre"], hp: 38, attack: 20, defense: 15, speed: 18, moves: ["A05", "A02", "A01"], description: "Feuille qui marche et disparaît dans l’ombre", form: "leaf" },
    { id: "004", name: "Voltice", types: ["Électrique", "Vol"], hp: 35, attack: 28, defense: 10, speed: 30, moves: ["A06", "A11", "A01"], description: "Petite boule d’électricité qui virevolte", form: "orb" },
    { id: "005", name: "Gelamour", types: ["Glace", "Fée"], hp: 40, attack: 16, defense: 20, speed: 15, moves: ["A07", "A01", "A14"], description: "Créature de cristal qui brille dans le noir", form: "crystal" },
    { id: "006", name: "Flamèche", types: ["Feu", "Insecte"], hp: 32, attack: 24, defense: 11, speed: 25, moves: ["A08", "A01", "A15"], description: "Insecte au thorax enflammé", form: "bug" },
    { id: "007", name: "Abyssalin", types: ["Eau", "Ténèbres"], hp: 48, attack: 22, defense: 18, speed: 14, moves: ["A09", "A03", "A01"], description: "Poisson des profondeurs aux yeux blancs", form: "fish" },
    { id: "008", name: "Terremine", types: ["Terre", "Acier"], hp: 60, attack: 20, defense: 35, speed: 6, moves: ["A10", "A01", "A04"], description: "Créature qui s’enfouit et ressort en explosant", form: "mole" },
    { id: "009", name: "Ventisphère", types: ["Vol", "Normal"], hp: 36, attack: 19, defense: 13, speed: 28, moves: ["A11", "A01", "A02"], description: "Sphère de vent qui tourne sur elle-même", form: "swirl" },
    { id: "010", name: "Ombracier", types: ["Ténèbres", "Acier"], hp: 45, attack: 26, defense: 22, speed: 12, moves: ["A12", "A01", "A09"], description: "Armure vide habitée par une ombre", form: "armor" },
    // ---- nouvelles créatures de base (toutes originales) ----
    { id: "011", name: "Bouletin", types: ["Normal"], hp: 38, attack: 16, defense: 14, speed: 18, moves: ["A20", "A27", "A01"], description: "Petite boule de poils qui roule partout et adore les câlins.", form: "blob", stage: 1 },
    { id: "012", name: "Braisille", types: ["Feu"], hp: 36, attack: 20, defense: 12, speed: 22, moves: ["A22", "A20", "A01"], description: "Renardeau dont la queue se met à fumer quand il est content.", form: "fox", stage: 1 },
    { id: "013", name: "Gouttelin", types: ["Eau"], hp: 42, attack: 16, defense: 15, speed: 16, moves: ["A21", "A35", "A01"], description: "Petit phoque qui fait des bulles en dormant.", form: "seal", stage: 1 },
    { id: "014", name: "Pousseron", types: ["Plante"], hp: 40, attack: 15, defense: 17, speed: 14, moves: ["A23", "A31", "A01"], description: "Une pousse têtue qui grandit en écoutant la pluie.", form: "sprout", stage: 1 },
    { id: "015", name: "Étincelot", types: ["Électrique"], hp: 34, attack: 19, defense: 11, speed: 26, moves: ["A24", "A20", "A01"], description: "Ses moustaches crépitent dès qu’il court trop vite.", form: "fox", stage: 1 },
    { id: "016", name: "Caillouton", types: ["Roche"], hp: 46, attack: 17, defense: 24, speed: 8, moves: ["A36", "A27", "A01"], description: "Tortue lente dont la carapace est un vrai caillou.", form: "turtle", stage: 1 },
    { id: "017", name: "Pluméa", types: ["Vol", "Normal"], hp: 36, attack: 17, defense: 12, speed: 24, moves: ["A25", "A33", "A01"], description: "Oisillon curieux qui ramasse tout ce qui brille.", form: "bird", stage: 1 },
    { id: "018", name: "Mousseron", types: ["Plante", "Fée"], hp: 40, attack: 14, defense: 16, speed: 12, moves: ["A31", "A23", "A32"], description: "Champignon timide dont les spores sentent la menthe.", form: "mushroom", stage: 1 },
    { id: "019", name: "Givrelin", types: ["Glace", "Vol"], hp: 36, attack: 17, defense: 13, speed: 20, moves: ["A35", "A25", "A01"], description: "Petit oiseau des neiges au bec toujours froid.", form: "bird", stage: 1 },
    { id: "020", name: "Sablon", types: ["Terre"], hp: 42, attack: 18, defense: 18, speed: 12, moves: ["A34", "A27", "A01"], description: "Creuse des tunnels pour cacher ses provisions.", form: "mole", stage: 1 },
    { id: "021", name: "Nocturet", types: ["Ténèbres", "Vol"], hp: 36, attack: 18, defense: 12, speed: 24, moves: ["A28", "A25", "A01"], description: "Chauve-souris farceuse qui ne sort qu’à la nuit tombée.", form: "bat", stage: 1 },
    { id: "022", name: "Coquillard", types: ["Eau", "Roche"], hp: 44, attack: 16, defense: 22, speed: 9, moves: ["A21", "A36", "A01"], description: "Se réfugie dans sa coquille au moindre bruit.", form: "turtle", stage: 1 },
    { id: "023", name: "Fantômiel", types: ["Spectre", "Fée"], hp: 36, attack: 17, defense: 13, speed: 20, moves: ["A38", "A29", "A32"], description: "Petit fantôme qui sent le miel et fait des farces.", form: "ghost", stage: 1 },
    { id: "024", name: "Boulonnet", types: ["Acier"], hp: 40, attack: 17, defense: 22, speed: 12, moves: ["A37", "A24", "A01"], description: "Boule de métal qui tinte quand elle se cogne.", form: "orb", stage: 1 },
    { id: "025", name: "Bzzlette", types: ["Insecte", "Vol"], hp: 32, attack: 17, defense: 12, speed: 26, moves: ["A30", "A33", "A01"], description: "Abeille pressée qui bourdonne des chansons.", form: "bug", stage: 1 },
    { id: "026", name: "Lumignon", types: ["Feu", "Fée"], hp: 34, attack: 19, defense: 12, speed: 20, moves: ["A22", "A29", "A01"], description: "Petite flamme de bougie qui guide les égarés.", form: "ghost", stage: 1 },
    { id: "027", name: "Brindillon", types: ["Plante", "Insecte"], hp: 36, attack: 17, defense: 15, speed: 18, moves: ["A30", "A23", "A01"], description: "Insecte-brindille presque invisible dans les fourrés.", form: "bug", stage: 1 },
    { id: "028", name: "Frimasson", types: ["Glace"], hp: 38, attack: 18, defense: 14, speed: 20, moves: ["A26", "A20", "A35"], description: "Renard des neiges qui laisse des traces de givre.", form: "fox", stage: 1 },
    { id: "029", name: "Vasouille", types: ["Eau", "Terre"], hp: 46, attack: 15, defense: 16, speed: 10, moves: ["A34", "A21", "A01"], description: "Flaque de boue vivante, très collante.", form: "blob", stage: 1 },
    { id: "030", name: "Ombrichon", types: ["Ténèbres"], hp: 36, attack: 20, defense: 12, speed: 22, moves: ["A28", "A20", "A01"], description: "Petit renard d’ombre qui adore surprendre les passants.", form: "fox", stage: 1 }
  ],
  attacks: [
    { id: "A01", name: "Coup basique", type: "Normal", power: 20, accuracy: 100, pp: 35, effect: null },
    { id: "A02", name: "Brume", type: "Spectre", power: 0, accuracy: 100, pp: 15, effect: "lower_accuracy" },
    { id: "A03", name: "Lame d’eau", type: "Eau", power: 35, accuracy: 95, pp: 20, effect: null },
    { id: "A04", name: "Éboulement", type: "Roche", power: 40, accuracy: 85, pp: 15, effect: "flinch" },
    { id: "A05", name: "Liane fantôme", type: "Plante", power: 30, accuracy: 100, pp: 20, effect: "lower_speed" },
    { id: "A06", name: "Éclair", type: "Électrique", power: 40, accuracy: 100, pp: 20, effect: "paralyze", range: "line" },
    { id: "A07", name: "Poudre de givre", type: "Glace", power: 0, accuracy: 100, pp: 15, effect: "freeze" },
    { id: "A08", name: "Étincelle", type: "Feu", power: 35, accuracy: 100, pp: 25, effect: "burn" },
    { id: "A09", name: "Vague sombre", type: "Eau", power: 45, accuracy: 90, pp: 15, effect: null },
    { id: "A10", name: "Tremblement", type: "Terre", power: 50, accuracy: 100, pp: 10, effect: "hit_all" },
    { id: "A11", name: "Rafale", type: "Vol", power: 30, accuracy: 100, pp: 25, effect: null, range: "line" },
    { id: "A12", name: "Lame d’ombre", type: "Ténèbres", power: 40, accuracy: 100, pp: 15, effect: "ignore_defense" },
    // A14 et A15 étaient utilisées par Gelamour et Flamèche mais absentes d'attacks.json
    { id: "A14", name: "Éclat féerique", type: "Fée", power: 35, accuracy: 100, pp: 20, effect: null },
    { id: "A15", name: "Nuée piquante", type: "Insecte", power: 30, accuracy: 95, pp: 20, effect: "flinch" },
    { id: "A20", name: "Griffure", type: "Normal", power: 30, accuracy: 95, pp: 30, effect: null },
    { id: "A21", name: "Bulle d’écume", type: "Eau", power: 30, accuracy: 100, pp: 30, effect: null },
    { id: "A22", name: "Braise vive", type: "Feu", power: 30, accuracy: 100, pp: 30, effect: "burn" },
    { id: "A23", name: "Vrille de ronce", type: "Plante", power: 30, accuracy: 100, pp: 30, effect: null },
    { id: "A24", name: "Choc statique", type: "Électrique", power: 30, accuracy: 100, pp: 25, effect: "paralyze" },
    { id: "A25", name: "Plongeon", type: "Vol", power: 35, accuracy: 95, pp: 25, effect: null },
    { id: "A26", name: "Grêlon", type: "Glace", power: 30, accuracy: 100, pp: 25, effect: "freeze" },
    { id: "A27", name: "Jet de sable", type: "Terre", power: 0, accuracy: 100, pp: 20, effect: "lower_accuracy" },
    { id: "A28", name: "Morsure d’ombre", type: "Ténèbres", power: 35, accuracy: 100, pp: 25, effect: "flinch" },
    { id: "A29", name: "Poussière d’étoile", type: "Fée", power: 30, accuracy: 100, pp: 25, effect: null, range: "line" },
    { id: "A30", name: "Dard vif", type: "Insecte", power: 30, accuracy: 100, pp: 30, effect: null },
    { id: "A31", name: "Spore douce", type: "Plante", power: 0, accuracy: 85, pp: 15, effect: "sleep" },
    { id: "A32", name: "Souffle apaisant", type: "Fée", power: 0, accuracy: 100, pp: 10, effect: "heal", range: "self" },
    { id: "A33", name: "Rafale de plumes", type: "Vol", power: 25, accuracy: 100, pp: 25, effect: null, range: "line" },
    { id: "A34", name: "Coup de boue", type: "Terre", power: 30, accuracy: 95, pp: 20, effect: "lower_accuracy" },
    { id: "A35", name: "Boule de neige", type: "Glace", power: 25, accuracy: 100, pp: 25, effect: null, range: "line" },
    { id: "A36", name: "Roulé-boulé", type: "Roche", power: 35, accuracy: 95, pp: 20, effect: null },
    { id: "A37", name: "Coup de boulon", type: "Acier", power: 35, accuracy: 95, pp: 20, effect: null },
    { id: "A38", name: "Ombre furtive", type: "Spectre", power: 30, accuracy: 100, pp: 25, effect: "ignore_defense" }
  ],
  locations: [
    { id: "L00", name: "Forêt Verdoyante", theme: ["Plante", "Normal"], difficulty: 1, level: 1, common_monsters: ["011", "014", "017", "025", "018", "027", "020"], description: "Une forêt lumineuse pleine de jeunes créatures. Parfaite pour débuter.", floors: 5, crew: true },
    { id: "L01", name: "Forêt Brumeuse", theme: ["Plante", "Spectre"], difficulty: 1, common_monsters: ["001", "003", "009"], description: "Brouillard permanent, salles cachées", floors: 4, boss: "003" },
    { id: "L02", name: "Cavernes de Roc", theme: ["Roche", "Terre"], difficulty: 2, common_monsters: ["002", "008", "010"], description: "Sols instables, éboulements", floors: 5, boss: "008" },
    { id: "L03", name: "Ruines Électriques", theme: ["Électrique"], difficulty: 2, common_monsters: ["004", "006"], description: "Zones électrifiées, interrupteurs", floors: 5, boss: "004" },
    { id: "L04", name: "Glacier Silencieux", theme: ["Glace"], difficulty: 3, common_monsters: ["005", "007"], description: "Sol glissant, vents forts", floors: 6, boss: "007" }
  ]
};

const TYPES = ["Normal", "Feu", "Eau", "Plante", "Électrique", "Glace", "Roche", "Terre", "Vol", "Insecte", "Spectre", "Ténèbres", "Acier", "Fée"];

const TYPE_COLORS = {
  "Normal": "#cbbfa6", "Feu": "#ff7b3a", "Eau": "#48a6ff", "Plante": "#5ccb6c", "Électrique": "#ffd23f",
  "Glace": "#a3ecff", "Roche": "#b89c6c", "Terre": "#cf8a4c", "Vol": "#a7c1ff", "Insecte": "#a9c93b",
  "Spectre": "#9480dc", "Ténèbres": "#5c5072", "Acier": "#9eaab8", "Fée": "#ff9fd2"
};

// attaque → [types où c'est très efficace], [types qui résistent]
const TYPE_CHART = {
  "Normal":     [[], ["Roche", "Acier", "Spectre"]],
  "Feu":        [["Plante", "Glace", "Insecte", "Acier"], ["Eau", "Roche", "Feu"]],
  "Eau":        [["Feu", "Roche", "Terre"], ["Plante", "Eau"]],
  "Plante":     [["Eau", "Roche", "Terre"], ["Feu", "Vol", "Insecte", "Plante", "Acier"]],
  "Électrique": [["Eau", "Vol"], ["Terre", "Plante", "Électrique"]],
  "Glace":      [["Plante", "Terre", "Vol"], ["Feu", "Eau", "Glace", "Acier"]],
  "Roche":      [["Feu", "Glace", "Vol", "Insecte"], ["Terre", "Acier"]],
  "Terre":      [["Feu", "Électrique", "Roche", "Acier"], ["Plante", "Insecte", "Vol"]],
  "Vol":        [["Plante", "Insecte"], ["Électrique", "Roche", "Acier"]],
  "Insecte":    [["Plante", "Ténèbres"], ["Feu", "Vol", "Spectre", "Acier", "Fée"]],
  "Spectre":    [["Spectre"], ["Ténèbres", "Normal"]],
  "Ténèbres":   [["Spectre"], ["Ténèbres", "Fée"]],
  "Acier":      [["Glace", "Roche", "Fée"], ["Feu", "Eau", "Acier"]],
  "Fée":        [["Ténèbres", "Insecte"], ["Feu", "Acier"]]
};

const EFFECT_LABELS = {
  lower_accuracy: "Baisse la précision", flinch: "Peut apeurer", lower_speed: "Ralentit",
  paralyze: "Peut paralyser", freeze: "Gèle la cible", burn: "Peut brûler",
  hit_all: "Touche toute la salle", ignore_defense: "Ignore la défense", sleep: "Endort", heal: "Soigne le lanceur",
  poison: "Peut empoisonner", drain: "Draine les PV", lower_defense: "Baisse la défense"
};
// Taux de drop (en %) : créatures sauvages, membres des équipes rivales, part de pièces
const DROP = { wild: 30, rival: 60, coinShare: 45 };
// Lieux spéciaux du chapitre 2 (pas modifiables dans l’Atelier)
const SPECIAL_LOCS = {
  TOURNOI: { id: "TOURNOI", name: "Donjon du Tournoi", floors: 8, crew: true, difficulty: 2, themeOf: "TOURNOI", common_monsters: ["011", "014", "017", "020", "025", "018", "027", "013", "016"] },
  ARENE: { id: "ARENE", name: "Arène du Royaume", floors: 1, difficulty: 2, themeOf: "ARENE", common_monsters: ["011"] }
};
const RANGE_LABELS = { front: "Devant", line: "En ligne", room: "Salle entière", self: "Soi-même" };

const BASIC_ATTACK = { id: "_basic", name: "Attaque", type: "Normal", power: 22, accuracy: 94, pp: 0, effect: null, range: "front" };

let ITEMS = {};
const ITEMS_V1 = {
  baie:      { name: "Baie Vive", desc: "Rend 40 PV.", icon: "berry", color: "#ff5f86", w: 26 },
  baieor:    { name: "Baie Dorée", desc: "Rend tous les PV et soigne les statuts.", icon: "berry", color: "#ffcf3d", w: 4 },
  pomme:     { name: "Pomme Sylve", desc: "Remplit le ventre de 50.", icon: "apple", color: "#ff5546", w: 14 },
  grossepomme: { name: "Grosse Pomme", desc: "Remplit tout le ventre.", icon: "apple", color: "#ffa23a", w: 4 },
  graine:    { name: "Graine de Vie", desc: "Relève automatiquement un membre K.O.", icon: "seed", color: "#7ce38a", w: 5 },
  elixir:    { name: "Élixir Bleu", desc: "Restaure les PP de toutes les capacités.", icon: "potion", color: "#58b6ff", w: 8 },
  orbefuite: { name: "Orbe Fuite", desc: "Fait sortir l’équipe du donjon en gardant le sac.", icon: "orb", color: "#c39cff", w: 4 },
  orbelum:   { name: "Orbe Lumière", desc: "Révèle le plan de l’étage.", icon: "orb", color: "#fff1a1", w: 6 },
  caillou:   { name: "Caillou", desc: "À lancer : 20 dégâts en ligne droite.", icon: "stone", color: "#b9b2a6", w: 12, throw: true },
  grainesom: { name: "Graine Sommeil", desc: "À lancer : endort la première cible en ligne.", icon: "seed", color: "#8fa3ff", w: 7, throw: true },
  or:        { name: "Pièces", desc: "De l’argent, ramassé automatiquement.", icon: "coin", color: "#ffcf3d", w: 16, money: true }
};

const BAG_MAX = 10;

// Ambiance de chaque lieu (par id, puis par thème si lieu ajouté)
const THEMES = {
  L00: { key: "verdant", floor: "#5f9a50", floor2: "#62a054", corridor: "#558c47", wall: "#1f5226", wallTop: "#3d8a43", wallFace: "#143a19", accent: "#fff3a0", bg: "#0d2210" },
  L01: { key: "forest", floor: "#3d5a45", floor2: "#405f49", corridor: "#3a5241", wall: "#173023", wallTop: "#2b5a3c", wallFace: "#10221a", accent: "#9be3b0", fog: true, bg: "#0b1812" },
  L02: { key: "cave", floor: "#6b5641", floor2: "#6f5a45", corridor: "#5f4c39", wall: "#30241b", wallTop: "#5b4634", wallFace: "#1e1610", accent: "#f0c38a", quake: true, bg: "#120d09" },
  L03: { key: "ruins", floor: "#3b4660", floor2: "#3e4a65", corridor: "#363f56", wall: "#1a1f2e", wallTop: "#33405c", wallFace: "#10131c", accent: "#6ff3ff", electric: true, bg: "#0a0d16" },
  L04: { key: "glacier", floor: "#b9d4e6", floor2: "#bed8e9", corridor: "#a9c6da", wall: "#3d6a8c", wallTop: "#7fb3d6", wallFace: "#244a66", accent: "#ffffff", ice: true, bg: "#0e1c2a" }
};
THEMES.TOURNOI = { key: "arena", floor: "#8d7550", floor2: "#927a55", corridor: "#7d6747", wall: "#3b2c1c", wallTop: "#8a6a3e", wallFace: "#2a1f13", accent: "#ffd166", bg: "#140e08" };
THEMES.ARENE = THEMES.TOURNOI;
const THEME_BY_TYPE = { "Plante": "L01", "Spectre": "L01", "Roche": "L02", "Terre": "L02", "Électrique": "L03", "Acier": "L03", "Glace": "L04", "Eau": "L04" };

const FORMS = ["blob", "ghost", "rock", "leaf", "orb", "crystal", "bug", "fish", "mole", "swirl", "armor", "fox", "bird", "turtle", "mushroom", "bat", "seal", "sprout"];
const FORM_LABELS = { blob: "Boule", ghost: "Esprit", rock: "Rocher", leaf: "Feuille", orb: "Orbe ailée", crystal: "Cristal", bug: "Insecte", fish: "Poisson", mole: "Taupe", swirl: "Tourbillon", armor: "Armure", fox: "Renard", bird: "Oiseau", turtle: "Tortue", mushroom: "Champignon", bat: "Chauve-souris", seal: "Phoque", sprout: "Pousse" };
const FORM_BY_TYPE = { "Spectre": "ghost", "Roche": "rock", "Terre": "mole", "Plante": "leaf", "Électrique": "orb", "Glace": "crystal", "Fée": "crystal", "Insecte": "bug", "Feu": "bug", "Eau": "fish", "Vol": "swirl", "Acier": "armor", "Ténèbres": "armor", "Normal": "blob" };

// ============================================================
//  SCÉNARIO (original)
//  {name} = ton nom, {partner} = nom du partenaire
// ============================================================
const STORY = {
  intro: [
    { who: null, text: "Bienvenue…\nTon histoire commence ici." },
    { who: null, text: "Le bruit des vagues. Une odeur de sel.\nTu te réveilles sur une plage déserte…" },
    { who: null, text: "{partner} s’approche et te réveille.", partnerAppears: true },
    { who: "partner", text: "Tu es réveillé ? Tu étais allongé là, sans bouger. J’ai cru que la mer t’avait emporté !" },
    { who: "partner", text: "{name}… c’est ton nom ? Tu ne te souviens de rien d’autre ? Bizarre." },
    { who: "partner", text: "Depuis quelques jours, une brume noire sort des donjons. Les créatures qui la respirent deviennent agressives." },
    { who: "partner", text: "Moi, je veux savoir d’où elle vient. Et toi, tu as l’air solide." },
    { who: "partner", text: "On fait équipe ? La Forêt Brumeuse commence juste derrière la dune. Suis-moi, on doit entrer dans le donjon !" }
  ],
  cleared: {
    L01: [
      { who: "boss", text: "Merci… La brume m’étouffait. Je n’arrivais plus à penser." },
      { who: "boss", text: "Elle ne vient pas d’ici. Elle monte des Cavernes de Roc et des Ruines Électriques." },
      { who: null, text: "Un fragment d’écho brille au sol. Quand tu le touches, une image te revient : une lumière bleue au-dessus de la mer." },
      { who: "partner", text: "{name} ? Tu as vu quelque chose ? On dirait que ces fragments te rendent ta mémoire !" }
    ],
    L02: [
      { who: "boss", text: "Grrr… Ma tête… Ça fait des jours que je creuse sans savoir pourquoi." },
      { who: null, text: "Deuxième fragment. Un souvenir : tu portais quelque chose de froid, de lourd, à travers la neige." },
      { who: "partner", text: "De la neige ? Il n’y en a qu’au Glacier Silencieux, tout au nord…" }
    ],
    L03: [
      { who: "boss", text: "Bzzt… Les circuits sont clairs maintenant. La brume suivait les anciens câbles vers le nord." },
      { who: null, text: "Troisième fragment. Tu revois un sceau de glace, et une fissure qui s’ouvre dedans." },
      { who: "partner", text: "Un sceau ? {name}, je crois que tu étais là-bas quand tout a commencé." }
    ],
    L04: [
      { who: "boss", text: "Tu es revenu… Le gardien du sceau. La brume t’a rejeté à la mer quand le sceau s’est fendu." },
      { who: null, text: "Les quatre fragments se mettent à briller ensemble. Tu sais quoi faire : tu poses les mains sur la glace." },
      { who: null, text: "Le sceau se referme. Partout sur l’île, la brume noire se dissipe." },
      { who: "partner", text: "Alors c’était toi… Tu as protégé l’île depuis le début, sans t’en souvenir." },
      { who: "partner", text: "Dis, {name}… On continue d’explorer ? Les donjons sont encore pleins de mystères." },
      { who: null, text: "FIN — Merci d’avoir joué !\nTous les donjons restent ouverts en mode libre." }
    ]
  },
  bossIntro: [
    { who: "boss", text: "GRRAAAH ! Sortez d’ici !" },
    { who: "partner", text: "C’est la brume noire qui le contrôle ! Il faut le vaincre pour le libérer !" }
  ],
  defeat: [
    { who: "partner", text: "Ouch… On a été trop imprudents. On reprend des forces à la plage et on y retourne !" }
  ]
};

// Ordre de déblocage : un lieu se débloque quand ceux listés sont terminés
// L00 est jouable dès le début ; les autres lieux restent sous les nuages pour les prochains chapitres
const UNLOCKS = { L00: [], L01: ["@ch2"], L02: ["@ch2", "L01"], L03: ["@ch2", "L01"], L04: ["@ch2", "L02", "L03"] };

// ============================================================
//  CHAPITRE 1 : LE DÉBUT DU VOYAGE (texte original)
//  {name} = héros, {partner} = partenaire, {heroSp}/{partnerSp} = espèces,
//  {chef}, {sbire1}, {sbire2} = les trois voleurs tirés au hasard
// ============================================================
const SPLASH_TEXT = "Fan game fait par moi et pour moi\nJosé";
const CH1 = {
  title: "Chapitre 1 : Le Début du Voyage",
  treasure: "Pendentif d’Étoile",
  voice1: [
    { who: "voice", text: "…" },
    { who: "voice", text: "…Tu m’entends ?" },
    { who: "voice", text: "Ça fait si longtemps… si longtemps que je n’ai pas vu quelqu’un comme toi." },
    { who: "voice", text: "Approche. N’aie pas peur." },
    { who: "voice", text: "Donne-moi la main." }
  ],
  holdPrompt: "Pose ton doigt dans le cercle et ne le lâche pas…",
  holdEarly: "Non… ne me lâche pas tout de suite.",
  voice2: [
    { who: "voice", text: "…Oui. Je sens ta chaleur." },
    { who: "voice", text: "Je me souviens de toi, maintenant…" },
    { who: "voice", text: "Ah oui… tu es…" }
  ],
  confirmHero: "Oui… c’est bien toi ?",
  voice3: [{ who: "voice", text: "Et ton nom… Dis-le-moi." }],
  voice4: [
    { who: "voice", text: "Ah oui… tu es {name}." },
    { who: "voice", text: "Écoute-moi bien, {name}. Quelque chose va bientôt se produire." },
    { who: "voice", text: "Un ami est en danger. Quelqu’un qui va compter énormément pour toi, même si tu ne le sais pas encore." },
    { who: "voice", text: "Cet ami… qui est-ce ?" }
  ],
  confirmPartner: "C’est bien cet ami-là ?",
  voice5: [
    { who: "voice", text: "Alors c’est lui…" },
    { who: "voice", text: "Va, {name}. Protège-le. Et souviens-toi… je veille sur toi." }
  ],
  scene1: [
    { who: null, text: "Une plage paisible, au coucher du soleil.\nLes vagues s’échouent doucement sur le sable." },
    { who: null, text: "Étendu sur le sable, un petit {heroSp} ne bouge plus." },
    { who: "thought", text: "…Où… où suis-je ?", cue: "wake" },
    { who: "thought", text: "Ma tête… Je me souviens d’une voix. Et d’une lumière…" },
    { who: null, text: "Un coup de vent balaie la plage. Une lettre tourbillonne dans les airs…", cue: "letter" },
    { who: null, text: "…et retombe juste à tes pieds." },
    { who: "thought", text: "Une lettre ? Qu’est-ce que c’est ?", cue: "read" }
  ],
  letter: {
    head: "Guilde d’Exploration",
    title: "Formulaire d’invitation officiel",
    body: "La Guilde recherche de jeunes explorateurs courageux pour cartographier les donjons, secourir ceux qui s’y perdent et percer les mystères du monde.\n\nTout candidat doit se présenter avec un partenaire de confiance.",
    fields: ["Nom du candidat", "Espèce", "Partenaire", "Signature"]
  },
  scene1b: [
    { who: "thought", text: "Une invitation à rejoindre une guilde d’exploration…" },
    { who: "thought", text: "Je ne sais pas d’où je viens. Je ne sais même pas pourquoi je suis ici." },
    { who: "thought", text: "Mais c’est peut-être ça… la chance de tourner la page. De tout recommencer." },
    { who: "thought", text: "Il me faudrait un partenaire, d’après le formulaire. Hmm…" }
  ],
  scene2: [
    { who: "cry", text: "AU SECOURS !", cue: "shake" },
    { who: "thought", text: "Un cri ! Ça vient de là-bas, près des rochers !", cue: "run" },
    { who: "chef", text: "Hé hé hé… Regardez-moi ce petit trésor qui brille !", cue: "surround" },
    { who: "partner", text: "Rendez-le-moi ! C’est à moi !" },
    { who: "sbire1", text: "« C’est à moiii ! » T’as entendu ça, chef ?" },
    { who: "sbire2", text: "Allez, pousse-toi, minus !", cue: "shove" },
    { who: null, text: "{sbire2} bouscule {partnerSp}, et {chef} lui arrache l’objet des mains." },
    { who: "chef", text: "Merci pour le cadeau ! On va en tirer un bon prix." },
    { who: "hero", text: "Hé ! Laissez-le tranquille !", cue: "intervene" },
    { who: "sbire1", text: "Hein ? C’est qui, celui-là ?" },
    { who: "chef", text: "Hmpf… Ils sont deux maintenant, et celui-là a l’air coriace…" },
    { who: "chef", text: "Pas la peine de se fatiguer pour si peu. Les gars, on file à la Forêt Verdoyante !" },
    { who: "sbire2", text: "Bon courage pour nous rattraper, les mauviettes ! Hé hé !", cue: "flee" },
    { who: null, text: "La bande de {chef} s’enfuit en courant vers l’entrée d’un donjon voisin." }
  ],
  scene3: [
    { who: "partner", text: "Je… je… Merci. Merci d’être venu.", cue: "face" },
    { who: "partner", text: "Ils m’ont pris mon Pendentif d’Étoile… C’est tout ce qui me reste de ma grand-mère." },
    { who: "partner", text: "Quand j’étais petit, elle me disait qu’il brillait plus fort quand on était sur le bon chemin." },
    { who: "partner", text: "Oh, pardon ! Je ne me suis même pas présenté. Je m’appelle…" }
  ],
  scene3b: [
    { who: "partner", text: "Je m’appelle {partner}. Et toi, c’est {name} ? Enchanté !" },
    { who: "partner", text: "Dis… je sais qu’on vient juste de se rencontrer, mais…" },
    { who: "partner", text: "Tu voudrais bien m’aider à récupérer mon pendentif ? Tout seul, je n’oserai jamais entrer dans ce donjon." }
  ],
  askHelp: ["Bien sûr, je t’aide !", "Laisse-moi réfléchir…"],
  askHelpAgain: [{ who: "partner", text: "S’il te plaît… Je ne connais personne d’autre ici." }],
  scene3c: [
    { who: "partner", text: "C’est vrai ?! Merci, {name} ! Je ne l’oublierai jamais !" },
    { who: "partner", text: "Allons-y ! L’entrée de la Forêt Verdoyante est juste là-bas.", cue: "walk" }
  ],
  toDungeon: "En route vers le Donjon !",
  bossIntro: [
    { who: "chef", text: "Encore vous ?! Vous êtes vraiment collants !" },
    { who: "sbire1", text: "Chef, chef ! Ils nous ont suivis jusqu’ici !" },
    { who: "partner", text: "Rendez-moi mon pendentif !" },
    { who: "chef", text: "Viens le chercher, si t’es cap ! Les gars, à l’attaque !" }
  ],
  victory: [
    { who: "chef", text: "Aïe aïe aïe… D’accord, d’accord ! On abandonne !" },
    { who: "sbire1", text: "Pardon… On voulait juste se faire un peu d’argent…" },
    { who: "sbire2", text: "Tiens, reprends ton machin brillant. On ne recommencera plus, promis…" },
    { who: "chef", text: "…Vous êtes plutôt forts, tous les deux. Allez, on décampe !" },
    { who: null, text: "Les trois voleurs détalent entre les arbres. Le Pendentif d’Étoile est revenu entre les mains de {partner}." }
  ],
  victory2: [
    { who: "partner", text: "Mon pendentif… Il est là. Il est vraiment là !" },
    { who: "partner", text: "Merci, {name}. Sans toi, je l’aurais perdu pour toujours." },
    { who: "partner", text: "Tu sais… je n’ai jamais connu mes parents. C’est ma grand-mère qui m’a élevé, au bord de cette plage." },
    { who: "partner", text: "Elle était exploratrice, autrefois. Elle disait que ce pendentif venait d’un endroit que personne n’avait jamais trouvé." },
    { who: "partner", text: "Depuis qu’elle est partie, je rêve de découvrir d’où il vient… mais je n’ai jamais eu le courage." },
    { who: null, text: "{partner} fait quelques pas vers le chemin… puis s’arrête et se retourne.", cue: "turn" },
    { who: "partner", text: "…Dis, {name}." },
    { who: "partner", text: "Il y a une guilde d’exploration, pas loin d’ici. Ça te dirait… de la rejoindre avec moi ?" },
    { who: null, text: "Tu lèves les yeux vers le ciel. Les premières étoiles s’allument au-dessus de la mer.", cue: "sky" },
    { who: "thought", text: "La lettre… l’invitation… C’était peut-être un signe." }
  ],
  joinChoice: ["Oui, allons-y !"],
  victory3: [
    { who: "partner", text: "Ouais ! Alors c’est parti, partenaire !", cue: "follow" }
  ],
  shadow: [
    { who: null, text: "Pendant ce temps, au plus profond d’une forêt que personne n’ose traverser…" },
    { who: "shadow", text: "…Ils se sont trouvés." },
    { who: "shadow", text: "Le pendentif s’est remis à briller. Je l’ai senti." },
    { who: "shadow", text: "Après tout ce temps… le monde va enfin pouvoir recommencer." },
    { who: "shadow", text: "Hé hé hé…" }
  ],
  end: "Chapitre 1 — Fin",
  defeat: "Ton équipe est K.O.…\nNe baisse pas les bras : recommence depuis le début !"
};
