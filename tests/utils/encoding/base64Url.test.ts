
import { decodeBase64Url, encodeBase64Url, isBase64Url, encodeText } from "@scripts";

describe("encodeBase64Url / decodeBase64Url / isBase64Url", () => {
	it("encodes a string", () => {
		const result = encodeBase64Url("Hello");

		expect(result).toBe("SGVsbG8");
	});

	it("encodes bytes with url safe chars", () => {
		expect(encodeBase64Url(new Uint8Array([251, 239, 255]))).toBe("--__");
	});

	it("decodes a base64url string", () => {
		const result = decodeBase64Url("SGVsbG8");

		expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
	});

	it("decodes a base64url buffer", () => {
		const encoded = encodeText("SGVsbG8");

		expect(decodeBase64Url(encoded.buffer)).toEqual(
			new Uint8Array([72, 101, 108, 108, 111]),
		);
	});

	it("checks a base64url string", () => {
		expect(isBase64Url("SGVsbG8")).toBe(true);
		expect(isBase64Url("--__")).toBe(true);
		expect(isBase64Url("a+b")).toBe(false);
		expect(isBase64Url("abcde")).toBe(false);
	});
});
