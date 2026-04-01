import type { Algorithm } from "./types";
export declare function verify(content: string, signature: string, key: string, algorithm: Algorithm): Promise<boolean>;
