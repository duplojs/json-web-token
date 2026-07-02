**Checks that a token is valid and trusted.**

Use `verify` when a received token must be accepted or rejected.  
It decrypts the token when needed, decodes and parses its content, verifies the signature, then checks configured claims: issuer, subject, audience, and expiration.

Verification failures are normal business results. The method returns left values instead of throwing so callers can branch on cases such as `expired`, `signature-invalid`, or `audience-invalid`.

### Example
```ts
{@include core/tokenHandler/createTokenHandler/verify/example.ts[16,29]}
```

### Result
- `token-verified`: The token is valid and trusted.
- `token-format`: Token segments are missing or malformed.
- `header-decode-error`: Header cannot be decoded as JSON.
- `header-parse-error`: Header does not match the configured shape.
- `payload-decode-error`: Payload cannot be decoded as JSON.
- `payload-parse-error`: Payload does not match the configured shape.
- `signature-invalid`: Signature is missing, malformed, or invalid.
- `issue-invalid`: Issuer does not match the configured issuer.
- `subject-invalid`: Subject does not match the configured subject.
- `audience-invalid`: Audience does not match the configured audience.
- `expired`: Token expiration is older than the current date plus tolerance.
