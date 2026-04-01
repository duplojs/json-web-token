'use strict';

var keyLengthMapper = require('./keyLengthMapper.cjs');
var text = require('../../../encoding/text.cjs');
var base64Url = require('../../../encoding/base64Url.cjs');

async function decrypt(cipherText, key, initializationVector, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("raw", text.encodeText(key), {
        name: "AES-GCM",
        length: keyLengthMapper.keyLengthMapper[algorithm],
    }, false, ["decrypt"]);
    const content = await globalThis.crypto.subtle.decrypt({
        name: "AES-GCM",
        iv: base64Url.decodeBase64Url(initializationVector),
    }, cryptoKey, base64Url.decodeBase64Url(cipherText));
    return text.decodeText(content);
}

exports.decrypt = decrypt;
