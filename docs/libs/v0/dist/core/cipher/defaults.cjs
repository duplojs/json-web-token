'use strict';

var factory = require('./factory.cjs');
var decrypt = require('../../utils/crypto/asymmetric/rsa-oaep/decrypt.cjs');
var encrypt = require('../../utils/crypto/asymmetric/rsa-oaep/encrypt.cjs');

const createRSAOAEP = factory.factory("RSA-OAEP", (params, algorithm) => ({
    encrypt: (element) => encrypt.encrypt(element, params.publicKey, algorithm),
    decrypt: (element) => decrypt.decrypt(element, params.privateKey, algorithm),
}));
const createRSAOAEP256 = factory.factory("RSA-OAEP-256", (params, algorithm) => ({
    encrypt: (element) => encrypt.encrypt(element, params.publicKey, algorithm),
    decrypt: (element) => decrypt.decrypt(element, params.privateKey, algorithm),
}));

exports.createRSAOAEP = createRSAOAEP;
exports.createRSAOAEP256 = createRSAOAEP256;
