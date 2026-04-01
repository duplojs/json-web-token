'use strict';

var utils = require('@duplojs/utils');

function jsonParse(value) {
    try {
        return JSON.parse(value);
    }
    catch {
        return utils.E.left("json-parse-error");
    }
}

exports.jsonParse = jsonParse;
