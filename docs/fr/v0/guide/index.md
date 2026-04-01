---
description: "Présentation de @duplojs/json-web-token"
next:
  text: "Démarrage rapide"
  link: "/fr/v0/guide/quickStart"
---

# Introduction

La librairie `@duplojs/json-web-token` propose une approche volontairement cadrée de la gestion de tokens. Là où beaucoup d'outils exposent surtout des fonctions utilitaires à assembler soi-même, elle fournit d'abord un `tokenHandler` prêt à l'emploi, conçu pour centraliser la création, la vérification et le décodage des tokens.

Cette approche permet de définir une seule fois la politique de gestion d'un token dans l'application : durée de vie, claims par défaut, règles de validation, forme autorisée du payload et du header, ainsi que la mécanique de signature et de chiffrement. Le but n'est pas seulement de générer des tokens, mais de poser un contrat clair et réutilisable autour de leur cycle de vie.

La librairie reste néanmoins extensible. Les mécanismes de signature et de chiffrement sont encapsulés dans les interfaces `Signer` et `Cipher`, avec des implémentations par défaut déjà prêtes, mais aussi des factories pour brancher facilement votre propre logique si nécessaire.

En pratique, `@duplojs/json-web-token` cherche à rendre la configuration explicite, et à offrir une base fortement typée pour manipuler les tokens avec plus de cohérence.
