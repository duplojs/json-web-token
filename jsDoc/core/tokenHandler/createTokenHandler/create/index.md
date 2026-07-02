**Creates a token and returns an either result.**

Use `create` when token creation can be handled as a normal result in your flow.  
The method builds the final payload with configured claims (`iss`, `sub`, `aud`, `iat`, `exp`), validates the header and payload shapes, signs the token, then encrypts it when a cipher is configured.

Unlike `createOrThrow`, this method never throws for validation failures. It returns a left value that can be matched with the rest of your business logic.

### Example
```ts
{@include core/tokenHandler/createTokenHandler/create/example.ts[17,30]}
```

### Result
- `token-created`: Token creation succeeded.
- `header-parse-error`: Custom header fields do not match `customHeaderShape`.
- `payload-parse-error`: Payload fields do not match `customPayloadShape`.
