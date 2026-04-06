'use strict';

function resolveCipher(cipher, params) {
    return typeof cipher === "function"
        ? cipher(params)
        : cipher;
}

exports.resolveCipher = resolveCipher;
