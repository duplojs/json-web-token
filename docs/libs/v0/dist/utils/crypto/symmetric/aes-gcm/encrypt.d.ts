import type { Algorithm } from "./types";
export declare function encrypt(content: string, key: string, algorithm: Algorithm, initializationVector?: Uint8Array<ArrayBuffer>): Promise<{
    cipherText: string;
    initializationVector: string;
}>;
