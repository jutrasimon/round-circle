# Plan · De l’atelier à la partie

## Livré dans le gym

- [x] Sauvegarde GitHub du gym 004 et branche de travail.
- [x] Cassette interdite par défaut, vortex et 24 presets conservés.
- [x] Contrôle de vitesse permanent et collisions avec usure individuelle.
- [x] Maisons productrices, régénération et destruction définitive avant reset.
- [x] Sortie des habitants et embarquement au croisement.
- [x] Cinq ennemis supplémentaires, dont deux élites.
- [x] Designer de vagues et playlist importable/exportable.
- [x] Profil des prochaines naissances à budget pondéré.
- [x] Tests des règles critiques et documentation.

## À concevoir ensuite

| Lot | Travail | Critère de validation |
|---|---|---|
| Sensations | Ajuster vitesse, usure, collisions, portée et densité | Plusieurs vitesses sont utiles, pas un seul réglage dominant |
| Équilibrage soldats | Ajuster coûts et courbes de répartition | Plusieurs répartitions permettent des stratégies viables |
| Production | Définir nombre de bâtiments initial, diversité et reconstruction éventuelle | Une perte est lisible et a une conséquence intéressante |
| Habitants | Réparateurs, ouvriers, banquiers, cour | Chaque rôle a une fonction et un déplacement distincts |
| Moral | Définir le lien entre entourage, pertes et efficacité | Sacrifier la cour constitue un choix compréhensible |
| Table | Placement des aristocrates, synergies et buffs | Le placement modifie réellement la ville ou le train |
| Vortex | Croissance, urgence et engloutissement | Le joueur lit le temps restant sans dépendre d’un compteur |
| Narration | Portraits 2D, événements et décisions | Les choix restent lisibles pendant le mouvement du jeu |
| Diplomatie | Définir des conditions étranges mais compréhensibles | L’harmonie devient une stratégie découvrable |
| Force | Construire les synergies et la victoire militaire | Un build exceptionnel peut gagner avant la catastrophe |
| Fin de partie | Engloutissement, diplomatie, domination | Trois issues distinctes, avec une conclusion complète |

## Hors implémentation pour le moment

Niveaux, progression officielle, déblocages, méta-progression et pouvoir ultime. Les noter et les discuter avant de les introduire.

## Discipline de livraison

1. Nommer la version de départ et garder un checkpoint.
2. Limiter le changement à un lot cohérent.
3. Tester les règles affectées et la compatibilité des sauvegardes.
4. Committer la version et ses notes.
5. Publier le gym, puis examiner les sensations ensemble.

Ne pas écraser un export de vagues de référence lors d’un test. Les séquences du gym restent des données de design, pas des constantes enfouies dans le rendu.
