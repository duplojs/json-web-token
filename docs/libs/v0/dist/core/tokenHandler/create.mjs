import { unwrap, callThen } from '@duplojs/utils';
import * as DD from '@duplojs/utils/date';
import * as EE from '@duplojs/utils/either';
import { resolveSigner } from './shared/resolveSigner.mjs';
import { resolveCipher } from './shared/resolveCipher.mjs';
import { nowInSeconds } from './shared/nowInSeconds.mjs';
import { encodeBase64Url } from '../../utils/encoding/base64Url.mjs';

function createTokenHandlerCreateMethod(params) {
    const { config, headerParser, payloadParser } = params;
    return async function (payload, params) {
        const signer = resolveSigner(config.signer, params?.signer);
        const cipher = resolveCipher(config.cipher, params?.cipher);
        const issuedAt = nowInSeconds(config.now);
        const defaultHeaderValue = {
            typ: "JWT",
            alg: signer.algorithm,
        };
        const headerResult = (params?.header && headerParser.parse({
            ...params.header,
            ...defaultHeaderValue,
        })) ?? defaultHeaderValue;
        if (EE.isLeft(headerResult)) {
            return EE.left("header-parse-error", unwrap(headerResult));
        }
        const payloadResult = payloadParser.parse({
            iss: config.issuer,
            sub: config.subject,
            aud: config.audience,
            iat: issuedAt,
            exp: DD.computeTime(config.maxAge, "second") + issuedAt,
            ...payload,
        });
        if (EE.isLeft(payloadResult)) {
            return EE.left("payload-parse-error", unwrap(payloadResult));
        }
        const encodedHeader = encodeBase64Url(JSON.stringify(unwrap(headerResult)));
        const encodedPayload = encodeBase64Url(JSON.stringify(unwrap(payloadResult)));
        const signingInput = `${encodedHeader}.${encodedPayload}`;
        return callThen(signer.sign(signingInput), (signature) => {
            const token = `${signingInput}.${signature}`;
            if (cipher !== undefined) {
                return cipher.encrypt(token);
            }
            return token;
        });
    };
}

export { createTokenHandlerCreateMethod };
