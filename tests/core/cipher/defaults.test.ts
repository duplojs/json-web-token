import { Cipher, RSA_OAEP } from "@scripts";

describe("createRSAOAEP / createRSAOAEP256", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("creates a rsa oaep cipher", async() => {
		vi.spyOn(RSA_OAEP, "encrypt").mockResolvedValue("encrypted");
		vi.spyOn(RSA_OAEP, "decrypt").mockResolvedValue("decrypted");
		const cipher = Cipher.createRSAOAEP({
			publicKey: "public-key",
			privateKey: "private-key",
		});

		expect(cipher.algorithm).toBe("RSA-OAEP");
		await expect(cipher.encrypt("hello")).resolves.toBe("encrypted");
		await expect(cipher.decrypt("hello")).resolves.toBe("decrypted");
		expect(RSA_OAEP.encrypt).toHaveBeenCalledWith("hello", "public-key", "RSA-OAEP");
		expect(RSA_OAEP.decrypt).toHaveBeenCalledWith("hello", "private-key", "RSA-OAEP");
	});

	it("creates a rsa oaep 256 cipher", async() => {
		vi.spyOn(RSA_OAEP, "encrypt").mockResolvedValue("encrypted");
		vi.spyOn(RSA_OAEP, "decrypt").mockResolvedValue("decrypted");
		const cipher = Cipher.createRSAOAEP256({
			publicKey: "public-key",
			privateKey: "private-key",
		});

		expect(cipher.algorithm).toBe("RSA-OAEP-256");
		await expect(cipher.encrypt("hello")).resolves.toBe("encrypted");
		await expect(cipher.decrypt("hello")).resolves.toBe("decrypted");
		expect(RSA_OAEP.encrypt).toHaveBeenCalledWith("hello", "public-key", "RSA-OAEP-256");
		expect(RSA_OAEP.decrypt).toHaveBeenCalledWith("hello", "private-key", "RSA-OAEP-256");
	});
});
