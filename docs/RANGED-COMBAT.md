# Gym014 — attaques à distance

Tous les monstres tirent à distance avec les projectiles hostiles existants.
Ils s'arrêtent une fois leur cible à portée et la poursuivent si elle s'éloigne.

| Monstre | Portée |
| --- | --- |
| Rampant, Sprinteur | 3 |
| Colosse, Gueule traînante | 3,5 |
| Porte-cadavres | 4 |
| Veuve du seuil | 4,5 |
| Crache-bile | 5 |
| Cathédrale de chair | 6 |

La portée reste modifiable dans la simulation et par groupe de vague.
Les anciens réglages et bibliothèques migrent les valeurs correspondant aux
anciennes portées par défaut ; les autres valeurs personnalisées sont conservées.
Les exports marqués `combatVersion: 2` conservent toutes leurs valeurs exactes.

Validation : tests de tir à distance pour les huit types, conservation des
réglages personnalisés et migration des anciennes bibliothèques et stats.
