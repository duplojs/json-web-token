---
outline: [2, 3]
prev:
  text: "Signer"
  link: "/fr/v0/api/signer/"
next:
  text: "Référence API"
  link: "/fr/v0/api/"
description: "Créer, configurer ou personnaliser un cipher pour le chiffrement des tokens."
---

# Cipher

Un `Cipher` est une interface qui normalise la logique de chiffrement d'un token. Son rôle est de prendre une valeur, produire une version chiffrée, puis permettre plus tard de la déchiffrer.

Il n'embarque aucune vérification métier. Il ne gère ni les claims, ni l'expiration, ni la signature, ni le cycle complet du token. Il encapsule uniquement la mécanique de `encrypt` et `decrypt`.

L'idée est de sortir cette logique de simples fonctions utilitaires pour l'encapsuler dans un contrat clair et réutilisable. C'est ensuite le [`tokenHandler`](/fr/v0/api/tokenHandler/) qui s'appuie sur ce contrat pour intégrer le chiffrement dans un flux complet autour du token.

Un cipher peut être utilisé de deux façons :

- comme un cipher déjà configuré, prêt à chiffrer et déchiffrer ;
- comme un créateur de cipher, pour fournir la configuration plus tard.

## Exemple

```ts twoslash
// @version: 0
<!--@include: @/examples/v0/api/cipher/main.ts-->
```

## Syntaxe

### `Cipher`

```typescript
interface Cipher<
	GenericAlgorithm extends string = string
> {
	readonly algorithm: GenericAlgorithm;
	encrypt(element: string): MaybePromise<string>;
	decrypt(element: string): MaybePromise<string>;
}
```

### `CreateCipher`

`CreateCipher` représente une fonction qui reçoit des paramètres et retourne un `Cipher`.

```typescript
interface CreateCipher<
	GenericAlgorithm extends string,
	GenericParams extends unknown,
> {
	readonly algorithm: GenericAlgorithm;
	(params: NoInfer<GenericParams>): Cipher<GenericAlgorithm>;
}
```

### `Cipher.factory`

La factory permet de créer un `CreateCipher` à partir de vos propres méthodes.

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
		encrypt(element: string): MaybePromise<string>;
		decrypt(element: string): MaybePromise<string>;
	},
): CreateCipher<GenericAlgorithm, GenericMethodsParams>;
```

## Ciphers fournis

La librairie fournit déjà plusieurs créateurs de ciphers prêts à l'emploi.

### RSA-OAEP

- `Cipher.createRSAOAEP`
- `Cipher.createRSAOAEP256`

Ces deux ciphers utilisent une `publicKey` pour chiffrer et une `privateKey` pour déchiffrer.
