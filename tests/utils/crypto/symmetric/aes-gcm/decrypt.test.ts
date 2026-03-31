import { AES_GCM } from "@scripts";

describe("decrypt", () => {
	it("decrypts content", async() => {
		const encrypted = await AES_GCM.encrypt(
			"hello",
			"1234567890abcdef",
			"A128GCM",
			new Uint8Array(12).fill(1),
		);

		await expect(
			AES_GCM.decrypt(
				encrypted.cipherText,
				"1234567890abcdef",
				encrypted.initializationVector,
				"A128GCM",
			),
		).resolves.toBe("hello");
	});

	it("fails with a wrong key", async() => {
		const encrypted = await AES_GCM.encrypt(
			"hello",
			"1234567890abcdef",
			"A128GCM",
			new Uint8Array(12).fill(1),
		);

		await expect(
			AES_GCM.decrypt(
				encrypted.cipherText,
				"1234567890abcdeg",
				encrypted.initializationVector,
				"A128GCM",
			),
		).rejects.toBeDefined();
	});
});
