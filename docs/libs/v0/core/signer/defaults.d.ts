export interface CreateHS256Params {
    readonly secret: string;
}
export declare const createHS256: import("./factory").CreateSigner<"HS256", CreateHS256Params>;
export interface CreateHS512Params {
    readonly secret: string;
}
export declare const createHS512: import("./factory").CreateSigner<"HS512", CreateHS512Params>;
export interface CreateRS256Params {
    readonly privateKey: string;
    readonly publicKey: string;
}
export declare const createRS256: import("./factory").CreateSigner<"RS256", CreateRS256Params>;
export interface CreateRS512Params {
    readonly privateKey: string;
    readonly publicKey: string;
}
export declare const createRS512: import("./factory").CreateSigner<"RS512", CreateRS512Params>;
