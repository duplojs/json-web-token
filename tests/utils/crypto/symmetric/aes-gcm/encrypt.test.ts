import { AES_GCM, encodeBase64Url } from "@scripts";

describe("encrypt", () => {
	it("encrypts content", async() => {
		const initializationVector = new Uint8Array(12).fill(1);
		const result = await AES_GCM.encrypt(
			"hello",
			"1234567890abcdef",
			"A128GCM",
			initializationVector,
		);

		expect(result.initializationVector).toBe(encodeBase64Url(initializationVector));
		expect(typeof result.cipherText).toBe("string");
		expect(result.cipherText.length).toBeGreaterThan(0);
	});

	it("uses the default initialization vector", async() => {
		const result = await AES_GCM.encrypt(
			"hello",
			"1234567890abcdef",
			"A128GCM",
		);

		expect(typeof result.initializationVector).toBe("string");
		expect(result.initializationVector.length).toBeGreaterThan(0);
		await expect(
			AES_GCM.decrypt(
				result.cipherText,
				"1234567890abcdef",
				result.initializationVector,
				"A128GCM",
			),
		).resolves.toBe("hello");
	});

	it("changes with the initialization vector", async() => {
		const first = await AES_GCM.encrypt(
			"hello",
			"1234567890abcdef",
			"A128GCM",
			new Uint8Array(12).fill(1),
		);
		const second = await AES_GCM.encrypt(
			"hello",
			"1234567890abcdef",
			"A128GCM",
			new Uint8Array(12).fill(2),
		);

		expect(first.cipherText).not.toBe(second.cipherText);
	});
});
