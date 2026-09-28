# Round Circle 039 — simulations d'équilibrage

1160 exécutions : 240 pour comparer 12 stratégies, 900 pour les évaluer sur 100 nouvelles graines chacune, puis 20 contrôles avec un pas de temps plus fin.

## Résultats observés — dialogues aléatoires

| Stratégie | Train vivant à la limite | Train détruit | Engloutissement, dernière vague non terminée | Engloutissement après dernière vague | Harmonie |
| --- | --- | --- | --- | --- | --- |
| Aucun recrutement | 0 % | 100 % | 0 % | 0 % | 0 % |
| Occasionnel · 1 maison / 8 s | 31 % | 69 % | 2 % | 25 % | 4 % |
| Recrues + bonus aléatoires | 90 % | 10 % | 8 % | 67 % | 15 % |
| Rotation des 4 profils | 100 % | 0 % | 0 % | 85 % | 15 % |
| Guardians uniquement | 0 % | 100 % | 0 % | 0 % | 0 % |
| Watchers uniquement | 100 % | 0 % | 0 % | 85 % | 15 % |
| Gunners uniquement | 97 % | 3 % | 2 % | 80 % | 15 % |
| Scouts uniquement | 77 % | 23 % | 11 % | 57 % | 9 % |
| Meilleure stratégie testée | 100 % | 0 % | 0 % | 85 % | 15 % |

## Ce que ça dit du jeu

- La fréquence de recrutement change beaucoup le résultat : 31 % de survie pour le bot occasionnel, 90 % pour le bot qui recrute dès que possible avec des choix aléatoires.
- Les Watchers dominent la recherche, à égalité sur la survie mais devant sur les maisons et les HP conservés. Ce n'est pas un optimum mathématique : seulement le meilleur des 12 comportements évalués.
- Les Guardians seuls échouent dans les 100 parties testées. Leur faible portée et leur lenteur sont des pistes à examiner, pas une preuve que leur présence dans une équipe mixte est inutile.
- Survivre au combat n'est pas sauver la ville. Sans les choix narratifs nécessaires, le vortex engloutit la ville même lorsque les dix vagues sont vaincues.
- Choisir au hasard parmi deux réponses dans chacun des trois dialogues donne une probabilité théorique de 1/8 pour les trois bons drapeaux, avant de tenir compte du train et des maisons. Les 9–15 % observés selon les bons bots ne sont pas une nouvelle règle du jeu.
- Avec les trois choix d'ouverture et au moins une maison restante, les survivants peuvent obtenir l'harmonie. Le graphique HTML permet de comparer ces choix sur les mêmes combats.

## Méthode et limites

Le script utilise directement Simulation, WaveRunner, Rewards et resolveOutcome du jeu, avec les statistiques de partie-temoin.json. Aucune unité gratuite, aucun HP augmenté. Graines de recherche 1000–1019; graines d'évaluation 90000–90099. Recrutement rapide vérifié toutes les 0,4 secondes de simulation; le bot occasionnel attend 10 secondes puis visite au plus une maison toutes les 8 secondes. Les bots mono-profils et mixtes classent les bonus proposés par portée, dégâts, cadence, HP du convoi, HP soldats, production, HP maisons, dégâts train, régénération, collision. Les bots aléatoires choisissent parmi les trois offres réelles.

Les dialogues sont traités au seuil du vortex. Les réponses n'ont pas d'effet sur le combat dans cette version; les variantes « toujours ouverts » et « toujours fermés » sont des reclassifications, pas des parties supplémentaires. La meilleure stratégie retenue est Watcher : sa ligne de validation répète volontairement le témoin Watcher sur les mêmes graines, elle ne constitue pas 100 observations indépendantes supplémentaires.

Pas externe de 0,2 s, sous-pas de combat de 0,02 s. 2/20 issues changent avec un pas externe de 0,1 s : les chiffres restent des estimations de bots, pas des probabilités universelles pour les joueurs. Les offres de bonus interrompent la croissance au tick de leur résolution, comme dans le moteur; les runs survivants totalisent environ 302 secondes de simulation, plutôt qu'exactement 300. Le script s'arrête à la limite réelle du vortex, pas à un minuteur arbitraire.

Chaque barre de survie propose un intervalle de Wilson à 95 %. 100/100 ne prouve pas 100 % de réussite future (borne inférieure d'environ 96,3 %); 0/100 ne prouve pas l'impossibilité (borne supérieure d'environ 3,7 %). Les graines communes aident les comparaisons mais les trajectoires et tirages divergent selon les actions.

Les bots ne mesurent pas la lisibilité, les erreurs humaines, le temps de lecture, les ralentissements du navigateur ou le plaisir. Aucun équilibrage de combat n'a été modifié sur la seule base de ces chiffres.

## Recommandation pour le prochain équilibrage

1. Donner un rôle de protection utile au Guardian dans une équipe mixte, puis comparer « Watchers » contre « Watchers + Guardians ».
2. Réduire légèrement l'avantage de portée du Watcher ou ajouter une pression adaptée, sans rendre toutes les unités semblables.
3. Refaire le même benchmark après chaque changement; viser une montée de pression tardive plutôt qu'une punition de la découverte du recrutement.

Reproduire : node scripts/simulate-odds.cjs puis node scripts/render-odds.cjs.
Données détaillées : results.json et runs.csv dans ce dossier.
