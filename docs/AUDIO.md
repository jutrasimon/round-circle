# Audio — Gym018

Musique intégrée : `dist/assets/audio/fortress-of-bone.mp3`, extraite de
`Fortress of Bone - Music.mp3` dans le ZIP fourni par l'utilisateur.
Lecture en boucle après une interaction, volume initial 28 %, atténuation
pendant les dialogues et suspension lorsque l'onglet est masqué.

## Les 8 effets à fournir

Remplacer les WAV provisoires ci-dessous dans `dist/assets/audio/` par les sons
définitifs, en conservant les noms. Aucun changement de déclencheur nécessaire.
WAV PCM conseillé, sans silence initial, volume homogène, durée maximale 2 s.
Les placeholders actuels sont de petits sons synthétiques originaux, pas des
effets extraits de la musique. Le jeu contient neuf fichiers audio au total.

| Fichier | Son souhaité | Déclencheurs déjà connectés |
| --- | --- | --- |
| `ui.wav` | Clic sec et doux, 50–100 ms | Boutons, onglets, commandes |
| `shot.wav` | Tir court stylisé, 100–200 ms | Soldats, locomotive et monstres |
| `impact.wav` | Choc sourd, 100–250 ms | Dégâts reçus et collisions du convoi |
| `death.wav` | Craquement / éclatement, 200–500 ms | Mort d'une unité, destruction d'une maison ou du convoi |
| `spawn.wav` | Petit pop organique/mécanique, 150–350 ms | Apparition de monstres, soldats, maisons, wagons produits et embarquement |
| `wave.wav` | Alerte grave, 500–1000 ms | Début de vague annoncé |
| `reward.wav` | Accord gratifiant, 300–700 ms | Vague terminée et bonus choisi |
| `dialogue.wav` | Ponctuation douce, 60–150 ms | Nouvelle réplique et réponse validée menant au nœud suivant |

Un même son est réutilisé entre plusieurs types d'entités. Les effets sont
limités à quatre départs par 100 ms, douze voix simultanées et un délai propre
à chaque son. Pas de bruit par lettre ni de boucle de train supplémentaire.

Réglages : Mode jeu → Musique et sons. Volumes séparés, bouton de coupure rapide
dans le pied de l'écran et huit boutons de test. Préférences locales conservées.
Les signaux déclenchés avant activation ou en arrière-plan ne sont pas rejoués.
