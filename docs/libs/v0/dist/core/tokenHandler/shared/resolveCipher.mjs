function resolveCipher(cipher, params) {
    return typeof cipher === "function"
        ? cipher(params)
        : cipher;
}

export { resolveCipher };
