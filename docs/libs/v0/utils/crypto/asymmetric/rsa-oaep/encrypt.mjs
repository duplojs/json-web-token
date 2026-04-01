import { pemToBinary } from '../pemToBinary.mjs';
import { hashMapper } from './hashMapper.mjs';
import { encodeText } from '../../../encoding/text.mjs';
import { encodeBase64Url } from '../../../encoding/base64Url.mjs';

async function encrypt(content, key, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("spki", pemToBinary(key), {
        name: "RSA-OAEP",
        hash: hashMapper[algorithm],
    }, false, ["encrypt"]);
    const encryptedContent = await globalThis.crypto.subtle.encrypt({
        name: "RSA-OAEP",
    }, cryptoKey, encodeText(content));
    return encodeBase64Url(encryptedContent);
}

export { encrypt };
