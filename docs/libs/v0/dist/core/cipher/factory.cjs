'use strict';

var kind = require('../../kind.cjs');

const cipherKind = kind.createJsonWebTokenKind("cipher");
/**
 * {@include core/cipher/factory/index.md}
 */
function factory(algorithm, methods) {
    return Object.assign((params) => cipherKind
        .setTo({
        algorithm,
        ...methods(params, algorithm),
    }), {
        algorithm,
    });
}

exports.factory = factory;
