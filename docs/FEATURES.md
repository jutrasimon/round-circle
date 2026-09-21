# Gym 012 : récompenses et rencontres

## Tester les bonus

Dans **Bonus**, cliquer sur **Tester un choix de 3 bonus**. Le jeu suspend le combat, les apparitions et la croissance du vortex. Choisir une carte avec la souris, au toucher ou avec Tab puis Entrée. Les descriptions sont toujours visibles ; le survol et le focus mettent la carte en évidence. Les artefacts restent en haut de la scène ; leur survol ou leur focus montre l’effet et son cumul.

Dans **Vagues**, lancer une vague manuelle, une playlist ou la croissance avec des seuils assignés. Chaque instance de vague offre une seule récompense lorsque toutes ses apparitions ont eu lieu et que tous ses monstres ont disparu. Une apparition différée par la limite de population compte toujours comme en attente. La dernière vague offre aussi son choix.

Le mode **Temps** des playlists autorise toujours les vagues à se chevaucher. Il ne récompense pas simplement l’expiration du délai : il faut éliminer la vague. Plusieurs vagues éliminées ensemble produisent plusieurs choix successifs. Arrêter un planning annule son suivi des récompenses ; les artefacts déjà choisis restent jusqu’au prochain reset.

Les dix bonus initiaux renforcent dégâts, cadence, portée et vie des soldats ; production, vie et régénération des maisons ; tirs, vie et collisions du convoi. Les multiplicateurs s’appliquent aux unités présentes et futures, sans transformer les valeurs de base sauvegardées. Les bonus de vie conservent le pourcentage de vie et ne ressuscitent pas les ruines. ×2 puis ×2 donne ×4. Aucune progression permanente entre parties.

Le catalogue est sauvegardé dans ce navigateur sous `round-circle-bonuses-v1`. Régler un multiplicateur (1,5 à 10) ou ouvrir **Catalogue de bonus** pour ajouter des définitions. Les tirages en cours et les artefacts acquis conservent leur instantané. Chaque bonus doit avoir un ID unique, un nom, une icône, une description, un effet reconnu et un facteur. Exporter le JSON pour le transférer ou le versionner.

Limites du laboratoire : multiplicateur cumulé maximal ×1 000 000, une attaque par pas de simulation, production plafonnée par le pas de simulation et la population autorisée. Un multiplicateur ne transforme pas une valeur de base nulle en valeur positive. L’inspecteur garde les valeurs d’attaque de base ; les HP et les résumés d’artefacts reflètent les bonus.

## Tester les dialogues

Dans **Dialogue**, **Lancer la rencontre** ouvre « Le seuil de propriété ». Monsieur représente les réponses du joueur ; La Locataire a ses propres répliques et réactions. Un seul portrait apparaît à la fois. Continuer révèle d’abord le texte s’il est encore animé, puis passe à la suite ; Échap révèle le texte et Tab parcourt les actions. L’historique conserve les répliques et les choix de la partie.

**Pendant un dialogue** propose Normal, Ralenti ×0,15 et Pause. La pause manuelle conserve sa priorité et fermer le dialogue ne la désactive pas. Les récompenses ont priorité visuelle sur une conversation : choisir le bonus permet de reprendre celle-ci.

Le déclenchement automatique par défaut est au rayon 2. Il observe le rayon de la simulation, même si le laboratoire le règle manuellement. On peut aussi choisir une fin de vague numérotée ou le mode manuel. Chaque déclencheur est utilisé une fois par partie ; **Réarmer les rencontres** réinitialise les dialogues sans toucher au combat. **Start**, reset et chargement des réglages annulent conversations, file, drapeaux et récompenses.

**Nœud de départ** et **Tester ce nœud** permettent de tester une réplique précise. **Bibliothèque de dialogues** offre validation, import et export JSON. Une bibliothèque n’est remplacée qu’après validation et chargement réussi des images. L’import reste en mémoire jusqu’au rechargement ; exporter les changements pour les conserver. Les chemins d’assets restent locaux sous `dist/dialogue/assets/`.

Les effets `set` et `add` changent les drapeaux narratifs. `emit` consigne le résultat dans l’atelier ; `invitation` et `stalemate` n’accordent aucun buff implicite. Les handlers rejettent une action sur un écran périmé. Pas d’API ou de modèle utilisé pour jouer.

Les documents originaux du ZIP sont conservés dans `docs/dialogue/` à titre de référence ; leurs chemins et étapes d’installation décrivent le kit indépendant. Ici, l’entrée intégrée est `dist/features.js`, chargée après l’événement `round-circle-ready`. La copie du jeu livrée dans le ZIP n’a pas remplacé le jeu du dépôt.

## Vérification

`node --test tests/*.test.cjs tests/*.test.mjs` teste la simulation, les récompenses et le lecteur narratif. GitHub Actions lance toutes ces suites avant chaque publication.
