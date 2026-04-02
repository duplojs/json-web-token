---
outline: [2, 3]
prev:
  text: "TokenHandler"
  link: "/en/v0/api/tokenHandler/"
next:
  text: "Cipher"
  link: "/en/v0/api/cipher/"
description: "Create, configure, or customize a signer for token signatures."
---

# Signer

A `Signer` is an interface that normalizes token signing logic. Its role is to take some content, produce a signature, then later verify that this signature matches the expected content.

It does not embed any business validation. It does not manage claims, expiration, audience, or the full token lifecycle. It only encapsulates the `sign` and `verify` mechanics.

The idea is to move this logic away from plain utility functions and encapsulate it in a clear, reusable contract. The [`tokenHandler`](/en/v0/api/tokenHandler/) then builds on that contract to create a complete flow around the token.

A signer can be used in two ways:

- as an already configured signer, ready to sign and verify;
- as a signer creator, so configuration can be provided later.

## Example

```ts twoslash
// @version: 0
<!--@include: @/examples/v0/api/signer/main.ts-->
```

## Syntax

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

`CreateSigner` is a function that receives parameters and returns a `Signer`.

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

The factory creates a `CreateSigner` from your own methods.

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

## Built-in signers

The library already provides several ready-to-use signer creators.

### HMAC

- `Signer.createHS256`
- `Signer.createHS512`

Both signers use a shared `secret`.

### RSA

- `Signer.createRS256`
- `Signer.createRS512`

Both signers use a `privateKey` to sign and a `publicKey` to verify.
