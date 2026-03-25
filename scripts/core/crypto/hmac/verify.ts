import { decodeBase64Url, encodeText } from "../../encoding";
import { importKey } from "./importKey";
import type { CryptoKeyLike, HmacAlgorithm } from "./types";

export async function verify(
	content: string,
	signature: string,
	key: CryptoKeyLike,
	algorithm: HmacAlgorithm,
): Promise<boolean> {
	const cryptoKey = await importKey(key, algorithm, ["verify"]);

	return globalThis.crypto.subtle.verify(
		"HMAC",
		cryptoKey,
		decodeBase64Url(signature) as never,
		encodeText(content) as never,
	);
}
