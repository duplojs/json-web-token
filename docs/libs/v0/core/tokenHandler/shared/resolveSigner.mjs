function resolveSigner(signer, params) {
    return typeof signer === "function"
        ? signer(params)
        : signer;
}

export { resolveSigner };
