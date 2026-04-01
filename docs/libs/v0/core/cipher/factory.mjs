import { createJsonWebTokenKind } from '../../kind.mjs';

const cipherKind = createJsonWebTokenKind("cipher");
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

export { factory };
