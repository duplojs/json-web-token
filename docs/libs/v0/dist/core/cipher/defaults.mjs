import { factory } from './factory.mjs';
import { decrypt } from '../../utils/crypto/asymmetric/rsa-oaep/decrypt.mjs';
import { encrypt } from '../../utils/crypto/asymmetric/rsa-oaep/encrypt.mjs';

const createRSAOAEP = factory("RSA-OAEP", (params, algorithm) => ({
    encrypt: (element) => encrypt(element, params.publicKey, algorithm),
    decrypt: (element) => decrypt(element, params.privateKey, algorithm),
}));
const createRSAOAEP256 = factory("RSA-OAEP-256", (params, algorithm) => ({
    encrypt: (element) => encrypt(element, params.publicKey, algorithm),
    decrypt: (element) => decrypt(element, params.privateKey, algorithm),
}));

export { createRSAOAEP, createRSAOAEP256 };
