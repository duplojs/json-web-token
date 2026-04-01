import { RSA, encodeText } from "@scripts";

describe("sign", () => {
	const privateKey = "-----BEGIN PRIVATE KEY-----\ncHJpdmF0ZS1rZXk=\n-----END PRIVATE KEY-----";

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("calls subtle sign", async() => {
		const cryptoKey = {} as CryptoKey;
		const importKey = vi.spyOn(globalThis.crypto.subtle, "importKey").mockResolvedValue(cryptoKey);
		const sign = vi.spyOn(globalThis.crypto.subtle, "sign").mockResolvedValue(new Uint8Array([1, 2, 3]).buffer);

		await expect(RSA.sign("hello", privateKey, "RS256")).resolves.toBe("AQID");
		expect(importKey).toHaveBeenCalledWith(
			"pkcs8",
			encodeText("private-key"),
			{
				name: "RSASSA-PKCS1-v1_5",
				hash: "SHA-256",
			},
			false,
			["sign"],
		);
		expect(sign).toHaveBeenCalledWith(
			{
				name: "RSASSA-PKCS1-v1_5",
				hash: "SHA-256",
			},
			cryptoKey,
			encodeText("hello"),
		);
	});

	it("uses the selected hash", async() => {
		const cryptoKey = {} as CryptoKey;
		const importKey = vi.spyOn(globalThis.crypto.subtle, "importKey").mockResolvedValue(cryptoKey);
		vi.spyOn(globalThis.crypto.subtle, "sign").mockResolvedValue(new Uint8Array([1]).buffer);

		await RSA.sign("hello", privateKey, "RS512");

		expect(importKey).toHaveBeenCalledWith(
			"pkcs8",
			encodeText("private-key"),
			{
				name: "RSASSA-PKCS1-v1_5",
				hash: "SHA-512",
			},
			false,
			["sign"],
		);
	});
});
