import type { Algorithm } from "./types";
export declare function decrypt(content: string, key: string, algorithm: Algorithm): Promise<string>;
