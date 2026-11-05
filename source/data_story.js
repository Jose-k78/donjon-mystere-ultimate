// ============================================================
//  HISTOIRE COMPLÈTE : chapitres 3, 4, 5 et épilogue (texte original)
//  Script de José, adapté : « créature » à la place de « Pokémon »,
//  noms de guildes gardés comme simples noms d'organisations.
//  {name} héros · {partner} partenaire · {atk} attaque ultime choisie
//  emo : expression du portrait (noms de sprite_config.json)
// ============================================================

// ---- nouvelles créatures originales (ids du script de José) ----
DEFAULT_DATA.attacks.push(
  { id: "A90", name: "Lumière Originelle", type: "Fée", power: 80, accuracy: 100, pp: 3, effect: null, range: "room" },
  { id: "A91", name: "Éclipse Royale", type: "Ténèbres", power: 55, accuracy: 95, pp: 10, effect: "ignore_defense", range: "line" }
);
DEFAULT_DATA.monsters.push(
  { id: "045", name: "Rapinard", types: ["Ténèbres", "Normal"], hp: 44, attack: 24, defense: 17, speed: 26, moves: ["A28", "A20", "A12", "A27"], description: "Renard des ruelles au regard méfiant. Il ne vole plus… presque plus.", form: "fox", stage: 2, rarity: 2, story: true },
  { id: "112", name: "Ondelin", types: ["Eau"], hp: 46, attack: 17, defense: 19, speed: 17, moves: ["A21", "A03", "A35", "A01"], description: "Petit phoque des marées qui sursaute au moindre clapotis.", form: "seal", stage: 2, rarity: 2, story: true },
  { id: "205", name: "Sablorloge", types: ["Acier", "Spectre"], hp: 42, attack: 18, defense: 22, speed: 16, moves: ["A37", "A38", "A02", "A01"], description: "Un sablier vivant. Le sable dans son ventre coule… parfois à l’envers.", form: "orb", stage: 2, rarity: 2, story: true },
  { id: "301", name: "Pyrogriffe", types: ["Feu", "Normal"], hp: 42, attack: 27, defense: 15, speed: 25, moves: ["A22", "A08", "A20", "A01"], description: "Jeune combattant aux griffes brûlantes. Il fonce d’abord, il réfléchit… rarement.", form: "fox", stage: 2, rarity: 2, story: true },
  { id: "404", name: "Givrecorne", types: ["Glace", "Acier"], hp: 54, attack: 21, defense: 28, speed: 11, moves: ["A26", "A37", "A07", "A01"], description: "Garde cuirassé de givre. Son souffle gèle les mots avant qu’il ne les dise.", form: "armor", stage: 2, rarity: 2, story: true },
  { id: "505", name: "Sylverain", types: ["Plante", "Terre"], hp: 56, attack: 19, defense: 26, speed: 10, moves: ["A23", "A34", "A31", "A01"], description: "Une tortue dont la carapace est une petite forêt. Des oiseaux y nichent.", form: "turtle", stage: 2, rarity: 2, story: true },
  { id: "606", name: "Noctiluse", types: ["Ténèbres", "Spectre"], hp: 40, attack: 24, defense: 14, speed: 30, moves: ["A28", "A38", "A12", "A01"], description: "Éclaireuse nocturne aux ailes de brume. Elle voit sans lumière.", form: "bat", stage: 2, rarity: 2, story: true },
  { id: "707", name: "Cœurlys", types: ["Fée", "Normal"], hp: 48, attack: 15, defense: 18, speed: 18, moves: ["A32", "A29", "A14", "A01"], description: "Ses pétales changent de couleur selon ce que ressentent ceux qui l’entourent.", form: "mushroom", stage: 2, rarity: 2, story: true },
  { id: "808", name: "Anneautin", types: ["Spectre", "Fée"], hp: 38, attack: 21, defense: 13, speed: 32, moves: ["A38", "A29", "A02", "A01"], description: "Petit farceur qui ouvre des anneaux dans l’air pour passer d’un endroit à l’autre.", form: "swirl", stage: 2, rarity: 2, story: true },
  { id: "1999", name: "Vizirombre", types: ["Ténèbres", "Spectre"], hp: 120, attack: 40, defense: 32, speed: 30, moves: ["A91", "A12", "A28", "A38"], description: "L’Ombre du Vizir Kharzan, ancien bras droit du Roi Originel. Une couronne brisée flotte au-dessus de sa tête.", form: "ghost", stage: 2, rarity: 3, story: true }
);

// ---- les personnages qui parlent ----
const STORY_CAST = {
  rask: { mid: "045", name: "Rask" },
  ondin: { mid: "112", name: "Ondin", guild: "kyogre" },
  sablier: { mid: "205", name: "Sablier", guild: "dialga" },
  ardent: { mid: "301", name: "Ardent", guild: "victini" },
  frimas: { mid: "404", name: "Frimas", guild: "kyurem" },
  racine: { mid: "505", name: "Racine", guild: "zygarde" },
  nyx: { mid: "606", name: "Nyx", guild: "lunala" },
  lys: { mid: "707", name: "Lys", guild: "amovenus" },
  zip: { mid: "808", name: "Zip", guild: "hoopa" },
  vizir: { mid: "1999", name: "Kharzan" },
  givrel: { mid: "028", name: "Givrel" },
  orion: { father: true, name: "Orion" },
  chancelier: { role: "chancelier", name: "Chancelier Velmont" },
  receleur: { role: "receleur", name: "Le Receleur" },
  fisher: { role: "fisher", name: "Papy Bulle" },
  arcade: { role: "arcade", name: "Madame Jetons" },
  capVictini: { role: "cap_victini", name: "Capitaine de Victory Victini", guild: "victini" },
  capKyogre: { role: "cap_kyogre", name: "Capitaine de Tsunami Kyogre", guild: "kyogre" },
  capDialga: { role: "cap_dialga", name: "Capitaine de Time Dialga", guild: "dialga" },
  capKyurem: { role: "cap_kyurem", name: "Capitaine de Glacial Kyurem", guild: "kyurem" },
  capZygarde: { role: "cap_zygarde", name: "Capitaine de 100 Zygarde", guild: "zygarde" },
  capLunala: { role: "cap_lunala", name: "Capitaine de Moon Hunter Lunala", guild: "lunala" },
  capAmovenus: { role: "cap_amovenus", name: "Capitaine d’Amour Amovénus", guild: "amovenus" },
  capHoopa: { role: "cap_hoopa", name: "Capitaine d’Anneau Hoopa", guild: "hoopa" },
  allFriends: { name: "Les apprentis des guildes", badge: "#ffd166" },
  allCaptains: { name: "Tous les capitaines", badge: "#ffd94a" },
  echo: { name: "Voix dans l’écho", shadow: true }
};
const FRIEND_KEYS = ["ondin", "ardent", "racine", "lys", "sablier", "frimas", "nyx", "zip"];

// ============================================================
//  CHAPITRE 1 : détails ajoutés à l'introduction
// ============================================================
(function enrichCh1() {
  const i = CH1.scene1.findIndex(l => /Je me souviens d’une voix/.test(l.text));
  if (i >= 0) CH1.scene1.splice(i + 1, 0,
    { who: "thought", text: "Et… une salle immense. Un trône vide. Quelqu’un qui criait un nom… le mien ?", emo: "Worried" },
    { who: "thought", text: "Non. Ça s’efface déjà. Comme du sable entre les doigts." });
  CH1.letter.body += "\n\nCette année, les meilleures équipes pourront aussi représenter leur région au Grand Tournoi des Guildes de The World.";
  const j = CH1.scene1b.findIndex(l => /tourner la page/.test(l.text));
  if (j >= 0) CH1.scene1b[j] = { who: "thought", text: "Si je n’ai plus de passé… c’est peut-être l’occasion de me bâtir un avenir." };
  CH1.scene2 = CH1.scene2.map(l => {
    if (l.who === "partner" && /C’est à moi/.test(l.text)) return { who: "partner", text: "Laissez-moi ! Ce pendentif appartient à mon père !", emo: "Crying" };
    if (l.who === "chef" && /bon prix/.test(l.text)) return { who: "chef", text: "Tais-toi, le faible ! Dans ce monde, seuls les forts possèdent des trésors ! Et le client paiera cher pour celui-là." };
    return l;
  });
  CH1.scene3 = CH1.scene3.map(l => /tout ce qui me reste de ma grand-mère/.test(l.text) ? { who: "partner", text: "Ils m’ont pris mon Pendentif d’Étoile… C’est ma grand-mère qui me l’a donné. Il appartenait à mon père.", emo: "Teary-Eyed" } : l);
  const v = CH1.victory.findIndex(l => l.who === "sbire1");
  if (v >= 0) CH1.victory.splice(v + 1, 0,
    { who: "chef", text: "Le client va être furieux…" },
    { who: "sbire2", text: "Chut, chef ! On n’est pas censés parler du client !" });
  const w = CH1.victory2.findIndex(l => /jamais connu mes parents/.test(l.text));
  if (w >= 0) CH1.victory2.splice(w, 1,
    { who: "partner", text: "Tu sais… je n’ai jamais connu mon père. Il a disparu dans une faille, juste avant ma naissance. C’est ma grand-mère qui m’a élevé, au bord de cette plage.", emo: "Sad" });
  const k = CH1.victory2.findIndex(l => /Ça te dirait… de la rejoindre avec moi/.test(l.text));
  if (k >= 0) CH1.victory2.splice(k, 1,
    { who: "partner", text: "Je veux intégrer une guilde et devenir fort. Pour lui. S’il te plaît, {name}… faisons équipe !", emo: "Determined" });
  CH1.victory3 = [{ who: "hero", text: "Marchons ensemble. Direction le Royaume !", emo: "Determined" }].concat(CH1.victory3);
  CH1.shadow.splice(2, 0, { who: "shadow", text: "Le sceau s’est fissuré. Celui que j’attendais est revenu sur la plage… exactement comme prévu." });
})();

// ============================================================
//  CHAPITRE 2 : le balcon (capitaines) et Rask au marché
// ============================================================
(function enrichCh2() {
  CH2.captains = [
    { who: null, text: "Sur le balcon, les capitaines de guilde murmurent entre eux.", cue: "banners" },
    { who: "capVictini", text: "Cette façon de canaliser l’Éther… Ce n’est pas une créature ordinaire. Dialga, tu as vu ça ?" },
    { who: "capDialga", text: "Oui… Les lignes du temps tremblent autour de lui." },
    { who: "captainA", text: "Pas mal, ces petits. Ils ont du cran." },
    { who: null, text: "Un capitaine encapuchonné, resté dans l’ombre, se penche au-dessus de la rambarde.", cue: "hood" },
    { who: "hood", text: "…Ce pendentif. Et ce regard…" },
    { who: "hood", text: "Non… ce n’est pas possible. Pas après tout ce temps." },
    { who: null, text: "Quand tu lèves les yeux vers le balcon, le capitaine a déjà disparu." }
  ];
  VAGABONDS.push({
    nick: "Rask", mood: "sarcastique", fixedMid: "045", story: true,
    lines: ["Vous cherchez un 3e membre pour le tournoi ? Je n’ai nulle part où aller…", "…mais ne vous attendez pas à ce que je vous fasse des câlins."],
    more: ["Je connais les ruelles, les bas-fonds et toutes les façons de se faire voler. Croyez-moi, ça sert.", "Ces trois voyous, là-bas, au tournoi ? Je les connais. Mauvaise graine. Je sais de quoi je parle."],
    join: "Bon. Je viens. Mais je dors loin de l’émotif, il parle en dormant."
  });
})();

