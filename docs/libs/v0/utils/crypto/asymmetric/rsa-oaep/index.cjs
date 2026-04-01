'use strict';

var encrypt = require('./encrypt.cjs');
var decrypt = require('./decrypt.cjs');



exports.encrypt = encrypt.encrypt;
exports.decrypt = decrypt.decrypt;
