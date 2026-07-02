**Reads token content without checking trust.**

Use `decode` when you only need to inspect the token header or payload.  
It decrypts the token when a cipher is configured, decodes the header and payload, and validates both against the handler shapes.

`decode` does not verify the signature, issuer, subject, audience, or expiration. For authentication or authorization decisions, use `verify`.

### Example
```ts
{@include core/tokenHandler/createTokenHandler/decode/example.ts[14,19]}
```

### Result
- `token-decoded`: Header and payload were decoded and parsed.
- `token-format`: Token segments are missing or malformed.
- `header-decode-error`: Header cannot be decoded as JSON.
- `header-parse-error`: Header does not match the configured shape.
- `payload-decode-error`: Payload cannot be decoded as JSON.
- `payload-parse-error`: Payload does not match the configured shape.
