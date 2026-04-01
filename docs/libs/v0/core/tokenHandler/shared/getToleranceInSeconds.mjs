import { D } from '@duplojs/utils';

function getToleranceInSeconds(tolerance) {
    return tolerance
        ? D.computeTime(tolerance, "second")
        : 0;
}

export { getToleranceInSeconds };