// ============================================================
//  MISSIONS (donjons de l'histoire)
// ============================================================
const STORY_THEMES = {
  S_ABYSSE: { key: "abysse", style: "ruins", floor: "#1f4b63", floor2: "#224f68", corridor: "#1b4257", wall: "#0b1f2e", wallTop: "#2f7fa3", wallFace: "#071620", accent: "#7ae3ff", fog: true, bg: "#04101a" },
  S_FORET: { key: "centracines", style: "forest", floor: "#3f5a33", floor2: "#435f36", corridor: "#38502d", wall: "#152510", wallTop: "#2e5a28", wallFace: "#0d180a", accent: "#d6ff9a", fog: true, bg: "#081106" },
  S_BASTION: { key: "bastion", style: "glacier", floor: "#a9c3d6", floor2: "#aec8da", corridor: "#9bb6ca", wall: "#2d4f6a", wallTop: "#cfe6f5", wallFace: "#1b3446", accent: "#e8fbff", ice: true, bg: "#0b1622" },
  S_NUIT: { key: "nuit", style: "ruins", floor: "#2d2a48", floor2: "#302d4c", corridor: "#28253f", wall: "#0e0c1e", wallTop: "#4b4390", wallFace: "#080716", accent: "#d9c8ff", fog: true, bg: "#05040f" },
  S_EGOUTS: { key: "egouts", style: "cave", floor: "#4a4a3a", floor2: "#4e4e3d", corridor: "#3f4033", wall: "#1d1e16", wallTop: "#55573f", wallFace: "#11120c", accent: "#b6e36a", bg: "#0b0c07" },
  S_FAILLE: { key: "faille", style: "ruins", floor: "#3a2a55", floor2: "#3e2d5a", corridor: "#33254b", wall: "#120a22", wallTop: "#7b4fd0", wallFace: "#0a0614", accent: "#9ff0ff", electric: true, bg: "#06030e" },
  S_TOUR: { key: "celeste", style: "ruins", floor: "#d9d3c2", floor2: "#ddd8c8", corridor: "#cfc8b4", wall: "#6c6a8a", wallTop: "#f2e3a8", wallFace: "#46445e", accent: "#fff4c2", bg: "#1b1d3a" },
  S_PALAIS: { key: "palaisom", style: "arena", floor: "#7c6a8a", floor2: "#806e8e", corridor: "#6f5f7c", wall: "#2a1f35", wallTop: "#c9a14a", wallFace: "#1a1322", accent: "#ffd94a", bg: "#0e0914" }
};
Object.assign(THEMES, STORY_THEMES);

// guest = l'apprenti qui accompagne l'équipe · shadow = part des ennemis possédés par l'Ombre
const STORY_MISSIONS = {
  S_KYOGRE: { name: "Abysse des Tempêtes", floors: 6, difficulty: 2, themeOf: "S_ABYSSE", common_monsters: ["013", "022", "029", "007", "001"], boss: "007", bossName: "Gardien de la Tempête", guest: "ondin", shadow: 0.35, bg: "abyss" },
  S_VICTINI: { name: "Cratère des Champions", floors: 6, difficulty: 2, themeOf: "L05", common_monsters: ["012", "006", "026", "016", "002"], boss: "008", bossName: "Colosse de Lave", guest: "ardent", shadow: 0.35, bg: "crater" },
  S_ZYGARDE: { name: "Forêt des Cent Racines", floors: 6, difficulty: 2, themeOf: "S_FORET", common_monsters: ["014", "027", "018", "003", "020"], boss: "003", bossName: "Cœur de la Forêt", guest: "racine", shadow: 0.35, bg: "clearing" },
  S_AMOVENUS: { name: "Jardin des Cœurs", floors: 6, difficulty: 2, themeOf: "L12", common_monsters: ["018", "025", "017", "023", "014"], boss: "023", bossName: "La Pleureuse", guest: "lys", shadow: 0.35, bg: "garden" },
  S_GLACE: { name: "Glacier du Silence", floors: 5, difficulty: 3, themeOf: "L04", common_monsters: ["005", "019", "028", "007"], siege: true, shadow: 0.7, bg: "glacier" },
  S_DIALGA: { name: "Ruines du Temps Figé", floors: 7, difficulty: 3, themeOf: "L11", common_monsters: ["024", "010", "015", "005"], boss: "033", bossName: "Gardien des Heures", guest: "sablier", shadow: 0.4, bg: "clock" },
  S_KYUREM: { name: "Bastion de Givre", floors: 7, difficulty: 3, themeOf: "S_BASTION", common_monsters: ["005", "019", "028", "024"], boss: "028", bossName: "Givrel", guest: "frimas", shadow: 0.45, bg: "glacier" },
  S_LUNALA: { name: "Tour des Échos (nuit)", floors: 7, difficulty: 3, themeOf: "S_NUIT", common_monsters: ["021", "003", "023", "030"], boss: "606", bossName: "Le Reflet de Nyx", guest: "nyx", shadow: 0.45, bg: "night" },
  S_HOOPA: { name: "Cirque des Anneaux", floors: 7, difficulty: 3, themeOf: "L13", common_monsters: ["030", "021", "026", "011"], boss: "030", bossName: "Le Chien du Receleur", guest: "zip", shadow: 0.45, bg: "circus" },
  S_EGOUTS: { name: "Les Bas-Fonds", floors: 6, difficulty: 3, themeOf: "S_EGOUTS", common_monsters: ["029", "030", "021", "010", "020"], bossRole: "receleur", bossName: "Le Receleur", shadow: 0.5, bg: "sewer" },
  S_ARCHIVES: { name: "Archives Interdites", floors: 7, difficulty: 3, themeOf: "L10", common_monsters: ["001", "023", "013", "024"], boss: "024", bossName: "Gardien des Archives", guest: "sablier", shadow: 0.3, bossClean: true, bg: "library" },
  S_FAILLE: { name: "Cœur de la Faille", floors: 6, difficulty: 4, themeOf: "S_FAILLE", common_monsters: ["003", "010", "021", "023", "030", "001", "028", "007"], boss: "010", bossName: "Le Geôlier", shadow: 0.6, bg: "rift", shuffleTheme: true },
  S_TOUR: { name: "Tour Céleste", floors: 100, difficulty: 4, themeOf: "S_TOUR", common_monsters: [], boss: "1999", bossName: "Kharzan, l’Ombre du Vizir", bossMul: 2.4, shadow: 0.55, compact: true, bg: "towertop", tower: true }
};

