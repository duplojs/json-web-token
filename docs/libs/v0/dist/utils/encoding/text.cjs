'use strict';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
function encodeText(input) {
    return textEncoder.encode(input);
}
function decodeText(input) {
    return textDecoder.decode(input instanceof Uint8Array
        ? input
        : new Uint8Array(input));
}

exports.decodeText = decodeText;
exports.encodeText = encodeText;
