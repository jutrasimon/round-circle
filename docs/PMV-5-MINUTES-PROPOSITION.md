# Proposition · Partie témoin de cinq minutes

**Statut : première version jouable dans [`dist/partie-temoin.json`](../dist/partie-temoin.json).** Les nombres ci-dessous sont la base de réglage, pas un équilibrage définitif.

## Intention

Faire une partie complète avec les briques déjà jouables : conduire, produire des habitants, protéger les maisons, survivre aux vagues, choisir des bonus, entendre La Locataire et atteindre une conclusion. Les cinq minutes sont du **temps de simulation** : pause et choix de bonus ne les consomment pas. Les dialogues ordinaires laissent le jeu tourner; seul un choix ralentit brièvement la scène.

La montée doit passer par trois questions : **Qui arrive ? Qui perd sa place ? Qui peut encore rentrer ?** La première minute présente le train et le premier danger; la deuxième fait naître une force de défense; la troisième menace les maisons; la quatrième force l'usage de la vitesse et des bonus; la dernière met les deux mondes face à face.

## Horloge et partition des vagues

Rayon initial **1,20**, rayon final **6,00**, croissance **0,96 par minute**. Start remet ces valeurs et les compteurs à zéro. Chaque vague est attachée à un rayon et démarre même si la précédente a encore des survivants. Les apparitions d'un groupe sont espacées par `interval`; `delay` est relatif au début de sa vague.

| Temps de jeu | Rayon | Vague | Groupes (`nombre × type`, délai, intervalle) | Effet recherché |
|---|---:|---|---|---|
| 0:25 | 1,60 | 1 · Le bruit à la porte | 4 Rampants (0 s, 3 s); 2 Gueules (8 s, 4 s) | Premier contact, danger lisible, premier bonus vers 0:45–1:00. |
| 1:25 | 2,56 | 2 · Les voisins | 5 Sprinteurs (0 s, 1,5 s); 3 Gueules (5 s, 3 s) | Le joueur doit suivre plusieurs cibles et protéger les soldats à pied. |
| 2:25 | 3,52 | 3 · La limite | 3 Crache-bile (0 s, 3 s); 2 Porte-cadavres (8 s, 8 s) | Premier véritable siège des maisons. |
| 3:25 | 4,48 | 4 · La maison se fend | 6 Sprinteurs (0 s, 1 s); 3 Gueules (5 s, 2 s); 1 Colosse (8 s); 1 Veuve (12 s) | Pic de mobilité, pertes possibles, quatrième bonus si la vague est nettoyée. |
| 4:20 | 5,36 | 5 · Le seuil | 1 Cathédrale (0 s); 4 Crache-bile (5 s, 3 s); 6 Sprinteurs (5 s, 1 s) | Dernière menace visible; l'élimination complète est difficile, mais possible avec un bon build. |

Total programmé : **41 monstres**, les huit types présents et deux élites à des moments différents. Quatre choix de bonus sont attendus pendant une bonne partie; la dernière vague ne doit pas être une source de puissance nécessaire pour la finir. Les seuils et compositions doivent faire partie de la bibliothèque livrée à un nouveau joueur, tout en restant éditables dans le gym.

## Stats de départ de la simulation

Ces nombres servent à la **partie témoin**, pas aux limites des curseurs du gym. Les valeurs marquées « conserver » sont reprises du jeu actuel.

