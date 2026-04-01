import { pemToBinary } from '../pemToBinary.mjs';
import { hashMapper } from './hashMapper.mjs';
import { encodeText } from '../../../encoding/text.mjs';
import { encodeBase64Url } from '../../../encoding/base64Url.mjs';

async function sign(content, key, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("pkcs8", pemToBinary(key), {
        name: "RSASSA-PKCS1-v1_5",
        hash: hashMapper[algorithm],
    }, false, ["sign"]);
    const signature = await globalThis.crypto.subtle.sign({
        name: "RSASSA-PKCS1-v1_5",
        hash: hashMapper[algorithm],
    }, cryptoKey, encodeText(content));
    return encodeBase64Url(signature);
}

export { sign };
