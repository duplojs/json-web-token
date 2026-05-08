'use strict';

var utils = require('@duplojs/utils');
var EE = require('@duplojs/utils/either');
var resolveCipher = require('./shared/resolveCipher.cjs');

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
            if (EE__namespace.isLeft(decodeResult)) {
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
