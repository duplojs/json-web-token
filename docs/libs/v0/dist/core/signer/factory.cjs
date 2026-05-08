'use strict';

var kind = require('../../kind.cjs');

const signerKind = kind.createJsonWebTokenKind("signer");
/**
 * {@include core/signer/factory/index.md}
 */
function factory(algorithm, methods) {
    return Object.assign((params) => signerKind
        .setTo({
        algorithm,
        ...methods(params, algorithm),
    }), {
        algorithm,
    });
}

exports.factory = factory;
