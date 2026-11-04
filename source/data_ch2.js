// ============================================================
//  CHAPITRE 2 : LE ROYAUME, LES GUILDES ET LE TOURNOI (texte)
//  {name} héros, {partner} partenaire, {recruit} 3e membre,
//  {chef} {sbire1} {sbire2} les voyous du chapitre 1
// ============================================================
const GUILDS = [
  { id: "victini", name: "Victory Victini", tag: "La plus forte et la plus redoutée", col: "#ff8a3d", icon: "V" },
  { id: "kyogre", name: "Tsunami Kyogre", tag: "Maîtres des mers et des tempêtes", col: "#3d8bff", icon: "≈" },
  { id: "dialga", name: "Time Dialga", tag: "Gardiens des anciennes ruines", col: "#5fd0c8", icon: "◷" },
  { id: "kyurem", name: "Glacial de Kyurem", tag: "Explorateurs des terres gelées", col: "#a9e4ff", icon: "❄" },
  { id: "zygarde", name: "100 de Zygarde", tag: "Cent membres, un seul ordre", col: "#5bd16a", icon: "⬡" },
  { id: "lunala", name: "Moon Hunter de Lunala", tag: "Ils chassent sous la lune", col: "#b48cff", icon: "☾" },
  { id: "amovenus", name: "Amour de Amovénus", tag: "La guilde qui protège les liens", col: "#ff7eb6", icon: "♥" },
  { id: "hoopa", name: "Anneau de Hoopa", tag: "Ils vont partout, on ne sait comment", col: "#ffcf3d", icon: "◯" }
];
const CH2 = {
  title: "Chapitre 2 : Le Royaume, les Guildes et le Tournoi",
  home: [
    { who: null, text: "Quelques jours après l’aventure de la Forêt Verdoyante…" },
    { who: null, text: "{partner} t’a invité chez lui, la petite maison en bois où sa grand-mère l’a élevé, au bord de la plage." },
    { who: "partner", text: "Fais comme chez toi, {name} ! C’est pas grand, mais on y est bien." },
    { who: "partner", text: "Je t’ai déjà parlé de ma grand-mère. L’exploratrice. C’est elle qui m’a tout appris : lire une carte, trouver l’eau, ne jamais paniquer." },
    { who: "partner", text: "Ce que je ne t’ai pas dit… c’est que mon père a suivi ses traces. Lui aussi était explorateur, dans une grande guilde.", cue: "father" },
    { who: "partner", text: "Je ne l’ai jamais connu. Il est parti en mission juste avant ma naissance… et il n’est jamais revenu." },
    { who: "partner", text: "Ce portrait, là, au mur, c’est lui. Grand-mère disait que j’ai le même regard. Têtu, comme elle disait." },
    { who: "partner", text: "Avant de partir à son tour, elle m’a donné le pendentif. Elle m’a dit : « Ton père l’a rapporté du bout du monde. Un jour, tu comprendras pourquoi. »" },
    { who: "partner", text: "Mon rêve, c’est d’entrer dans une guilde d’exploration. Pour honorer la mémoire de mon père… et continuer ce que grand-mère a commencé." },
    { who: "thought", text: "Son regard brille autant que le pendentif…" },
    { who: "partner", text: "Attends, je t’explique comment ça marche, le monde des guildes !" }
  ],
  world: [
    { who: "partner", text: "Notre monde s’appelle The World. Toutes les créatures y vivent en communauté, autour du palais royal.", cue: "map" },
    { who: "partner", text: "C’est le Roi qui gouverne. Mais sur le terrain, ce sont les guildes qui font la loi." },
    { who: "partner", text: "Il y en a huit très prestigieuses. Regarde !", cue: "guilds" }
  ],
  world2: [
    { who: "partner", text: "Victory Victini, c’est la plus forte… et la plus redoutée. Personne n’ose leur tenir tête." },
    { who: "partner", text: "Et chaque année, le Roi organise le Tournoi de Sélection. Les capitaines y choisissent leurs nouvelles recrues." },
    { who: "partner", text: "Le tournoi commence bientôt, au Royaume du Tournoi. {name}… tu viendrais avec moi ?" }
  ],
  homeChoice: ["On y va ensemble !", "Une guilde… pourquoi pas !"],
  home2: [
    { who: "partner", text: "Ouais ! Je savais que je pouvais compter sur toi !", cue: "hop" },
    { who: "partner", text: "On part demain à l’aube. Le Royaume est à une journée de marche." }
  ],
  arrival: [
    { who: null, text: "Le lendemain, après une longue route…" },
    { who: null, text: "Les tours du Royaume du Tournoi se dressent devant vous. Des centaines de créatures se pressent aux portes." },
    { who: "partner", text: "Waouh… Regarde tout ce monde ! Et là-haut, sur le balcon du palais… les capitaines de guilde !", cue: "banners" },
    { who: "partner", text: "Et le Roi en personne ! Je n’arrive pas à y croire…" },
    { who: "herald", text: "OYEZ, OYEZ ! Le Tournoi de Sélection ouvre ses inscriptions à l’Arène !" },
    { who: "herald", text: "Rappel du règlement : les équipes doivent compter TROIS membres. Pas un de moins !" },
    { who: "partner", text: "Trois ?! Mais… on n’est que deux, nous." },
    { who: "thought", text: "Il va falloir trouver un troisième coéquipier." },
    { who: "partner", text: "Pas de panique ! Le Royaume est plein de monde. Baladons-nous : quelqu’un voudra bien faire équipe avec nous." }
  ],
  objRecruit: "Trouve un 3e membre : parle aux créatures qui se promènent en ville.",
  objRegister: "Ton équipe est complète ! Va t’inscrire à l’Arène (à l’est de la place).",
  objTournoi: "Le tournoi t’attend à l’Arène.",
  recruited: [
    { who: "partner", text: "Génial ! On est trois, maintenant !" },
    { who: "partner", text: "Allons vite nous inscrire à l’Arène, à l’est de la place !" }
  ],
  needThree: [{ who: "registrar", text: "Désolé, il me faut une équipe de trois. Revenez quand vous aurez un troisième membre !" }],
  register: [
    { who: "registrar", text: "Bienvenue à l’Arène ! Une équipe de trois ? Parfait. Le nom de votre équipe, s’il vous plaît…" },
    { who: "partner", text: "Euh… l’équipe de {name} ! Ça sonne bien, non ?" },
    { who: "registrar", text: "C’est noté. Vous serez quatre équipes dans ce groupe. Voyons qui sont vos adversaires…" },
    { who: "chef", text: "Tiens, tiens, tiens… Qui voilà ?", cue: "thieves" },
    { who: "partner", text: "VOUS ?! Qu’est-ce que vous faites là ?!" },
    { who: "sbire1", text: "On s’est inscrits, pardi ! Une guilde, ça paie mieux que les pendentifs, hé hé." },
    { who: "chef", text: "Cette fois, pas de forêt pour vous cacher. On va vous écraser devant tout le Royaume." },
    { who: "sbire2", text: "On se retrouve dans le donjon, les mauviettes !", cue: "thievesLeave" },
    { who: "recruit", text: "Ce sont… des amis à vous ?" },
    { who: "partner", text: "Des voleurs, oui ! Ils ont essayé de me prendre mon pendentif. Hors de question de perdre contre eux !" }
  ],
  rules: [
    { who: "presenter", text: "Mesdames et messieurs, créatures de tout The World… BIENVENUE AU TOURNOI DE SÉLECTION !", cue: "crowd" },
    { who: "king", text: "Jeunes explorateurs ! Les guildes de The World vous regardent. Montrez-nous votre courage… et votre cœur.", cue: "king" },
    { who: "presenter", text: "Les quatre équipes de ce groupe vont être téléportées dans un donjon géant de SEPT étages !" },
    { who: "presenter", text: "Les équipes se déplacent en même temps. Elles peuvent se soigner, fuir, utiliser des objets… et s’affronter entre elles !" },
    { who: "presenter", text: "Traquez vos adversaires et éliminez-les tous ! Quand plus personne ne restera dans le donjon…" },
    { who: "presenter", text: "…les finalistes seront téléportés dans l’ARÈNE FINALE !" },
    { who: "presenter", text: "Attention : si le chef d’équipe ou son partenaire tombe K.O., l’équipe est éliminée !" },
    { who: "partner", text: "{name}, {recruit}… On va gagner. Pour mon père. Pour nous trois !" }
  ],
  rulesChoice: ["Prêts !"],
  retry: [
    { who: "presenter", text: "Oh ! L’équipe de {name} est éliminée !" },
    { who: "presenter", text: "Mais… le Roi lève la main ! Il leur accorde une seconde chance ! Quelle générosité !" },
    { who: "partner", text: "On recommence depuis le début. Cette fois, on ne lâche rien !" }
  ],
  allOut: [
    { who: "presenter", text: "INCROYABLE ! Toutes les équipes ont quitté le donjon !" },
    { who: "presenter", text: "Il ne reste que deux équipes en lice… Direction l’ARÈNE FINALE !" }
  ],
  finalIntro: [
    { who: "presenter", text: "Voici la grande finale ! D’un côté, l’équipe de {name} !" },
    { who: "presenter", text: "De l’autre… l’équipe de {chef} !" },
    { who: "chef", text: "Cette fois, vous ne nous échapperez pas. Les gars, montrez-leur !" },
    { who: "partner", text: "C’est maintenant ou jamais. Allons-y !" }
  ],
  victory: [
    { who: "chef", text: "Non… pas encore… Comment c’est possible ?!", cue: "crowd" },
    { who: "presenter", text: "ET C’EST TERMINÉ ! L’équipe de {name} remporte le groupe et se qualifie !" },
    { who: "king", text: "Magnifique. Le Royaume a besoin de cœurs comme les vôtres. Revenez me voir quand vous serez prêts pour la suite.", cue: "king" },
    { who: null, text: "La foule rugit. Des fleurs et des confettis pleuvent sur l’arène." },
    { who: "sbire2", text: "Chef… on file avant qu’ils nous demandent de rendre les objets qu’on a… euh… trouvés." },
    { who: "chef", text: "On se reverra ! Vous n’avez pas fini d’entendre parler de nous !", cue: "thievesLeave" }
  ],
  captains: [
    { who: null, text: "Sur le balcon, les capitaines de guilde murmurent entre eux.", cue: "banners" },
    { who: "captainA", text: "Pas mal, ces petits. Ils ont du cran." },
    { who: "captainB", text: "Ce trio… il a quelque chose de spécial." },
    { who: null, text: "Un capitaine encapuchonné, resté dans l’ombre, se penche au-dessus de la rambarde.", cue: "hood" },
    { who: "hood", text: "…Ce pendentif. Et ce regard…" },
    { who: "hood", text: "Non… ce n’est pas possible. Pas après tout ce temps." },
    { who: null, text: "Quand tu lèves les yeux vers le balcon, le capitaine a déjà disparu." }
  ],
  after: [
    { who: "partner", text: "{name} ! On a gagné ! ON A GAGNÉ !", cue: "hop" },
    { who: "partner", text: "Mon père serait fier… et grand-mère aussi, je le sens. Merci. Merci d’être là, partenaire." },
    { who: "recruit", text: "Merci à vous deux. Faire équipe avec vous… c’était génial." }
  ],
  recruitChoice: ["Reste avec nous, {recruit} !", "Bonne route, {recruit}."],
  recruitStays: [
    { who: "recruit", text: "…Vraiment ? Vous voulez bien de moi ?" },
    { who: "recruit", text: "Alors c’est décidé ! Je reste avec vous. On ira loin, tous les trois !" }
  ],
  recruitLeaves: [
    { who: "recruit", text: "J’ai encore mon propre chemin à suivre. Mais je n’oublierai jamais ce tournoi." },
    { who: "recruit", text: "Si un jour vous avez besoin de moi, je serai à l’auberge du Royaume. À bientôt !" }
  ],
  end: "Chapitre 2 — Fin",
  endSub: "Mode libre débloqué : le Royaume, le marché, l’auberge, l’arène et de nouveaux donjons t’attendent.",
  shadow: [
    { who: null, text: "Cette nuit-là, dans une tour du palais…" },
    { who: "hood", text: "Il a grandi… Et il a trouvé un partenaire digne de lui." },
    { who: "shadow", text: "Tu l’as vu, toi aussi. Le pendentif brille de nouveau." },
    { who: "hood", text: "Je ne te laisserai pas l’approcher." },
    { who: "shadow", text: "Hé hé hé… Nous verrons bien." }
  ]
};
// Personnages qui parlent dans le chapitre 2 (pas de créature affichée : un insigne coloré)
const CH2_SPEAKERS = {
  herald: { name: "Héraut du Roi", badge: "#ffd166" },
  registrar: { name: "Préposée de l’Arène", badge: "#7adcff" },
  presenter: { name: "Présentateur", badge: "#ff8a3d" },
  captainA: { name: "Capitaine de Tsunami Kyogre", badge: "#3d8bff" },
  captainB: { name: "Capitaine d’Amour de Amovénus", badge: "#ff7eb6" },
  hood: { name: "Capitaine encapuchonné", shadow: true },
  king: { name: "Le Roi", badge: "#ffd94a" },
  traveler: { name: "Voyageur encapuchonné", shadow: true },
  soldier: { name: "Soldat du Royaume", badge: "#b8c0d0" },
  questguard: { name: "Garde royal", badge: "#ffd94a" },
  informant: { name: "Informatrice", badge: "#7adcff" },
  innkeeper: { name: "Aubergiste", badge: "#c38b5a" },
  merchant: { name: "Marchande", badge: "#7ce38a" },
  guard: { name: "Garde du palais", badge: "#b8c0d0" }
};
// Créatures vagabondes du Royaume : un passé, une personnalité. Leur espèce est tirée au hasard.
const VAGABONDS = [
  { nick: "Pip", mood: "timide", lines: ["Oh ! Euh… bonjour. Je viens d’un village de montagne détruit par une avalanche.", "Depuis, je voyage seul. J’aimerais tellement faire partie d’une équipe…"], more: ["Dans mon village, on chantait pour faire fondre la neige. Ça ne marchait jamais… mais c’était joli.", "Depuis l’avalanche, j’ai peur du silence. Avec une équipe, il y aurait toujours quelqu’un pour parler."], join: "Vous… vous voulez bien de moi ? D’accord ! Je ferai de mon mieux !" },
  { nick: "Rokko", mood: "fier", lines: ["Moi ? J’étais le champion d’un petit tournoi du sud. Invaincu pendant trois saisons !", "Mais un champion sans équipe ne peut pas s’inscrire ici. Ridicule, ce règlement."], more: ["Trois saisons invaincu, je te dis ! …Bon, la quatrième, j’ai glissé sur une pomme. Mais ça ne compte pas.", "Un jour, mon nom sera gravé sur l’arène. En grosses lettres. Très grosses."], join: "Hmpf. Très bien, je vous prête ma force. Essayez de suivre !" },
  { nick: "Lunette", mood: "savante", lines: ["Je suis cartographe. J’ai dessiné les plans de onze donjons… dont trois que personne n’a jamais revus.", "Une guilde me donnerait accès aux archives royales. C’est tout ce que je veux."], more: ["Sur mes cartes, il y a une zone que j’ai laissée blanche. Personne n’en est revenu pour me la décrire.", "Si tu trouves un donjon que personne ne connaît, raconte-le-moi. Je le dessinerai pour toi."], join: "Un trio d’explorateurs ? Parfait, j’emporte mes cartes." },
  { nick: "Bramble", mood: "joyeux", lines: ["Salut salut ! Je suis cuisinier ambulant ! Personne ne fait les tartes aux baies comme moi !", "Je me suis dit : le tournoi, c’est plein de monde affamé. Mais je me battrais bien un peu, aussi !"], more: ["Ma recette secrète ? Une baie, deux pommes, et beaucoup d’amour. Et un caillou. Non, pas le caillou.", "J’ai cuisiné pour un capitaine de guilde, une fois ! Il a dit « pas mal ». C’est le meilleur jour de ma vie."], join: "Youpi ! Une équipe ! Je vous ferai des tartes après chaque victoire !" },
  { nick: "Sorbet", mood: "mystérieux", lines: ["…Tu me regardes depuis tout à l’heure.", "Je cherche quelqu’un. Quelqu’un qui a disparu dans un donjon il y a longtemps. Les guildes savent peut-être où."], more: ["La personne que je cherche… c’est ma sœur. Elle est entrée dans un donjon qui n’existait plus le lendemain.", "On dit que certains donjons apparaissent et disparaissent. Si tu en croises un… fais attention."], join: "…Bien. Je viens. Mais je garde mes secrets." },
  { nick: "Tika", mood: "courageuse", lines: ["Mes parents tiennent la boulangerie près du marché. Ils veulent que je reprenne le four.", "Moi, je veux voir le monde ! Si je gagne le tournoi, ils seront bien obligés de me laisser partir."], more: ["Le pain de mes parents est le meilleur du Royaume. Mais je ne veux pas passer ma vie à le pétrir.", "Si je deviens exploratrice, je ramènerai des épices de partout. Et papa fera le pain du monde entier !"], join: "C’est vrai ?! Attendez, je préviens mes parents… Non, je leur dirai après. On y va !" },
  { nick: "Grumo", mood: "grognon", lines: ["Quoi ? Je suis occupé à ne rien faire.", "J’ai été viré de trois équipes parce que je ronfle. C’est pas ma faute si je ronfle fort."], more: ["Tu sais pourquoi je ronfle ? Parce que je rêve fort. Voilà.", "…Bon, d’accord. Je ronfle aussi parce que je suis tombé dans un trou quand j’étais petit. Ne le répète à personne."], join: "…Bon. Mais je dors près du feu, c’est non négociable." },
  { nick: "Zéphyr", mood: "rêveur", lines: ["Tu sens ce vent ? Il vient du nord. Il a traversé la mer pour arriver ici.", "J’ai suivi le vent toute ma vie. Aujourd’hui, il m’a amené jusqu’à vous."], more: ["Le vent m’a parlé de toi avant que tu arrives. Il disait que tu venais de très loin.", "Parfois, le vent souffle d’une direction qui n’existe pas. Ça me donne des frissons."], join: "Le vent a tourné. Je vous suis."
  }
];
// Habitants du Royaume (dialogues d'ambiance)
const TOWNFOLK_LINES = [
  ["Le marché est ouvert jusqu’au coucher du soleil. Profitez-en !"],
  ["Tu as vu la bannière de Victory Victini ? On dit que leur capitaine n’a jamais perdu un combat."],
  ["Le Roi ne sort presque jamais du palais. Le voir au tournoi, c’est un honneur."],
  ["L’auberge du coin fait la meilleure soupe de baies du Royaume. Et on y dort bien."],
  ["Méfie-toi des ruelles derrière le marché. Il s’y passe de drôles de choses la nuit."],
  ["Moi aussi, je voulais m’inscrire au tournoi… mais je n’ai trouvé personne pour faire équipe."],
  ["Les capitaines regardent chaque combat. Une belle victoire, et c’est la guilde assurée !"],
  ["On raconte qu’un capitaine encapuchonné ne montre jamais son visage. Brr…"]
];
const SHOP_STOCK = [
  { id: "baie", price: 30 }, { id: "pomme", price: 25 }, { id: "grossepomme", price: 70 }, { id: "elixir", price: 80 },
  { id: "caillou", price: 15 }, { id: "grainesom", price: 60 }, { id: "orbelum", price: 90 }, { id: "orbefuite", price: 150 },
  { id: "graine", price: 220 }, { id: "baieor", price: 260 }
];
const RIVAL_TEAM_NAMES = [
  { name: "Équipe Braise", col: "#ff8a3d" }, { name: "Équipe Écume", col: "#58b6ff" }, { name: "Équipe Lierre", col: "#7ce38a" }, { name: "Équipe Orage", col: "#ffd23f" }
];
const TOUR_ANNOUNCES = {
  rivalOut: "📣 {winner} a éliminé {loser} à l’étage {floor} !",
  rivalFled: "📣 {team} a utilisé un Orbe Fuite et descend à l’étage {floor} !",
  thievesFled: "📣 Les voyous s’enfuient du donjon : « On se retrouve en finale ! »",
  weOut: "📣 L’équipe de {name} a éliminé {loser} !",
  descend: "📣 {team} a trouvé l’escalier : direction l’étage {floor} !",
  sealed: "Le portail de l’arène est scellé : il reste {n} équipe(s) dans le donjon."
};

