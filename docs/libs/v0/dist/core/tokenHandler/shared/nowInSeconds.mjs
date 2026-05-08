import * as DD from '@duplojs/utils/date';

function nowInSeconds(func) {
    const now = func?.() ?? DD.now();
    return Math.floor(DD.toTimestamp(now) / 1000);
}

export { nowInSeconds };