// ============================================================
//  CHAPITRE 3 : LES SERMENTS DES GUILDES
// ============================================================
const CH3 = {
  title: "Chapitre 3 : Les Serments des Guildes",
  objPalace: "Le Roi vous convoque au palais (tout au nord de la ville).",
  intro: { bg: "throne", cast: ["hero", "partner", "rask?", "king", "capVictini", "capDialga", "chancelier"], lines: [
    { who: null, text: "Le palais royal. Des colonnes de marbre blanc, des vitraux aux couleurs des huit guildes… et, au bout d’un long tapis rouge, le trône." },
    { who: "partner", text: "On est… vraiment dans la salle du trône ? {name}, pince-moi.", emo: "Surprised", cue: "hop:partner" },
    { who: "king", text: "Approchez, jeunes gens. N’ayez pas peur." },
    { who: "king", text: "Depuis le tournoi, on ne parle que de vous dans le Royaume. L’équipe de {name}, qui a battu des voyous devant tout The World." },
    { who: "capVictini", text: "Hah ! Moi, j’ai surtout vu un petit gabarit encaisser des coups sans jamais reculer. Ça me plaît.", cue: "hop:capVictini" },
    { who: "capDialga", text: "Et moi, j’ai vu autre chose. Majesté, permettez que je sois franc." },
    { who: "capDialga", text: "Pendant la finale, les lignes du temps se sont tordues autour de {name}. Comme si le monde retenait son souffle." },
    { who: "thought", text: "Le monde… retenait son souffle ? À cause de moi ?", emo: "Worried" },
    { who: "chancelier", text: "Des lignes du temps… Allons, Capitaine. Ce ne sont que des enfants chanceux." },
    { who: "king", text: "Merci, Chancelier. Nous en reparlerons. The World a un problème plus urgent.", emo: "Sigh" },
    { who: "king", text: "Des failles s’ouvrent partout. Des déchirures dans l’air, fines comme des cheveux… puis larges comme des portes." },
    { who: "king", text: "Et de ces failles sortent des créatures de l’Ombre. Des êtres comme vous et moi, dont le cœur a été dévoré par une brume noire." },
    { who: "partner", text: "Des failles… Comme celle où mon père a disparu…", emo: "Sad" },
    { who: "king", text: "Les huit guildes sont débordées. Chacune m’a envoyé une demande d’aide… et chacune a un apprenti qui, disons, a besoin d’un coup de pouce." },
    { who: "king", text: "Je ne peux pas vous faire entrer dans une guilde tout de suite. Mais je peux faire de vous des Explorateurs Royaux." },
    { who: "king", text: "Aidez les huit guildes. Gagnez leur confiance. Et quand l’heure viendra, The World saura sur qui compter." }
  ] },
  introChoice: ["Nous acceptons !", "Pourquoi nous ?"],
  introWhy: [{ who: "king", text: "Parce que dans l’arène, quand ton partenaire est tombé, tu ne l’as pas laissé derrière. Les titres, ça s’apprend. Ça, non." }],
  introEnd: [
    { who: "partner", text: "Explorateurs Royaux… Grand-mère, papa… vous entendez ça ?!", emo: "Joyous", cue: "hop:partner|hop:hero" },
    { who: "chancelier", text: "…Félicitations. Tâchez de ne pas mourir. Ce serait regrettable pour la réputation du Roi." },
    { who: "king", text: "La Maison des Guildes vous attend. Commencez par où vous voulez. Bonne chance, Explorateurs Royaux." }
  ],
  rask: { bg: "kingdom", cast: ["hero", "partner", "recruit?", "rask@"], lines: [
    { who: null, text: "À la sortie du palais, une silhouette vous attend, adossée à la fontaine.", cue: "in:rask" },
    { who: "rask", text: "Explorateurs Royaux, hein ? Ça sonne bien. Ça sonne surtout comme « chair à canon »." },
    { who: "partner", text: "Hé ! Tu es… le type du marché ! Celui qui traînait près des étals pendant le tournoi.", emo: "Surprised" },
    { who: "rask", text: "Rask. Et je ne traînais pas, j’observais. Nuance." },
    { who: "rask", text: "Vous cherchez un troisième membre pour vos missions ? Je n’ai nulle part où aller…" },
    { who: "rask", text: "…mais ne vous attendez pas à ce que je vous fasse des câlins.", emo: "Sigh" },
    { who: "rask", text: "Je connais les ruelles, les bas-fonds et toutes les façons de se faire voler. Croyez-moi, ça va vous servir." }
  ] },
  raskRecruit: [
    { who: "recruit", text: "On était déjà trois, pourtant…" },
    { who: "rask", text: "Alors tu iras te reposer au dortoir, et tu me remercieras plus tard. Les missions royales, ce n’est pas un tournoi." }
  ],
  raskChoice: ["Bienvenue, Rask !", "Pourquoi tu nous aides ?"],
  raskWhy: [{ who: "rask", text: "…Parce que ces trois voyous de la plage, je les connais. J’ai traîné avec eux, avant. Et je déteste avoir des dettes.", emo: "Sigh" }],
  raskEnd: [
    { who: "partner", text: "Bienvenue dans l’équipe, Rask !", emo: "Happy", cue: "hop:partner" },
    { who: "rask", text: "Pas de câlin. Je te vois venir." }
  ],
  objGuilds: "Maison des Guildes : aide les guildes ({n}/8 Serments).",
  objIce: "Alerte ! Le Roi vous attend au palais.",
  objFete: "La Fête des Serments commence : rejoins tes amis à l’auberge.",
  hallIntro: "Huit guildes, huit apprentis, huit missions. Chaque mission réussie scelle un Serment : un ami qui viendra t’aider quand tu l’appelleras.",
  ice: { bg: "throne", cast: ["hero", "partner", "rask", "king", "chancelier", "guard@"], lines: [
    { who: "guard", text: "MAJESTÉ ! Le convoi du Glacier du Silence ne répond plus !", cue: "in:guard|shake" },
    { who: "king", text: "Le convoi des cristaux de sceau… Ce sont eux qui maintiennent les failles fermées dans le nord.", emo: "Worried" },
    { who: "chancelier", text: "Quel malheur. Quel… terrible malheur." },
    { who: "king", text: "Glacial Kyurem est en expédition au-delà des montagnes. Vous êtes les plus proches." },
    { who: "partner", text: "On y va !", emo: "Determined" },
    { who: "rask", text: "Évidemment qu’on y va. Personne ne demande jamais si on a envie d’avoir froid." }
  ] },
  iceFloors: {
    1: [{ who: null, text: "Le vent hurle. Des traces de pas, beaucoup trop de traces, mènent vers le cœur du glacier." }, { who: "rask", text: "Ces traces… des créatures de l’Ombre. Une armée entière.", emo: "Worried" }],
    3: [{ who: "partner", text: "Là ! Les caisses du convoi… renversées. Et vides." , emo: "Surprised" }, { who: "thought", text: "Quelqu’un savait exactement ce que ce convoi transportait. Et par où il passait." }]
  },
  siege: [
    { who: null, text: "Au cœur du glacier, le silence. Puis des centaines d’yeux rouges s’allument dans la tempête." },
    { who: "partner", text: "On… on est encerclés !", emo: "Surprised" },
    { who: "rask", text: "Cinquante… Non, plus ! C’est un piège ! Ils nous attendaient !", emo: "Shouting" },
    { who: "partner", text: "Dos à dos ! On tient le plus longtemps possible !", emo: "Determined" }
  ],
  rescue: [
    { who: "rask", text: "Ils sont trop nombreux… C’est la fin !", emo: "Pain" },
    { who: null, text: "Soudain, un souffle glacial titanesque balaye la carte.", cue: "freeze" },
    { who: "capKyurem", text: "Repliez-vous, jeunes pousses. Aucun membre du royaume ne tombera sous mes yeux." },
    { who: null, text: "Une vague de flammes déchire la tempête.", cue: "fire" },
    { who: "capVictini", text: "Hahaha ! Ne prends pas toute la gloire, Kyurem ! {name}, {partner}, filez ! On s’occupe du reste !" },
    { who: "capKyurem", text: "…Tu es en retard, Victini.", emo: "Sigh" },
    { who: "capVictini", text: "Je suis toujours pile à l’heure pour la partie amusante !" }
  ],
  iceAfter: { bg: "glacier", cast: ["hero", "partner", "rask", "capKyurem", "capVictini"], lines: [
    { who: null, text: "Quand la tempête retombe, il ne reste que de la neige fondue… et un symbole gravé dans la glace." },
    { who: "rask", text: "Ce symbole… Un œil dans un croissant noir.", emo: "Surprised" },
    { who: "rask", text: "Je le connais. C’est la marque du Receleur. Celui pour qui ces voyous travaillaient. Celui pour qui… je travaillais.", emo: "Angry" },
    { who: "partner", text: "Rask… ?", emo: "Worried" },
    { who: "rask", text: "Plus tard. Promis." },
    { who: "capKyurem", text: "Ces créatures n’étaient pas sauvages. Elles obéissaient. Quelqu’un les commande." },
    { who: "capVictini", text: "Hé, les petits. Vous avez tenu face à une armée. Il y a des capitaines qui n’auraient pas fait mieux." },
    { who: "capKyurem", text: "…Les quatre autres guildes vous attendent à la Maison des Guildes. Glacial Kyurem a une dette envers vous." },
    { who: "partner", text: "{name}… Quelqu’un nous vise. Il vise le pendentif, j’en suis sûr.", emo: "Determined" }
  ] },
  fete: { bg: "festival", cast: ["hero", "partner", "rask", "ondin", "ardent", "lys", "racine"], lines: [
    { who: null, text: "Ce soir-là, le Royaume organise une fête en l’honneur des Explorateurs Royaux." },
    { who: null, text: "Lanternes, musique, tartes aux baies… Les huit apprentis sont venus. Tous." },
    { who: "ondin", text: "J’ai nagé jusqu’ici ! Par la rivière ! Sans avoir peur ! …Bon, un peu peur.", emo: "Joyous", cue: "hop:ondin" },
    { who: "ardent", text: "{name} ! Un bras de fer ! Maintenant !", emo: "Determined", cue: "hop:ardent" },
    { who: "lys", text: "Ardent, laisse-le manger sa tarte, enfin…" },
    { who: "sablier", text: "Il est vingt heures quarante-sept. Et demain, il sera vingt heures quarante-huit. C’est merveilleux.", cue: "in:sablier" },
    { who: "frimas", text: "La musique est forte.", cue: "in:frimas" },
    { who: "racine", text: "Tu veux dire que tu l’aimes ?" },
    { who: "frimas", text: "…Oui." },
    { who: "nyx", text: "Je déteste les fêtes.", cue: "in:nyx" },
    { who: "zip", text: "Mais tu es venue quand même !", cue: "in:zip|hop:zip" },
    { who: "nyx", text: "…Tais-toi.", emo: "Happy" },
    { who: "rask", text: "Huit apprentis, une fête, des tartes gratuites. Si on m’avait dit ça il y a un mois… j’aurais volé les tartes." },
    { who: null, text: "Plus tard, sur le toit de l’auberge, {partner} et toi regardez les étoiles.", cue: "bg:rooftop|out:ondin|out:ardent|out:lys|out:racine|out:sablier|out:frimas|out:nyx|out:zip|out:rask" },
    { who: "partner", text: "Tu sais, {name}… Avant de te rencontrer, je parlais au portrait de mon père tous les soirs.", emo: "Sad" },
    { who: "partner", text: "Ce soir, j’ai huit amis de plus. Et un meilleur ami. Je crois que j’ai oublié de lui parler, à lui." },
    { who: "partner", text: "…Tu crois qu’il m’en voudrait ?", emo: "Worried" }
  ] },
  feteChoice: ["Il serait fier de toi.", "Parle-lui maintenant. Je t’écoute."],
  feteA: [{ who: "partner", text: "…Tu dis toujours peu de mots. Mais toujours les bons.", emo: "Teary-Eyed" }],
  feteB: [
    { who: "partner", text: "Papa… Je suis devenu Explorateur Royal. J’ai un partenaire incroyable. Et je n’ai plus peur. Enfin, moins.", emo: "Happy" },
    { who: "partner", text: "…C’est bête, hein ? Parler aux étoiles." }
  ],
  feteEnd: [
    { who: null, text: "Le pendentif s’illumine. Une lumière bleue, froide, qui pulse comme un cœur.", cue: "pendant:partner" },
    { who: "thought", text: "Une image. Un trône. Une couronne qui tombe. Et une main tendue… vers moi.", emo: "Stunned" },
    { who: "partner", text: "{name} ? Tu es tout pâle !", emo: "Surprised" }
  ],
  shadow: [
    { who: null, text: "Au même moment, dans la salle du Conseil du palais…" },
    { who: "shadow", text: "Les huit guildes se sont liées à lui. C’est fâcheux." },
    { who: "shadow", text: "Mais un lien… ça se brise. Il suffit de frapper au bon endroit." },
    { who: "shadow", text: "Demain, le Roi s’endormira. Et la vérité se réveillera avec moi." }
  ],
  end: "Chapitre 3 — Fin",
  endSub: "Les huit Serments sont scellés. Le chapitre 4 commence au palais."
};

