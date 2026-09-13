# Guide · Composer une partie dans le gym

## 1. Conduire

Le panneau de vitesse se déplace par son titre et se redimensionne par son coin inférieur droit (souris ou tactile, flèches au clavier). Sa position et sa taille sont mémorisées dans le navigateur et restent dans la scène. La vitesse va de 1 à 60 : aucun arrêt ni raccourci de vitesse. Les dégâts bruts d’impact et l’usure par contact sont affichés sous le contrôle.

Augmenter la vitesse ne modifie pas les dégâts des tirs. Les collisions ajoutent une autre source de dégâts. Les coefficients sont exposés dans **Mode jeu → Maisons et collisions**.

## 2. Produire des soldats

Les maisons produisent automatiquement quand l’option est active. Elles ont chacune une cadence et une régénération, inspectables en cliquant le bâtiment. Une naissance apparaît à la sortie de la maison, puis rejoint la circulation à pied.

Un wagon libre doit croiser le soldat pour qu’il embarque. Si le train est plein, il continue de marcher et d’attaquer. Diminuer une capacité fait débarquer le surplus.

### Profil pondéré

Dans **Mode jeu**, répartir les points entre résistance, puissance, mobilité, portée et cadence. Monter une allocation redistribue proportionnellement les autres. Le total reste 100 %.

Les points utiles d’une stat valent `budget × allocation / 100 / pondération`. Les courbes actuelles sont :

| Stat | Valeur finale |
|---|---|
| HP | `arrondi(15 + points × 2)` |
| Dégâts | `2 + points × 0,4` |
| Vitesse | `0,8 + points × 0,08` |
| Portée | `1 + points × 0,12` |
| Tirs/seconde | `0,25 + points × 0,06` |

Pondérations par défaut : HP 1; dégâts 1,5; vitesse 1; portée 1,5; cadence 2. Tout cela reste un réglage de design, sans progression officielle.

Le bouton de naissance du Mode jeu utilise ce profil. Le spawn manuel de **Simulation** utilise les sliders libres. La production des maisons peut être basculée du profil pondéré vers ces valeurs libres.

## 3. Construire une vague

1. Dans **Vagues**, choisir une vague ou cliquer **Nouvelle**.
2. Donner un nom.
3. Ajouter un ou plusieurs groupes.
4. Choisir le monstre, sa quantité, son délai et l’intervalle entre ses apparitions.
5. Ouvrir les stats du groupe pour régler HP, dégâts, vitesse, portée et intervalle d’attaque.
6. **Spawn wave** teste le brouillon courant, même avant sauvegarde.
7. **Sauvegarder** enregistre ou remplace cette vague. **Dupliquer** crée un nouveau brouillon.

Les trois exemples fournis sont des séquences de test. Ce ne sont pas les vagues officielles du jeu.

## 4. Assembler la playlist

Ajouter les vagues sauvegardées et les réordonner avec les flèches.

- **Attendre le délai** : la vague suivante démarre après la dernière apparition et le délai choisi. Les monstres survivants peuvent s’accumuler.
- **Attendre élimination** : il faut aussi éliminer tous les monstres issus de cette vague. Le délai est compté depuis sa dernière apparition; il peut donc déjà être écoulé lors de la dernière mort.
- **Arrêter** annule les apparitions futures, sans supprimer les monstres présents.
- **Recommencer** remet la scène à zéro et relance la playlist.
- La pause générale suspend la simulation et les apparitions.

Si la limite de monstres est atteinte, les apparitions restent en attente. Elles ne disparaissent pas de la séquence.

## 5. Sauvegarder son travail

| Données | Sauvegarde |
|---|---|
| Vagues et ordre de playlist | Automatique après sauvegarde d’une vague ou changement de playlist |
| Bibliothèque complète | Export/import JSON dans Vagues |
| Réglages visuels, simulation et profil soldats | Sauver/charger dans Visuel |
| État exact du combat | Non sauvegardé |

La sauvegarde locale appartient à ce navigateur. **Exporter le JSON des vagues avant de changer d’appareil ou de vider les données du navigateur.** L’import est validé avant remplacement. Les fichiers invalides ne remplacent pas la bibliothèque.

## Bestiaire de test

| Ennemi | Silhouette | Comportement |
|---|---|---|
| Rampant | Petit corps à œil et gueule | Cible la plus proche |
| Sprinteur | Petite créature rapide | Cible la plus proche |
| Colosse | Corps massif | Lent et résistant |
| Gueule traînante | Mâchoire large et plusieurs membres | Cherche les soldats à pied |
| Crache-bile | Sac gonflé et pustule lumineuse | Attaque les bâtiments à distance |
| Porte-cadavres | Carapace anguleuse et épines | Assiège les maisons, armure de 40 % |
| Cathédrale de chair · élite | Masse verticale, organes et grandes pointes | Attaque de zone, dégâts secondaires à 40 % |
| Veuve du seuil · élite | Abdomen, huit longues pattes et crocs | Chasse rapidement les soldats à pied |

Les cinq nouveaux monstres sont assemblés en volumes simples. Leurs stats initiales et comportements sont dans `dist/sim.js`; leurs silhouettes sont dans `dist/enemies.js`.
