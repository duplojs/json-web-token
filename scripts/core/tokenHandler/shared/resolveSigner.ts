import type { CreateSigner, Signer } from "../../signer";

export function resolveSigner(
	signer: Signer<string> | CreateSigner<string, any>,
	params: unknown,
) {
	return typeof signer === "function"
		? signer(params)
		: signer;
}
