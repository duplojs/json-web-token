**Creates a token handler with validation.**

### Parameters
- `params.maxAge`: Token lifetime
- `params.signer`: Signer or creator
- `params.cipher`: Cipher or creator
- `params.issuer`: Default issuer claim
- `params.subject`: Default subject claim
- `params.audience`: Default audience claim
- `params.now`: Current date override
- `params.customPayloadShape`: Custom payload shape
- `params.customHeaderShape`: Custom header shape

### Example
```ts
{@include core/tokenHandler/createTokenHandler/example.ts[4,34]}
```

@remarks
- `verify` also checks issuer, subject, audience and expiration.
- `createOrThrow` throws when token creation returns a left value.
- Creator inputs move signer and cipher params to `create`, `createOrThrow`, `decode` and `verify`.
- Custom shapes cannot redefine reserved JWT keys.

@see https://json-web-token.duplojs.dev/en/v0/api/tokenHandler
