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

- Vitesse permanente de 0 à 60, impacts et usure du train.
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
