# Guide · Composer une partie dans le gym

## 1. Conduire

Le panneau de vitesse se déplace par son titre et se redimensionne par son coin inférieur droit (souris ou tactile, flèches au clavier). Sa position et sa taille sont mémorisées dans le navigateur et restent dans la scène. La vitesse va de 1 à 60 : aucun arrêt ni raccourci de vitesse. Les dégâts bruts d’impact et l’usure par contact sont affichés sous le contrôle.

Augmenter la vitesse ne modifie pas les dégâts des tirs. Les collisions ajoutent une autre source de dégâts. Les coefficients sont exposés dans **Mode jeu → Maisons et collisions**.

## 2. Produire des soldats

Les maisons produisent automatiquement quand l’option est active. Elles ont chacune une cadence et une régénération, inspectables en cliquant le bâtiment. Une naissance apparaît à la sortie de la maison, puis rejoint la circulation à pied.

Un wagon libre doit croiser le soldat pour qu’il embarque. Si le train est plein, il continue de marcher et d’attaquer. Diminuer une capacité fait débarquer le surplus.

### Profil pondéré

Dans **Mode jeu**, répartir les points entre résistance, puissance, mobilité, portée et cadence. Monter une allocation redistribue proportionnellement les autres. Le total reste 100 points entiers, avec un minimum de 1 et un maximum de 96 par allocation. Les boutons −/+ changent un point; le champ permet la saisie directe. Le slider réserve davantage de course aux petites valeurs.

Les points utiles d’une stat valent `budget × allocation / 100 / pondération`. Les courbes actuelles sont :

| Stat | Valeur finale |
|---|---|
| HP | `arrondi(15 + points × 2)` |
| Dégâts | `2 + points × 0,4` |
| Vitesse | `1 + points × 0,08` |
| Portée | `1 + points × 0,12` |
| Tirs/seconde | `1 + points × 0,06` |

Pondérations par défaut : HP 1; dégâts 1,5; vitesse 1; portée 1,5; cadence 2. Tout cela reste un réglage de design, sans progression officielle.

Le bouton de naissance du Mode jeu utilise ce profil. Le spawn manuel de **Simulation** utilise les sliders libres. La production des maisons peut être basculée du profil pondéré vers ces valeurs libres.

**Tuer tous les soldats** tue les soldats à pied et à bord, libère les places et conserve les maisons. La production continue : la désactiver pour garder la scène sans soldats.

## 3. Construire une vague

1. Dans **Vagues**, choisir une vague ou cliquer **Nouvelle**.
2. Donner un nom.
3. Ajouter un ou plusieurs groupes.
4. Choisir le monstre, sa quantité, son délai et l’intervalle entre ses apparitions.
5. Ouvrir les stats du groupe pour régler HP, dégâts, vitesse, portée et intervalle d’attaque.
6. **Faire apparaître cette vague** teste le brouillon courant, même avant sauvegarde, en arrêtant le mode automatique actif.
7. **Sauvegarder** enregistre ou remplace cette vague. **Dupliquer** crée un nouveau brouillon.

Les trois exemples fournis sont des séquences de test. Ce ne sont pas les vagues officielles du jeu.

## 4. Déclencher par taille du vortex

1. Choisir une vague en haut de **Vagues**, ou modifier sa composition.
2. Régler **Rayon actuel / taille à assigner**, par exemple 2.
3. Cliquer **Assigner cette vague au rayon actuel**. Cela sauvegarde aussi la composition affichée.
4. Refaire pour les autres seuils. Plusieurs vagues peuvent partager un rayon.
5. Régler le rayon initial (ex. 1,2) et la croissance (ex. 0,6 unité/minute).
6. **Lancer / relancer la croissance** remet le vortex au rayon initial et arme les seuils. Les monstres existants restent en scène.

Un rayon de 2 est atteint après 80 secondes avec ces valeurs. Chaque seuil déclenche une seule fois par lancement. Le délai de chaque groupe commence au déclenchement de sa vague. Les seuils inférieurs au rayon initial sont ignorés; ceux égaux au départ se déclenchent immédiatement.

