import { pemToBinary } from '../pemToBinary.mjs';
import { hashMapper } from './hashMapper.mjs';
import { decodeBase64Url } from '../../../encoding/base64Url.mjs';
import { encodeText } from '../../../encoding/text.mjs';

async function verify(content, signature, key, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("spki", pemToBinary(key), {
        name: "RSASSA-PKCS1-v1_5",
        hash: hashMapper[algorithm],
    }, false, ["verify"]);
    return globalThis.crypto.subtle.verify({
        name: "RSASSA-PKCS1-v1_5",
        hash: hashMapper[algorithm],
    }, cryptoKey, decodeBase64Url(signature), encodeText(content));
}

export { verify };