| Champ | Proposition | Rôle et raison |
|---|---:|---|
| `trainHp` | 280 | Réserve de survie pour tenir jusqu'au cinquième acte avec des bonus variés. |
| `trainDamage` | 13 | Tir de base un peu plus utile sans rivaliser avec tout un wagon de soldats. |
| `trainSpeed` | 3 | Départ actif; la plage réglable 1–60 reste disponible. |
| `trainRange` | 6 | Conserver; le train participe tôt au combat. |
| `trainCooldown` | 1 s | Cadence lisible. |
| `ramDamage` | 6 par unité de vitesse | Conserver; l'accélération doit être un choix d'attaque. |
| `ramSelfDamage` | 0,35 par unité, plancher de vitesse 5 | Un impact coûte au moins 1,75 HP par véhicule; à 20, il coûte 7 HP. |
| `wagonHp` | 110 | Les wagons encaissent un peu plus, sans devenir jetables. |
| `capacity` | 3 soldats par wagon | Neuf places initiales : les soldats à pied restent visibles et le wagon supplémentaire compte. |
| `actorHp` | 55 | Valeur des spawns libres alignée sur le profil de départ. |
| `actorDamage` | 8,67 | Idem. |
| `actorSpeed` | 2,2 | Idem. |
| `actorRange` | 2,6 | Idem. |
| `actorCooldown` | 0,625 s | Idem, soit 1,6 tir/s. |
| `actorLimit` | 50 | Évite une armée qui résout automatiquement le dernier acte. |
| `monsterLimit` | 80 | Laisse toutes les vagues coexister sans masquer la scène. |
| `buildingHp` | 150 | Une maison peut être perdue pendant le siège, avec assez de temps pour réagir. |
| `buildingCount` | 5 | Laisse voir la ville se construire; le début n'occupe plus les 12 emplacements. |
| `buildingPopInterval` | 50 s | Une nouvelle maison à 0:50, 1:40, 2:30, 3:20 et 4:10 si une place libre existe. |
| `buildingRegen` | 0,35 HP/s | La réparation aide entre deux attaques, sans annuler un siège. |
| `buildingSpawnRate` | 1,2 soldat/min/maison | Environ 48 naissances potentielles sur cinq minutes avant pertes et blocages. |
| `production` | activée | Le cycle maisons → habitants → défense existe dès Start. |
| `useBudget` | activé | Le profil pondéré gouverne les naissances. |
| `vortexRadius` | 1,20 | Valeur initiale; la partie se clôt à 6. |

Il y a trois wagons au départ et au plus seize, comme aujourd'hui. Une maison produit un wagon lorsque le train est plein; cette règle reste visible dans le panneau de production. Une maison détruite reste détruite jusqu'à la prochaine partie.

### Profil des soldats produits

| Paramètre | Valeur proposée |
|---|---:|
| Budget | 100 |
| Parts HP / dégâts / mobilité / portée / cadence | 20 / 25 / 15 / 20 / 20 |
| Pondérations HP / dégâts / mobilité / portée / cadence | 1 / 1,5 / 1 / 1,5 / 2 |
| Résultat du profil de départ | **55 HP, 8,67 dégâts, vitesse 2,2, portée 2,6, cadence 1,6 tir/s** |

Ce profil reste modifiable entre parties. Les soldats déjà nés gardent leurs stats. Les valeurs libres de la section Simulation sont alignées sur ce profil pour que les deux modes ne donnent pas des impressions contraires.

## Bestiaire complet proposé

`Portée` est la distance d'attaque; `cadence` est le temps entre tirs. Les tailles restent celles des silhouettes actuelles. Les monstres ordinaires gardent leurs stats actuelles; les deux élites sont réduites pour une partie de cinq minutes. Aucun type nouveau n'est nécessaire.

| Type | HP | Dégâts | Vitesse | Portée | Cadence | Taille | Comportement / spécial |
|---|---:|---:|---:|---:|---:|---:|---|
| Rampant | 35 | 5 | 0,8 | 3 | 1,2 s | 0,55 | Cible accessible la plus proche. |
| Sprinteur | 18 | 3 | 1,8 | 3 | 0,7 s | 0,38 | Masse mobile et fragile. |
| Colosse | 150 | 16 | 0,42 | 3,5 | 1,8 s | 1 | Menace lente au quatrième acte. |
| Gueule traînante | 65 | 9 | 1,2 | 3,5 | 0,9 s | 0,85 | Chasse prioritairement les soldats à pied. |
| Crache-bile | 48 | 7 | 0,6 | 5 | 1,8 s | 0,8 | Siège : priorise une maison vivante. |
| Porte-cadavres | 180 | 13 | 0,45 | 4 | 1,5 s | 1,1 | Siège; armure **40 %**. |
| Cathédrale de chair | **420** | **14** | 0,32 | 6 | **3 s** | 1,85 | Élite de siège; dégâts de zone à **40 %** dans un rayon de **1,6**. |
| Veuve du seuil | **260** | **10** | 1,45 | 4,5 | **1,1 s** | 1,5 | Élite chasseuse des soldats à pied. |

