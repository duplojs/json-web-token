const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function encodeText(input: string): Uint8Array {
	return textEncoder.encode(input);
}

export function decodeText(input: Uint8Array): string {
	return textDecoder.decode(input);
}
