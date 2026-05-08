'use strict';

var DD = require('@duplojs/utils/date');

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

var DD__namespace = /*#__PURE__*/_interopNamespaceDefault(DD);

function nowInSeconds(func) {
    const now = func?.() ?? DD__namespace.now();
    return Math.floor(DD__namespace.toTimestamp(now) / 1000);
}

exports.nowInSeconds = nowInSeconds;
