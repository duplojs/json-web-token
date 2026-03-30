import { decodeBase64Url, decodeText, encodeText } from "@scripts/utils";
import type { Algorithm } from "./types";
import { hashMapper } from "./hashMapper";

export async function decrypt(
	content: string,
	key: string,
	algorithm: Algorithm,
) {
	const cryptoKey = await globalThis.crypto.subtle.importKey(
		"pkcs8",
		encodeText(key) as BufferSource,
		{
			name: "RSA-OAEP",
			hash: hashMapper[algorithm],
		},
		false,
		["decrypt"],
	);

	const decryptedContent = await globalThis.crypto.subtle.decrypt(
		{
			name: "RSA-OAEP",
		},
		cryptoKey,
		decodeBase64Url(content) as BufferSource,
	);

	return decodeText(decryptedContent);
}
