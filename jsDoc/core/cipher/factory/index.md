**Creates a cipher creator from custom methods.**

### Parameters
- `algorithm`: Cipher algorithm name
- `methods`: Build encrypt and decrypt

### Example
```ts
{@include core/cipher/factory/example.ts[3,22]}
```

@remarks
- The returned creator also exposes `algorithm`.
- `encrypt` and `decrypt` can be sync or async.

@see https://json-web-token.duplojs.dev/en/v0/api/cipher
