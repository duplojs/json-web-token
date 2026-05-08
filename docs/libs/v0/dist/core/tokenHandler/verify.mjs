import { callThen } from '@duplojs/utils';
import * as EE from '@duplojs/utils/either';
import { isAudienceValid } from './shared/isAudienceValid.mjs';
import { getToleranceInSeconds } from './shared/getToleranceInSeconds.mjs';
import { resolveCipher } from './shared/resolveCipher.mjs';
import { isBase64Url } from '../../utils/encoding/base64Url.mjs';
import { resolveSigner } from './shared/resolveSigner.mjs';
import { nowInSeconds } from './shared/nowInSeconds.mjs';

function createTokenHandlerVerifyMethod(params) {
    const { config, parseTokenContent } = params;
    return async function (token, params) {
        const cipher = resolveCipher(config.cipher, params?.cipher);
        const decryptedToken = cipher === undefined
            ? token
            : cipher.decrypt(token);
        return callThen(decryptedToken, (token) => {
            const [encodedHeader, encodedPayload, signature] = token.split(".");
            if (!signature || !isBase64Url(signature)) {
                return EE.left("signature-invalid");
            }
            const decodeResult = parseTokenContent(encodedHeader, encodedPayload);
            if (EE.isLeft(decodeResult)) {
                return decodeResult;
            }
            const signer = resolveSigner(config.signer, params?.signer);
            return callThen(signer.verify(`${encodedHeader}.${encodedPayload}`, signature), (isValid) => {
                if (!isValid) {
                    return EE.left("signature-invalid");
                }
                if (typeof config.issuer !== "undefined"
                    && decodeResult.payload.iss !== config.issuer) {
                    return EE.left("issue-invalid");
                }
                if (typeof config.subject !== "undefined"
                    && decodeResult.payload.sub !== config.subject) {
                    return EE.left("subject-invalid");
                }
                if (!isAudienceValid(config.audience, decodeResult.payload.aud)) {
                    return EE.left("audience-invalid");
                }
                if ((decodeResult.payload.exp + getToleranceInSeconds(params?.tolerance))
                    < nowInSeconds(config.now)) {
                    return EE.left("expired");
                }
                return {
                    header: decodeResult.header,
                    payload: decodeResult.payload,
                };
            });
        });
    };
}

export { createTokenHandlerVerifyMethod };
