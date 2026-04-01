'use strict';

var utils = require('@duplojs/utils');

function isAudienceValid(expectedAudience, tokenAudience) {
    if (typeof expectedAudience === "undefined") {
        return true;
    }
    if (typeof tokenAudience === "undefined") {
        return false;
    }
    const expected = utils.A.coalescing(expectedAudience);
    const actual = utils.A.coalescing(tokenAudience);
    return expected.some((value) => actual.includes(value));
}

exports.isAudienceValid = isAudienceValid;
