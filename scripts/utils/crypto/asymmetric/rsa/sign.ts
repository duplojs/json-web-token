import { encodeBase64Url, encodeText } from "@scripts/utils";
import { pemToBinary } from "../pemToBinary";
import { hashMapper } from "./hashMapper";
import type { Algorithm } from "./types";

export async function sign(
	content: string,
	key: string,
	algorithm: Algorithm,
) {
	const cryptoKey = await globalThis.crypto.subtle.importKey(
		"pkcs8",
		pemToBinary(key) as BufferSource,
		{
			name: "RSASSA-PKCS1-v1_5",
			hash: hashMapper[algorithm],
		},
		false,
		["sign"],
	);

	const signature = await globalThis.crypto.subtle.sign(
		{
			name: "RSASSA-PKCS1-v1_5",
			hash: hashMapper[algorithm],
		},
		cryptoKey,
		encodeText(content) as BufferSource,
	);

	return encodeBase64Url(signature);
}
