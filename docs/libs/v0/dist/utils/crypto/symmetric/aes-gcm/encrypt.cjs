'use strict';

var generateInitializationVector = require('./generateInitializationVector.cjs');
var keyLengthMapper = require('./keyLengthMapper.cjs');
var text = require('../../../encoding/text.cjs');
var base64Url = require('../../../encoding/base64Url.cjs');

async function encrypt(content, key, algorithm, initializationVector = generateInitializationVector.generateInitializationVector()) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("raw", text.encodeText(key), {
        name: "AES-GCM",
        length: keyLengthMapper.keyLengthMapper[algorithm],
    }, false, ["encrypt"]);
    const cipherText = await globalThis.crypto.subtle.encrypt({
        name: "AES-GCM",
        iv: initializationVector,
    }, cryptoKey, text.encodeText(content));
    return {
        cipherText: base64Url.encodeBase64Url(cipherText),
        initializationVector: base64Url.encodeBase64Url(initializationVector),
    };
}

exports.encrypt = encrypt;