// ---- les huit arcs d'amitié ----
const GUILD_ARCS = {
  kyogre: {
    friend: "ondin", cap: "capKyogre", mission: "S_KYOGRE", wave: 1, fav: "pomme",
    intro: [
      { who: "capKyogre", text: "Ah, les Explorateurs Royaux ! Pile à l’heure. La mer est en colère depuis trois jours." },
      { who: "capKyogre", text: "Une faille s’est ouverte au fond de l’Abysse des Tempêtes. Mes marins n’osent plus plonger." },
      { who: "capKyogre", text: "Je vous confie mon apprenti, Ondin. Il connaît chaque courant de l’Abysse… quand il ne tremble pas." },
      { who: "ondin", text: "B-bonjour ! Je… je suis Ondin. Enchanté. Enfin, pas enchanté, terrifié. Mais enchanté aussi.", emo: "Worried", cue: "in:ondin" },
      { who: "partner", text: "Salut, Ondin ! Moi aussi, au début, j’avais peur de tout. Hein, {name} ?", emo: "Happy" },
      { who: "thought", text: "Il tremble tellement que l’eau de sa fourrure fait des vaguelettes." },
      { who: "capKyogre", text: "Ramenez-le entier. Et toi, Ondin… cette fois, va jusqu’au bout." },
      { who: "ondin", text: "O-oui, capitaine…", emo: "Teary-Eyed" }
    ],
    floors: {
      1: [{ who: "ondin", text: "L’eau est trop sombre… Avant, on voyait le fond jusqu’ici.", emo: "Worried" }, { who: "rask", text: "Reste derrière moi, le petit. Si quelque chose bouge, tu cries. Fort." }, { who: "ondin", text: "Je crie toujours fort. C’est mon seul talent.", emo: "Surprised" }],
      3: [
        { who: "ondin", text: "Vous savez pourquoi le capitaine m’a choisi ? Parce que personne d’autre ne voulait d’un apprenti qui a peur de l’eau.", emo: "Sad" },
        { who: "partner", text: "Peur de l’eau ? Mais tu es…", emo: "Surprised" },
        { who: "ondin", text: "Une créature aquatique. Oui. Quand j’étais petit, une vague m’a emporté pendant une tempête. Depuis, chaque vague me rappelle ce jour-là.", emo: "Sigh" },
        { who: "partner", text: "Et pourtant, tu es là. Au fond de l’Abysse. Tu sais comment on appelle ça ?" },
        { who: "ondin", text: "…De la bêtise ?", emo: "Worried" },
        { who: "rask", text: "Du courage, crétin. Le genre qu’on ne voit qu’après." }
      ]
    },
    boss: [
      { who: null, text: "Une tempête se lève au cœur du donjon. Les vagues frappent les parois comme des poings." },
      { who: "boss", text: "GRRRAAAH… LA MER… M’APPARTIENT…" },
      { who: "ondin", text: "Je n’y arriverai jamais… Le Capitaine Kyogre va me chasser de la guilde…", emo: "Crying" },
      { who: "partner", text: "Écoute-moi ! La peur ne disparaît jamais, mais c’est en la traversant qu’on devient un vrai explorateur ! On est avec toi !", emo: "Determined" },
      { who: "ondin", text: "…En la traversant. D’accord. D’ACCORD ! Je reste !", emo: "Determined" }
    ],
    victory: [
      { who: "boss", text: "La brume… se retire… Merci… petits…" },
      { who: null, text: "La faille se referme dans un clapotis. L’eau redevient claire, et un rayon de soleil traverse l’Abysse jusqu’au fond." },
      { who: "ondin", text: "Je l’ai fait… On l’a fait ! J’ai plongé dans la tempête et je ne suis pas mort !", emo: "Inspired", cue: "hop:ondin" },
      { who: "rask", text: "Félicitations. Le niveau était bas, mais tu l’as atteint." },
      { who: "ondin", text: "Merci… Je dois rester fidèle à ma guilde, mais retenez bien ceci : si un jour vous avez besoin de moi, peu importe où vous êtes, je viendrai !", emo: "Joyous" }
    ],
    hall: [{ who: "capKyogre", text: "Mon apprenti est revenu en souriant. Ça faisait des mois. Merci, l’équipe de {name}." }]
  },
  victini: {
    friend: "ardent", cap: "capVictini", mission: "S_VICTINI", wave: 1, fav: "grossepomme",
    intro: [
      { who: "capVictini", text: "HAHA ! Les voilà, les petits prodiges ! Venez, venez !" },
      { who: "capVictini", text: "Le Cratère des Champions crache de l’Ombre depuis une semaine. Mes guerriers s’y battent jour et nuit… et ça ne suffit pas." },
      { who: "capVictini", text: "Je vous prête mon meilleur élément. Ardent ! Viens dire bonjour !" },
      { who: "ardent", text: "Bonjour. Voilà. C’est fait.", emo: "Angry", cue: "in:ardent" },
      { who: "ardent", text: "C’est toi, le phénomène du tournoi ? J’ai regardé ta finale. T’as eu de la chance." },
      { who: "partner", text: "De la chance ?! On s’est battus comme des fous !", emo: "Angry" },
      { who: "ardent", text: "Dans ma guilde, on ne compte pas sur la chance. On compte sur sa force. Sa force à soi.", emo: "Determined" },
      { who: "capVictini", text: "…Et c’est exactement pour ça que je vous l’envoie. Bonne chance. Il en aura besoin. Vous aussi.", emo: "Sigh" }
    ],
    floors: {
      1: [{ who: "ardent", text: "Restez derrière. Je m’occupe des ennemis, vous ramassez les miettes." }, { who: "rask", text: "Génial. J’ai toujours rêvé d’être une serpillière." }],
      3: [
        { who: null, text: "Ardent fonce seul dans une salle… et se retrouve encerclé." },
        { who: "ardent", text: "Tch… Ils sont trop nombreux… Je n’ai besoin de personne !", emo: "Pain" },
        { who: "partner", text: "{name}, on y va ! On ne laisse personne derrière !", emo: "Shouting" },
        { who: null, text: "Vous vous jetez dans la mêlée. Dos à dos, vous repoussez les créatures de l’Ombre." },
        { who: "ardent", text: "…Pourquoi vous êtes venus ? Je vous ai traités comme des moins que rien.", emo: "Surprised" },
        { who: "partner", text: "Parce que c’est ce que font les coéquipiers. Même quand l’un d’eux est une tête de mule." },
        { who: "ardent", text: "…Hmpf. On en reparlera.", emo: "Sigh" }
      ]
    },
    boss: [
      { who: "boss", text: "VOUS… N’ÊTES… QUE… DES BRINDILLES…" },
      { who: "ardent", text: "Le Colosse de Lave ! C’est lui qui a blessé la moitié de ma guilde ! Je vais…", emo: "Angry" },
      { who: "ardent", text: "…Non. Pas tout seul. {name} ! Tu prends sa gauche, je prends sa droite. Et toi, l’émotif, tu nous couvres !", emo: "Determined" },
      { who: "partner", text: "L’émotif a un nom, tu sais !", emo: "Happy" }
    ],
    victory: [
      { who: null, text: "Le Colosse s’effondre. La lave refroidit en une roche noire, lisse comme un miroir." },
      { who: "ardent", text: "…J’ai toujours cru qu’une victoire, ça se gagnait seul. Que si on m’aidait, ça voulait dire que j’étais faible.", emo: "Sigh" },
      { who: "ardent", text: "Mais là, je me sens plus fort que jamais. C’est bizarre. Ça fait chaud, là, dedans.", emo: "Happy" },
      { who: "rask", text: "C’est la lave. Recule." },
      { who: "ardent", text: "Hahaha ! {name}. Le jour où vous aurez besoin d’un poing, d’un bouclier ou d’un idiot qui fonce, appelez-moi. Je viendrai. C’est un serment de Victory Victini !", emo: "Joyous", cue: "hop:ardent" }
    ],
    hall: [{ who: "capVictini", text: "HAHA ! Mon têtu d’élève a appris à dire merci ! Je vous dois une fière chandelle !" }]
  },
  zygarde: {
    friend: "racine", cap: "capZygarde", mission: "S_ZYGARDE", wave: 1, fav: "graine",
    intro: [
      { who: "capZygarde", text: "Cent membres, un seul ordre. Bienvenue, Explorateurs Royaux." },
      { who: "capZygarde", text: "La Forêt des Cent Racines meurt. Les arbres pourrissent de l’intérieur. Racine est notre gardien… mais il refuse toute aide." },
      { who: "racine", text: "Je n’ai pas besoin d’eux. Les étrangers coupent, brûlent, prennent. Toujours.", emo: "Angry", cue: "in:racine" },
      { who: "partner", text: "Nous, on veut juste aider…", emo: "Sad" },
      { who: "racine", text: "C’est ce qu’ils disent tous. Avant de sortir les haches." },
      { who: "capZygarde", text: "Racine. Cent membres, un seul ordre. Tu iras avec eux." },
      { who: "racine", text: "…Cent membres, un seul ordre. Bien. Mais ne touchez à rien.", emo: "Sigh" }
    ],
    floors: {
      1: [{ who: "racine", text: "Ne marchez pas sur les jeunes pousses. Ne cueillez rien. Ne respirez pas trop fort." }, { who: "rask", text: "Je peux cligner des yeux, ou c’est une agression ?" }],
      3: [
        { who: null, text: "Au détour d’un sentier, des créatures de l’Ombre encerclent un jeune arbre à peine plus haut qu’une pomme." },
        { who: "racine", text: "NON ! C’est le dernier semis du Grand Chêne !", emo: "Shouting" },
        { who: null, text: "Avant qu’il ne puisse bouger, {partner} se jette devant le semis et encaisse le coup à sa place." },
        { who: "partner", text: "Ouch… Il… il va bien, ton arbre ?", emo: "Pain" },
        { who: "racine", text: "…Tu t’es fait frapper… pour une pousse ?", emo: "Surprised" },
        { who: "partner", text: "Bah… tu as dit qu’il ne fallait toucher à rien. Je l’ai protégée sans la toucher !", emo: "Happy" },
        { who: "racine", text: "…Imbécile. Merci.", emo: "Sigh" }
      ]
    },
    boss: [
      { who: "boss", text: "LA FORÊT… EST… À MOI… TOUT POURRIT… TOUT…" },
      { who: "racine", text: "Le Cœur de la forêt… C’est lui qui me chantait des chansons quand je n’étais qu’une graine.", emo: "Sad" },
      { who: "racine", text: "Je ne peux pas le sauver seul. {name}… s’il te plaît. Aide-moi.", emo: "Determined" }
    ],
    victory: [
      { who: null, text: "La brume noire s’échappe du tronc comme une fumée. Une à une, les feuilles reverdissent." },
      { who: "boss", text: "Petite… racine… tu as… trouvé… des amis…" },
      { who: "racine", text: "Oui. Des étrangers. Ils n’ont rien coupé, rien brûlé, rien pris.", emo: "Teary-Eyed" },
      { who: "racine", text: "Ils ont donné.", emo: "Happy" },
      { who: "racine", text: "Cent membres, un seul ordre… Désormais, vous êtes cent-trois. Si un jour vous appelez, la forêt entière répondra. C’est mon serment." }
    ],
    hall: [{ who: "capZygarde", text: "Racine a souri. Les cent membres l’ont vu. Nous ne l’oublierons pas." }]
  },
  amovenus: {
    friend: "lys", cap: "capAmovenus", mission: "S_AMOVENUS", wave: 1, fav: "baie",
    intro: [
      { who: "capAmovenus", text: "Bienvenue, mes chéris. Asseyez-vous. Un thé ? Non ? Dommage, il est délicieux." },
      { who: "capAmovenus", text: "Le Jardin des Cœurs, notre sanctuaire, s’est retourné. Littéralement. Les fleurs poussent vers le bas, et les cœurs se ferment." },
      { who: "capAmovenus", text: "Lys, notre soigneuse, ira avec vous. Elle ressent la douleur des autres comme si c’était la sienne." },
      { who: "lys", text: "Bonjour ! Oh, {partner}, tu as une égratignure ! Et {name}, tu as mal dormi. Et toi, Rask, tu… tu es triste ?", emo: "Happy", cue: "in:lys" },
      { who: "rask", text: "Je ne suis pas triste. J’ai une tête comme ça.", emo: "Angry" },
      { who: "lys", text: "Pardon ! Pardon. Je ressens tout, tout le temps. C’est… beaucoup.", emo: "Worried" },
      { who: "capAmovenus", text: "Lys. Promets-moi de te ménager.", emo: "Sigh" },
      { who: "lys", text: "Promis, Capitaine !", emo: "Happy" },
      { who: "thought", text: "Elle a répondu un peu trop vite." }
    ],
    floors: {
      1: [{ who: "lys", text: "Les fleurs pleurent… Vous entendez ? Non ? Moi si. Tout le temps." }],
      3: [
        { who: null, text: "Lys soigne chaque blessure, chaque égratignure, à peine apparue. Son souffle devient court." },
        { who: "lys", text: "Ça va… ça va… je peux encore…", emo: "Pain" },
        { who: null, text: "Elle vacille, et tu la rattrapes avant qu’elle ne tombe." },
        { who: "partner", text: "Lys ! Tu es épuisée !", emo: "Worried" },
        { who: "lys", text: "Si je ne soigne pas tout le monde… à quoi je sers ?", emo: "Teary-Eyed" },
        { who: "rask", text: "Écoute, la fleur. Je connais ce regard. C’est celui de quelqu’un qui croit qu’on l’aime seulement pour ce qu’il donne.", emo: "Sigh" },
        { who: "rask", text: "On ne t’a pas emmenée pour que tu nous soignes. On t’a emmenée parce que t’es des nôtres. Repose-toi. On gère." },
        { who: "lys", text: "…Personne ne m’avait jamais dit ça.", emo: "Crying" }
      ]
    },
    boss: [
      { who: "boss", text: "Snif… snif… Personne… ne m’aime… Tout le monde… part…" },
      { who: "lys", text: "Je ressens son cœur… Elle a été abandonnée. La brume s’est nourrie de sa solitude.", emo: "Sad" },
      { who: "lys", text: "Cette fois, je ne vais pas prendre sa douleur pour moi toute seule. On va la libérer… ensemble !", emo: "Determined" }
    ],
    victory: [
      { who: "boss", text: "…C’est chaud… Il y a… quelqu’un…" },
      { who: "lys", text: "Oui. Il y aura toujours quelqu’un. Je te le promets." },
      { who: null, text: "Le jardin se retourne lentement. Les fleurs pointent de nouveau vers le ciel." },
      { who: "lys", text: "Je me sens… légère. Comme si j’avais posé un sac très lourd que je portais depuis toujours.", emo: "Joyous" },
      { who: "lys", text: "Je dois rester avec ma guilde. Mais si un jour vos cœurs ont mal, peu importe où vous êtes, je viendrai. Et cette fois… je vous laisserai m’aider aussi." }
    ],
    hall: [{ who: "capAmovenus", text: "Elle est revenue en riant. Elle ne riait plus depuis longtemps. Vous êtes des trésors, tous les trois." }]
  },
  dialga: {
    friend: "sablier", cap: "capDialga", mission: "S_DIALGA", wave: 2, fav: "elixir",
    intro: [
      { who: "capDialga", text: "Vous voilà. Je vous attendais. Enfin… je vous attendais demain, mais le temps est capricieux ces jours-ci." },
      { who: "capDialga", text: "Notre chercheur, Sablier, s’est enfermé dans les Ruines du Temps Figé. Il y revit la même matinée depuis trente-deux jours." },
      { who: "partner", text: "La même matinée ? Tous les jours ?!", emo: "Surprised" },
      { who: "capDialga", text: "Pour lui, ce n’est qu’un seul jour. Pour nous, un mois. Ramenez-le dans le présent." }
    ],
    floors: {
      1: [
        { who: null, text: "Au milieu des engrenages figés, une créature griffonne frénétiquement dans un carnet." },
        { who: "sablier", text: "Ah ! Des visiteurs ! C’est la première fois que je vois quelqu’un ici !", emo: "Happy" },
        { who: "sablier", text: "Je suis Sablier, chercheur de Time Dialga. Il est neuf heures douze. Il est toujours neuf heures douze." },
        { who: "rask", text: "Il a un grain." },
        { who: "sablier", text: "Vous me l’avez déjà dit ! …Attendez. Comment je le sais ?", emo: "Surprised" }
      ],
      4: [
        { who: "sablier", text: "Neuf heures douze… C’est l’heure où mon maître, le professeur Clepsydre, est tombé dans une faille. Juste devant moi.", emo: "Sad" },
        { who: "sablier", text: "J’ai essayé de remonter le temps pour le rattraper. Et le temps… s’est arrêté. Il tourne en rond, comme moi." },
        { who: "partner", text: "Mon père aussi est tombé dans une faille. Je n’ai jamais pu le rattraper. Mais je n’ai pas arrêté d’avancer.", emo: "Sad" },
        { who: "sablier", text: "Avancer… même sans lui ?", emo: "Teary-Eyed" },
        { who: "partner", text: "Surtout sans lui. Parce que c’est ce qu’il aurait voulu." }
      ]
    },
    boss: [
      { who: "boss", text: "TIC… TAC… TOUT… RECOMMENCE… TOUJOURS…" },
      { who: "sablier", text: "Le gardien des ruines ! L’Ombre s’est nourrie de ma boucle… C’est ma faute !", emo: "Worried" },
      { who: "sablier", text: "Alors c’est à moi de la briser. Professeur… je vous laisse partir. Il est temps que l’aiguille bouge !", emo: "Determined" }
    ],
    victory: [
      { who: null, text: "Un claquement immense. Partout dans les ruines, les engrenages se remettent à tourner." },
      { who: "sablier", text: "Neuf heures treize. NEUF HEURES TREIZE ! Le temps avance !", emo: "Surprised", cue: "hop:sablier" },
      { who: "sablier", text: "Il est parti… Il est vraiment parti. Ça fait mal, mais c’est une bonne douleur. Une douleur qui avance.", emo: "Crying" },
      { who: "sablier", text: "Je vais tout noter. Les failles, l’Ombre, la boucle… Le savoir, c’est ce qui reste quand on a tout perdu.", emo: "Inspired" },
      { who: "sablier", text: "Si un jour le temps vous manque, appelez-moi. Je viendrai à l’heure. Pour une fois." }
    ],
    hall: [{ who: "capDialga", text: "…Il est revenu. Merci. Les lignes du temps autour de vous deviennent de plus en plus… intéressantes, {name}." }]
  },
  kyurem: {
    friend: "frimas", cap: "capKyurem", mission: "S_KYUREM", wave: 2, fav: "caillou",
    intro: [
      { who: "capKyurem", text: "Asseyez-vous. Le Bastion de Givre est tombé il y a trois jours. Douze gardes y étaient. Onze sont revenus." },
      { who: "capKyurem", text: "Frimas vous accompagnera. Il ne parle pas beaucoup. Ne le prenez pas mal." },
      { who: "frimas", text: "Frimas. Garde. Prêt.", cue: "in:frimas" },
      { who: "partner", text: "Salut, Frimas ! Ravi de te rencontrer ! Tu aimes quoi, dans la vie ?", emo: "Happy" },
      { who: "frimas", text: "Le silence." },
      { who: "partner", text: "…D’accord.", emo: "Sigh" },
      { who: "capKyurem", text: "Le douzième garde… c’est son petit frère. Givrel." }
    ],
    floors: {
      1: [{ who: "frimas", text: "Restez groupés. Le froid tue plus que l’Ombre." }, { who: "rask", text: "Tu es toujours aussi joyeux ?" }, { who: "frimas", text: "Oui." }],
      4: [
        { who: null, text: "Sur un mur de glace, des marques enfantines : des petits traits, qui comptent des jours." },
        { who: "frimas", text: "…Givrel faisait ça. Quand il avait peur. Il comptait.", emo: "Sad" },
        { who: "partner", text: "Frimas… tu as le droit d’avoir peur, toi aussi." },
        { who: "frimas", text: "Un garde ne tremble pas." },
        { who: "rask", text: "Un garde, non. Un grand frère, si. Et tu trembles depuis qu’on est entrés." },
        { who: "frimas", text: "…Oui.", emo: "Sigh" }
      ]
    },
    boss: [
      { who: "boss", text: "GRAND… FRÈRE… TU… M’AS… LAISSÉ…" },
      { who: "frimas", text: "…Givrel.", emo: "Stunned" },
      { who: "frimas", text: "Je suis là. Je suis là, maintenant. Je ne te laisserai plus.", emo: "Crying" },
      { who: "frimas", text: "{name}. Aide-moi à le ramener. Ne le blesse pas plus que nécessaire.", emo: "Determined" }
    ],
    victory: [
      { who: null, text: "La glace noire se brise comme du verre. Un petit corps tombe dans la neige… et respire." },
      { who: "givrel", text: "…Frimas ? Tu… tu pleures ?" },
      { who: "frimas", text: "Non. C’est la neige.", emo: "Crying" },
      { who: "frimas", text: "…C’est faux. Je pleure. Je pleure parce que tu es vivant, idiot.", emo: "Happy" },
      { who: "frimas", text: "{name}. Je ne suis pas doué avec les mots. Alors je vais faire simple. Appelez, et je viendrai. Même au bout du monde. Surtout au bout du monde." }
    ],
    hall: [{ who: "capKyurem", text: "Douze sont revenus. Je vous dois la vie d’un de mes gardes. Glacial Kyurem ne l’oubliera pas." }]
  },
  lunala: {
    friend: "nyx", cap: "capLunala", mission: "S_LUNALA", wave: 2, fav: "orbelum",
    intro: [
      { who: "capLunala", text: "Vous êtes ceux dont tout le monde parle. Hm. Plus petits que prévu." },
      { who: "capLunala", text: "La Tour des Échos a cessé de résonner. Quand une tour d’écho se tait, c’est que quelque chose écoute à sa place." },
      { who: "capLunala", text: "Nyx est ma meilleure éclaireuse. Elle n’aime pas les équipes. Elle n’aime pas grand-chose." },
      { who: "nyx", text: "Je travaille seule. Vous me ralentirez.", cue: "in:nyx" },
      { who: "rask", text: "Et moi je travaille en groupe, et vous me fatiguez tous. On fait aller." },
      { who: "nyx", text: "…Toi, tu sens les ruelles.", emo: "Surprised" },
      { who: "rask", text: "Et toi, tu sens l’Ombre. Ça nous fait un point commun." },
      { who: "nyx", text: "…", emo: "Angry" }
    ],
    floors: {
      1: [{ who: "nyx", text: "Ne faites pas de bruit. Chaque pas résonne mille fois ici." }, { who: "partner", text: "D’accord !! …Oups.", emo: "Worried" }],
      4: [
        { who: null, text: "Les échos changent. Ils ne répètent plus vos pas. Ils murmurent un nom." },
        { who: "echo", text: "Nyx… Nyx… Reviens… Tu es des nôtres…" },
        { who: "nyx", text: "Taisez-vous… TAISEZ-VOUS !", emo: "Pain" },
        { who: "nyx", text: "…Vous voulez savoir pourquoi je travaille seule ? Parce que j’étais l’une d’entre eux. Une créature de l’Ombre.", emo: "Sad" },
        { who: "nyx", text: "La Capitaine m’a purifiée. Mais l’Ombre ne part jamais vraiment. Un jour, elle reviendra. Et ce jour-là, je ne veux blesser personne." },
        { who: "partner", text: "Alors on sera là ce jour-là. Pour te rattraper. C’est à ça que servent les amis.", emo: "Determined" },
        { who: "thought", text: "Ce qu’on était ne décide pas de ce qu’on est. Pourquoi ces mots me touchent-ils autant ?" }
      ]
    },
    boss: [
      { who: null, text: "Au sommet de la tour, une silhouette vous attend. La même que Nyx… mais noire comme une nuit sans lune." },
      { who: "boss", text: "Tu ne peux pas me fuir. Je suis toi. La vraie toi." },
      { who: "nyx", text: "Non ! Tu es ce que j’étais. Pas ce que je suis !", emo: "Shouting" },
      { who: "nyx", text: "{name}, {partner}, Rask… Restez avec moi. Ne me lâchez pas.", emo: "Determined" }
    ],
    victory: [
      { who: null, text: "Le reflet se dissout en mille échos. Puis, enfin, la tour se remet à chanter." },
      { who: "nyx", text: "…Elle n’a pas disparu. Elle ne disparaîtra jamais. Mais elle n’a plus d’emprise.", emo: "Sigh" },
      { who: "nyx", text: "Parce que, cette fois, je n’étais pas seule.", emo: "Happy" },
      { who: "rask", text: "Tu viens de sourire. Je l’ai vu. Je vais le raconter à tout le monde." },
      { who: "nyx", text: "Fais ça et je te mords.", emo: "Angry" },
      { who: "nyx", text: "…Si un jour l’obscurité vous entoure, cherchez la lune. J’y serai. C’est mon serment." }
    ],
    hall: [{ who: "capLunala", text: "Elle m’a dit « merci ». En deux ans, c’est la première fois. Je ne sais pas ce que vous lui avez fait, mais continuez." }]
  },
  hoopa: {
    friend: "zip", cap: "capHoopa", mission: "S_HOOPA", wave: 2, fav: "cristal",
    intro: [
      { who: null, text: "La Maison des Guildes. Personne. Puis un anneau doré s’ouvre dans le plafond, et une créature tombe sur la table.", cue: "shake" },
      { who: "capHoopa", text: "Tadaaa ! Anneau de Hoopa, toujours là où on ne l’attend pas !", cue: "hop:capHoopa" },
      { who: "capHoopa", text: "Mon petit Zip a fait une bêtise. Une GROSSE bêtise. Il a volé quelque chose aux mauvaises personnes." },
      { who: "zip", text: "« Emprunté » ! J’ai EMPRUNTÉ ! Salut tout le monde ! Oh, joli pendentif. Je peux le voir ?", emo: "Joyous", cue: "in:zip" },
      { who: "partner", text: "NON !", emo: "Angry" },
      { who: "zip", text: "Ok, ok ! Pas touche. Mais je l’aurais rendu. Probablement." },
      { who: "rask", text: "…Oh non. Il me ressemble. En pire.", emo: "Sigh" },
      { who: "capHoopa", text: "Il se cache dans le Cirque des Anneaux. Ses poursuivants aussi. Ramenez-le, avec ce qu’il a volé, et sans trous en plus." }
    ],
    floors: {
      1: [{ who: "zip", text: "Bienvenue au Cirque ! Attention, les anneaux téléportent. Parfois dans le vide. C’est rigolo." }],
      4: [
        { who: "zip", text: "Vous voulez savoir ce que j’ai volé ? Une carte. Une carte de toutes les failles de The World. Avec des croix dessus.", emo: "Worried" },
        { who: "rask", text: "Montre-moi ça. …Ces croix. Elles forment un cercle autour du palais.", emo: "Surprised" },
        { who: "zip", text: "Je l’ai piquée à des types avec une marque bizarre. Un œil dans un croissant." },
        { who: "rask", text: "Le Receleur.", emo: "Angry" },
        { who: "zip", text: "Tu le connais ?", emo: "Surprised" },
        { who: "rask", text: "…J’ai travaillé pour lui. Avant. Je volais pour lui, comme toi tu voles pour rire. Sauf que moi, je ne riais pas.", emo: "Sigh" },
        { who: "rask", text: "Écoute, le gamin. Voler, c’est facile. Ce qui est dur, c’est d’arrêter de courir." }
      ]
    },
    boss: [
      { who: "boss", text: "GRRR… LA CARTE… RENDS… LA CARTE…" },
      { who: "zip", text: "Le chien du Receleur ! Il me suit depuis trois jours… Je peux me téléporter loin, très loin, et…", emo: "Worried" },
      { who: "rask", text: "Et courir toute ta vie ? Non. Aujourd’hui, on s’arrête. Ensemble.", emo: "Determined" },
      { who: "zip", text: "…D’accord. Pour une fois, je reste.", emo: "Determined" }
    ],
    victory: [
      { who: null, text: "Le chien de l’Ombre s’effondre. À son cou, un médaillon gravé de l’œil et du croissant." },
      { who: "zip", text: "On a gagné ! Et je n’ai rien volé pendant tout le combat ! Enfin… presque rien.", emo: "Happy" },
      { who: "rask", text: "Rends-lui sa bourse." },
      { who: "zip", text: "…Tiens, {partner}. Elle était tombée. Tout à fait par hasard." },
      { who: "zip", text: "Rask… merci. Personne ne m’avait jamais dit de m’arrêter. On m’avait juste dit de courir plus vite.", emo: "Sad" },
      { who: "zip", text: "Si un jour vous avez besoin de moi, ouvrez n’importe quelle porte et criez « ZIP ! ». J’arriverai. Peut-être par la fenêtre. C’est mon serment !", emo: "Joyous", cue: "hop:zip" }
    ],
    hall: [{ who: "capHoopa", text: "Tadaaa ! Mon petit voleur est revenu avec la carte ET un cœur tout neuf. Je vous adore !" }]
  }
};
const GUILD_ORDER = ["kyogre", "victini", "zygarde", "amovenus", "dialga", "kyurem", "lunala", "hoopa"];

