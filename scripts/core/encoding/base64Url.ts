import { encodeBase64, decodeBase64 } from "./base64";
import { encodeText, decodeText } from "./text";

export function decodeBase64Url(input: Uint8Array | string): Uint8Array {
	let encoded = input;
	if (encoded instanceof Uint8Array) {
		encoded = decodeText(encoded);
	}
	encoded = encoded
		.replace(/-/g, "+")
		.replace(/_/g, "/");

	return decodeBase64(encoded);
}

export function encodeBase64Url(input: Uint8Array | string): string {
	let unencoded = input;
	if (typeof unencoded === "string") {
		unencoded = encodeText(unencoded);
	}

	return encodeBase64(unencoded)
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}
