import { decodeBase64 } from '../../encoding/base64.mjs';

const pemWrapperRegex = /-----BEGIN [^-]+-----|-----END [^-]+-----|\s+/g;
function pemToBinary(key) {
    return decodeBase64(key.replace(pemWrapperRegex, ""));
}

export { pemToBinary };