// ============================================================
//  CHAPITRE 4 : L'OMBRE DU VIZIR (la conspiration et la vérité)
// ============================================================
const CH4 = {
  title: "Chapitre 4 : L’Ombre du Vizir",
  objIntro: "Les cloches du palais sonnent l’alerte ! Va au palais.",
  objEgouts: "Suis Rask dans les Bas-Fonds (Maison des Guildes ou touche cet objectif).",
  objArchives: "Archives Interdites : déchiffre le parchemin avec Sablier.",
  objFaille: "Le pendentif a ouvert une faille. Entre dans le Cœur de la Faille.",
  objPalace: "Retourne au palais. La vérité t’attend.",
  intro: { bg: "throne", cast: ["hero", "partner", "rask", "guard@", "capAmovenus", "capDialga", "kingSleep"], lines: [
    { who: null, text: "Le lendemain matin, les cloches du palais sonnent l’alerte." },
    { who: "guard", text: "Explorateurs ! Le Roi… Le Roi ne se réveille pas !", emo: "Worried", cue: "in:guard" },
    { who: null, text: "Dans la chambre royale, le Roi dort. Une brume noire s’enroule autour de lui comme un serpent." },
    { who: "capAmovenus", text: "Son cœur bat. Mais son esprit est ailleurs. Prisonnier.", emo: "Sad" },
    { who: "capDialga", text: "Ce n’est pas une maladie. C’est un sort. Un sort très ancien… qu’on croyait disparu avec le Vizir." },
    { who: "partner", text: "Le Vizir ?", emo: "Surprised" },
    { who: "capDialga", text: "Kharzan. Le bras droit du Roi Originel, il y a bien longtemps. On raconte qu’il a trahi son roi et qu’il a disparu dans la toute première faille." },
    { who: "partner", text: "Et le Chancelier ? Il était toujours à côté du Roi…" },
    { who: "capAmovenus", text: "Introuvable depuis cette nuit." },
    { who: "rask", text: "L’œil dans le croissant… Le Receleur… Tout se tient. Le Receleur travaille pour quelqu’un. Et je sais où le trouver.", emo: "Angry" },
    { who: "rask", text: "Dans les Bas-Fonds. Là où j’ai grandi. Là où j’avais juré de ne jamais revenir.", emo: "Sigh" },
    { who: "partner", text: "Alors on y va ensemble.", emo: "Determined" }
  ] },
  egoutsIntro: { bg: "sewer", cast: ["hero", "partner", "rask"], lines: [
    { who: "rask", text: "Les Bas-Fonds. Sous le Royaume, il y a un autre royaume. Sans roi. Sans lumière." },
    { who: "rask", text: "Quand j’étais petit, le Receleur m’a trouvé ici. Il m’a donné à manger. Puis il m’a appris à voler. Puis il m’a appris à ne plus rien ressentir." },
    { who: "partner", text: "Rask…", emo: "Sad" },
    { who: "rask", text: "Pas de pitié. J’ai fini par partir. Le jour où il m’a demandé de voler le dernier repas d’une famille de petits." },
    { who: "rask", text: "Allez. Il nous attend.", emo: "Determined" }
  ] },
  egoutsFloors: {
    3: { cue: "thugs", lines: [
      { who: "chef", text: "À l’aide ! AU SECOURS !", emo: "Pain" },
      { who: "partner", text: "Ce sont… les voyous de la plage !", emo: "Surprised" },
      { who: "sbire1", text: "Le Receleur veut nous faire taire ! Parce qu’on sait pour le client !", emo: "Crying" },
      { who: "partner", text: "Le client ?" },
      { who: "chef", text: "Celui qui nous a payés pour voler ton pendentif ! Une voix sans visage ! Elle disait que le pendentif était « la clé du trône »…" },
      { who: "rask", text: "{name}. On les aide ?" }
    ], choice: ["On les aide.", "Ils l’ont cherché… mais on les aide."], after: [
      { who: null, text: "Vous repoussez les ombres qui encerclaient les trois voyous." },
      { who: "chef", text: "Pourquoi… Pourquoi vous nous aidez ? On vous a volés !", emo: "Teary-Eyed" },
      { who: "partner", text: "Parce que c’est ce que font les explorateurs. Et parce que tout le monde mérite une deuxième chance." },
      { who: "sbire2", text: "Chef… Je crois que je vais pleurer…", emo: "Crying" },
      { who: "chef", text: "Tu pleures déjà, imbécile. …On vous revaudra ça. Promis. Pour de vrai, cette fois." }
    ] }
  },
  egoutsBoss: [
    { who: "boss", text: "Rask. Mon petit Rask. Tu reviens enfin à la maison ?" },
    { who: "rask", text: "Ce n’était pas une maison. C’était une cage.", emo: "Angry" },
    { who: "boss", text: "Je t’ai nourri. Je t’ai appris tout ce que tu sais." },
    { who: "rask", text: "Oui. Et aujourd’hui, je vais te montrer ce que j’ai appris tout seul : avoir des amis.", emo: "Determined" }
  ],
  egoutsVictory: [
    { who: "boss", text: "Tu… crois… avoir gagné ? Le Maître… est déjà au palais… Il a toujours été au palais…" },
    { who: "rask", text: "Qui ?! Qui est ton maître ?!", emo: "Shouting" },
    { who: "boss", text: "Hé… hé… Celui qui conseille le Roi… depuis… le début…" },
    { who: null, text: "Le Receleur se dissout en fumée noire. Il ne reste qu’un parchemin, scellé de l’œil et du croissant." },
    { who: "rask", text: "…C’est fini. Je ne lui dois plus rien.", emo: "Sigh" },
    { who: "partner", text: "Rask. Tu viens de faire un câlin à ton passé.", emo: "Happy" },
    { who: "rask", text: "J’ai fait QUOI ?", emo: "Angry" },
    { who: "partner", text: "Ce parchemin est écrit dans une langue bizarre… Il nous faut quelqu’un qui sait lire les vieux trucs." },
    { who: "rask", text: "Je connais un sablier qui adore les vieux trucs." }
  ],
  archivesIntro: { bg: "library", cast: ["hero", "partner", "rask", "sablier@"], lines: [
    { who: "sablier", text: "Ce parchemin est écrit en langue royale ancienne. Seules les Archives Interdites peuvent le traduire.", cue: "in:sablier" },
    { who: "sablier", text: "Elles sont sous la Bibliothèque Engloutie. Interdites. Scellées. Dangereuses. J’ADORE.", emo: "Inspired", cue: "hop:sablier" },
    { who: "rask", text: "Super. Un sablier qui adore le danger. On était à court de problèmes." }
  ] },
  archivesFloors: {
    2: [
      { who: null, text: "Une fresque immense couvre le mur : un roi coiffé d’une couronne d’étoiles, et à sa droite, une silhouette en robe noire." },
      { who: "sablier", text: "Le Roi Originel et son Vizir. Kharzan. Ils étaient amis, autrefois. Les meilleurs amis du monde, d’après les textes." },
      { who: "thought", text: "Ce visage… Je le connais. Comme on connaît son propre reflet.", emo: "Stunned" }
    ],
    4: [
      { who: null, text: "Un texte gravé dans la pierre : « Le jour où le Vizir voulut l’Éther, le Roi scella sa propre mémoire dans une étoile, et s’en alla là où nul ne pourrait le trouver. »" },
      { who: "partner", text: "Une étoile… Le Pendentif d’Étoile ?!", emo: "Surprised" },
      { who: "sablier", text: "Il y a une suite : « Le sceau déchira le monde. Ainsi naquirent les failles. »" },
      { who: "rask", text: "Donc les failles… c’est la faute d’un roi qui ne voulait pas se souvenir ?" },
      { who: "sablier", text: "Ou la preuve d’un roi qui a préféré tout perdre plutôt que de laisser l’Éther à un traître." }
    ],
    6: [
      { who: null, text: "Un dernier fragment, presque effacé : un capitaine de la garde royale, portant une étoile dans ses mains, qui s’éloigne vers la mer." },
      { who: "partner", text: "Ce capitaine… Il a la même allure que le portrait de papa…", emo: "Stunned" }
    ]
  },
  archivesBoss: [
    { who: "boss", text: "INTRUS. LA VÉRITÉ EST SCELLÉE. LA VÉRITÉ DOIT RESTER SCELLÉE." },
    { who: "sablier", text: "Le savoir, c’est ce qui reste quand on a tout perdu. Et on a le droit de savoir !", emo: "Determined" }
  ],
  archivesVictory: [
    { who: "sablier", text: "Le parchemin… je peux le lire, maintenant. « Au Maître : le pendentif est la clé. Celui qui le porte en son cœur est la serrure. Le Roi qui dort est la porte. »" },
    { who: "sablier", text: "Le Roi qui dort… La porte vers quoi ?", emo: "Worried" },
    { who: "partner", text: "Le pendentif… Il réagit ! Il… il tire vers quelque part !", emo: "Surprised", cue: "pendant:partner" },
    { who: null, text: "Le pendentif s’élève dans les airs, et une faille s’ouvre devant vous. Bleue. Froide. Familière.", cue: "flash" },
    { who: "partner", text: "Mon père a disparu dans une faille… Et si… et si c’était celle-là ?", emo: "Worried" },
    { who: "rask", text: "Alors on va le chercher. Et s’il n’y est pas, on aura au moins visité un endroit nul." }
  ],
  failleFloors: {
    1: [{ who: null, text: "À l’intérieur de la faille, le sol change sous vos pas. Forêt, glace, ruines… Tout se mélange." }],
    3: [{ who: "echo", text: "…Ne t’approche pas… c’est un piège…" }, { who: "partner", text: "Cette voix… Je la connais. Je ne l’ai jamais entendue… mais je la connais.", emo: "Stunned" }]
  },
  failleBoss: [
    { who: "boss", text: "LE PRISONNIER NE PARTIRA PAS. LE SCEAU DOIT TENIR." },
    { who: null, text: "Derrière le Geôlier, enchaînée par des liens d’ombre, une silhouette encapuchonnée." },
    { who: "partner", text: "LÂCHE-LE !", emo: "Shouting" }
  ],
  father: { bg: "rift", cast: ["hero", "partner", "rask", "orion@"], lines: [
    { who: null, text: "Les chaînes se brisent. La silhouette tombe à genoux, et sa capuche glisse.", cue: "in:orion" },
    { who: "orion", text: "…Tu as tant grandi.", emo: "Sad" },
    { who: "partner", text: "…Papa ?", emo: "Stunned" },
    { who: "orion", text: "Je t’ai regardé grandir de loin. Au tournoi, depuis le balcon… J’aurais tant voulu descendre te serrer dans mes bras.", emo: "Teary-Eyed" },
    { who: "partner", text: "Pourquoi tu n’es jamais revenu ?! Grand-mère t’a attendu toute sa vie ! MOI, je t’ai attendu !", emo: "Crying" },
    { who: "orion", text: "Parce que je ne pouvais pas. Je suis le gardien du sceau. Tant que je reste dans la faille, le sceau tient.", emo: "Sad" },
    { who: "orion", text: "Il y a longtemps, j’étais le capitaine de la garde du Roi Originel. Le jour où Kharzan l’a trahi, le Roi m’a confié une étoile : sa mémoire, scellée." },
    { who: "orion", text: "« Porte-la loin d’ici. Qu’elle grandisse auprès de quelqu’un au cœur pur. » Voilà ce qu’il m’a dit." },
    { who: "orion", text: "Alors je l’ai confiée à ma mère. Ta grand-mère. Et je suis entré dans la faille pour tenir le sceau de l’intérieur." },
    { who: "partner", text: "Alors… le pendentif… il n’a jamais été à toi ?", emo: "Teary-Eyed" },
    { who: "orion", text: "Si. Il était à moi de le protéger. Et maintenant, c’est à toi.", emo: "Happy" },
    { who: "orion", text: "Et toi… Je savais que tu reviendrais. Sur la même plage. Exactement là où je l’avais promis.", cue: "face:orion:hero" },
    { who: "thought", text: "…Promis ?", emo: "Stunned" },
    { who: "orion", text: "Il n’y a plus de temps. Kharzan sait que vous êtes ici. La faille se referme. Je dois rester.", emo: "Worried", cue: "shake" },
    { who: "partner", text: "Non ! Pas encore ! Je viens juste de te retrouver !", emo: "Crying" },
    { who: "orion", text: "Écoute-moi. Je suis fier de toi. Tellement fier. Retourne au palais. Le Vizir s’y cache. Il porte un autre visage." },
    { who: "orion", text: "Et {partner}… ne lâche jamais la main de ton ami. Quoi qu’il découvre sur lui-même.", emo: "Happy" },
    { who: null, text: "La faille se referme dans un éclair bleu. {partner} reste à genoux, le pendentif serré contre son cœur.", cue: "flash|out:orion" },
    { who: "rask", text: "…Hé. Il est vivant. C’est déjà énorme.", emo: "Sad" },
    { who: "partner", text: "Oui. Il est vivant. Et je vais le sortir de là. Mais d’abord… le palais.", emo: "Determined" }
  ] },
  palace: { bg: "council", cast: ["hero", "partner", "rask", "chancelier", "kingSleep"], lines: [
    { who: null, text: "Le palais est silencieux. Trop silencieux. Dans la salle du Conseil, une seule silhouette veille sur le Roi endormi." },
    { who: "chancelier", text: "Ah. Les Explorateurs Royaux. Vous rentrez bien tard." },
    { who: "partner", text: "C’est vous ! Le maître du Receleur ! Celui qui conseille le Roi depuis le début !", emo: "Angry" },
    { who: "chancelier", text: "Depuis le début… Oui. Depuis bien plus longtemps que tu ne le crois, petit." },
    { who: null, text: "La silhouette du Chancelier se déchire comme du papier. Une ombre immense s’en échappe, coiffée d’une couronne brisée.", cue: "vizir|shake" },
    { who: "vizir", text: "Je suis Kharzan. Le Vizir. L’Ombre qui a survécu au sceau." },
    { who: "vizir", text: "Regardez-le… Il ne se rappelle même pas qu’il a régné sur ce monde ! Tu es le Roi Originel, {name} ! C’est toi qui as créé les failles en scellant ta propre mémoire pour échapper à mon emprise !", emo: "Shouting" },
    { who: "thought", text: "…Moi ?", emo: "Stunned", cue: "flash" },
    { who: null, text: "Des images explosent dans ta tête. Une couronne d’étoiles. Une main amie qui se referme sur la tienne… puis qui serre trop fort." },
    { who: "vizir", text: "Nous étions amis, mon roi. Je voulais seulement l’Éther pour réparer ce monde. Un monde sans failles, sans pertes, sans larmes. Et tu as refusé." },
    { who: "vizir", text: "Alors tu t’es effacé. Tu as préféré déchirer le monde plutôt que de me le confier !", emo: "Angry" },
    { who: "partner", text: "Roi ou pas… {name} est mon ami ! C’est celui qui m’a tendu la main sur la plage quand j’étais seul !", emo: "Shouting", cue: "hop:partner" },
    { who: "rask", text: "Et pour info, je ne fais pas de câlins aux rois. Mais pour lui, je ferai une exception.", emo: "Determined" },
    { who: "hero", text: "Mon passé n’a plus d’importance. Ce qui compte, c’est ce que je choisis de protéger aujourd’hui !", emo: "Determined", cue: "hop:hero" },
    { who: "vizir", text: "Alors tu choisis encore de me tourner le dos. Comme la dernière fois.", emo: "Sad" },
    { who: "vizir", text: "Rask. Toi qui as volé toute ta vie. Rejoins-moi. Je te donnerai un royaume entier à piller." },
    { who: "rask", text: "J’ai volé beaucoup de choses. Mais eux, ils m’ont donné quelque chose qu’on ne vole pas. Alors non." },
    { who: "vizir", text: "Assez joué." },
    { who: null, text: "D’un geste, le Vizir arrache le pendentif du cou de {partner}.", cue: "shake|pendant:vizir" },
    { who: "partner", text: "NON !", emo: "Pain" },
    { who: "vizir", text: "La clé est à moi. Le Roi endormi m’ouvrira la porte. Et l’Éther Originel, au sommet de la Tour Céleste, refera ce monde." },
    { who: null, text: "Le sol tremble. Au loin, au-dessus de la mer, une tour immense jaillit des flots et perce les nuages.", cue: "shake" },
    { who: "vizir", text: "Cent étages, mon roi. Monte, si tu l’oses. Je t’attendrai au sommet. Comme autrefois.", cue: "out:vizir|flash" },
    { who: null, text: "L’Ombre s’évanouit. Le Roi, lui, se réveille en sursaut.", cue: "wake:king" },
    { who: "king", text: "…J’ai tout vu. Dans mon rêve. Tout.", emo: "Worried" },
    { who: "king", text: "{name}… Pardonne-moi. J’étais ton élève, autrefois. Le jour où tu as disparu, tu m’as confié le trône « en attendant ». J’ai attendu si longtemps…", emo: "Teary-Eyed" },
    { who: "king", text: "Bienvenue chez toi… mon roi." },
    { who: "partner", text: "{name}… Tu vas monter dans cette tour ?", emo: "Worried" }
  ] },
  palaceChoice: ["Oui. Ensemble.", "Je n’ai pas le choix."],
  palaceEnd: [
    { who: "partner", text: "Alors je monte avec toi. Cent étages, mille, je m’en fiche.", emo: "Determined" },
    { who: "rask", text: "Cent étages. Évidemment. Personne ne construit jamais de tour à trois étages." }
  ],
  end: "Chapitre 4 — Fin",
  endSub: "La Tour Céleste s’élève au-dessus de la mer. Le chapitre 5 commence à la porte sud du Royaume."
};

