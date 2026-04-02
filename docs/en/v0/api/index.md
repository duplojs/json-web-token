---
outline: [2, 3]
description: "API reference for the token handler, signers, and ciphers."
next:
  text: "TokenHandler"
  link: "/en/v0/api/tokenHandler/"
---

# API Reference

The library is organized around a ready-to-use `tokenHandler`. `Signer` and `Cipher` are used to plug in the default signing and encryption mechanics, or your own implementations when you need to go further.

## [🔑 TokenHandler](/en/v0/api/tokenHandler/)
The core of the library. It brings together token creation, decoding, and verification, including expiration, issuer, subject, and audience validation in the same flow.

## [✍️ Signer](/en/v0/api/signer/)
Signers are responsible for signing content and verifying its signature. You can use the built-in algorithms or create your own signer with a factory.

## [🔢 Cipher](/en/v0/api/cipher/)
Ciphers handle token encryption and decryption. As with signers, the library provides ready-to-use implementations while leaving the door open to custom ones.
