import type { Algorithm } from "./types";
export declare function encrypt(content: string, key: string, algorithm: Algorithm): Promise<string>;
