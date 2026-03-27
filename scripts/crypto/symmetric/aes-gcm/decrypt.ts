import { decodeBase64Url, decodeText, encodeText } from "@scripts/encoding";
import type { Algorithm } from "./types";
import { keyLengthMapper } from "./keyLengthMapper";

export async function decrypt(
	cipherText: string,
	key: string,
	initializationVector: string,
	algorithm: Algorithm,
) {
	const cryptoKey = await globalThis.crypto.subtle.importKey(
		"raw",
		encodeText(key) as BufferSource,
		{
			name: "AES-GCM",
			length: keyLengthMapper[algorithm],
		},
		false,
		["decrypt"],
	);

	const content = await globalThis.crypto.subtle.decrypt(
		{
			name: "AES-GCM",
			iv: decodeBase64Url(initializationVector) as BufferSource,
		},
		cryptoKey,
		decodeBase64Url(cipherText) as BufferSource,
	);

	return decodeText(content);
}
