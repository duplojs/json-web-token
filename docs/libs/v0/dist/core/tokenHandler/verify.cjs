'use strict';

var utils = require('@duplojs/utils');
var EE = require('@duplojs/utils/either');
var isAudienceValid = require('./shared/isAudienceValid.cjs');
var getToleranceInSeconds = require('./shared/getToleranceInSeconds.cjs');
var resolveCipher = require('./shared/resolveCipher.cjs');
var base64Url = require('../../utils/encoding/base64Url.cjs');
var resolveSigner = require('./shared/resolveSigner.cjs');
var nowInSeconds = require('./shared/nowInSeconds.cjs');

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

var EE__namespace = /*#__PURE__*/_interopNamespaceDefault(EE);

function createTokenHandlerVerifyMethod(params) {
    const { config, parseTokenContent } = params;
    return async function (token, params) {
        const cipher = resolveCipher.resolveCipher(config.cipher, params?.cipher);
        const decryptedToken = cipher === undefined
            ? token
            : cipher.decrypt(token);
        return utils.callThen(decryptedToken, (token) => {
            const [encodedHeader, encodedPayload, signature] = token.split(".");
            if (!signature || !base64Url.isBase64Url(signature)) {
                return EE__namespace.left("signature-invalid");
            }
            const decodeResult = parseTokenContent(encodedHeader, encodedPayload);
            if (EE__namespace.isLeft(decodeResult)) {
                return decodeResult;
            }
            const signer = resolveSigner.resolveSigner(config.signer, params?.signer);
            return utils.callThen(signer.verify(`${encodedHeader}.${encodedPayload}`, signature), (isValid) => {
                if (!isValid) {
                    return EE__namespace.left("signature-invalid");
                }
                if (typeof config.issuer !== "undefined"
                    && decodeResult.payload.iss !== config.issuer) {
                    return EE__namespace.left("issue-invalid");
                }
                if (typeof config.subject !== "undefined"
                    && decodeResult.payload.sub !== config.subject) {
                    return EE__namespace.left("subject-invalid");
                }
                if (!isAudienceValid.isAudienceValid(config.audience, decodeResult.payload.aud)) {
                    return EE__namespace.left("audience-invalid");
                }
                if ((decodeResult.payload.exp + getToleranceInSeconds.getToleranceInSeconds(params?.tolerance))
                    < nowInSeconds.nowInSeconds(config.now)) {
                    return EE__namespace.left("expired");
                }
                return {
                    header: decodeResult.header,
                    payload: decodeResult.payload,
                };
            });
        });
    };
}

exports.createTokenHandlerVerifyMethod = createTokenHandlerVerifyMethod;
