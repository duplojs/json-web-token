'use strict';

function jsonParse(value) {
    try {
        return JSON.parse(value);
    }
    catch {
        return undefined;
    }
}

exports.jsonParse = jsonParse;
