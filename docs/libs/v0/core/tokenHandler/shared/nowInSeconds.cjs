'use strict';

var utils = require('@duplojs/utils');

function nowInSeconds(func) {
    const now = func?.() ?? utils.D.now();
    return Math.floor(utils.D.toTimestamp(now) / 1000);
}

exports.nowInSeconds = nowInSeconds;
