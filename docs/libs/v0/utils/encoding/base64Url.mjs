import { decodeBase64, encodeBase64 } from './base64.mjs';
import { decodeText, encodeText } from './text.mjs';

const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
function isBase64Url(input) {
    return base64UrlRegex.test(input)
        && (input.length % 4) !== 1;
}
function decodeBase64Url(input) {
    let encoded = input;
    if (encoded instanceof Uint8Array || encoded instanceof ArrayBuffer) {
        encoded = decodeText(encoded);
    }
    encoded = encoded
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    return decodeBase64(encoded);
}
function encodeBase64Url(input) {
    let unencoded = input;
    if (typeof unencoded === "string") {
        unencoded = encodeText(unencoded);
    }
    return encodeBase64(unencoded)
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

export { decodeBase64Url, encodeBase64Url, isBase64Url };
