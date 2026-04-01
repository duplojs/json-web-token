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
Au moment du `create`, le handler ajoute lui-même les claims standards comme `iat` et `exp`, puis signe le contenu.  
Au moment du `verify`, il redécode le token, vérifie la signature, puis applique les contrôles de configuration comme l'expiration, l'issuer, le subject ou l'audience.
:::

## Syntaxe simplifiée

Le vrai typage de `createTokenHandler` est volontairement riche, mais on peut le résumer ainsi :

```typescript
interface TokenHandlerParams {
	maxAge: D.TheTime;
	signer: Signer<string> | CreateSigner<string, unknown>;
	cipher?: Cipher<string> | CreateCipher<string, unknown>;
	issuer?: string;
	subject?: string;
	audience?: string | string[];
	tolerance?: D.TheTime;
	now?: () => D.TheDate;
	customPayloadShape: DP.DataParserObjectShape;
	customHeaderShape?: DP.DataParserObjectShape;
};

const tokenHandler = createTokenHandler({
	maxAge,
	signer,
	cipher?,
	issuer?,
	subject?,
	audience?,
	tolerance?,
	now?,
	customPayloadShape,
	customHeaderShape?,
});
```

Le handler retourné expose ensuite trois méthodes :

```typescript
tokenHandler.create(payload, params?)
tokenHandler.verify(token, params?)
tokenHandler.decode(token, params?)
```

- `create` génère un token valide à partir du payload ;
- `verify` valide le token et retourne son contenu décodé ;
- `decode` lit le contenu sans faire les vérifications métier de `verify`.

## Exemple avec custom shapes

```ts twoslash
// @version: 0
<!--@include: @/examples/v0/api/tokenHandler/customShape.ts-->
```

::: tip Ce qui se passe ici
`customPayloadShape` et `customHeaderShape` définissent ce que ton application a le droit de mettre dans le token.  
Les clés réservées du JWT, comme `exp`, `iat`, `iss`, `sub`, `aud`, `typ` ou `alg`, restent gérées par le handler lui-même.
:::

## Exemple avec des "creators"

```ts twoslash
// @version: 0
<!--@include: @/examples/v0/api/tokenHandler/creators.ts-->
```

::: tip Ce qui se passe ici
Quand tu passes un `CreateSigner` ou un `CreateCipher` au lieu d'une instance déjà configurée, les paramètres sont déplacés vers `create`, `verify` et `decode`.  
Cela permet de créer le handler une seule fois, tout en injectant plus tard les secrets, les clés ou d'autres paramètres nécessaires.
:::
