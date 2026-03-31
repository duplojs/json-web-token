import type { CreateCipher, Cipher } from "../../cipher";

export function resolveCipher(
	cipher: Cipher<string> | CreateCipher<string, any> | undefined,
	params: unknown,
) {
	if (typeof cipher === "function") {
		return cipher(params);
	}

	return cipher;
}
