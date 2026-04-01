function andThen(value, callback) {
    if (value instanceof Promise) {
        return value.then(callback);
    }
    return callback(value);
}

export { andThen };
