'use strict';

function resolveSigner(signer, params) {
    return typeof signer === "function"
        ? signer(params)
        : signer;
}

exports.resolveSigner = resolveSigner;
