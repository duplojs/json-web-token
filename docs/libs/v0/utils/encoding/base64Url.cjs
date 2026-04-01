'use strict';

var base64 = require('./base64.cjs');
var text = require('./text.cjs');

const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
function isBase64Url(input) {
    return base64UrlRegex.test(input)
        && (input.length % 4) !== 1;
}
function decodeBase64Url(input) {
    let encoded = input;
    if (encoded instanceof Uint8Array || encoded instanceof ArrayBuffer) {
        encoded = text.decodeText(encoded);
    }
    encoded = encoded
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    return base64.decodeBase64(encoded);
}
function encodeBase64Url(input) {
    let unencoded = input;
    if (typeof unencoded === "string") {
        unencoded = text.encodeText(unencoded);
    }
    return base64.encodeBase64(unencoded)
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

exports.decodeBase64Url = decodeBase64Url;
exports.encodeBase64Url = encodeBase64Url;
exports.isBase64Url = isBase64Url;
