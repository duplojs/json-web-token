import { encodeBase64Url, encodeText } from "@scripts/encoding";
import { generateInitializationVector } from "./generateInitializationVector";
import type { Algorithm } from "./types";
import { keyLengthMapper } from "./keyLengthMapper";

export async function encrypt(
	content: string,
	key: string,
	algorithm: Algorithm,
	initializationVector = generateInitializationVector(),
) {
	const cryptoKey = await globalThis.crypto.subtle.importKey(
		"raw",
		encodeText(key) as BufferSource,
		{
			name: "AES-GCM",
			length: keyLengthMapper[algorithm],
		},
		false,
		["encrypt"],
	);

	const cipherText = await globalThis.crypto.subtle.encrypt(
		{
			name: "AES-GCM",
			iv: initializationVector,
		},
		cryptoKey,
		encodeText(content) as BufferSource,
	);

	return {
		cipherText: encodeBase64Url(cipherText),
		initializationVector: encodeBase64Url(initializationVector),
	};
}
