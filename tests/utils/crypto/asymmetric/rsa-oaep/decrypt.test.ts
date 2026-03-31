import { RSA_OAEP, encodeText } from "@scripts";

describe("decrypt", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("calls subtle decrypt", async() => {
		const cryptoKey = {} as CryptoKey;
		const importKey = vi.spyOn(globalThis.crypto.subtle, "importKey").mockResolvedValue(cryptoKey);
		const decrypt = vi.spyOn(globalThis.crypto.subtle, "decrypt").mockResolvedValue(encodeText("hello").buffer);

		await expect(RSA_OAEP.decrypt("AQID", "private-key", "RSA-OAEP")).resolves.toBe("hello");
		expect(importKey).toHaveBeenCalledWith(
			"pkcs8",
			encodeText("private-key"),
			{
				name: "RSA-OAEP",
				hash: "SHA-1",
			},
			false,
			["decrypt"],
		);
		expect(decrypt).toHaveBeenCalledWith(
			{
				name: "RSA-OAEP",
			},
			cryptoKey,
			new Uint8Array([1, 2, 3]),
		);
	});

	it("uses the selected hash", async() => {
		const cryptoKey = {} as CryptoKey;
		const importKey = vi.spyOn(globalThis.crypto.subtle, "importKey").mockResolvedValue(cryptoKey);
		vi.spyOn(globalThis.crypto.subtle, "decrypt").mockResolvedValue(encodeText("hello").buffer);

		await RSA_OAEP.decrypt("AQID", "private-key", "RSA-OAEP-256");

		expect(importKey).toHaveBeenCalledWith(
			"pkcs8",
			encodeText("private-key"),
			{
				name: "RSA-OAEP",
				hash: "SHA-256",
			},
			false,
			["decrypt"],
		);
	});
});
