'use strict';

function generateInitializationVector() {
    return globalThis.crypto.getRandomValues(new Uint8Array(12));
}

exports.generateInitializationVector = generateInitializationVector;
