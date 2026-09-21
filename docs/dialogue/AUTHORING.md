# Monter un dialogue

## Ouvrir l’atelier

Depuis le dossier du kit : `python3 -m http.server 8000`, puis ouvrir `http://localhost:8000`. Il faut un serveur local pour charger les JSON et les modules. Ne pas double-cliquer `index.html` en mode fichier.

Le bouton Lancer la rencontre démarre le dialogue. Le panneau « Composer / importer » fournit un éditeur JSON, validation, export/import et test d’un nœud précis. Tester un nœud seul ne rejoue pas ses antécédents; les drapeaux existants sont conservés. Nouvelle partie efface ces drapeaux.

## Structure

La bibliothèque possède `version:1`, `characters`, `backplates`, `dialogues`. Chaque dialogue contient un ID stable, un titre, un nœud de départ et un dictionnaire de nœuds. Les chemins d’images commencent par `assets/` relativement à la racine du kit; lors d’intégration, `assetBase` fournit le préfixe.

| Champ de nœud | Usage |
|---|---|
| `type` | `line`, `choice` ou `end` |
| `speaker` | ID du personnage affiché |
| `pose` | Clé d’expression définie dans `characters` |
| `backplate` | Clé d’habillage dans `backplates` |
| `text` | Réplique ou invitation à choisir |
| `next` | Nœud suivant pour une réplique |
| `choices` | 1 à 3 réponses pour un nœud de choix |
| `effects` | Changements appliqués une fois à la sortie |

## Exemple de réplique

```json
{
  "type": "line",
  "speaker": "locataire",
  "pose": "hostile",
  "backplate": "default",
  "text": "Vous avez fait signer la porte.",
  "next": "reponse"
}
```

## Exemple de choix

```json
{
  "type": "choice",
  "speaker": "monsieur",
  "pose": "worried",
  "backplate": "default",
  "text": "Que lui répondez-vous ?",
  "choices": [
    {
      "id": "ecouter",
      "text": "Expliquez-moi.",
      "next": "elle_explique",
      "effects": [{"type": "add", "key": "trust", "value": 1}]
    },
    {
      "id": "partir",
      "text": "Nous reviendrons.",
      "next": "fin"
    }
  ]
}
```

Créer aussi `elle_explique` et `fin`, sinon la validation refuse l’import. Un `end` affiche sa dernière phrase; Terminer applique ses effets puis ferme la conversation. Pour changer d’expression sans changer de locuteur, ajouter une nouvelle réplique avec le même `speaker` et une autre `pose`.

## Conditions et effets

Une réponse peut porter `when: {"key":"listened","op":"eq","value":true}` ou `when: {"key":"trust","op":"gte","value":2}`. Une réponse inéligible est masquée. Garder toujours au moins une réponse sans condition; le validateur l’exige pour éviter une impasse.

- `set` : attribuer un booléen, nombre ou texte à un drapeau.
- `add` : ajouter un nombre à un drapeau numérique (départ 0).
- `emit` : notifier le jeu via un nom et un payload, par exemple `dialogue_outcome`.

Les effets d’un choix se produisent avant la réaction suivante. Les effets d’un nœud se produisent lorsque le joueur le quitte. Les effets ne sont pas des commandes arbitraires : les conséquences de gameplay doivent être écrites dans l’adaptateur par le programmeur.

## Ajouter un personnage

Ajouter son ID, son nom, son rôle (`player` ou `npc`) et ses poses dans `characters`. La pose `neutral` est obligatoire. Chaque nœud nomme explicitement une pose valide. Préparer toutes les poses dans le même canevas et orientation. Les deux personnages du kit regardent vers la zone de texte à droite.

## Méthode de travail

1. Écrire l’intention de la rencontre et ce que chaque camp veut.
2. Créer une première réplique, un choix, une réaction et une fin.
3. Vérifier le parcours sans effet de gameplay.
4. Ajouter les autres réponses et leurs émotions.
5. Ajouter quelques drapeaux; tester toutes les branches.
6. Valider, exporter et versionner le JSON avec les assets.

Le lecteur prend un instantané de la bibliothèque. Dans la démo, « Valider et utiliser » remplace le moteur et réinitialise ses drapeaux. Le simple export ne modifie pas la conversation en cours. Pour des sauvegardes de campagne, définir plus tard un schéma versionné; le kit ne persiste pas automatiquement la progression.
