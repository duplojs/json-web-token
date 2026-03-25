import { encodeBase64Url, encodeText } from "../../encoding";
import { importKey } from "./importKey";
import type { CryptoKeyLike, HmacAlgorithm } from "./types";

export async function sign(
	content: string,
	key: CryptoKeyLike,
	algorithm: HmacAlgorithm,
): Promise<string> {
	const cryptoKey = await importKey(key, algorithm, ["sign"]);
	const signature = await globalThis.crypto.subtle.sign(
		"HMAC",
		cryptoKey,
		encodeText(content) as never,
	);

	return encodeBase64Url(new Uint8Array(signature));
}
