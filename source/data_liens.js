// ============================================================
//  LIENS D'AMITIÉ, MINI-JEUX, TROPHÉES (données)
// ============================================================
// Rang de lien : 1 (0-24 pts) · 2 (25) · 3 (50) · 4 (75) · 5 (100)
// Les scènes se débloquent à un rang ; req = étape d'histoire nécessaire
const BOND_SCENES = {
  partner: [
    { rank: 2, lines: [
      { who: "partner", text: "Tu sais ce que grand-mère faisait quand je n’arrivais pas à dormir ? Elle me racontait ses explorations. Toutes inventées, je crois." },
      { who: "partner", text: "Il y en avait une avec un donjon en gâteau. Je l’ai cherché pendant des années.", emo: "Happy" },
      { who: "thought", text: "Il rit. Mais ses yeux brillent un peu trop." },
      { who: "partner", text: "Elle me manque. Mais quand je suis avec toi, je me dis qu’elle aurait adoré te rencontrer." }
    ] },
    { rank: 3, lines: [
      { who: "partner", text: "{name}… Je peux te dire un truc nul ?", emo: "Worried" },
      { who: "partner", text: "Des fois, j’ai peur que tu retrouves la mémoire. Que tu te souviennes d’une vie d’avant… et que tu n’aies plus besoin de moi." },
      { who: "partner", text: "C’est égoïste, hein ?", emo: "Sad" },
      { who: "thought", text: "Quoi que je retrouve, je ne veux pas perdre ça." },
      { who: "partner", text: "…Merci de ne pas te moquer. Tu es vraiment le meilleur partenaire du monde.", emo: "Teary-Eyed" }
    ] },
    { rank: 4, lines: [
      { who: "partner", text: "J’ai écrit un truc. Pour nous. Une promesse d’explorateurs.", emo: "Happy" },
      { who: "partner", text: "« Quoi qu’il arrive, on ne laisse jamais l’autre derrière. Ni dans un donjon, ni dans la vie. »" },
      { who: "partner", text: "Tu signes ? Avec la patte, ça compte." },
      { who: null, text: "Tu poses ta patte sur la feuille. {partner} la range précieusement dans son sac, à côté du pendentif." }
    ] }
  ],
  rask: [
    { rank: 2, lines: [
      { who: null, text: "Rask a disparu au coucher du soleil. Tu le retrouves dans une ruelle, en train de partager son pain avec trois créatures maigres." },
      { who: "rask", text: "…Tu n’as rien vu.", emo: "Angry" },
      { who: "rask", text: "Ils n’ont personne. Moi non plus, à leur âge. Quelqu’un m’a nourri, une fois. C’était le mauvais quelqu’un." },
      { who: "rask", text: "Eux, ils auront le bon. Maintenant, va-t’en avant que ça devienne gênant." }
    ] },
    { rank: 3, req: "ice", lines: [
      { who: "rask", text: "Rask, ce n’est pas mon vrai nom. C’est le Receleur qui me l’a donné. Ça veut dire « rapide » dans l’argot des ruelles.", emo: "Sigh" },
      { who: "rask", text: "Mon vrai nom, je ne m’en souviens pas. Comme toi, j’imagine. On est deux amnésiques dans une équipe de trois." },
      { who: "rask", text: "…Mais tu sais quoi ? Je l’aime bien, maintenant, ce nom. Parce que c’est vous qui le dites." }
    ] },
    { rank: 4, lines: [
      { who: "rask", text: "Je vais le dire une seule fois, alors écoute bien." },
      { who: "rask", text: "Merci. D’être… ce que je n’ai jamais eu. Une famille. Voilà. C’est dit.", emo: "Teary-Eyed" },
      { who: "rask", text: "Si tu le répètes à l’émotif, je nie tout.", emo: "Angry" }
    ] }
  ],
  ondin: [
    { rank: 2, lines: [
      { who: "ondin", text: "Hé ! Tu veux que je t’apprenne à écouter la mer ? On colle l’oreille contre un coquillage, et…", emo: "Happy" },
      { who: "ondin", text: "…et on entend la mer. Oui, c’est tout. Mais avant, j’avais peur de le faire. Maintenant, je trouve ça joli." }
    ] },
    { rank: 4, lines: [
      { who: "ondin", text: "Le capitaine m’a nommé matelot ! Officiellement ! Avec un chapeau !", emo: "Joyous" },
      { who: "ondin", text: "Je n’ai plus peur des vagues. J’ai peur de vous perdre, par contre. C’est une meilleure peur, je crois." }
    ] }
  ],
  ardent: [
    { rank: 2, lines: [
      { who: "ardent", text: "Bras de fer. Toi et moi. Maintenant.", emo: "Determined" },
      { who: null, text: "Ardent perd. Contre {partner}. En trois secondes." },
      { who: "ardent", text: "…C’était une ruse. Je voulais te mettre en confiance. Revanche demain.", emo: "Angry" }
    ] },
    { rank: 4, lines: [
      { who: "ardent", text: "Je m’entraîne la nuit. Tout le monde croit que je suis né fort. C’est faux. J’ai juste très peur d’être faible." },
      { who: "ardent", text: "Mais depuis vous… je m’entraîne pour protéger les autres. Pas pour qu’on m’admire. Et c’est beaucoup plus facile de se lever le matin.", emo: "Happy" }
    ] }
  ],
  racine: [
    { rank: 2, lines: [
      { who: "racine", text: "Le semis que {partner} a protégé… Il a poussé. Je l’ai appelé comme lui.", emo: "Happy" },
      { who: "racine", text: "Ne lui dis pas. Il pleurerait. Et ça ferait pousser des champignons partout." }
    ] },
    { rank: 4, lines: [
      { who: "racine", text: "J’ai planté un arbre au Royaume. Près de l’auberge. Pour vous trois." },
      { who: "racine", text: "Dans cent ans, il sera immense. Et quelqu’un se reposera dessous sans savoir pourquoi il se sent bien. C’est comme ça que je veux qu’on se souvienne de nous." }
    ] }
  ],
  lys: [
    { rank: 2, lines: [
      { who: "lys", text: "J’essaie un truc nouveau : je ne devine plus ce que les gens ressentent. Je demande." },
      { who: "lys", text: "Alors… comment tu te sens, aujourd’hui ? Pour de vrai ?" },
      { who: "lys", text: "…Tu vois ? C’est mieux quand c’est toi qui le dis.", emo: "Happy" }
    ] },
    { rank: 4, lines: [
      { who: "lys", text: "Aujourd’hui, quelqu’un m’a demandé de le soigner pour une égratignure de rien. Et j’ai dit non !", emo: "Joyous" },
      { who: "lys", text: "Gentiment, hein. Mais j’ai dit non. Je me suis sentie… libre. Merci de m’avoir appris que j’avais le droit." }
    ] }
  ],
  sablier: [
    { rank: 2, lines: [
      { who: "sablier", text: "Je tiens un carnet sur toi, {name}. Purement scientifique ! Anomalie temporelle numéro 47 : tu t’endors toujours à la même minute.", emo: "Inspired" },
      { who: "sablier", text: "…Anomalie numéro 48 : tu me rends heureux de vivre au présent. Ça, ce n’est pas très scientifique." }
    ] },
    { rank: 4, lines: [
      { who: "sablier", text: "J’ai retrouvé une note du professeur Clepsydre, cachée dans une horloge. Elle m’était adressée.", emo: "Teary-Eyed" },
      { who: "sablier", text: "« Le temps ne se rattrape pas, Sablier. Il se partage. » …Il savait. Il savait que je trouverais des amis." }
    ] }
  ],
  frimas: [
    { rank: 2, lines: [
      { who: "givrel", text: "Coucou ! Je suis Givrel ! Mon frère parle de vous tout le temps !" },
      { who: "frimas", text: "…Faux." },
      { who: "givrel", text: "Il a dit « ils sont bien » trois fois hier ! C’est un record !" },
      { who: "frimas", text: "…Quatre fois.", emo: "Happy" }
    ] },
    { rank: 4, lines: [
      { who: "frimas", text: "J’ai une blague." },
      { who: "frimas", text: "Pourquoi les gardes de Kyurem ne se disputent jamais ? …Parce qu’ils restent de glace." },
      { who: null, text: "Un silence. Puis {partner} éclate de rire, et même Rask craque. Frimas a l’air très, très fier de lui." }
    ] }
  ],
  nyx: [
    { rank: 2, lines: [
      { who: "nyx", text: "Suis-moi. Ne pose pas de questions." },
      { who: null, text: "Elle t’emmène sur le toit le plus haut du Royaume. La lune est énorme." },
      { who: "nyx", text: "C’est mon endroit. Personne ne le connaît. …Maintenant, toi si. Ne le gâche pas." }
    ] },
    { rank: 4, lines: [
      { who: "nyx", text: "Rask m’a raconté une blague nulle. J’ai ri. Fort.", emo: "Sigh" },
      { who: "nyx", text: "Il a dit qu’il le dirait à tout le monde. Je l’ai laissé faire. Je crois que… je n’ai plus honte d’être heureuse.", emo: "Happy" }
    ] }
  ],
  zip: [
    { rank: 2, lines: [
      { who: "zip", text: "Viens, j’ai un plan ! On va rendre tout ce que j’ai volé. En secret. Par des anneaux.", emo: "Joyous" },
      { who: null, text: "Vous passez l’après-midi à déposer des objets sur des rebords de fenêtre. Zip rit à chaque fois." },
      { who: "zip", text: "C’est encore plus drôle que de voler ! Qui l’eût cru ?" }
    ] },
    { rank: 4, lines: [
      { who: "zip", text: "Tiens. C’est un anneau de secours. Si un jour tu es coincé, tu le lances, et j’arrive.", emo: "Happy" },
      { who: "zip", text: "Je ne l’ai pas volé, promis. Je l’ai fabriqué. C’est le premier truc que je fabrique." }
    ] }
  ]
};
// petites phrases quand on leur parle en ville
const FRIEND_CHAT = {
  ondin: ["Aujourd’hui, j’ai plongé deux fois ! Sans crier ! Bon, j’ai crié une fois.", "Le capitaine dit que je deviens courageux. Je crois qu’il dit ça pour être gentil. Mais j’y crois un peu.", "Tu savais que les vagues reviennent toujours ? Comme les amis."],
  ardent: ["Tu t’es entraîné aujourd’hui ? Moi oui. Deux fois. Pour toi.", "La prochaine fois, je te bats. Ou je t’aide. Les deux me vont, maintenant.", "Hé, l’émotif est avec toi ? Dis-lui bonjour. …Non, ne lui dis pas que je l’ai dit."],
  racine: ["Les arbres de la Forêt des Cent Racines vont bien. Ils te saluent. Enfin, je crois.", "Tu marches mieux qu’avant. Moins de pousses écrasées.", "Cent membres, un seul ordre. Et des amis en plus. C’est nouveau."],
  lys: ["Tu as l’air en forme ! …Pardon, je devine encore. Tu te sens comment ?", "Je me suis fait un thé rien que pour moi aujourd’hui. C’était bizarre. C’était bien.", "Prends soin de toi. Et laisse les autres prendre soin de toi aussi."],
  sablier: ["Il est exactement l’heure de te dire bonjour. Bonjour !", "Mes recherches avancent. Le temps aussi. C’est formidable.", "Anomalie numéro 112 : tu m’as fait sourire. Encore."],
  frimas: ["Bonjour.", "…Givrel dit bonjour aussi.", "Le froid est bon aujourd’hui. Toi aussi. …C’était un compliment."],
  nyx: ["Tu me cherchais ? Je t’ai vu arriver il y a dix minutes.", "La lune sera pleine dans trois jours. Ne me demande pas pourquoi je compte.", "…Salut. C’est tout. Ne fais pas cette tête."],
  zip: ["Coucou ! Ne cherche pas ta bourse, elle est dans ta poche. Je vérifiais juste.", "J’ai ouvert un anneau jusqu’à la mer ce matin. Pour rien. Juste pour voir le soleil se lever.", "Rask m’a appris à faire des crêpes. Il fait semblant de détester ça."]
};
const PARTNER_CHAT = ["On fait quoi aujourd’hui ? Un donjon ? Deux donjons ? TROIS ?", "J’ai rêvé qu’on trouvait un donjon en gâteau. Grand-mère avait raison, il existe !", "Merci d’être là, {name}. Je le dis pas assez.", "Tu as vu les nouvelles quêtes ? Le garde royal avait l’air débordé."];
const RASK_CHAT = ["Quoi ? Je ne souris pas. C’est mon visage qui fait ça tout seul.", "L’émotif ronfle. Je dis ça, je dis rien.", "Si tu cherches un mauvais coup, je ne connais personne. …Enfin, plus maintenant.", "Les ruelles sont plus calmes depuis le Receleur. Les petits mangent à leur faim."];

