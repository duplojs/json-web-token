import { encodeBase64Url, encodeText } from "@scripts/core/encoding";
import { hashMapper } from "./hashMapper";
import type { Algorithm } from "./types";

export async function sign(
	content: string,
	key: string,
	algorithm: Algorithm,
) {
	const cryptoKey = await globalThis.crypto.subtle.importKey(
		"raw",
		encodeText(key) as BufferSource,
		{
			name: "HMAC",
			hash: hashMapper[algorithm],
		},
		false,
		["sign"],
	);

	const signature = await globalThis.crypto.subtle.sign(
		"HMAC",
		cryptoKey,
		encodeText(content) as BufferSource,
	);

	return encodeBase64Url(signature);
}