// ============================================================
//  CHAPITRE 5 : LA BATAILLE CÉLESTE (100 étages)
// ============================================================
const CH5 = {
  title: "Chapitre 5 : La Bataille Céleste",
  objStart: "La Tour Céleste t’attend. Sors par la porte sud du Royaume.",
  objTower: "Tour Céleste : reprise à l’étage {f} / 100 (porte sud).",
  intro: { bg: "beachDawn", cast: ["hero", "partner", "rask"], lines: [
    { who: null, text: "L’aube. La plage où tout a commencé. Au loin, la Tour Céleste transperce le ciel." },
    { who: "partner", text: "C’est ici que je t’ai trouvé. Allongé dans le sable. J’ai cru que la mer t’avait emporté." },
    { who: "partner", text: "Et maintenant, regarde-nous. On va sauver le monde. Grand-mère ne me croirait jamais.", emo: "Happy" },
    { who: "rask", text: "Moi non plus, je n’y crois pas. Et pourtant, je suis là." },
    { who: "thought", text: "Roi Originel… Je ne me souviens toujours de presque rien. Seulement de fragments. Mais je me souviens de chaque jour depuis cette plage. Et ça, c’est ma vraie vie." },
    { who: "hero", text: "Allons-y.", emo: "Determined" }
  ] },
  base: { bg: "towerbase", cast: ["hero", "partner", "rask"], lines: [
    { who: null, text: "Au pied de la Tour Céleste, l’armée de l’Ombre bloque le passage. Des milliers d’yeux rouges." },
    { who: "hero", text: "Il y en a trop… On ne pourra jamais passer !", emo: "Worried" },
    { who: null, text: "Soudain, une vague géante fend les rangs ennemis.", cue: "shake|in:ondin" },
    { who: "ondin", text: "L’Ordre des Tsunami est là ! On vous avait promis qu’on couvrirait vos arrières !", emo: "Determined" },
    { who: "sablier", text: "Le temps est de notre côté ! Avancez !", cue: "in:sablier" },
    { who: "allFriends", text: "FORMEZ UNE BRÈCHE ! LAISSEZ PASSER L’ÉQUIPE DE {NAME} !", cue: "in:ardent|in:frimas|in:racine|in:nyx|in:lys|in:zip|shake" },
    { who: "allCaptains", text: "Allez terrasser le traître ! Le royaume repose sur vos épaules !", cue: "flash" },
    { who: "partner", text: "Ils sont tous venus… Tous !", emo: "Teary-Eyed" },
    { who: "rask", text: "Les serments. Ils les ont tenus. Bon sang… j’ai une poussière dans l’œil.", emo: "Sigh" }
  ] },
  // relais : un ami tient l'étage pendant que l'équipe monte (soins et sauvegarde)
  camps: {
    10: { who: "ondin", lines: [{ who: "ondin", text: "Je n’ai plus peur des vagues. Je SUIS la vague ! Montez, je tiens l’étage !", emo: "Determined" }] },
    20: { who: "ardent", lines: [{ who: "ardent", text: "Une victoire seule, c’est une victoire vide ! Alors gagnez-la pour nous tous ! ALLEZ !", emo: "Shouting" }] },
    30: { who: "racine", lines: [{ who: "racine", text: "Cent membres, un seul ordre. Et cet ordre, c’est : MONTEZ !" }, { who: "racine", text: "…Et faites attention aux pousses, même ici." }] },
    40: { who: "lys", lines: [{ who: "lys", text: "Laissez-moi vous soigner. Une dernière fois… et cette fois, c’est vous qui me laissez faire.", emo: "Happy" }, { who: null, text: "Une lumière douce enveloppe l’équipe. Toutes les blessures se referment." }] },
    50: { who: "chef", lines: [
      { who: "chef", text: "Hé, les mauviettes ! …Pardon. Les héros. On est venus rembourser notre dette !", emo: "Determined" },
      { who: "sbire1", text: "On a même volé une carte de la tour !" },
      { who: "sbire2", text: "Enfin… Zip nous l’a donnée." },
      { who: "chef", text: "Montez ! On tient la porte ! Pour une fois qu’on garde un trésor au lieu de le voler !" }
    ] },
    60: { who: "sablier", lines: [{ who: "sablier", text: "Il est midi pile. L’heure parfaite pour sauver le monde.", emo: "Inspired" }, { who: "sablier", text: "Je note tout. Un jour, on racontera cette tour dans les livres. Montez !" }] },
    70: { who: "frimas", lines: [{ who: "frimas", text: "Partez. Je tiendrai. Je suis un mur." }, { who: "givrel", text: "Et moi, je suis un petit mur ! Allez-y !" }] },
    80: { who: "nyx", reveal: true, lines: [{ who: "nyx", text: "L’Ombre est épaisse, ici. Mais je la connais par cœur. Je vous montre le chemin." }, { who: null, text: "Nyx déploie ses ailes : tout l’étage s’illumine sur ta carte." }] },
    90: { who: "zip", skip: 95, lines: [{ who: "zip", text: "Raccourci ! Anneau express jusqu’au 95e étage !", emo: "Joyous" }, { who: "zip", text: "Quoi ? Ce n’est pas de la triche si c’est pour sauver le monde !" }] }
  },
  campHeal: "L’équipe reprend des forces. Étape sauvegardée : tu pourras reprendre ici.",
  father: { bg: "towertop", cast: ["hero", "partner", "rask", "orion@"], lines: [
    { who: null, text: "Au 95e étage, l’air se fige. Une faille bleue s’ouvre au milieu des ombres.", cue: "flash|in:orion" },
    { who: "orion", text: "Le sceau se brise… Alors je peux enfin sortir. Et me battre à vos côtés." },
    { who: "partner", text: "PAPA !", emo: "Joyous", cue: "hop:partner" },
    { who: "orion", text: "Allez. Je retiens les ombres. Fils… je t’attends en bas, après. On rentrera à la maison. Tous les deux.", emo: "Happy" },
    { who: "partner", text: "Tous les trois. Non, tous les quatre ! Rask aussi !", emo: "Teary-Eyed" },
    { who: "rask", text: "…Je vais finir par vraiment avoir besoin de mouchoirs." }
  ] },
  ult: { bg: "towertop", cast: ["hero", "partner", "rask"], lines: [
    { who: null, text: "Le 99e étage. Un dernier palier, un dernier silence avant le sommet." },
    { who: "partner", text: "{name}. Avant le dernier étage… On choisit notre attaque ultime. Celle qu’on lancera ensemble.", emo: "Determined" }
  ] },
  ultPrompt: "Notre attaque ultime :",
  ultChosen: [
    { who: "partner", text: "« {atk} » ! Parfait. On la lancera ensemble, au moment où il s’y attendra le moins.", emo: "Inspired" },
    { who: "rask", text: "Et moi, je lui balance un caillou dans l’œil pour la diversion. Chacun son talent." }
  ],
  boss: [
    { who: "boss", text: "Te voilà enfin, mon roi. Au sommet du monde. Comme autrefois." },
    { who: "boss", text: "Regarde. L’Éther Originel. Avec la clé et la porte, je vais réécrire The World. Plus de failles. Plus de pertes. Plus de larmes." },
    { who: "partner", text: "Et plus de liberté ! Un monde sans larmes, c’est un monde où plus personne n’a le droit de ressentir !", emo: "Angry" },
    { who: "boss", text: "Silence, enfant ! Tu ne sais rien de la perte !" },
    { who: "partner", text: "J’ai attendu mon père toute ma vie. Je sais tout de la perte. Et je ne changerais rien, parce que c’est ce qui m’a mené jusqu’à {name} !", emo: "Determined" },
    { who: "hero", text: "Kharzan. Tu étais mon ami. Je vais te libérer.", emo: "Determined" }
  ],
  ultimate: [
    { who: "partner", text: "{name} ! Envoie ton attaque ultime ! Celle qu’on a configurée ensemble !", emo: "Shouting" },
    { who: "rask", text: "Je m’occupe de la diversion ! Hé, le Vizir ! Attrape !", cue: "rock" },
    { who: null, text: "« {atk} » !!!", cue: "ult" },
    { who: "boss", text: "Impossible… La force de l’amitié… l’emporte sur l’Éther Originel ?!", emo: "Pain" }
  ],
  after: { bg: "towertop", cast: ["hero", "partner", "rask", "vizir@"], lines: [
    { who: null, text: "La couronne brisée de Kharzan se fend en deux. L’Ombre se dissipe… et il ne reste qu’une créature fatiguée, à genoux.", cue: "in:vizir|light:vizir" },
    { who: "vizir", text: "…Je voulais juste… que plus personne ne perde personne. J’ai perdu ma sœur dans la toute première faille. Tu te souviens ?", emo: "Sad" },
    { who: "hero", text: "Je me souviens." },
    { who: "thought", text: "Oui… Je me souviens de tout, maintenant. De lui. De nous. De la couronne. Et du jour où j’ai choisi de tout oublier pour protéger ce monde." },
    { who: "vizir", text: "Pardonne-moi… mon ami.", emo: "Teary-Eyed" },
    { who: "hero", text: "Ce monde a des failles, Kharzan. Mais c’est dans les failles que la lumière passe." },
    { who: null, text: "Le pendentif retombe dans la main de {partner}. Il brille plus fort que jamais. Partout dans The World, les failles se referment une à une.", cue: "flash|pendant:partner" },
    { who: "partner", text: "On a réussi… {name}, ON A RÉUSSI !", emo: "Joyous", cue: "hop:partner|hop:hero" },
    { who: "rask", text: "D’accord. D’accord ! Un câlin. Un seul. VITE.", emo: "Happy", cue: "hop:rask" }
  ] }
};

