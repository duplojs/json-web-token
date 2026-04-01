'use strict';

var utils = require('@duplojs/utils');
var resolveSigner = require('./shared/resolveSigner.cjs');
var resolveCipher = require('./shared/resolveCipher.cjs');
var nowInSeconds = require('./shared/nowInSeconds.cjs');
var andThen = require('./shared/andThen.cjs');
var base64Url = require('../../utils/encoding/base64Url.cjs');

function createTokenHandlerCreateMethod(params) {
    const { config, headerParser, payloadParser } = params;
    return async function (payload, params) {
        const signer = resolveSigner.resolveSigner(config.signer, params?.signer);
        const cipher = resolveCipher.resolveCipher(config.cipher, params?.cipher);
        const issuedAt = nowInSeconds.nowInSeconds(config.now);
        const headerResult = headerParser.parse({
            ...(params?.header ?? {}),
            typ: "JWT",
            alg: signer.algorithm,
        });
        if (utils.E.isLeft(headerResult)) {
            return utils.E.left("header-parse-error", utils.unwrap(headerResult));
        }
        const payloadResult = payloadParser.parse({
            iss: config.issuer,
            sub: config.subject,
            aud: config.audience,
            iat: issuedAt,
            exp: utils.D.computeTime(config.maxAge, "second") + issuedAt,
            ...payload,
        });
        if (utils.E.isLeft(payloadResult)) {
            return utils.E.left("payload-parse-error", utils.unwrap(payloadResult));
        }
        const encodedHeader = base64Url.encodeBase64Url(JSON.stringify(utils.unwrap(headerResult)));
        const encodedPayload = base64Url.encodeBase64Url(JSON.stringify(utils.unwrap(payloadResult)));
        const signingInput = `${encodedHeader}.${encodedPayload}`;
        const encryptFlow = (signature) => {
            const token = `${signingInput}.${signature}`;
            if (cipher !== undefined) {
                return cipher.encrypt(token);
            }
            return token;
        };
        return andThen.andThen(signer.sign(signingInput), encryptFlow);
    };
}

exports.createTokenHandlerCreateMethod = createTokenHandlerCreateMethod;
