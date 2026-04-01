'use strict';

var pemToBinary = require('../pemToBinary.cjs');
var hashMapper = require('./hashMapper.cjs');
var text = require('../../../encoding/text.cjs');
var base64Url = require('../../../encoding/base64Url.cjs');

async function decrypt(content, key, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("pkcs8", pemToBinary.pemToBinary(key), {
        name: "RSA-OAEP",
        hash: hashMapper.hashMapper[algorithm],
    }, false, ["decrypt"]);
    const decryptedContent = await globalThis.crypto.subtle.decrypt({
        name: "RSA-OAEP",
    }, cryptoKey, base64Url.decodeBase64Url(content));
    return text.decodeText(decryptedContent);
}

exports.decrypt = decrypt;
