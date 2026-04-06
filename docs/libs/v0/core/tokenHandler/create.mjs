import { E, unwrap, D, callThen } from '@duplojs/utils';
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
        const headerResult = headerParser.parse({
            ...(params?.header ?? {}),
            typ: "JWT",
            alg: signer.algorithm,
        });
        if (E.isLeft(headerResult)) {
            return E.left("header-parse-error", unwrap(headerResult));
        }
        const payloadResult = payloadParser.parse({
            iss: config.issuer,
            sub: config.subject,
            aud: config.audience,
            iat: issuedAt,
            exp: D.computeTime(config.maxAge, "second") + issuedAt,
            ...payload,
        });
        if (E.isLeft(payloadResult)) {
            return E.left("payload-parse-error", unwrap(payloadResult));
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
