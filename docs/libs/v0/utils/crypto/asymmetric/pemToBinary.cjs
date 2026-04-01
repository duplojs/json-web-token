'use strict';

var base64 = require('../../encoding/base64.cjs');

const pemWrapperRegex = /-----BEGIN [^-]+-----|-----END [^-]+-----|\s+/g;
function pemToBinary(key) {
    return base64.decodeBase64(key.replace(pemWrapperRegex, ""));
}

exports.pemToBinary = pemToBinary;
