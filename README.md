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
