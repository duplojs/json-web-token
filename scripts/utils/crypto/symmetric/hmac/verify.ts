import { decodeBase64Url, encodeText } from "@scripts/utils";
import { hashMapper } from "./hashMapper";
import type { Algorithm } from "./types";

export async function verify(
	content: string,
	signature: string,
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
		["verify"],
	);

	return globalThis.crypto.subtle.verify(
		"HMAC",
		cryptoKey,
		decodeBase64Url(signature) as BufferSource,
		encodeText(content) as BufferSource,
	);
}