const TRAVELER_LINES = [
  ["…Tu sens ça ? Une fissure. Fine comme un cheveu, juste là, dans l’air.", "Personne ne la voit. Sauf ceux qui sont déjà passés de l’autre côté."],
  ["Il existe d’autres mondes que The World. Des mondes où tes amis n’ont pas le même visage.", "Des mondes où ton pendentif… n’existe pas."],
  ["On m’appelle voyageur. Je passe d’une dimension à l’autre, comme on change de pièce.", "Enfin… quand les portes veulent bien s’ouvrir."],
  ["Bientôt, les portes s’ouvriront pour de bon. Des voyageurs d’autres dimensions viendront ici.", "Ce jour-là, souviens-toi de moi. Tu auras besoin d’un guide."],
  ["Tu veux savoir d’où je viens ? Hmm… D’un endroit où il pleut vers le haut.", "Ne fais pas cette tête. Tu verras bien."]
];
const INFORMANT_LINES = ["Tu cherches une créature ? Je sais où elles vivent toutes. Enfin, presque toutes.", "On m’a parlé d’une créature légendaire qui dort au fond d’un donjon… Il faut beaucoup de chance pour la croiser."];
const SOLDIER_LINES = ["Halte ! Un donjon inconnu est apparu hors des murs. Il change à chaque fois qu’on y entre.", "Personne n’en revient avec le même récit. Tu veux tenter ta chance ?"];
const FOLK_EXTRA = [
  ["Tu as vu ? Le garde royal affiche de nouvelles quêtes chaque matin. Les explorateurs se battent pour les meilleures !"],
  ["Ma fille dit qu’elle a vu une silhouette encapuchonnée dans les ruelles. Brr. Je n’aime pas ça."],
  ["Si tu fais un vœu à la fontaine, jette une pièce. On dit que ça porte chance… parfois."],
  ["Le maître des capacités a appris une attaque de feu à mon cousin. Il a brûlé sa moustache en essayant."],
  ["Il paraît que les créatures légendaires sont plus fortes que n’importe quel gardien. Et plus rares qu’une Baie Dorée."]
];