**Correction de comportement requise avant d'équilibrer les HP des maisons :** un monstre de siège doit choisir une maison vivante à portée avant le train, sauf s'il est directement intercepté. Actuellement, la recherche d'une cible « à portée » passe avant sa préférence de siège; les simulations frappent donc surtout le train et presque aucune maison. Les nombres du tableau ne suffiront pas à eux seuls à rendre les maisons vulnérables.

## Bonus : garder les dix effets et leurs facteurs

Le tirage reste trois cartes après l'élimination complète d'une vague. Les multiplicateurs sont cumulatifs et remis à zéro au Start. Pour ce PMV, je conserverais le catalogue actuel et je jugerais d'abord l'effet des vagues et de la production.

| Effet | Facteur par choix |
|---|---:|
| Dégâts soldats | ×1,5 |
| Cadence soldats | ×1,5 |
| Portée soldats | ×1,25 |
| Vie soldats | ×1,5 |
| Production maisons | ×1,5 |
| Vie maisons | ×2 |
| Régénération maisons | ×2 |
| Dégâts locomotive | ×2 |
| Vie convoi | ×1,5 |
| Dégâts de collision | ×2 |

Les bonus défensifs ne doivent pas être requis dans un ordre précis. Un mauvais tirage peut compliquer la dernière minute; il ne doit pas condamner une partie déjà bien jouée.

## Trois passages narratifs légers

Réutiliser Monsieur, La Locataire et les portraits existants. Une seule voix à la fois. Deux ou trois lignes brèves apparaissent sur le bord du jeu; la scène continue. Un choix ralentit à ×0,15, puis la vitesse normale revient. Les apparitions se déclenchent par rayon, une fois chacune, même si une vague n'est pas éliminée. Elles ne se substituent jamais à un bonus déjà ouvert.

### 0:55 environ · Le trait (rayon 2,08)

> **La Locataire :** « Vous avez tracé un cercle, puis écrit *chez nous* à l'intérieur. »
> **Monsieur :** « Nous voulions un endroit où rentrer. »
> **La Locataire :** « Nous aussi. »

Choix : « Montrez-moi ce que le trait a coupé » (`écouté = vrai`) ou « Les murs prouvent que nous sommes chez nous » (`tension +1`). Aucun effet de combat.

### 2:55 environ · Le passage (rayon 4,00)

> **La Locataire :** « Vos maisons ont des murs. Les nôtres avaient des passages. »
> **Monsieur :** « Si j'ouvre un passage, qui protège ceux qui sont derrière moi ? »
> **La Locataire :** « Une porte peut protéger sans être fermée des deux côtés. »

Choix : « Gardons un passage entre nous » (`passage = vrai`) ou « Attendons la fin pour décider ». Le choix est une promesse narrative; le PMV ne crée pas une nouvelle économie de maisons pour la représenter.

### 4:35 environ · La clé (rayon 5,60)

> **La Locataire :** « Quand le cercle touchera les deux maisons, qui devra partir ? »
> **Monsieur :** « Je ne veux plus que le mot *nous* ait besoin d'un dehors. »

Choix final : « La porte s'ouvrira dans les deux sens » (`invitation = vrai`) ou « Je garderai la clé ». La première réponse reste visible, mais La Locataire ne l'accepte que si les deux précédentes promesses ont été faites. Une réplique courte explique l'acceptation ou le refus; le joueur comprend la conséquence avant le bilan.

