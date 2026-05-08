'use strict';

var hashMapper = require('./hashMapper.cjs');
var text = require('../../../encoding/text.cjs');
var base64Url = require('../../../encoding/base64Url.cjs');

async function sign(content, key, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("raw", text.encodeText(key), {
        name: "HMAC",
        hash: hashMapper.hashMapper[algorithm],
    }, false, ["sign"]);
    const signature = await globalThis.crypto.subtle.sign("HMAC", cryptoKey, text.encodeText(content));
    return base64Url.encodeBase64Url(signature);
}

exports.sign = sign;
