---
outline: [2, 3]
prev:
  text: "API Reference"
  link: "/en/v0/api/"
next:
  text: "Signer"
  link: "/en/v0/api/signer/"
description: "Create a ready-to-use token handler to generate, verify, and decode tokens."
---

# TokenHandler

`createTokenHandler` is the core of the library. Where many libraries mainly expose utility functions that you have to assemble yourself, the idea here is the opposite: you start by creating a handler that already carries the token management policy.

This handler brings together in one place:

- signing;
- encryption;
- token lifetime;
- claim management for header and payload;

In other words, the goal is to build a clear contract that you can reuse.

::: tip Created at startup
`createTokenHandler` is meant to be called when the application starts. The configuration is validated immediately, and an invalid configuration throws as soon as the handler is created.
:::

## Simple example

```ts twoslash
// @version: 0
<!--@include: @/examples/v0/api/tokenHandler/main.ts-->
```

::: tip What happens here
When `create` runs, the handler adds standard claims such as `iat` and `exp`, then signs the content.  
When `verify` runs, it decodes the token again, verifies the signature, then applies configuration checks such as expiration, issuer, subject, or audience.
:::

::: tip Why prefer `createOrThrow`
In practice, we recommend `createOrThrow`.  
If token creation fails, it is usually a server-side implementation or configuration issue, not an expected business scenario. In that case, throwing immediately is often the healthiest behavior.

By contrast, `verify` has no `orThrow` variant: a verification failure can be perfectly normal (invalid signature, expired token, inconsistent claims, etc.). It is not necessarily an implementation error, so this case remains handled as a business-level result.
:::

## Parameters

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

The returned handler then exposes four methods:

- `create`
- `createOrThrow`
- `verify`
- `decode`

## Example with custom shapes

```ts twoslash
// @version: 0
<!--@include: @/examples/v0/api/tokenHandler/customShape.ts-->
```

::: tip What happens here
`customPayloadShape` and `customHeaderShape` define what your application is allowed to put into the token.  
Reserved JWT keys such as `exp`, `iat`, `iss`, `sub`, `aud`, `typ`, or `alg` remain managed by the handler itself.
:::

## Example with creators

```ts twoslash
// @version: 0
<!--@include: @/examples/v0/api/tokenHandler/creators.ts-->
```

::: tip What happens here
When you pass a `CreateSigner` or a `CreateCipher` instead of an already configured instance, the parameters move to `create`, `createOrThrow`, `verify`, and `decode`.  
This lets you create the handler only once, while injecting secrets, keys, or other required parameters later.
:::
