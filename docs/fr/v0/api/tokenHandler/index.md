---
outline: [2, 3]
prev:
  text: "Référence API"
  link: "/fr/v0/api/"
next:
  text: "Signer"
  link: "/fr/v0/api/signer/"
description: "Créer un token handler prêt à l'emploi pour générer, vérifier et décoder des tokens."
---

# TokenHandler

`createTokenHandler` est le coeur de la librairie. Là où beaucoup de bibliothèques exposent surtout des fonctions utilitaires à assembler, ici l'idée est inverse : on commence par créer un handler qui porte déjà la politique de gestion du token.

Ce handler regroupe au même endroit :

- la signature ;
- le chiffrement ;
- la durée de vie du token ;
- la gestions des claims (header/payload) ;

Autrement dit, le but est de construire un contrat clair que l'on peut réutiliser.

::: tip Création au démarrage
`createTokenHandler` est pensé pour être appelé au démarrage d'une l'application. La configuration est validée immédiatement, et une configuration invalide provoque un `throw` dès la création du handler.
:::

## Exemple simple

```ts twoslash
// @version: 0
<!--@include: @/examples/v0/api/tokenHandler/main.ts-->
```

::: tip Ce qui se passe ici
Au moment du `createOrThrow`, le handler ajoute lui-même les claims standards comme `iat` et `exp`, puis signe le contenu.  
Au moment du `verify`, il redécode le token, vérifie la signature, puis applique les contrôles de configuration comme l'expiration, l'issuer, le subject ou l'audience.

`verify` retourne un résultat either. En cas de succès, l'information est `token-verified` et la valeur contient le header et le payload décodés.
:::

::: tip Pourquoi `createOrThrow` existe ?
En pratique, on recommande `createOrThrow`.  
Si la création d'un token échoue, c'est généralement un problème d'implémentation ou de configuration côté serveur, pas un scénario métier attendu. Dans ce cas, lever une erreur immédiatement est un comportement sain.

À l'inverse, `verify` n'a pas de variante `orThrow` : un échec de vérification peut être parfaitement normal (signature invalide, token expiré, claims incohérents, etc.). Ce n'est pas forcément une erreur d'implémentation, donc ce cas reste géré comme un résultat métier.
:::

## Paramètres

```typescript
interface TokenHandlerParams {
	maxAge: D.TheTime;
	signer: Signer<string> | CreateSigner<string, unknown>;
	cipher?: Cipher<string> | CreateCipher<string, unknown>;
	issuer?: string;
	subject?: string;
	audience?: string | string[];
	now?: () => D.TheDate;
	customPayloadShape: DP.DataParserObjectShape;
	customHeaderShape?: DP.DataParserObjectShape;
};
```

Le handler retourné expose ensuite quatre méthodes :

- `create` : crée un token et retourne `token-created` ou une erreur de création.
- `createOrThrow` : crée directement une chaîne de token, ou throw si la création échoue.
- `verify` : vérifie la signature et les claims configurés, puis retourne `token-verified` ou une erreur de vérification.
- `decode` : lit le header et le payload sans vérifier la signature ni les claims, puis retourne `token-decoded` ou une erreur de décodage.

## Exemple avec custom shapes

```ts twoslash
// @version: 0
<!--@include: @/examples/v0/api/tokenHandler/customShape.ts-->
```

::: tip Ce qui se passe ici
`customPayloadShape` et `customHeaderShape` définissent ce que ton application a le droit de mettre dans le token.  
Les clés réservées du JWT, comme `exp`, `iat`, `iss`, `sub`, `aud`, `typ` ou `alg`, restent gérées par le handler lui-même.

`decode` lit uniquement le contenu du token. C'est utile pour inspecter, mais ce n'est pas la méthode à utiliser pour faire confiance à un token reçu.
:::

## Exemple avec des "creators"

```ts twoslash
// @version: 0
<!--@include: @/examples/v0/api/tokenHandler/creators.ts-->
```

::: tip Ce qui se passe ici
Quand tu passes un `CreateSigner` ou un `CreateCipher` au lieu d'une instance déjà configurée, les paramètres sont déplacés vers `create`, `createOrThrow`, `verify` et `decode`.  
Cela permet de créer le handler une seule fois, tout en injectant plus tard les secrets, les clés ou d'autres paramètres nécessaires.

Le résultat de succès reste le même : `create` retourne `token-created`, `decode` retourne `token-decoded` et `verify` retourne `token-verified`.
:::
