# Round Circle Train

Gym de création d’un jeu de survie circulaire en navigateur. Babylon.js, JavaScript, HTML et CSS, sans compilation.

## Lancer le gym

```sh
node scripts/prepare-engine.mjs
python3 -m http.server 8000 --directory dist
```

Ouvrir http://localhost:8000. Le moteur Babylon.js 9.26.0 est récupéré avec une vérification SHA-256. Les scripts, presets et effets originaux sont versionnés dans ce dépôt.

## Point de départ

Le checkpoint `checkpoint/gym-004` conserve la simulation manuelle, les 24 ambiances, le vortex animé, les paramètres exposés et l’inspection des entités avant l’intégration des mécaniques de jeu.

[Jouer à Round Circle sur GitHub Pages](https://jutrasimon.github.io/round-circle/).

## Hébergement GitHub Pages

Le workflow `.github/workflows/pages.yml` teste le jeu, récupère le moteur Babylon.js avec vérification SHA-256 et publie uniquement `dist` à chaque mise à jour de `main`. Le jeu fonctionne alors sans ChatGPT et sans CDN pendant la partie.

Activation initiale : dans **Settings → Pages → Build and deployment**, choisir **GitHub Actions**, puis lancer le workflow **Test and deploy game to GitHub Pages** depuis **Actions**. Un dépôt privé nécessite une offre GitHub compatible avec Pages ; il n’est pas nécessaire de rendre le code public si cette offre est disponible.

Lors du changement d’adresse, les sauvegardes du navigateur ne sont pas transférées automatiquement. Exporter les réglages et vagues souhaités depuis l’ancien site, puis les importer sur le nouveau. Retirer l’ancien hébergement seulement après vérification du nouveau site.

## Gym 005

- Vitesse permanente de 1 à 60, impacts et usure du train.
- Maisons productrices, régénération et destruction définitive avant reset.
- Soldats à budget pondéré; embarquement au croisement.
- Huit ennemis au total, dont cinq nouveaux et deux élites.
- Éditeur de vagues, playlist et import/export JSON.
- Cassette interdite par défaut; les 24 ambiances et le vortex restent disponibles.

**Pas de progression officielle ni de campagne pour le moment.**

## Gym 012 · Bonus et dialogues

- Après l’élimination d’une vague : trois bonus au choix, combat en pause, puis un artefact en haut de l’écran. Dix effets puissants, cumulatifs : ×1,5, ×2 ou ×3.
- Onglet **Bonus** : tester un tirage, régler les multiplicateurs, créer des bonus dans le catalogue JSON, importer/exporter.
- Onglet **Dialogue** : rencontre du kit avec Monsieur et La Locataire, six portraits, choix conditionnels et historique. Lecture manuelle, au rayon choisi ou après une vague ; temps normal, ralenti ou pause.
- **Start** remet à zéro les bonus et les conversations, en conservant les réglages du laboratoire.

[Guide des deux ateliers](docs/FEATURES.md).

## Gym 013 · Ciblage, relief et ciel

Les ennemis quittent les points d’interception vides après deux secondes et se rabattent sur une maison existante. Les attaques tolèrent l’arrondi à la limite de portée ; les wagons arrêtés et les bâtiments détruits sont correctement retargetés.

Dans **Visuel → Réglages avancés** : **Disque de la ville** et **Fond extérieur** ont des couleurs séparées. Le **Ciel illustré** peut être désactivé ou atténué. **Relief des monstres** règle leur lumière de remplissage ; le cuirassé possède une carapace à facettes contrastées et des détails dorsaux visibles de haut.

[Image du ciel et prompt de création](docs/SKY-ASSET.md).

## Documentation

[Ouvrir le carnet de conception](docs/README.md) : vision, idées futures, décisions, guide du gym, plan de développement et architecture.

## Tests

```sh
node --test tests/*.test.cjs tests/*.test.mjs
```

## Gym 007

- Profils : points entiers, minimum 1, boutons −/+ et sliders précis dans les petites valeurs.
- Bouton pour tuer tous les soldats, à pied comme à bord.
- Vortex : croissance par minute et vagues assignées à des seuils de rayon, en alternative à la playlist.
- Seuils sauvegardés et exportables avec les vagues; anciens exports compatibles.

## Gym 008

- Interception des cibles mobiles : les ennemis lents rejoignent leur trajectoire.
- Save stats to default, chargement automatique local et export/import JSON.
- Nombre de maisons au démarrage clarifié.

## Gym 009

- Pop automatique de maisons toutes les X secondes sur les emplacements libres, compte à rebours et sauvegarde du délai dans les stats par défaut.

## Gym 010

- Emplacements aléatoires des maisons initiales et des pops.
- Start à côté de Pause : recommencer la partie avec les réglages courants.

## Gym 011

- Annonce WAVE X aux seuils du vortex : texte animé, flash, vibration, contraste et aberration chromatique.
- Test et réglages des effets dans Vagues, sauvegardés localement.
