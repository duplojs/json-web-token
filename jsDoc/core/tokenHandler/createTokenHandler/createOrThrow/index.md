**Creates a token and throws on creation errors.**

Use `createOrThrow` when a token creation failure means the application code is wrong: invalid payload shape, invalid custom header, or missing creator parameters.  
It delegates to `create`, unwraps the `token-created` result, and throws `TokenHandlerCreateError` when `create` returns a left value.

This is usually the most convenient method for issuing tokens because invalid creation inputs are often development errors, not user-facing authentication failures.

### Example
```ts
{@include core/tokenHandler/createTokenHandler/createOrThrow/example.ts[17,26]}
```

### Result
Returns the created token string.

@throws `TokenHandlerCreateError` when token creation returns a left value.
