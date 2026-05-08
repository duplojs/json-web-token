import type { CreateCipher, Cipher } from "../../cipher";
export declare function resolveCipher(cipher: Cipher<string> | CreateCipher<string, any> | undefined, params: unknown): Cipher<string> | undefined;
