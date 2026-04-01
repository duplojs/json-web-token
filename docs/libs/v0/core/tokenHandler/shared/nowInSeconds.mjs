import { D } from '@duplojs/utils';

function nowInSeconds(func) {
    const now = func?.() ?? D.now();
    return Math.floor(D.toTimestamp(now) / 1000);
}

export { nowInSeconds };
