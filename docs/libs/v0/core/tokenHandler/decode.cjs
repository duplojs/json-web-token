'use strict';

var utils = require('@duplojs/utils');
var resolveCipher = require('./shared/resolveCipher.cjs');
var andThen = require('./shared/andThen.cjs');

function createTokenHandlerDecodeMethod(params) {
    const { config, parseTokenContent } = params;
    return async function (token, params) {
        const decodeFlow = (token) => {
            const [encodedHeader, encodedPayload] = token.split(".");
            const decodeResult = parseTokenContent(encodedHeader, encodedPayload);
            if (utils.E.isLeft(decodeResult)) {
                return decodeResult;
            }
            return {
                header: decodeResult.header,
                payload: decodeResult.payload,
            };
        };
        const cipher = resolveCipher.resolveCipher(config.cipher, params?.cipher);
        const decryptedToken = cipher === undefined
            ? token
            : cipher.decrypt(token);
        return andThen.andThen(decryptedToken, decodeFlow);
    };
}

exports.createTokenHandlerDecodeMethod = createTokenHandlerDecodeMethod;
