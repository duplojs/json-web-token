import { decodeBase64Url, encodeText } from "@scripts/utils";
import { pemToBinary } from "../pemToBinary";
import type { Algorithm } from "./types";
import { hashMapper } from "./hashMapper";

export async function verify(
	content: string,
	signature: string,
	key: string,
	algorithm: Algorithm,
) {
	const cryptoKey = await globalThis.crypto.subtle.importKey(
		"spki",
		pemToBinary(key) as BufferSource,
		{
			name: "RSASSA-PKCS1-v1_5",
			hash: hashMapper[algorithm],
		},
		false,
		["verify"],
	);

	return globalThis.crypto.subtle.verify(
		{
			name: "RSASSA-PKCS1-v1_5",
			hash: hashMapper[algorithm],
		},
		cryptoKey,
		decodeBase64Url(signature) as BufferSource,
		encodeText(content) as BufferSource,
	);
}
