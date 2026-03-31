import { decodeBase64, encodeBase64 } from "@scripts";

describe("encodeBase64 / decodeBase64", () => {
	it("encodes a Uint8Array", () => {
		const value = new Uint8Array([72, 101, 108, 108, 111]);
		const result = encodeBase64(value);

		expect(result).toBe("SGVsbG8=");
	});

	it("encodes an ArrayBuffer", () => {
		const value = new Uint8Array([72, 101, 108, 108, 111]).buffer;

		expect(encodeBase64(value)).toBe("SGVsbG8=");
	});

	it("decodes a base64 string", () => {
		const result = decodeBase64("SGVsbG8=");

		expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
	});

	it("round trips a big buffer", () => {
		const value = Uint8Array.from(
			{ length: 0x8000 + 5 },
			(__, index) => index % 256,
		);

		expect(decodeBase64(encodeBase64(value))).toEqual(value);
	});
});
