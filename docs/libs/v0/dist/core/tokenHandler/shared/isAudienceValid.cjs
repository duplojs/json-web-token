'use strict';

var AA = require('@duplojs/utils/array');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var AA__namespace = /*#__PURE__*/_interopNamespaceDefault(AA);

function isAudienceValid(expectedAudience, tokenAudience) {
    if (typeof expectedAudience === "undefined") {
        return true;
    }
    if (typeof tokenAudience === "undefined") {
        return false;
    }
    const expected = AA__namespace.coalescing(expectedAudience);
    const actual = AA__namespace.coalescing(tokenAudience);
    return expected.some((value) => actual.includes(value));
}

exports.isAudienceValid = isAudienceValid;