// ---- mini-jeux ----
const FISH = [
  { id: "goujon", name: "Goujonnet", r: 1, w: 34, val: 15, col: "#a8b8c8", desc: "Petit poisson curieux qui mord à tout." },
  { id: "perche", name: "Perchinette", r: 1, w: 28, val: 20, col: "#9ccf6a", desc: "Rayée de vert, elle se cache dans les herbes." },
  { id: "truite", name: "Truitelle", r: 1, w: 22, val: 30, col: "#e8a6c0", desc: "Ses écailles brillent comme des perles roses." },
  { id: "meduse", name: "Méduse Douce", r: 1, w: 16, val: 35, col: "#c6b4ff", desc: "Elle ne pique pas. Elle fait des câlins mouillés." },
  { id: "carpe", name: "Carpe Dorée", r: 2, w: 12, val: 80, col: "#ffcf3d", desc: "On dit qu’elle exauce un vœu sur cent." },
  { id: "anguille", name: "Anguillampe", r: 2, w: 10, val: 90, col: "#ffe86a", desc: "Une anguille qui s’allume quand elle est contente." },
  { id: "brochet", name: "Brochet-Lune", r: 2, w: 9, val: 110, col: "#d9e6ff", desc: "Il ne sort qu’à la nuit tombée… ou presque." },
  { id: "saumon", name: "Saumon Rubis", r: 2, w: 8, val: 130, col: "#ff5f6d", desc: "Il remonte même les cascades de la fontaine." },
  { id: "cle", name: "Poisson-Clé", r: 3, w: 5, val: 220, col: "#b9b2a6", desc: "Sa nageoire a la forme d’une clé. Elle n’ouvre rien. Probablement." },
  { id: "raie", name: "Raie Étoilée", r: 3, w: 4, val: 260, col: "#58b6ff", desc: "Des étoiles scintillent sur son dos, même en plein jour." },
  { id: "fantome", name: "Poisson-Fantôme", r: 3, w: 3, val: 300, col: "#e8f0ff", desc: "Transparent. On ne sait jamais s’il est vraiment là." },
  { id: "barbu", name: "Le Vieux Barbu", r: 4, w: 1, val: 800, col: "#7a6a4a", desc: "Le poisson légendaire de l’étang. Papy Bulle le cherche depuis 40 ans." }
];
const FISH_RANK = { 1: "Commun", 2: "Rare", 3: "Très rare", 4: "Légendaire" };
const FISH_PER_DAY = 15;
const PRIZES = [
  { id: "baie", cost: 20 }, { id: "grossepomme", cost: 30 }, { id: "elixir", cost: 45 }, { id: "orbelum", cost: 50 },
  { id: "graine", cost: 120 }, { id: "orbesoin", cost: 110 }, { id: "rubanrouge", cost: 160 }, { id: "foulardbleu", cost: 160 },
  { id: "badgeeclair", cost: 160 }, { id: "rubanvital", cost: 170 }, { id: "foulardpro", cost: 300 }, { id: "baieor", cost: 180 },
  { id: "cristal", cost: 400 }, { id: "badgeroyal", cost: 700 }, { id: "_shards5", cost: 90, name: "5 Éclats d’étoile" }
];
// ---- trophées ----
const TROPHIES = [
  { id: "ch1", name: "Le début du voyage", desc: "Terminer le chapitre 1.", rew: 5, test: g => g.story.ch1Done },
  { id: "ch2", name: "Champion de groupe", desc: "Remporter le Tournoi de Sélection.", rew: 5, test: g => g.story.ch2Done },
  { id: "oath1", name: "Premier serment", desc: "Sceller un Serment avec une guilde.", rew: 5, test: g => oathCount(g) >= 1 },
  { id: "oath8", name: "Les huit serments", desc: "Sceller les huit Serments.", rew: 15, test: g => oathCount(g) >= 8 },
  { id: "ch3", name: "La fête des serments", desc: "Terminer le chapitre 3.", rew: 10, test: g => g.story.c3 && g.story.c3.end },
  { id: "ch4", name: "La vérité", desc: "Terminer le chapitre 4.", rew: 10, test: g => g.story.c4 && g.story.c4.step >= 5 },
  { id: "tour50", name: "À mi-hauteur", desc: "Atteindre le 50e étage de la Tour Céleste.", rew: 10, test: g => g.story.c5 && g.story.c5.ck >= 50 },
  { id: "fin", name: "Le Roi Originel", desc: "Terminer l’histoire.", rew: 30, test: g => g.story.c5 && g.story.c5.done },
  { id: "order", name: "Une destinée", desc: "Choisir un Ordre dans l’épilogue.", rew: 10, test: g => g.story.epi && g.story.epi.done },
  { id: "orders3", name: "Explorateur de tous les ordres", desc: "Débloquer trois Ordres au palais.", rew: 20, test: g => g.story.epi && (g.story.epi.orders || []).length >= 3 },
  { id: "kills100", name: "Cent victoires", desc: "Vaincre 100 créatures.", rew: 5, test: g => (g.stats.kills || 0) >= 100 },
  { id: "kills500", name: "Cinq cents victoires", desc: "Vaincre 500 créatures.", rew: 15, test: g => (g.stats.kills || 0) >= 500 },
  { id: "runs20", name: "Habitué des donjons", desc: "Partir 20 fois en exploration.", rew: 5, test: g => (g.stats.runs || 0) >= 20 },
  { id: "lv20", name: "Niveau 20", desc: "Atteindre le niveau 20 avec le héros.", rew: 10, test: g => g.team[0] && g.team[0].lv >= 20 },
  { id: "lv40", name: "Niveau 40", desc: "Atteindre le niveau 40 avec le héros.", rew: 20, test: g => g.team[0] && g.team[0].lv >= 40 },
  { id: "rich", name: "Petite fortune", desc: "Avoir 5 000 pièces.", rew: 5, test: g => (g.money || 0) >= 5000 },
  { id: "reserve5", name: "Dortoir animé", desc: "Avoir 5 amis au dortoir.", rew: 5, test: g => (g.reserve || []).length >= 5 },
  { id: "fish1", name: "Première prise", desc: "Pêcher un poisson.", rew: 2, test: g => fishCount(g) >= 1 },
  { id: "fishall", name: "Carnet de pêche complet", desc: "Pêcher les douze espèces.", rew: 25, test: g => fishCount(g) >= FISH.length },
  { id: "barbu", name: "Le Vieux Barbu", desc: "Pêcher le poisson légendaire de l’étang.", rew: 15, test: g => !!(g.fish && g.fish.barbu) },
  { id: "memory", name: "Mémoire d’éléphant", desc: "Finir la Mémoire des Runes en difficile.", rew: 8, test: g => !!(g.mg && g.mg.memHard) },
  { id: "whack", name: "Réflexes de champion", desc: "Faire 30 points au Tir aux Baies.", rew: 8, test: g => ((g.mg && g.mg.whack) || 0) >= 30 },
  { id: "quiz", name: "Expert des types", desc: "Faire un sans-faute au Défi des Types.", rew: 10, test: g => ((g.mg && g.mg.quiz) || 0) >= 10 },
  { id: "bond5", name: "Lien absolu", desc: "Atteindre le rang 5 avec un ami.", rew: 10, test: g => Object.values((g.story && g.story.bonds) || {}).some(v => v >= 100) },
  { id: "invoc", name: "Appel des étoiles", desc: "Faire une invocation.", rew: 2, test: g => ((g.mg && g.mg.invoc) || 0) >= 1 }
];
function oathCount(g) { return ((g.story && g.story.c3 && g.story.c3.oaths) || []).length; }
function fishCount(g) { return Object.keys(g.fish || {}).length; }
