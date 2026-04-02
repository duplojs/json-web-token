---
outline: [2, 3]
prev:
  text: "Signer"
  link: "/en/v0/api/signer/"
next:
  text: "API Reference"
  link: "/en/v0/api/"
description: "Create, configure, or customize a cipher for token encryption."
---

# Cipher

A `Cipher` is an interface that normalizes token encryption logic. Its role is to take a value, produce an encrypted version, then later decrypt it.

It does not embed any business validation. It does not manage claims, expiration, signatures, or the full token lifecycle. It only encapsulates the `encrypt` and `decrypt` mechanics.

The idea is to move this logic away from plain utility functions and encapsulate it in a clear, reusable contract. The [`tokenHandler`](/en/v0/api/tokenHandler/) then builds on that contract to integrate encryption into a complete flow around the token.

A cipher can be used in two ways:

- as an already configured cipher, ready to encrypt and decrypt;
- as a cipher creator, so configuration can be provided later.

## Example

```ts twoslash
// @version: 0
<!--@include: @/examples/v0/api/cipher/main.ts-->
```

## Syntax

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

`CreateCipher` is a function that receives parameters and returns a `Cipher`.

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

The factory creates a `CreateCipher` from your own methods.

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

## Built-in ciphers

The library already provides several ready-to-use cipher creators.

### RSA-OAEP

- `Cipher.createRSAOAEP`
- `Cipher.createRSAOAEP256`

Both ciphers use a `publicKey` to encrypt and a `privateKey` to decrypt.