// ============================================================
//  ÉPILOGUE : LE GRAND CHOIX
// ============================================================
const ORDERS = [
  { id: "victini", guild: "victini", name: "Intégrer l’Ordre Victory Victini", unlock: "Débloque les défis d’attaque et l’arène explosive." },
  { id: "kyogre", guild: "kyogre", name: "Intégrer l’Ordre Tsunami Kyogre", unlock: "Débloque les Abysses Profondes (donjon maritime)." },
  { id: "dialga", guild: "dialga", name: "Intégrer l’Ordre Time Dialga", unlock: "Débloque les Failles Temporelles (un décor différent à chaque étage)." },
  { id: "kyurem", guild: "kyurem", name: "Intégrer l’Ordre Glacial Kyurem", unlock: "Débloque la Toundra Éternelle (survie arctique : le ventre se vide plus vite)." },
  { id: "zygarde", guild: "zygarde", name: "Intégrer l’Ordre 100 Zygarde", unlock: "Débloque le Sanctuaire Vivant (régénération à chaque pas)." },
  { id: "lunala", guild: "lunala", name: "Intégrer l’Ordre Moon Hunter Lunala", unlock: "Débloque les Contrats de l’Ombre (missions d’infiltration bien payées)." },
  { id: "amovenus", guild: "amovenus", name: "Intégrer l’Ordre Amour Amovénus", unlock: "Débloque le bonus de synergie : +10 % de stats avec une équipe de trois." },
  { id: "hoopa", guild: "hoopa", name: "Intégrer l’Ordre Anneau Hoopa", unlock: "Débloque l’Anneau : téléportation vers un donjon et un étage au hasard." },
  { id: "libre", guild: null, name: "Refuser et fonder notre propre guilde", unlock: "Débloque ton QG et le recrutement illimité des habitants en mode libre." }
];
const EPI = {
  title: "Épilogue : Le Grand Choix",
  scene: { bg: "throne", cast: ["hero", "partner", "rask", "king", "orion", "capVictini", "capKyogre"], lines: [
    { who: null, text: "Une semaine plus tard. Le Palais Royal. Le Conseil et les huit capitaines sont assemblés." },
    { who: null, text: "Orion est là, au premier rang, debout près de {partner}. Il n’a plus de capuche." },
    { who: "king", text: "{name}, {partner}, Rask… vous avez sauvé The World. Votre légende est gravée à jamais. Il est temps de choisir votre destinée." },
    { who: "king", text: "{name}… Le trône t’appartient, si tu le veux." },
    { who: "hero", text: "Garde-le. Il est entre de bonnes mains. Moi, j’ai déjà ce dont j’ai besoin.", cue: "hop:partner" },
    { who: "orion", text: "Le Roi Originel a toujours dit ça. « Une couronne pèse moins lourd qu’un ami. »", emo: "Happy" },
    { who: "king", text: "Alors choisissez votre Ordre. Chaque guilde vous ouvre ses portes… ou fondez la vôtre." }
  ] },
  prompt: "Votre destinée :",
  reactions: {
    victini: [{ who: "capVictini", text: "HAHA ! Bienvenue dans la guilde la plus forte de The World ! Ardent va être insupportable de joie." }],
    kyogre: [{ who: "capKyogre", text: "La mer vous attend. Ondin a déjà préparé vos hamacs. Il a pleuré en les installant." }],
    dialga: [{ who: "capDialga", text: "Je savais que vous choisiriez ça. Enfin, je l’ai su demain. Bienvenue, Sablier est ravi." }],
    kyurem: [{ who: "capKyurem", text: "Bienvenue. Frimas a souri. Deux fois. Nous sommes tous inquiets." }],
    zygarde: [{ who: "capZygarde", text: "Cent membres, un seul ordre. Cent trois, désormais. Racine a planté un arbre à votre nom." }],
    lunala: [{ who: "capLunala", text: "Bienvenue chez les chasseurs de lune. Nyx a dit « pas mal ». C’est le plus beau compliment qu’elle connaisse." }],
    amovenus: [{ who: "capAmovenus", text: "Venez là, mes chéris ! Lys a déjà fait du thé. Beaucoup trop de thé." }],
    hoopa: [{ who: "capHoopa", text: "Tadaaa ! Zip a déjà volé vos clés de chambre pour vous les rendre. C’est sa façon de dire bonjour." }],
    libre: [{ who: "king", text: "Votre propre guilde ? …Le Roi Originel aurait fait exactement le même choix. La maison du sud est à vous : ce sera votre QG." }]
  },
  finale: { bg: "beachSunset", cast: ["hero", "partner", "rask", "orion"], lines: [
    { who: null, text: "Le soir venu, sur la plage où tout a commencé." },
    { who: "partner", text: "Tu te souviens ? C’est ici que tout a commencé." },
    { who: "hero", text: "Je me souviens de tout, maintenant." },
    { who: "partner", text: "Et alors ? C’est comment, d’être un ancien roi ?", emo: "Happy" },
    { who: "hero", text: "Je préfère être ton partenaire.", emo: "Happy" },
    { who: "orion", text: "Ta grand-mère aurait adoré ce moment. Elle disait que le pendentif brillait plus fort quand on était sur le bon chemin." },
    { who: null, text: "Le Pendentif d’Étoile brille doucement. Comme un cœur qui bat.", cue: "pendant:partner" },
    { who: "rask", text: "Bon. On a sauvé le monde. On mange, maintenant ?" }
  ] },
  credits: ["Donjon Mystère Ultimate", "Une histoire imaginée par José", "Merci d’avoir joué !"],
  teaser: [
    { who: "traveler", text: "Bien joué, {name}. Vraiment." },
    { who: "traveler", text: "Mais les portes entre les dimensions… elles, ne se sont pas toutes refermées. À très bientôt." }
  ],
  end: "FIN",
  endSub: "Mode libre : ton Ordre est débloqué. Les mini-jeux, les liens et les trophées t’attendent au Royaume."
};
// Chapitre 1 : petite scène à l'entrée du premier donjon (étage 1)
CH1.floor1 = [
  { who: "partner", text: "On y est… La Forêt Verdoyante. Les voleurs sont forcément quelque part tout en bas.", emo: "Worried" },
  { who: "partner", text: "Reste près de moi, d’accord ? Enfin… je reste près de toi. C’est pareil." },
  { who: "thought", text: "Mon cœur bat vite. Mais bizarrement… je me sens à ma place, ici." }
];
// ---- donjons débloqués par les Ordres (épilogue) ----
DEFAULT_DATA.locations.push(
  { id: "E_ABYSSES", name: "Abysses Profondes", theme: ["Eau", "Ténèbres"], difficulty: 4, common_monsters: ["007", "013", "022", "029", "001", "032"], description: "Ordre Tsunami Kyogre : un donjon maritime sans fond. Le chant d’Abyssoral résonne tout en bas.", floors: 12, boss: "032" },
  { id: "E_FAILLES", name: "Failles Temporelles", theme: ["Acier", "Spectre"], difficulty: 4, common_monsters: ["024", "010", "015", "005", "003", "023", "021", "028"], description: "Ordre Time Dialga : chaque étage s’ouvre sur une autre époque… et un autre décor.", floors: 10, boss: "033", shuffleTheme: true },
  { id: "E_TOUNDRA", name: "Toundra Éternelle", theme: ["Glace"], difficulty: 4, common_monsters: ["005", "019", "028", "024", "007"], description: "Ordre Glacial Kyurem : survie arctique. Le ventre se vide deux fois plus vite.", floors: 10, boss: "028", hunger2: true },
  { id: "E_SANCTUAIRE", name: "Sanctuaire Vivant", theme: ["Plante", "Fée"], difficulty: 4, common_monsters: ["014", "018", "027", "026", "005", "031"], description: "Ordre 100 Zygarde : la forêt soigne ceux qui la respectent. 1 PV regagné à chaque pas.", floors: 10, boss: "031", regen1: true }
);
Object.assign(UNLOCKS, { E_ABYSSES: ["@order:kyogre"], E_FAILLES: ["@order:dialga"], E_TOUNDRA: ["@order:kyurem"], E_SANCTUAIRE: ["@order:zygarde"] });
Object.assign(THEMES, { E_ABYSSES: STORY_THEMES.S_ABYSSE, E_FAILLES: STORY_THEMES.S_FAILLE, E_TOUNDRA: STORY_THEMES.S_BASTION, E_SANCTUAIRE: STORY_THEMES.S_FORET });
