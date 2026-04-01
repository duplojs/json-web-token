'use strict';

var utils = require('@duplojs/utils');

function getToleranceInSeconds(tolerance) {
    return tolerance
        ? utils.D.computeTime(tolerance, "second")
        : 0;
}

exports.getToleranceInSeconds = getToleranceInSeconds;
