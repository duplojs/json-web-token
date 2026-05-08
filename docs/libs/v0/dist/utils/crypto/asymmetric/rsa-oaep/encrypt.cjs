'use strict';

var pemToBinary = require('../pemToBinary.cjs');
var hashMapper = require('./hashMapper.cjs');
var text = require('../../../encoding/text.cjs');
var base64Url = require('../../../encoding/base64Url.cjs');

async function encrypt(content, key, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("spki", pemToBinary.pemToBinary(key), {
        name: "RSA-OAEP",
        hash: hashMapper.hashMapper[algorithm],
    }, false, ["encrypt"]);
    const encryptedContent = await globalThis.crypto.subtle.encrypt({
        name: "RSA-OAEP",
    }, cryptoKey, text.encodeText(content));
    return base64Url.encodeBase64Url(encryptedContent);
}

exports.encrypt = encrypt;
