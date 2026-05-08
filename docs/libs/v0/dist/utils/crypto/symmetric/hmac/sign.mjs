import { hashMapper } from './hashMapper.mjs';
import { encodeText } from '../../../encoding/text.mjs';
import { encodeBase64Url } from '../../../encoding/base64Url.mjs';

async function sign(content, key, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("raw", encodeText(key), {
        name: "HMAC",
        hash: hashMapper[algorithm],
    }, false, ["sign"]);
    const signature = await globalThis.crypto.subtle.sign("HMAC", cryptoKey, encodeText(content));
    return encodeBase64Url(signature);
}

export { sign };
