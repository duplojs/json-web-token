import { E } from '@duplojs/utils';
import { resolveCipher } from './shared/resolveCipher.mjs';
import { andThen } from './shared/andThen.mjs';

function createTokenHandlerDecodeMethod(params) {
    const { config, parseTokenContent } = params;
    return async function (token, params) {
        const decodeFlow = (token) => {
            const [encodedHeader, encodedPayload] = token.split(".");
            const decodeResult = parseTokenContent(encodedHeader, encodedPayload);
            if (E.isLeft(decodeResult)) {
                return decodeResult;
            }
            return {
                header: decodeResult.header,
                payload: decodeResult.payload,
            };
        };
        const cipher = resolveCipher(config.cipher, params?.cipher);
        const decryptedToken = cipher === undefined
            ? token
            : cipher.decrypt(token);
        return andThen(decryptedToken, decodeFlow);
    };
}

export { createTokenHandlerDecodeMethod };
