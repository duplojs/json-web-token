'use strict';

var factory = require('./factory.cjs');
var verify = require('../../utils/crypto/symmetric/hmac/verify.cjs');
var sign = require('../../utils/crypto/symmetric/hmac/sign.cjs');
var verify$1 = require('../../utils/crypto/asymmetric/rsa/verify.cjs');
var sign$1 = require('../../utils/crypto/asymmetric/rsa/sign.cjs');

const createHS256 = factory.factory("HS256", (params, algorithm) => ({
    sign: (content) => sign.sign(content, params.secret, algorithm),
    verify: (content, signature) => verify.verify(content, signature, params.secret, algorithm),
}));
const createHS512 = factory.factory("HS512", (params, algorithm) => ({
    sign: (content) => sign.sign(content, params.secret, algorithm),
    verify: (content, signature) => verify.verify(content, signature, params.secret, algorithm),
}));
const createRS256 = factory.factory("RS256", (params, algorithm) => ({
    sign: (content) => sign$1.sign(content, params.privateKey, algorithm),
    verify: (content, signature) => verify$1.verify(content, signature, params.publicKey, algorithm),
}));
const createRS512 = factory.factory("RS512", (params, algorithm) => ({
    sign: (content) => sign$1.sign(content, params.privateKey, algorithm),
    verify: (content, signature) => verify$1.verify(content, signature, params.publicKey, algorithm),
}));

exports.createHS256 = createHS256;
exports.createHS512 = createHS512;
exports.createRS256 = createRS256;
exports.createRS512 = createRS512;
