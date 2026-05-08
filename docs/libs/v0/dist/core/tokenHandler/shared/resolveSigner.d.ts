import type { CreateSigner, Signer } from "../../signer";
export declare function resolveSigner(signer: Signer<string> | CreateSigner<string, any>, params: unknown): Signer<string>;
