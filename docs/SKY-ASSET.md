# Ciel du Gym 013

Asset : `dist/assets/round-circle-sky.png`. Généré avec l’outil intégré **imagegen**, puis copié dans le dépôt. Image originale conservée ; aucune retouche externe.

Prompt final :

> Use case: stylized-concept. Create a wide landscape background image for a surreal retro low-poly browser game called Round Circle. Image only, no text. A dreamy ominous midnight sky of broad layered sculptural violet and dusty mauve clouds, muted blue-indigo depths, pale pink diffuse light along some cloud edges, sparse faint stars. Painterly graphic shapes, subtle film grain, slightly uncanny theatrical stop-motion atmosphere, compatible with pastel pink buildings and a dark circular floating city. Composition: wide 16:9, cloud interest concentrated toward the outer edges, subdued dark negative space in the central half where the game's circular city will sit. Sky fills entire image, no ground, no horizon line, no buildings, no people, no planets, no vortex, no UI. Restrained brightness and saturation so foreground enemies remain readable. Deliver a beautiful finished background illustration.

Le ciel est un fond illustré en écran, pas un panorama à 360°. Il reste derrière la scène lors des mouvements de caméra. Une conversion sRGB vers linéaire évite de le surexposer dans le rendu Babylon. L’opacité permet de mélanger l’image avec la couleur de fond extérieur. Désactiver le ciel retrouve cette couleur seule.
