'use strict';

function andThen(value, callback) {
    if (value instanceof Promise) {
        return value.then(callback);
    }
    return callback(value);
}

exports.andThen = andThen;
