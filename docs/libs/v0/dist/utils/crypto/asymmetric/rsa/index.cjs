'use strict';

var sign = require('./sign.cjs');
var verify = require('./verify.cjs');



exports.sign = sign.sign;
exports.verify = verify.verify;
