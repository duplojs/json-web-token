function jsonParse(value) {
    try {
        return JSON.parse(value);
    }
    catch {
        return undefined;
    }
}

export { jsonParse };
