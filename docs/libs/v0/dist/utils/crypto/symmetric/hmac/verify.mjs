import { hashMapper } from './hashMapper.mjs';
import { encodeText } from '../../../encoding/text.mjs';
import { decodeBase64Url } from '../../../encoding/base64Url.mjs';

async function verify(content, signature, key, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("raw", encodeText(key), {
        name: "HMAC",
        hash: hashMapper[algorithm],
    }, false, ["verify"]);
    return globalThis.crypto.subtle.verify("HMAC", cryptoKey, decodeBase64Url(signature), encodeText(content));
}

export { verify };
