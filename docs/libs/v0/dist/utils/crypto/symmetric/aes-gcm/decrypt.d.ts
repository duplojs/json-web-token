import type { Algorithm } from "./types";
export declare function decrypt(cipherText: string, key: string, initializationVector: string, algorithm: Algorithm): Promise<string>;
