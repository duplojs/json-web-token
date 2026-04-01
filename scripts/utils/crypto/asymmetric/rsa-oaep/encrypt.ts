import { encodeBase64Url, encodeText } from "@scripts/utils";
import { pemToBinary } from "../pemToBinary";
import { hashMapper } from "./hashMapper";
import type { Algorithm } from "./types";

export async function encrypt(
	content: string,
	key: string,
	algorithm: Algorithm,
) {
	const cryptoKey = await globalThis.crypto.subtle.importKey(
		"spki",
		pemToBinary(key) as BufferSource,
		{
			name: "RSA-OAEP",
			hash: hashMapper[algorithm],
		},
		false,
		["encrypt"],
	);

	const encryptedContent = await globalThis.crypto.subtle.encrypt(
		{
			name: "RSA-OAEP",
		},
		cryptoKey,
		encodeText(content) as BufferSource,
	);

	return encodeBase64Url(encryptedContent);
}
