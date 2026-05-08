import * as DD from '@duplojs/utils/date';

function getToleranceInSeconds(tolerance) {
    return tolerance
        ? DD.computeTime(tolerance, "second")
        : 0;
}

export { getToleranceInSeconds };
