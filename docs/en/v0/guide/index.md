---
description: "Introduction to @duplojs/json-web-token"
next:
  text: "Quick start"
  link: "/en/v0/guide/quickStart"
---

# Introduction

The `@duplojs/json-web-token` library provides a deliberately structured approach to token management. Where many tools mainly expose utility functions that you assemble yourself, this library first gives you a ready-to-use `tokenHandler`, designed to centralize token creation, verification, and decoding.

This approach makes it possible to define the token policy only once in the application: lifetime, default claims, validation rules, allowed payload and header shape, as well as the signing and encryption mechanics. The goal is not only to generate tokens, but to establish a clear and reusable contract around their lifecycle.

The library still remains extensible. Signing and encryption mechanisms are encapsulated in the `Signer` and `Cipher` interfaces, with built-in default implementations, but also factories that let you plug in your own logic when needed.

In practice, `@duplojs/json-web-token` aims to make configuration explicit and provide a strongly typed foundation to handle tokens with more consistency.
