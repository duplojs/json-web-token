---
outline: [2, 3]
prev:
  text: "TokenHandler"
  link: "/fr/v0/api/tokenHandler/"
next:
  text: "Cipher"
  link: "/fr/v0/api/cipher/"
description: "Créer, configurer ou personnaliser un signer pour la signature des tokens."
---

# Signer

Un `Signer` est une interface qui normalise la logique de signature d'un token. Son rôle est de prendre un contenu, produire une signature, puis vérifier plus tard que cette signature correspond bien au contenu attendu.

Il n'embarque aucune vérification métier. Il ne gère ni les claims, ni l'expiration, ni l'audience, ni le cycle complet du token. Il encapsule uniquement la mécanique de `sign` et `verify`.

L'idée est de sortir cette logique de simples fonctions utilitaires pour l'encapsuler dans un contrat clair et réutilisable. C'est ensuite le [`tokenHandler`](/fr/v0/api/tokenHandler/) qui s'appuie sur ce contrat pour construire un flux complet autour du token.

Un signer peut être utilisé de deux façons :

- comme un signer déjà configuré, prêt à signer et vérifier ;
- comme un créateur de signer, pour fournir la configuration plus tard.

## Exemple

```ts twoslash
// @version: 0
<!--@include: @/examples/v0/api/signer/main.ts-->
```

## Syntaxe

### `Signer`

```typescript
interface Signer<
	GenericAlgorithm extends string = string
> {
	readonly algorithm: GenericAlgorithm;
	sign(content: string): MaybePromise<string>;
	verify(content: string, signature: string): MaybePromise<boolean>;
}
```

### `CreateSigner`

`CreateSigner` représente une fonction qui reçoit des paramètres et retourne un `Signer`.

```typescript
interface CreateSigner<
	GenericAlgorithm extends string,
	GenericParams extends unknown,
> {
	readonly algorithm: GenericAlgorithm;
	(params: NoInfer<GenericParams>): Signer<GenericAlgorithm>;
}
```

### `Signer.factory`

La factory permet de créer un `CreateSigner` à partir de vos propres méthodes.

```typescript
function factory<
	const GenericAlgorithm extends string,
	GenericMethodsParams extends unknown,
>(
	algorithm: GenericAlgorithm,
	methods: (
		params: GenericMethodsParams,
		algorithm: NoInfer<GenericAlgorithm>,
	) => {
		sign(content: string): MaybePromise<string>;
		verify(content: string, signature: string): MaybePromise<boolean>;
	},
): CreateSigner<GenericAlgorithm, GenericMethodsParams>;
```

## Signers fournis

La librairie fournit déjà plusieurs créateurs de signers prêts à l'emploi.

### HMAC

- `Signer.createHS256`
- `Signer.createHS512`

Ces deux signers utilisent un `secret` partagé.

### RSA

- `Signer.createRS256`
- `Signer.createRS512`

Ces deux signers utilisent une `privateKey` pour signer et une `publicKey` pour vérifier.
