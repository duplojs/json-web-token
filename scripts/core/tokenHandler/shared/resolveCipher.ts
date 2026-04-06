import type { CreateCipher, Cipher } from "../../cipher";

export function resolveCipher(
	cipher: Cipher<string> | CreateCipher<string, any> | undefined,
	params: unknown,
) {
	return typeof cipher === "function"
		? cipher(params)
		: cipher;
}
