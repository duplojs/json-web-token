import { RSA_OAEP, encodeText } from "@scripts";

describe("encrypt", () => {
	const publicKey = "-----BEGIN PUBLIC KEY-----\ncHVibGljLWtleQ==\n-----END PUBLIC KEY-----";

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("calls subtle encrypt", async() => {
		const cryptoKey = {} as CryptoKey;
		const importKey = vi.spyOn(globalThis.crypto.subtle, "importKey").mockResolvedValue(cryptoKey);
		const encrypt = vi.spyOn(globalThis.crypto.subtle, "encrypt").mockResolvedValue(new Uint8Array([1, 2, 3]).buffer);

		await expect(RSA_OAEP.encrypt("hello", publicKey, "RSA-OAEP")).resolves.toBe("AQID");
		expect(importKey).toHaveBeenCalledWith(
			"spki",
			encodeText("public-key"),
			{
				name: "RSA-OAEP",
				hash: "SHA-1",
			},
			false,
			["encrypt"],
		);
		expect(encrypt).toHaveBeenCalledWith(
			{
				name: "RSA-OAEP",
			},
			cryptoKey,
			encodeText("hello"),
		);
	});

	it("uses the selected hash", async() => {
		const cryptoKey = {} as CryptoKey;
		const importKey = vi.spyOn(globalThis.crypto.subtle, "importKey").mockResolvedValue(cryptoKey);
		vi.spyOn(globalThis.crypto.subtle, "encrypt").mockResolvedValue(new Uint8Array([1]).buffer);

		await RSA_OAEP.encrypt("hello", publicKey, "RSA-OAEP-256");

		expect(importKey).toHaveBeenCalledWith(
			"spki",
			encodeText("public-key"),
			{
				name: "RSA-OAEP",
				hash: "SHA-256",
			},
			false,
			["encrypt"],
		);
	});
});
