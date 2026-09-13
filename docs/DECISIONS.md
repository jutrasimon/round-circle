# Décisions · Référence du gym

## Confirmé par Simon

| Décision | État |
|---|---|
| Cassette interdite au démarrage | Implémenté |
| Vitesse très largement modulable dans l’interface normale | Implémenté : 1 à 60 unités/s |
| Dégâts de collision liés à la vitesse | Implémenté |
| Locomotive et wagons subissent une très petite usure lors de leurs collisions | Implémenté, coefficient exposé |
| Bâtiments avec HP, régénération et production de soldats | Implémenté |
| Bâtiment détruit = perdu pour la partie | Implémenté jusqu’au reset |
| Soldat sort de sa maison et embarque seulement lors d’un croisement | Implémenté |
| Designer de vagues et playlist sauvegardables | Implémenté |
| Profil pondéré pour les prochains soldats | Implémenté |
| Conserver les paramètres exposés et les outils du gym | Implémenté |
| Aucune progression officielle pour le moment | Respecté : idées dans VISION.md |

## Choix provisoires de prototype

Ces valeurs ne sont pas un équilibrage approuvé.

- 12 bâtiments au début par défaut. Le gym permet 0 à 12 au prochain reset.
- 3 wagons au début, 4 places chacun. Jusqu’à 16 wagons, 12 places par wagon.
- Locomotive : 200 HP, tir de 12 dégâts toutes les 1,1 s, portée 6.
- Collision : `vitesse × 6` dégâts bruts à l’ennemi.
- Usure du véhicule qui frappe : `vitesse × 0,04` HP.
- L’armure du Porte-cadavres réduit les tirs et impacts reçus de 40 %.
- Un véhicule peut frapper de nouveau après une séparation. Chaque wagon constitue un véhicule distinct.
- Les soldats à bord sont protégés par le wagon; les monstres ne les ciblent pas directement.
- Un wagon retiré ou détruit débarque ses survivants en conservant leurs HP.
- Les bâtiments vivants récupèrent 1 HP/s et produisent 3 soldats/minute par défaut.
- Le budget de répartition initial est 100; il reste réglable à la main.
- La locomotive détruite s’arrête. Le bouton de réparation du gym peut la relancer. Ce n’est pas une fin de campagne.

## À ne pas changer implicitement

- Les changements de profil de production ne recalculent pas les soldats existants.
- Les sliders libres de Simulation servent aux spawns manuels; ils ne contournent le budget de production que si ce mode est choisi.
- Les changements d’ambiance ne réinitialisent pas la caméra ni le combat.
- Le rayon du vortex n’inflige pas encore de dégâts ou de défaite.
- « Tout réparer » ne ressuscite pas les bâtiments détruits ni les monstres morts.
- Les modifications de bibliothèque ne modifient pas une playlist déjà lancée : elle utilise un instantané.
