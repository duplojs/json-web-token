'use strict';

var utils = require('@duplojs/utils');
var DD = require('@duplojs/utils/date');
var EE = require('@duplojs/utils/either');
var resolveSigner = require('./shared/resolveSigner.cjs');
var resolveCipher = require('./shared/resolveCipher.cjs');
var nowInSeconds = require('./shared/nowInSeconds.cjs');
var base64Url = require('../../utils/encoding/base64Url.cjs');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var DD__namespace = /*#__PURE__*/_interopNamespaceDefault(DD);
var EE__namespace = /*#__PURE__*/_interopNamespaceDefault(EE);

function createTokenHandlerCreateMethod(params) {
    const { config, headerParser, payloadParser } = params;
    return async function (payload, params) {
        const signer = resolveSigner.resolveSigner(config.signer, params?.signer);
        const cipher = resolveCipher.resolveCipher(config.cipher, params?.cipher);
        const issuedAt = nowInSeconds.nowInSeconds(config.now);
        const defaultHeaderValue = {
            typ: "JWT",
            alg: signer.algorithm,
        };
        const headerResult = (params?.header && headerParser.parse({
            ...params.header,
            ...defaultHeaderValue,
        })) ?? defaultHeaderValue;
        if (EE__namespace.isLeft(headerResult)) {
            return EE__namespace.left("header-parse-error", utils.unwrap(headerResult));
        }
        const payloadResult = payloadParser.parse({
            iss: config.issuer,
            sub: config.subject,
            aud: config.audience,
            iat: issuedAt,
            exp: DD__namespace.computeTime(config.maxAge, "second") + issuedAt,
            ...payload,
        });
        if (EE__namespace.isLeft(payloadResult)) {
            return EE__namespace.left("payload-parse-error", utils.unwrap(payloadResult));
        }
        const encodedHeader = base64Url.encodeBase64Url(JSON.stringify(utils.unwrap(headerResult)));
        const encodedPayload = base64Url.encodeBase64Url(JSON.stringify(utils.unwrap(payloadResult)));
        const signingInput = `${encodedHeader}.${encodedPayload}`;
        return utils.callThen(signer.sign(signingInput), (signature) => {
            const token = `${signingInput}.${signature}`;
            if (cipher !== undefined) {
                return cipher.encrypt(token);
            }
            return token;
        });
    };
}

exports.createTokenHandlerCreateMethod = createTokenHandlerCreateMethod;
