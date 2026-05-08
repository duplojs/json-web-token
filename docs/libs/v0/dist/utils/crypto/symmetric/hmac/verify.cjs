'use strict';

var hashMapper = require('./hashMapper.cjs');
var text = require('../../../encoding/text.cjs');
var base64Url = require('../../../encoding/base64Url.cjs');

async function verify(content, signature, key, algorithm) {
    const cryptoKey = await globalThis.crypto.subtle.importKey("raw", text.encodeText(key), {
        name: "HMAC",
        hash: hashMapper.hashMapper[algorithm],
    }, false, ["verify"]);
    return globalThis.crypto.subtle.verify("HMAC", cryptoKey, base64Url.decodeBase64Url(signature), text.encodeText(content));
}

exports.verify = verify;