La croissance s’arrête à 6 (limite actuelle du gym), sans engloutissement. Le taux est modifiable pendant le test; 0 suspend la croissance. Changer le rayon actuel vers le haut déclenche les seuils atteints au prochain pas de simulation. Le réduire ne réarme aucun seuil. Modifier les assignations ou les vagues demande une relance; le mode en cours conserve sa copie.

Le prochain seuil et les apparitions en attente sont affichés. Pause suspend tout. Arrêter annule la croissance et les apparitions futures. Une réinitialisation ou un chargement arrête le mode. Lancer la playlist remplace le mode vortex et inversement.

## 5. Assembler la playlist

Ajouter les vagues sauvegardées et les réordonner avec les flèches.

- **Attendre le délai** : la vague suivante démarre après la dernière apparition et le délai choisi. Les monstres survivants peuvent s’accumuler.
- **Attendre élimination** : il faut aussi éliminer tous les monstres issus de cette vague. Le délai est compté depuis sa dernière apparition; il peut donc déjà être écoulé lors de la dernière mort.
- **Arrêter** annule les apparitions futures, sans supprimer les monstres présents.
- **Recommencer** remet la scène à zéro et relance la playlist.
- La pause générale suspend la simulation et les apparitions.

Si la limite de monstres est atteinte, les apparitions restent en attente. Elles ne disparaissent pas de la séquence.

## 6. Sauvegarder son travail

| Données | Sauvegarde |
|---|---|
| Vagues, playlist, seuils, rayon initial et croissance | Automatique après modification ou sauvegarde d’une vague |
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

## Stats par défaut au démarrage

En haut de **Mode jeu**, **Save stats to default** mémorise les réglages de simulation, le profil des prochains soldats, les stats des prochains monstres et les réglages initiaux du vortex. Ils sont rechargés automatiquement à la prochaine ouverture dans ce navigateur. Sauvegarder ne réinitialise pas le combat. Les HP restants et les modifications individuelles de bâtiments, soldats ou wagons ne constituent pas des stats de départ.

**Exporter defaults.json** télécharge `stats-defaults.json` avec les réglages actuels. **Importer defaults.json** valide un fichier et en fait le nouveau défaut local; recharger ensuite la page. Le fichier de référence du dépôt est `dist/stats-defaults.json`. Le bouton ne réécrit pas ce fichier serveur : pour partager un défaut entre navigateurs, exporter/importer le fichier ou intégrer son contenu au dépôt.

Le nombre de maisons s’applique au démarrage et à la réinitialisation. Les réglages de production concernent les prochains soldats; les soldats déjà présents conservent leur profil. Les outils de sauvegarde visuelle existants restent séparés.

## Interception des ennemis

Un ennemi lent qui vise le train rejoint maintenant un point fixe sur les rails pour l’intercepter. Il ne poursuit plus indéfiniment sa position instantanée près du vortex. Les assiégeants conservent leur priorité aux bâtiments.

## Pop de maisons

Dans **Mode jeu → Maisons et collisions**, **Pop maison : toutes les X secondes** ajoute une maison sur un emplacement jamais occupé. Défaut : 30 secondes; 0 désactive. Le compte à rebours utilise le temps de simulation (la pause le suspend), repart à zéro après une création, un changement de délai ou un reset. Aucun cumul quand les 12 places sont occupées. Les ruines restent occupées : une maison détruite n’est pas reconstruite.

La nouvelle maison utilise les HP, la régénération et la production courants; sa production de soldats démarre à zéro. Le délai est inclus dans Save stats to default et les exports JSON. Pour tester, choisir moins de 12 maisons au démarrage puis réinitialiser la scène.

## Start et positions des maisons

**Start**, à côté de Pause, recommence une partie avec les réglages actuels : HP restaurés, monstres et soldats retirés, trois wagons initiaux, compteurs remis à zéro et nouvelles positions aléatoires des maisons. Il quitte la pause et remet le vortex au rayon initial. Il relance le dernier mode choisi (vortex par défaut, playlist ou manuel). Les vagues, profils, couleurs et caméra sont conservés.

Les maisons initiales comme les pops suivants tirent uniformément un emplacement parmi les places jamais occupées, sans doublon. Les ruines restent occupées jusqu’à la prochaine partie. Avec 12 maisons initiales, toutes les places sont forcément remplies.
