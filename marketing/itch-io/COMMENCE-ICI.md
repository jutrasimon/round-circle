# Publier Round Circle sur itch.io

Kit préparé pour la version **039**, le 28 septembre 2026. Textes publics en anglais, instructions en français.

## Les fichiers utiles

- **`../../releases/round-circle-v039-itch.zip`** : le jeu à téléverser dans itch.io. Ne pas le décompresser pour l'envoi.
- **`PAGE-EN.md`** : accroche et description à copier.
- **`assets/`** : couverture et captures pour la page.
- **`PROMO-EN-FR.md`** : annonces, fiche presse et idée de bande-annonce.
- **`CREDITS-FR.md`** : les quelques informations de provenance à compléter.
- **`../../releases/round-circle-v039-marketing-kit.zip`** : tout le kit, y compris l'archive du jeu. **Ne pas envoyer ce gros kit comme jeu HTML5.**

Tu peux préparer toute la page en brouillon avant de la rendre publique. Aucun besoin de toucher au code, à Git ou à un terminal pour ce premier envoi.

## 1. Créer ton espace

Va sur [itch.io](https://itch.io/), crée ton compte et choisis ton nom public. Ton profil aura une adresse du genre `tonnom.itch.io`. Confirme ton courriel si demandé. Depuis ton Dashboard, crée un nouveau projet avec **Create new project / Create new game**.

## 2. Remplir la fiche

Mes recommandations pour cette version :

| Champ | Valeur |
| --- | --- |
| Title | Round Circle |
| Project URL | round-circle, si disponible |
| Short description | La phrase sous « Short description » dans PAGE-EN.md |
| Classification | Games |
| Kind of project | HTML / HTML Game |
| Release status | In development |
| Pricing | Gratuit, sans paiement pour ce premier lancement |
| Genre | Strategy |
| Language | English |
| Tags | Short, Singleplayer, Surreal, Atmospheric, Experimental, 3D, Trains — choisir les équivalents proposés |

Évite de promettre une version native Windows/Mac : c'est un jeu navigateur. Ne coche pas Mobile Friendly avant un essai sur un vrai téléphone. Laisse la visibilité en **Draft** pendant la préparation.

La description se trouve dans `PAGE-EN.md`. Copie uniquement la partie publique, puis les crédits complétés. Le champ de description est un éditeur riche : utilise ses boutons de titres et de listes si les symboles Markdown ne sont pas convertis. Ne colle pas les instructions françaises.

Le [guide de création officiel](https://itch.io/docs/creators/getting-started) explique les champs, les métadonnées et la visibilité.

## 3. Envoyer le jeu

Dans **Uploads**, choisis `round-circle-v039-itch.zip`. Après traitement, coche **This file will be played in the browser** si cette case est proposée. Choisis **Click to launch in fullscreen** dans Embed options. Garde le démarrage sur clic. Pas besoin de SharedArrayBuffer pour ce jeu.

L'archive contient `index.html` à sa racine, le moteur et les ressources. Ne crée pas une archive contenant le dossier `dist` entier comme niveau supplémentaire. Les noms de fichiers et leur casse doivent rester identiques.

Référence : [publication HTML5 officielle](https://itch.io/docs/creators/html5). Le ZIP est contrôlé par le script du kit contre les limites de cette documentation.

## 4. Donner une identité à la page

Téléverse `assets/cover.png` comme **Cover image**. Cette illustration promotionnelle accompagne les captures réelles; ce n'est pas une capture du jeu.

Ajoute les captures du dossier `assets` dans cet ordre : gameplay, recrutement, dialogue, accueil. Les noms numérotés permettent de les retrouver. Utilise leurs légendes dans `ASSETS.md` et leur texte alternatif si le champ est disponible.

Après **Save & view page**, ouvre **Edit theme**. Direction proposée :

| Réglage visuel | Couleur |
| --- | --- |
| Fond de page | `#171520` |
| Surface / contenu | `#241F2E` |
| Texte | `#F5ECDD` |
| Liens et boutons | `#DF91CF` |
| Accent facultatif | `#A8C9B5` |

Garde une colonne lisible, les captures visibles et les titres courts. La couverture suffit pour lancer : pas besoin de CSS personnalisé. [Personnalisation officielle](https://itch.io/docs/creators/design).

## 5. Compléter les crédits et les informations

Ouvre `CREDITS-FR.md` et complète le nom public, les auteurs de la musique, des sons et des portraits. Dans les métadonnées relatives à l'IA, indique honnêtement l'utilisation de génération pour le ciel et la couverture; le développement a aussi été assisté par Codex. Les portraits sont à vérifier avant d'indiquer leur provenance.

Active les commentaires si tu veux recueillir des retours. Ajoute le lien du dépôt seulement si tu veux le mettre en avant : https://github.com/jutrasimon/round-circle. Pas besoin de configurer des paiements pour publier gratuitement.

## 6. Faire ton essai privé

Clique **Save & view page**, puis lance le jeu depuis cette page itch.io. Ce test est nécessaire : l'archive a été vérifiée localement, mais n'a pas encore été essayée dans l'hébergement itch.io.

- L'accueil apparaît et attend Start; Settings s'ouvre.
- Le son commence après interaction, avec musique à 10 % et effets à 10 % sur un navigateur sans préférences existantes.
- Une maison propose les quatre soldats; une production se termine.
- Le jeu passe la vague 4, puis les vagues suivantes.
- Les dialogues sont lisibles, les personnages font face au centre, et les choix fonctionnent.
- Les bonus ne cachent pas le chrono; changer la vitesse affecte la simulation.
- Une partie atteint sa fin et affiche les graphiques.
- Le plein écran et le retour à la page fonctionnent.

Teste aussi une fenêtre privée et un deuxième navigateur. Les préférences de la version GitHub ne sont pas transférées automatiquement vers itch.io, car le site d'origine change.

## 7. Publier

Quand l'essai est bon et les crédits remplis, retourne à Edit game, passe la visibilité à **Public**, puis sauvegarde. Ouvre l'URL finale dans une fenêtre privée pour vérifier qu'un visiteur peut jouer. Remplace `[ITCH LINK]` dans les textes promo par cette adresse.

Publication et apparition dans la recherche ne sont pas la même chose. Les [règles de qualité itch.io](https://itch.io/docs/creators/quality-guidelines) précisent les attentes pour les fiches et leur référencement. Ne mise pas sur une apparition immédiate dans les listes : partage le lien direct.

## 8. Annoncer sans te compliquer la vie

Publie le petit devlog fourni, puis un message avec la couverture et le lien. Demande un retour précis : « At what wave did the pressure feel right? » Réponds aux premiers commentaires. Note les bugs reproductibles avant de changer l'équilibrage.

Pour une vidéo : suis le découpage dans PROMO-EN-FR.md. Elle est facultative; aucun trailer n'est inclus dans ce kit.

## Mettre à jour plus tard

Conserve la même page. Prépare un nouveau ZIP, envoie-le, désigne-le comme fichier jouable, teste la prévisualisation puis retire l'ancien fichier de la liste publique. Publie un court devlog expliquant les changements. Garde l'ancienne archive sur ton ordinateur pour pouvoir revenir en arrière.

Pour reconstruire les archives depuis le dépôt : `python scripts/package-itch.py`. Le script utilise le contenu actuel de `dist`; il exige que `babylon.js` soit déjà présent. Si nécessaire, lancer d'abord `node scripts/prepare-engine.mjs`.

## Dépannage rapide

| Symptôme | Action |
| --- | --- |
| itch ne trouve pas le jeu | Vérifier que tu as envoyé le ZIP du jeu, et que `index.html` est à sa racine |
| Écran vide / fichier introuvable | Vérifier les chemins relatifs et la casse; réenvoyer l'archive complète |
| Interface coupée | Utiliser Click to launch in fullscreen |
| Aucun son | Cliquer Start, vérifier les interrupteurs audio et le son du navigateur |
| Mauvaise version visible | Recharger la page et vérifier quel upload est marqué jouable |
| Ami incapable d'accéder à la page | Vérifier la visibilité Public et lui transmettre l'URL du projet, pas celle de l'éditeur |
