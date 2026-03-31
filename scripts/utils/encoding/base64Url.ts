import { encodeBase64, decodeBase64 } from "./base64";
import { encodeText, decodeText } from "./text";

const base64UrlRegex = /^[A-Za-z0-9_-]+$/;

export function isBase64Url(input: string) {
	return base64UrlRegex.test(input)
		&& (input.length % 4) !== 1;
}

export function decodeBase64Url(input: Uint8Array | ArrayBuffer | string) {
	let encoded = input;
	if (encoded instanceof Uint8Array || encoded instanceof ArrayBuffer) {
		encoded = decodeText(encoded);
	}
	encoded = encoded
		.replace(/-/g, "+")
		.replace(/_/g, "/");

	return decodeBase64(encoded);
}

export function encodeBase64Url(input: Uint8Array | ArrayBuffer | string) {
	let unencoded = input;
	if (typeof unencoded === "string") {
		unencoded = encodeText(unencoded);
	}

	return encodeBase64(unencoded)
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}
