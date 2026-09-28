# Équilibrage 040 — atteindre cinq minutes

## Résultat

- Objectif équipe maîtrisée : 75 %. Mesuré : 77.7 % (233/300); intervalle de Wilson 95 % : 72.6–82.0 %.
- Objectif débutant rapide : 15 %. Mesuré : 17.3 % (52/300); intervalle 95 % : 13.5–22.0 %.

- Équipe maîtrisée : 233/300 survies (77.7 %).
- Débutant rapide : 52/300 survies (17.3 %).
- Guardians uniquement : 0/100 survies (0.0 %).
- Watchers uniquement : 9/100 survies (9.0 %).
- Gunners uniquement : 9/100 survies (9.0 %).
- Scouts uniquement : 0/100 survies (0.0 %).
- Rotation simple des 4 profils : 38/100 survies (38.0 %).
- Recrutement occasionnel : 0/100 survies (0.0 %).

Atteindre la limite du vortex avec le train vivant est une réussite de survie, indépendamment des dialogues. Vaincre la dernière vague améliore ce résultat; l'harmonie reste la meilleure résolution narrative.

## Règles modifiées

- Guardian : protection de 40 % contre les tirs ennemis pour les alliés dans un rayon de 3. Pas de cumul, pas de protection de soi-même.
- Watcher : portée 6, zone morte 3, dégâts 32. Ignore l'armure, mais inflige la moitié de ses dégâts sans marque. Les cibles plus rapides que 1,3 nécessitent une marque de Scout.
- Gunner : petits tirs rapides contre les ennemis légers. L'armure absorbe une partie du calibre de base avant les bonus, puis applique sa réduction proportionnelle.
- Scout : marque pendant 3 s. Les autres profils et le train infligent 35 % de dégâts supplémentaires à la cible et les Watchers peuvent la viser même si elle est rapide.
- Budget d'armée : 28 places, formations incluses. Guardian 10 s, Watcher 20 s, Gunner 12 s, Scout 8 s.
- Bonus offensifs moins exponentiels : portée ×1,1, dégâts et cadence soldats ×1,2. Production ×2, maisons ×2, régénération ×4, canon/collisions +200 % de leur base. Santé du convoi +50 % de base : ces trois bonus s’additionnent entre répétitions, sans multiplication exponentielle.
- Ennemis du preset et des vagues renforcés; les dix seuils et les cinq minutes restent identiques.

## Protocole

2940 exécutions pour cette validation finale : 1680 de recherche, 1200 de validation, 60 de sensibilité temporelle. Les explorations antérieures sont conservées séparément dans tuning-*.json; elles ne sont pas mélangées aux probabilités publiées.

La recherche compare compositions fixes, équipes ajustées aux survivants, et priorités de bonus portée / dégâts / défense / convoi. La meilleure politique retenue est {"id":"expert","ratios":[1,3,2,1],"bonusStyle":"convoy"}. Chaque mono-profil est également évalué avec sa meilleure priorité de bonus trouvée en recherche, pas avec un choix volontairement mauvais.

Le débutant rapide recrute dans toutes les maisons disponibles toutes les 0,4 secondes de simulation, choisit uniformément les quatre profils et les trois bonus proposés. Le bot maîtrisé recrute à la même fréquence, mais choisit sa composition et ses bonus. Le bot occasionnel agit sur une seule maison toutes les 8 s après 10 s d'attente.

Recherche : graines 54000–54039. Validation : nouvelles graines 980000–980299 (100 ou 300 par politique). Tous utilisent le même moteur, les mêmes statistiques et les offres réelles. Aucun bonus caché, aucune unité gratuite, aucune modification de l'ennemi selon le bot. La sélection d'une politique utilise uniquement les graines de recherche.

Pas externe : 0.1 s, sous-pas de combat ≤0,02 s. Contrôle à 0,05 s : 15/60 issues différentes. Les résultats sont des estimations conditionnelles aux bots, aux graines et au pas de simulation, pas une promesse pour chaque humain. « Meilleure testée » ne prouve pas un optimum global. 0/100 n'établit pas une impossibilité absolue.

Les dialogues n'affectent pas les combats. Le comparateur narratif reclasse les mêmes runs avec trois réponses ouvertes ou fermées; ces variantes ne sont pas des simulations supplémentaires. Les statistiques utilisent l'état avant la cinématique. Les pauses de récompenses peuvent ajouter environ une seconde de temps moteur au parcours de cinq minutes du vortex.

Reproduire : node scripts/verify-balance.cjs puis node scripts/render-balance.cjs. Le profil exact utilisé est inclus dans results.json; les parties de validation sont dans runs.csv.
