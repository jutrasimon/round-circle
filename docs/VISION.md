# Vision · Qui est chez soi ?

**Round Circle Train** est un jeu de survie circulaire : une locomotive protège une ville construite autour d’un vortex. La ville produit des habitants; les habitants alimentent les capacités du train. Le monde central réclame progressivement sa place.

## Ton et direction artistique

Une bourgeoisie victorienne dégénérée, le commerce omniprésent, des boissons étranges et une indifférence polie à la catastrophe. Références d’intention : Kafka pour l’absurdité administrative, Naked Lunch pour l’organique inquiétant, Total Recall pour l’artificialité, Hunger Games pour le spectacle institutionnel.

La direction retenue dans le gym est **Cassette interdite** : rendu 3D simple, couleurs vidéo, grain et aberrations. Les 24 presets restent disponibles pour explorer. Le vortex actuel est conservé. Éviter de revenir au gothique ornemental ou à une illustration impossible à produire en jeu.

## Fondations retenues

- Une piste circulaire, des bâtiments à l’extérieur, un vortex à l’intérieur.
- Locomotive, wagons, bâtiments, habitants et monstres ont leurs propres HP.
- La vitesse du train est un levier joueur, y compris pour les collisions.
- Les bâtiments produisent des habitants qui sortent, circulent et embarquent lors d’un croisement si une place est libre.
- Les wagons portent une capacité et leurs propres HP.

## Habitants à concevoir

Seul le soldat attaquant est actuellement simulé. Les rôles ci-dessous sont des **intentions à designer**, sans valeurs ni pouvoirs définitifs.

| Rôle | Intention | Questions de design |
|---|---|---|
| Combattants | Attaquer les monstres | Variantes, portées, spécialités, préférences de déplacement |
| Réparateurs | Entretenir les structures ou le train | Réparer à pied, à bord ou lors d’un passage ? |
| Ouvriers | Faire fonctionner la ville | Construction, cadence, ressources ou production ? |
| Banquiers | Influencer l’économie | Quelle ressource ? Quel risque ? Quel coût social ? |
| Cour / entourage | Soutenir le moral et servir de bouclier | Priorité des pertes; effet exact des morts sur le moral |
| Aristocrates | Être placés autour d’une table et transformer le monde | Buffs de siège, changements permanents, places et synergies |

**La cour est importante.** Ce sont les premiers à mourir, mais leur présence soutient le moral. Cette contradiction doit devenir sensible, pas rester du texte d’ambiance.

## Table des aristocrates

L’intention est de voir les personnages autour d’une table et de les placer. Ils offrent des buffs passifs et des transformations permanentes du monde.

À préciser : le sens de « permanent » dans une partie, l’éventuelle persistance entre parties, ce qui cesse quand un aristocrate quitte la table, les interactions de voisinage. **Aucune progression ou méta-progression officielle n’est implémentée.**

## Locomotive à développer

En plus des HP, de la vitesse et des collisions déjà testables : spécialisation, force éventuelle, niveaux et pouvoir ultime. Ces systèmes restent au carnet. Le budget des soldats est un paramètre de gym, pas une progression débloquée en jeu.

## Vortex et narration

Le vortex possède une cadence d’apparition, une file d’ennemis et des moments narratifs. Le designer de vagues prépare cette séquence. Son rayon est réglable; sa croissance automatique et l’engloutissement ne sont pas implémentés.

Les conversations envisagées utilisent de grands portraits 2D devant le jeu en mouvement, avec quelques décisions clés. Une forte décélération pendant les choix est une proposition à tester, pas une règle définitive.

## Trois fins envisagées

| Fin | Sens | Durée souhaitée, non implémentée |
|---|---|---|
| Engloutissement | « Heading to a new home » : perdre cette maison et partir ailleurs | Environ 6 à 7 minutes |
| Diplomatie | Harmonie entre les deux mondes; la maison se transforme | Environ 5 minutes |
| Victoire par la force | Imposer sa présence grâce à un build excessivement puissant | À tout moment avant la défaite |

La diplomatie exige des choix étranges et difficiles. La victoire militaire doit être très difficile et dépendre fortement des synergies et de la chance. Aucune de ces conditions de fin n’est encore codée.

## Question directrice

**Qu’est-ce qu’une maison quand on refuse de reconnaître celle de l’autre ?**

La réponse passe par les habitants que l’on protège, ceux que l’on sacrifie et ce que l’on accepte de transformer. Le projet a été envisagé pour le thème HOME du [jam All Tools Allowed #2](https://itch.io/jam/all-tools-allowed-2).
