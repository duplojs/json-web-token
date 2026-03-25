import { encodeText } from "../../encoding";
import type { CryptoKeyLike, HmacAlgorithm } from "./types";

const hashMap = {
	HS256: "SHA-256",
	HS512: "SHA-512",
} as const;

export async function importKey(
	key: CryptoKeyLike,
	algorithm: HmacAlgorithm,
	usages: KeyUsage[],
): Promise<CryptoKey> {
	if (typeof globalThis.crypto?.subtle === "undefined") {
		throw new Error("Web Crypto API is not available in this environment.");
	}

	if (key instanceof CryptoKey) {
		return key;
	}

	return globalThis.crypto.subtle.importKey(
		"raw",
		(typeof key === "string"
			? encodeText(key)
			: key) as never,
		{
			name: "HMAC",
			hash: hashMap[algorithm],
		},
		false,
		usages,
	);
}
