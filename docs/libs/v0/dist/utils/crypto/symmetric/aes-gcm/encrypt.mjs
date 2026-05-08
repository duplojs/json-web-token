import { generateInitializationVector } from './generateInitializationVector.mjs';
import { keyLengthMapper } from './keyLengthMapper.mjs';
import { encodeText } from '../../../encoding/text.mjs';
import { encodeBase64Url } from '../../../encoding/base64Url.mjs';

async function encrypt(content, key, algorithm, initializationVector = generateInitializationVector()) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("raw", encodeText(key), {
        name: "AES-GCM",
        length: keyLengthMapper[algorithm],
    }, false, ["encrypt"]);
    const cipherText = await globalThis.crypto.subtle.encrypt({
        name: "AES-GCM",
        iv: initializationVector,
    }, cryptoKey, encodeText(content));
    return {
        cipherText: encodeBase64Url(cipherText),
        initializationVector: encodeBase64Url(initializationVector),
    };
}

export { encrypt };
