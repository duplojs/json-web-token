export interface CreateRSAOAEPParams {
    readonly privateKey: string;
    readonly publicKey: string;
}
export declare const createRSAOAEP: import("./factory").CreateCipher<"RSA-OAEP", CreateRSAOAEPParams>;
export interface CreateRSAOAEP256Params {
    readonly privateKey: string;
    readonly publicKey: string;
}
export declare const createRSAOAEP256: import("./factory").CreateCipher<"RSA-OAEP-256", CreateRSAOAEP256Params>;
