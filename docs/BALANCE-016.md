# Gym016 — premier ajustement de puissance

Les collisions gardent leurs dégâts de base : vitesse × 6, avant bonus et armure.
L’usure par contact devient max(5, vitesse) × 0,4 HP : 2 HP à la vitesse de base
de 1,4, 12 HP à 30 et 24 HP à 60. Locomotive et wagons suivent la même règle.
Un contact prolongé ne répète pas les dégâts. Le coefficient reste réglable ;
zéro désactive l’usure. Les anciennes sauvegardes utilisant 0,04 par défaut
passent à 0,4, les autres valeurs personnalisées sont conservées.

Les gains des bonus sont réduits de moitié : ×2 → ×1,5, ×3 → ×2 et ×1,5 → ×1,25.
Le cumul multiplicatif reste inchangé. Un ancien catalogue local reçoit cette
réduction une seule fois, puis les nouveaux réglages sont sauvegardés séparément.
Recharger le jeu commence une nouvelle partie avec cet équilibrage.
