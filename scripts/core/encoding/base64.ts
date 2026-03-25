/**
 * remove on TS 6.0
 */
const chunkSize = 0x8000;

/**
 * @internal
 */
export function encodeBase64(input: Uint8Array): string {
	const arr = [];
	for (let index = 0; index < input.length; index += chunkSize) {
		// @ts-expect-error - more efficient than doing it one by one
		arr.push(String.fromCharCode.apply(null, input.subarray(index, index + chunkSize)));
	}
	return btoa(arr.join(""));
}

/**
 * @internal
 */
export function decodeBase64(encoded: string): Uint8Array {
	const binary = atob(encoded);
	const output = new Uint8Array(binary.length);

	for (let index = 0; index < binary.length; index++) {
		output[index] = binary.charCodeAt(index);
	}

	return output;
}
