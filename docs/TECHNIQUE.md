# Architecture · Préserver et poursuivre le travail

## Fichiers

| Fichier | Responsabilité |
|---|---|
| `dist/sim.js` | Entités, HP, production, profils, déplacements, tirs et collisions |
| `dist/waves.js` | Validation des données, planification et lecture des vagues |
| `dist/designer.js` | Interface de budget, éditeur de vagues et playlist |
| `dist/driving-panel.js` | Déplacement, redimensionnement et mémoire du panneau de vitesse |
| `dist/app.js` | Scène Babylon, rendu, interactions et raccordement du gym |
| `dist/enemies.js` | Formes et membres des monstres |
| `dist/vortex.js` | Vortex procédural, débris et particules |
| `dist/presets.js` | Les 24 ambiances |
| `dist/index.html`, `dist/style.css` | Structure et mise en page |
| `scripts/prepare-engine.mjs` | Récupération de Babylon.js 9.26.0 avec SHA-256 |
| `tests/simulation.test.cjs` | Régressions des règles critiques |

Le moteur n’est pas inclus dans GitHub pour éviter de versionner une distribution tierce de 8 Mo. Le script reproduit exactement le fichier servi par le gym. Une fois téléchargé, le jeu utilise le fichier local et ne dépend pas d’un CDN pendant la partie.

## Collisions

La simulation subdivise les mises à jour en pas d’au plus 20 ms. Pour chaque véhicule, elle teste l’arc parcouru contre la position angulaire des monstres dans la bande de collision du rail. La collision n’est donc pas limitée à la position finale du train.

Un ensemble de contacts empêche de multiplier les impacts pendant un contact continu. Une séparation autorise un nouveau contact. Les wagons ont leurs propres contacts et HP. Les pertes de wagons font débarquer leurs occupants.

Il s’agit de collisions de gameplay simplifiées, sans moteur physique de corps rigides.

## Vagues et reproductibilité

Le schéma de bibliothèque porte `version: 1`, `waves` et `playlist`.

```json
{
  "version": 1,
  "waves": [{
    "id": "visiteurs",
    "name": "Premiers visiteurs",
    "groups": [{
      "type": "maw", "count": 4,
      "delay": 0, "interval": 1.5,
      "stats": {"hp": 65, "damage": 9}
    }]
  }],
  "playlist": [{"waveId": "visiteurs", "mode": "clear", "gap": 3}]
}
```

Le lecteur copie les données au lancement. Les modifications de design suivantes ne changent pas cet instantané. Les groupes mémorisent les stats; les apparitions sont ordonnées selon le temps simulé. La répartition spatiale dépend des IDs d’entités, donc deux états de scène différents ne garantissent pas les mêmes positions de spawn.

Limites de sécurité et de performance du gym : 100 vagues, 32 groupes par vague, 500 apparitions par vague, 100 entrées de playlist; limite d’entités actives configurable jusqu’à 300 par camp. Cela n’est pas une garantie de 60 FPS à ces plafonds.

## Vérifier

```sh
node scripts/prepare-engine.mjs
node --test tests/simulation.test.cjs
node --check dist/app.js
node --check dist/designer.js
```

Les tests automatisés couvrent tirs fixes, collisions à haute vitesse, usure, embarquement, capacité, production, destruction, budget, validation JSON et timing des vagues. Un contrôle de scène sans GPU peut vérifier la construction et les interactions, mais ne remplace pas une inspection visuelle WebGL.

## Points de retour

- `checkpoint/gym-004` : sauvegarde GitHub de la version précédente, avant cette intégration.
- `work/gameplay-gym` : branche de travail de cette extension.
- `main` : dernière version livrée du dépôt.

Pour examiner le checkpoint sans écraser la version en cours :

```sh
git worktree add ../round-circle-checkpoint checkpoint/gym-004
cd ../round-circle-checkpoint
node scripts/prepare-engine.mjs
python3 -m http.server 8001 --directory dist
```

Pour revenir en production, créer un nouveau commit de restauration après vérification, sans réécrire l’historique. La version hébergée du gym est également versionnée; le checkpoint correspond au gym 004.

## Sauvegardes locales

- `round-circle-driving-layout-v1` : position et taille du panneau de vitesse.
- `round-circle-gym` : configuration visuelle, simulation et profil soldats.
- `round-circle-waves-v1` : bibliothèque des vagues et playlist.

L’état du combat n’est pas persisté. Les documents, le code et les checkpoints sont dans GitHub; les vagues créées par le designer doivent aussi être exportées puis ajoutées au dépôt pour une conservation indépendante du navigateur.
