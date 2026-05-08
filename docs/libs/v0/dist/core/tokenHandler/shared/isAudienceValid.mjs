import * as AA from '@duplojs/utils/array';

function isAudienceValid(expectedAudience, tokenAudience) {
    if (typeof expectedAudience === "undefined") {
        return true;
    }
    if (typeof tokenAudience === "undefined") {
        return false;
    }
    const expected = AA.coalescing(expectedAudience);
    const actual = AA.coalescing(tokenAudience);
    return expected.some((value) => actual.includes(value));
}

export { isAudienceValid };