## Issues de la partie

| Issue | Condition PMV | Image et sens |
|---|---|---|
| **Départ** | Rayon 6 atteint; les conditions d'harmonie ou de force ne sont pas réunies. | Le train part avec ce qu'il peut porter. Derrière lui, une fenêtre s'allume. Le mot *maison* change d'habitant sans changer d'adresse. |
| **Harmonie** | Rayon 6, locomotive vivante, au moins une maison vivante, `écouté`, `passage` et `invitation`. | Le vortex cesse d'avancer; une chaise est placée de chaque côté du seuil. Monsieur demande : « Et si la maison n'avait jamais été à nous ? » La Locataire répond : « Elle n'était pas à nous non plus. Elle peut peut-être nous garder tous. » |
| **Force** | Dernière vague entièrement éliminée avant le rayon 6, locomotive vivante, et pas d'accord accepté. | Le cercle se tait. Il ne reste personne pour contester le titre. La maison n'a jamais paru si vide. Rare, mais atteignable avec de bonnes synergies. |
| **Convoi perdu** | Locomotive détruite avant le rayon 6. | Fin immédiate. Les maisons gardent leurs lumières allumées pour un train qui ne revient pas. |

Priorité à l'harmonie si ses conditions sont remplies. Une défaite du convoi termine immédiatement la partie. Le bilan conserve les métriques actuelles et ajoute l'issue, les trois choix narratifs, les maisons sauvées et la liste des vagues éliminées. La force peut être déterminée au rayon 6 dans le PMV pour ne pas couper le troisième dialogue si le joueur nettoie la dernière vague très vite.

## Cibles d'équilibrage et vérification

- Vague 1 éliminée en général avant 1:10; vagues 2 à 4 donnent chacune une chance raisonnable de bonus avant la suivante.
- À 3:00, au moins une maison a reçu des dégâts dans une partie ordinaire; à 4:00, une maison peut être perdue sans condamner la partie. Le village doit compter dans les décisions.
- À 4:00, le train a pris des dégâts visibles. Un joueur qui conduit et choisit ses bonus peut encore agir sur l'issue.
- Des essais à vitesse lente, moyenne et rapide montrent des avantages distincts. L'accélération doit servir au moins une fois dans une partie témoin; le 60 permanent ne doit pas dominer.
- L'harmonie est découvrable sans guide si le joueur écoute les répliques; elle ne dépend ni d'un score caché de victimes, ni d'une série parfaite de combats.

**Sonde avant correction du siège :** 16 parties sur 20 gardaient le train vivant à 5:00 et aucune maison n'était perdue. Cette mesure historique montrait que les maisons étaient trop peu ciblées.

**Sonde de la version jouable :** sur 20 parties simulées à vitesse 3 avec des bonus choisis au hasard, 20 trains survivent, toutes les parties ont subi des dégâts aux maisons avant 3:00, trois perdent au moins une maison avant 4:00 et deux éliminent la dernière vague. Sans bonus, à vitesse 1, trois trains sur 20 sont détruits; à vitesse 3, les trains survivent mais le village subit davantage de dégâts. Ce sont des sondes reproductibles du moteur, pas des tests de plaisir ni de lisibilité; les prochaines décisions d'équilibrage demandent des parties jouées.

## Ordre de réalisation proposé

1. Livrer la bibliothèque des cinq vagues et les stats de départ, sans écraser les réglages locaux du gym.
2. Corriger la priorité des ennemis de siège et tester les cinq minutes complètes; ajuster surtout maisons, production et élites.
3. Ajouter les trois passages narratifs et les drapeaux de dialogue, puis les quatre textes de fin.
4. Rendre lisible le jeu pendant les vagues : menace sur une maison, HP du convoi, bonus disponible et compte à rebours. Conserver l'atelier dans les onglets.
5. Écrire un bilan de parties courtes avec des critères observables, corriger les stats, puis seulement figer un défaut PMV.
