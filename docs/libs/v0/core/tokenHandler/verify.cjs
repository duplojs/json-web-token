'use strict';

var utils = require('@duplojs/utils');
var isAudienceValid = require('./shared/isAudienceValid.cjs');
var getToleranceInSeconds = require('./shared/getToleranceInSeconds.cjs');
var resolveCipher = require('./shared/resolveCipher.cjs');
var base64Url = require('../../utils/encoding/base64Url.cjs');
var resolveSigner = require('./shared/resolveSigner.cjs');
var nowInSeconds = require('./shared/nowInSeconds.cjs');

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
                return utils.E.left("signature-invalid");
            }
            const decodeResult = parseTokenContent(encodedHeader, encodedPayload);
            if (utils.E.isLeft(decodeResult)) {
                return decodeResult;
            }
            const signer = resolveSigner.resolveSigner(config.signer, params?.signer);
            return utils.callThen(signer.verify(`${encodedHeader}.${encodedPayload}`, signature), (isValid) => {
                if (!isValid) {
                    return utils.E.left("signature-invalid");
                }
                if (typeof config.issuer !== "undefined"
                    && decodeResult.payload.iss !== config.issuer) {
                    return utils.E.left("issue-invalid");
                }
                if (typeof config.subject !== "undefined"
                    && decodeResult.payload.sub !== config.subject) {
                    return utils.E.left("subject-invalid");
                }
                if (!isAudienceValid.isAudienceValid(config.audience, decodeResult.payload.aud)) {
                    return utils.E.left("audience-invalid");
                }
                if ((decodeResult.payload.exp + getToleranceInSeconds.getToleranceInSeconds(params?.tolerance))
                    < nowInSeconds.nowInSeconds(config.now)) {
                    return utils.E.left("expired");
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
