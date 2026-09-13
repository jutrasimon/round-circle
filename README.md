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

[Gym hébergé](https://round-circle-lab.jutrasimon.chatgpt.site)

## Gym 005

- Vitesse permanente de 1 à 60, impacts et usure du train.
- Maisons productrices, régénération et destruction définitive avant reset.
- Soldats à budget pondéré; embarquement au croisement.
- Huit ennemis au total, dont cinq nouveaux et deux élites.
- Éditeur de vagues, playlist et import/export JSON.
- Cassette interdite par défaut; les 24 ambiances et le vortex restent disponibles.

**Pas de progression officielle ni de campagne pour le moment.**

## Documentation

[Ouvrir le carnet de conception](docs/README.md) : vision, idées futures, décisions, guide du gym, plan de développement et architecture.

## Tests

```sh
node --test tests/simulation.test.cjs
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
