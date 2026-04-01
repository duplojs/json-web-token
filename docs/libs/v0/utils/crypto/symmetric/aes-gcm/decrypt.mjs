import { keyLengthMapper } from './keyLengthMapper.mjs';
import { encodeText, decodeText } from '../../../encoding/text.mjs';
import { decodeBase64Url } from '../../../encoding/base64Url.mjs';

async function decrypt(cipherText, key, initializationVector, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("raw", encodeText(key), {
        name: "AES-GCM",
        length: keyLengthMapper[algorithm],
    }, false, ["decrypt"]);
    const content = await globalThis.crypto.subtle.decrypt({
        name: "AES-GCM",
        iv: decodeBase64Url(initializationVector),
    }, cryptoKey, decodeBase64Url(cipherText));
    return decodeText(content);
}

export { decrypt };
