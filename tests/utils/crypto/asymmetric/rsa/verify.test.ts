import { RSA, encodeText } from "@scripts";

describe("verify", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("calls subtle verify", async() => {
		const cryptoKey = {} as CryptoKey;
		const importKey = vi.spyOn(globalThis.crypto.subtle, "importKey").mockResolvedValue(cryptoKey);
		const verify = vi.spyOn(globalThis.crypto.subtle, "verify").mockResolvedValue(true);

		await expect(RSA.verify("hello", "AQID", "public-key", "RS256")).resolves.toBe(true);
		expect(importKey).toHaveBeenCalledWith(
			"spki",
			encodeText("public-key"),
			{
				name: "RSASSA-PKCS1-v1_5",
				hash: "SHA-256",
			},
			false,
			["verify"],
		);
		expect(verify).toHaveBeenCalledWith(
			{
				name: "RSASSA-PKCS1-v1_5",
				hash: "SHA-256",
			},
			cryptoKey,
			new Uint8Array([1, 2, 3]),
			encodeText("hello"),
		);
	});

	it("returns false when subtle verify fails", async() => {
		vi.spyOn(globalThis.crypto.subtle, "importKey").mockResolvedValue({} as CryptoKey);
		vi.spyOn(globalThis.crypto.subtle, "verify").mockResolvedValue(false);

		await expect(RSA.verify("hello", "AQID", "public-key", "RS256")).resolves.toBe(false);
	});
});
