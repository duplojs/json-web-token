'use strict';

var pemToBinary = require('../pemToBinary.cjs');
var hashMapper = require('./hashMapper.cjs');
var base64Url = require('../../../encoding/base64Url.cjs');
var text = require('../../../encoding/text.cjs');

async function verify(content, signature, key, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("spki", pemToBinary.pemToBinary(key), {
        name: "RSASSA-PKCS1-v1_5",
        hash: hashMapper.hashMapper[algorithm],
    }, false, ["verify"]);
    return globalThis.crypto.subtle.verify({
        name: "RSASSA-PKCS1-v1_5",
        hash: hashMapper.hashMapper[algorithm],
    }, cryptoKey, base64Url.decodeBase64Url(signature), text.encodeText(content));
}

exports.verify = verify;
