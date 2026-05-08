import { pemToBinary } from '../pemToBinary.mjs';
import { hashMapper } from './hashMapper.mjs';
import { decodeText } from '../../../encoding/text.mjs';
import { decodeBase64Url } from '../../../encoding/base64Url.mjs';

async function decrypt(content, key, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("pkcs8", pemToBinary(key), {
        name: "RSA-OAEP",
        hash: hashMapper[algorithm],
    }, false, ["decrypt"]);
    const decryptedContent = await globalThis.crypto.subtle.decrypt({
        name: "RSA-OAEP",
    }, cryptoKey, decodeBase64Url(content));
    return decodeText(decryptedContent);
}

export { decrypt };
