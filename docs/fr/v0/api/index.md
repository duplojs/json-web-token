---
outline: [2, 3]
description: "Référence API du token handler, des signers et des ciphers."
next:
  text: "TokenHandler"
  link: "/fr/v0/api/tokenHandler/"
---

# Référence API

La librairie s'organise autour d'un `tokenHandler` prêt à l'emploi. Les `Signer` et `Cipher` servent à brancher la mécanique de signature et de chiffrement par défaut, ou vos propres implémentations quand vous avez besoin d'aller plus loin.

## [🔑 TokenHandler](/fr/v0/api/tokenHandler/)
Le coeur de la librairie. Il regroupe la création, le décodage et la vérification des tokens, avec la validation de l'expiration, de l'issuer, du subject et de l'audience dans le même flux.

## [✍️ Signer](/fr/v0/api/signer/)
Les signers s'occupent de signer un contenu et d'en vérifier la signature. Vous pouvez utiliser les algorithmes fournis ou créer votre propre signer avec une factory.

## [🔢 Cipher](/fr/v0/api/cipher/)
Les ciphers gèrent le chiffrement et le déchiffrement du token. Comme pour les signers, la librairie fournit des implémentations prêtes à l'emploi et laisse la porte ouverte à des versions personnalisées.
