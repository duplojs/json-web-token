import { decodeText, encodeText } from "@scripts";

describe("encodeText / decodeText", () => {
	it("encodes a string", () => {
		const value = "Hello world";
		const result = encodeText(value);

		expect(result).toEqual(new TextEncoder().encode(value));
	});

	it("decodes an Uint8Array", () => {
		const value = new TextEncoder().encode("Hello world");
		const result = decodeText(value);

		expect(result).toBe("Hello world");
	});

	it("decodes an ArrayBuffer", () => {
		const value = new TextEncoder().encode("Hello world").buffer;

		expect(decodeText(value)).toBe("Hello world");
	});
});
