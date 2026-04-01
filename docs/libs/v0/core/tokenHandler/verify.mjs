import { E } from '@duplojs/utils';
import { isAudienceValid } from './shared/isAudienceValid.mjs';
import { getToleranceInSeconds } from './shared/getToleranceInSeconds.mjs';
import { resolveCipher } from './shared/resolveCipher.mjs';
import { andThen } from './shared/andThen.mjs';
import { isBase64Url } from '../../utils/encoding/base64Url.mjs';
import { resolveSigner } from './shared/resolveSigner.mjs';
import { nowInSeconds } from './shared/nowInSeconds.mjs';

function createTokenHandlerVerifyMethod(params) {
    const { config, parseTokenContent } = params;
    return async function (token, params) {
        const verifyFlow = (token) => {
            const [encodedHeader, encodedPayload, signature] = token.split(".");
            if (!signature || !isBase64Url(signature)) {
                return E.left("signature-invalid");
            }
            const decodeResult = parseTokenContent(encodedHeader, encodedPayload);
            if (E.isLeft(decodeResult)) {
                return decodeResult;
            }
            const signer = resolveSigner(config.signer, params?.signer);
            const finishVerify = (isValid) => {
                if (!isValid) {
                    return E.left("signature-invalid");
                }
                if (typeof config.issuer !== "undefined"
                    && decodeResult.payload.iss !== config.issuer) {
                    return E.left("issue-invalid");
                }
                if (typeof config.subject !== "undefined"
                    && decodeResult.payload.sub !== config.subject) {
                    return E.left("subject-invalid");
                }
                if (!isAudienceValid(config.audience, decodeResult.payload.aud)) {
                    return E.left("audience-invalid");
                }
                if ((decodeResult.payload.exp + getToleranceInSeconds(config.tolerance))
                    < nowInSeconds(config.now)) {
                    return E.left("expired");
                }
                return {
                    header: decodeResult.header,
                    payload: decodeResult.payload,
                };
            };
            return andThen(signer.verify(`${encodedHeader}.${encodedPayload}`, signature), finishVerify);
        };
        const cipher = resolveCipher(config.cipher, params?.cipher);
        const decryptedToken = cipher === undefined
            ? token
            : cipher.decrypt(token);
        return andThen(decryptedToken, verifyFlow);
    };
}

export { createTokenHandlerVerifyMethod };
