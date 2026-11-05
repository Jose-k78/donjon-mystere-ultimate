# Donjon Mystère Ultimate

Fan game fait par moi et pour moi — José.

**Jouer / installer :** ouvre la page GitHub Pages de ce dépôt sur ton téléphone, puis « Ajouter à l’écran d’accueil » (Chrome ou Safari). Le jeu s’ouvre en plein écran, marche hors ligne et se met à jour tout seul à chaque nouvelle version publiée ici.

**APK Android :** colle l’adresse de la page sur https://www.pwabuilder.com, choisis Android et télécharge le paquet. L’APK ouvre la version en ligne : il reçoit donc les mises à jour sans être réinstallé.

- `index.html` : le jeu.
- `source/` : le code (voir `source/build.py` pour reconstruire `index.html`).

## Nouveautés (version 5)

- **Paramètres refaits en onglets** : Jeu, Synchro, Sprites, Sons, Sauvegarde, Atelier.
- **Synchro avec un dépôt GitHub privé séparé** : le jeu installé sur le PC et sur le téléphone lit ses sprites (`creatures/0001` → créature 001…), ses sons et ses images dans un dépôt privé, et y range la partie, l’Atelier et les réglages. Mêmes données sur tous les appareils, téléchargement à la demande, mémoire hors ligne, choix guidé si deux appareils ont changé la même chose (l’autre version est gardée en secours).
- Ce dépôt-ci ne contient que le code du jeu : aucune donnée personnelle n’y est envoyée.

## Contenu (version 4)

- **Histoire complète** : chapitre 1 (la plage), chapitre 2 (le Royaume et le tournoi), chapitre 3 (les huit Serments des guildes, le piège du glacier, la fête), chapitre 4 (l’Ombre du Vizir : les Bas-Fonds, les Archives Interdites, le Cœur de la Faille, la vérité au palais), chapitre 5 (la Tour Céleste de 100 étages avec relais tous les 10 étages) et l’épilogue (le grand choix entre 9 destinées).
- **Après l’histoire** : chaque Ordre débloque un bonus (arène explosive, donjons maritimes, failles temporelles, toundra, sanctuaire, contrats de l’Ombre, synergie, anneau de téléportation, QG indépendant). On peut changer d’Ordre au palais.
- **Liens d’amitié** avec le partenaire, Rask et les huit apprentis (scènes à débloquer, cadeaux, appel de Serment en donjon).
- **Mini-jeux** : pêche à l’étang, Mémoire des Runes, Tir aux Baies, Défi des Types, comptoir des lots ; invocations avec les Éclats d’étoile ; trophées.
- **Portraits d’émotion** (format `sprite_config.json`) : mets `Normal.png`, `Happy.png`, `Crying.png`… dans le dossier d’une créature, ou une planche de portraits de 5 colonnes de 40 px.
- **user_save.json** : la sauvegarde s’exporte et s’importe (Paramètres → Sauvegarde).
