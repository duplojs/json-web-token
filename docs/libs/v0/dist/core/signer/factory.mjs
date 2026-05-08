import { createJsonWebTokenKind } from '../../kind.mjs';

const signerKind = createJsonWebTokenKind("signer");
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

export { factory };
