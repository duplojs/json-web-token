import { factory } from './factory.mjs';
import { verify } from '../../utils/crypto/symmetric/hmac/verify.mjs';
import { sign } from '../../utils/crypto/symmetric/hmac/sign.mjs';
import { verify as verify$1 } from '../../utils/crypto/asymmetric/rsa/verify.mjs';
import { sign as sign$1 } from '../../utils/crypto/asymmetric/rsa/sign.mjs';

const createHS256 = factory("HS256", (params, algorithm) => ({
    sign: (content) => sign(content, params.secret, algorithm),
    verify: (content, signature) => verify(content, signature, params.secret, algorithm),
}));
const createHS512 = factory("HS512", (params, algorithm) => ({
    sign: (content) => sign(content, params.secret, algorithm),
    verify: (content, signature) => verify(content, signature, params.secret, algorithm),
}));
const createRS256 = factory("RS256", (params, algorithm) => ({
    sign: (content) => sign$1(content, params.privateKey, algorithm),
    verify: (content, signature) => verify$1(content, signature, params.publicKey, algorithm),
}));
const createRS512 = factory("RS512", (params, algorithm) => ({
    sign: (content) => sign$1(content, params.privateKey, algorithm),
    verify: (content, signature) => verify$1(content, signature, params.publicKey, algorithm),
}));

export { createHS256, createHS512, createRS256, createRS512 };
