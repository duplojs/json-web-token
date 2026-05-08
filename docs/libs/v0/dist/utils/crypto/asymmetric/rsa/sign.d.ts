import type { Algorithm } from "./types";
export declare function sign(content: string, key: string, algorithm: Algorithm): Promise<string>;
