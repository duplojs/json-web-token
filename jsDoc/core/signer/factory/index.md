**Creates a signer creator from custom methods.**

### Parameters
- `algorithm`: Signer algorithm name
- `methods`: Build sign and verify

### Example
```ts
{@include core/signer/factory/example.ts[3,20]}
```

@remarks
- The returned creator also exposes `algorithm`.
- `sign` and `verify` can be sync or async.

@see https://json-web-token.duplojs.dev/en/v0/api/signer
