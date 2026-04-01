import { E } from '@duplojs/utils';

function jsonParse(value) {
    try {
        return JSON.parse(value);
    }
    catch {
        return E.left("json-parse-error");
    }
}

export { jsonParse };
