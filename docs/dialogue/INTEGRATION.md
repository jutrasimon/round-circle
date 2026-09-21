# Intégration pour le programmeur

## État de livraison

Le lecteur, le JSON et l’interface sont implémentés et testables. Les six portraits sont des PNG RGBA détourés avec transparence réelle. L’habillage `assets/ui/backplate.svg` est également transparent. Les portraits ont été contrôlés sur fonds clair et sombre; la validation navigateur reste à effectuer.

## Intention à préserver

Le jeu Babylon reste le fond complet. On superpose un voile léger, une forme graphique indépendante, UN portrait de locuteur, puis une interface lisible. Aucun salon peint, aucun fond complet de remplacement, aucun texte incorporé dans les images.

Une réplique NPC affiche La Locataire. Une réponse à choisir affiche Monsieur. Une réaction affiche la nouvelle émotion de La Locataire. Le rôle et le nom sont explicites. Ne jamais laisser simultanément les deux interlocuteurs en grand : cela rendrait les choix ambigus.

## Ordre des couches

| Ordre | Élément | Responsabilité |
|---|---|---|
| 0 | Canvas Babylon + HUD existant | Jeu inchangé |
| 10 | Voile sombre | Lisibilité; capte les clics vers la scène |
| 20 | `backplate.svg` | Habillage graphique indépendant |
| 30 | PNG du personnage | Pose choisie par le nœud |
| 40 | Panneau HTML | Nom, rôle, texte, boutons, historique |

Créer le conteneur dans `#stage`, en `position:absolute; inset:0`. Garder les réglages du gym hors du conteneur pour pouvoir tester pendant le dialogue. Le kit utilise des classes préfixées `rct-` afin de limiter les conflits CSS. Le jeu doit définir la priorité entre annonce WAVE et dialogue; recommandation : dialogue au-dessus, annonce de vague continue derrière.

## Installation dans le dépôt actuel

1. Créer une branche `feature/dialogue-kit` depuis la dernière version du gym; conserver un checkpoint.
2. Copier `assets/`, `data/`, `src/dialogue-core.js`, `src/dialogue-view.js` et `src/dialogue.css` dans `dist/dialogue/`.
3. Charger la CSS. Ajouter un point d’entrée ES module après `app.js`. Attendre que le bootstrap asynchrone du gym expose `window.roundCircleLab`, ou mieux exposer un événement `round-circle-ready` juste après son affectation.
4. Précharger et valider `dialogue/data/dialogues.json`. Laisser le jeu fonctionner et afficher un message si un asset manque; ne pas rendre l’écran entier inutilisable.
5. Instancier un seul moteur et une seule vue; brancher d’abord un bouton manuel dans le gym.
6. Valider les trois branches de démonstration, la pause, le reset et les spawns.
7. Ajouter les déclencheurs de rayon; brancher les conséquences réelles seulement après validation de design.
8. Tester le rendu avec les PNG détourés avant fusion et publication.

```js
import {DialogueEngine} from './dialogue/src/dialogue-core.js';
import {DialogueView, preloadAssets} from './dialogue/src/dialogue-view.js';
const base = './dialogue/';
const data = await fetch(base + 'data/dialogues.json').then(r => r.json());
await preloadAssets(data, base);
const host = document.createElement('div');
document.querySelector('#stage').append(host);
const engine = new DialogueEngine(data, {
  onEffect(event) { narrativeBus.emit(event.name, event.payload, event.eventId); }
});
const view = new DialogueView(host, engine, {
  assetBase: base,
  onOpen() { dialogueTimeScale = selectedDialogueSpeed; },
  onClose() { dialogueTimeScale = 1; }
});
// Bouton manuel : annuler le test précédent puis lancer.
engine.cancel();
engine.start('first_contact');
```

`narrativeBus`, `dialogueTimeScale` et `selectedDialogueSpeed` sont des points d’intégration À CRÉER dans le jeu, pas des globals déjà existants. Le kit de démonstration montre un branchement fonctionnel sans imposer ces noms au projet.

## Temps, pause et Start

Le comportement par défaut demandé est de continuer le jeu. Exposer Normal = 1, Ralenti = 0,15 et Pause = 0 dans le gym, sans trancher définitivement l’équilibrage.

