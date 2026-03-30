const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function encodeText(input: string) {
	return textEncoder.encode(input);
}

export function decodeText(input: Uint8Array | ArrayBuffer) {
	return textDecoder.decode(
		input instanceof Uint8Array
			? input
			: new Uint8Array(input),
	);
}
