function resolveCipher(cipher, params) {
    if (typeof cipher === "function") {
        return cipher(params);
    }
    return cipher;
}

export { resolveCipher };