Dans la boucle existante, remplacer seulement l’argument du tick par `sim.tick(dt * dialogueTimeScale)` à l’intérieur du test de pause existant. Le texte HTML utilise son propre temps réel; il continue même si la simulation est arrêtée. `designer.update()` reste en place et se base sur le temps simulé. Ne pas recréer de moteur Babylon, de scène, de caméra ou une deuxième boucle de combat. Ne pas utiliser une autre boucle de croissance du vortex.

La pause manuelle du joueur garde priorité : fermer un dialogue ne doit pas dépauser un jeu qu’il avait mis en pause. Sur Start, reset et chargement d’une partie : `engine.reset()` puis reset normal du jeu. Le contrôleur de dialogue ne doit pas lancer automatiquement de nouvelles vagues ni réinitialiser le monde. Le bouton Nouvelle partie de la démo annule ses conversations et appelle le restart du gym embarqué.

## Déclencheurs

Premier lot : déclenchement manuel. Deuxième lot : seuils de rayon.

Exemple après réception d’un événement existant `wave-start` :

```js
if (event.radius >= 2 && !engine.triggered.has('first_contact_radius_2')) {
  engine.enqueue('first_contact', 'first_contact_radius_2');
}
```

Utiliser un ID stable par événement narratif, pas un ID recréé à chaque frame. `enqueue` refuse les doublons pendant la partie et met les conversations suivantes en file. Une seule conversation s’affiche à la fois. `reset()` réarme tous les déclencheurs. Une progression persistante entre parties n’est PAS implémentée.

## Résultats et sécurité des doubles clics

Les changements internes sont limités à `set` et `add` sur des drapeaux. `emit` transmet un résultat au jeu, sans modifier directement les entités. Les exemples émettent `dialogue_outcome` avec `invitation` ou `stalemate`. Ce sont des résultats de démo, pas des fins officielles ou des buffs approuvés.

Chaque écran possède une révision. Les handlers capturent cette révision; une action répétée sur l’ancien écran est rejetée. Les effets sont appliqués à la sortie du nœud (ou au choix validé), jamais au rendu. Le callback externe doit aussi dédupliquer par `eventId` s’il écrit dans un système durable. Pas d’`eval`, pas de JavaScript saisi dans le JSON, pas d’injection HTML pour les textes.

## Images et animations

Les six fichiers sont en 1024 × 1536. Garder ce canevas lors des futurs changements de pose. L’ancrage est le bas du canevas. Ne pas découper chaque PNG à sa bounding box : cela crée des sauts. Monsieur et La Locataire ont des marges basses différentes; le cadrage CSS livré sert de base et doit être vérifié aux résolutions cibles.

Le lecteur change la source du portrait et joue une entrée de 180 ms. C’est une transition simple, pas du rigging. Les fichiers source conservent une pose de corps proche; il peut rester de petites variations de contour entre expressions. Si nécessaire, ajouter des réglages par pose `offsetX`, `offsetY`, `scale` au manifeste avant production. Ne pas régénérer les personnages à chaque réplique.

Le fond graphique est un SVG à transparence réelle, modifiable et redimensionnable. Aucun asset bitmap n’est nécessaire pour les boutons et le panneau : leur HTML/CSS fournit les états normal, survol et focus, sans texte rasterisé.

## Validation avant fusion

- Les trois réponses initiales mènent à la bonne réaction; le choix conditionnel apparaît uniquement après écoute.
- Nom et portrait correspondent toujours au locuteur. Les choix montrent Monsieur.
- Double clic, Enter répété et retour de focus ne doublent pas les conséquences.
- Start ferme le dialogue, vide la file et réarme les déclencheurs.
- Pause manuelle conservée; ralentissement sans effet sur les stats ou la cadence réelle hors dialogue.
- Le jeu reste visible; les zones transparentes sont réellement transparentes, y compris entre les doigts.
- Affichage à 1280×720 et 390×844; texte agrandi; défilement du panneau sans débordement.
- Aucun 404; les poses sont préchargées; aucune requête de modèle ou API dans le jeu.

Tests livrés : `npm test` (Node, sans dépendance). Le fonctionnement logique est vérifié; une validation visuelle navigateur du rendu final détouré reste à effectuer.
