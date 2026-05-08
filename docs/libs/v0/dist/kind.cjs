'use strict';

var utils = require('@duplojs/utils');

const createJsonWebTokenKind = utils.createKindNamespace(
// @ts-expect-error reserved kind namespace
"DuplojsJsonWebToken");

exports.createJsonWebTokenKind = createJsonWebTokenKind;
