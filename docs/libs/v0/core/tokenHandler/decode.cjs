'use strict';

var utils = require('@duplojs/utils');
var resolveCipher = require('./shared/resolveCipher.cjs');

function createTokenHandlerDecodeMethod(params) {
    const { config, parseTokenContent } = params;
    return async function (token, params) {
        const cipher = resolveCipher.resolveCipher(config.cipher, params?.cipher);
        const decryptedToken = cipher === undefined
            ? token
            : cipher.decrypt(token);
        return utils.callThen(decryptedToken, (token) => {
            const [encodedHeader, encodedPayload] = token.split(".");
            const decodeResult = parseTokenContent(encodedHeader, encodedPayload);
            if (utils.E.isLeft(decodeResult)) {
                return decodeResult;
            }
            return {
                header: decodeResult.header,
                payload: decodeResult.payload,
            };
        });
    };
}

exports.createTokenHandlerDecodeMethod = createTokenHandlerDecodeMethod;
