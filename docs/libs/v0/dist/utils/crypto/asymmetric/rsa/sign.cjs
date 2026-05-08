'use strict';

var pemToBinary = require('../pemToBinary.cjs');
var hashMapper = require('./hashMapper.cjs');
var text = require('../../../encoding/text.cjs');
var base64Url = require('../../../encoding/base64Url.cjs');

async function sign(content, key, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("pkcs8", pemToBinary.pemToBinary(key), {
        name: "RSASSA-PKCS1-v1_5",
        hash: hashMapper.hashMapper[algorithm],
    }, false, ["sign"]);
    const signature = await globalThis.crypto.subtle.sign({
        name: "RSASSA-PKCS1-v1_5",
        hash: hashMapper.hashMapper[algorithm],
    }, cryptoKey, text.encodeText(content));
    return base64Url.encodeBase64Url(signature);
}

exports.sign = sign;
