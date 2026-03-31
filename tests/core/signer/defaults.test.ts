import { HMAC, RSA, Signer } from "@scripts";

describe("createHS256 / createHS512 / createRS256 / createRS512", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("creates a hs256 signer", async() => {
		vi.spyOn(HMAC, "sign").mockResolvedValue("signature");
		vi.spyOn(HMAC, "verify").mockResolvedValue(true);
		const signer = Signer.createHS256({
			secret: "secret",
		});

		expect(signer.algorithm).toBe("HS256");
		await expect(signer.sign("hello")).resolves.toBe("signature");
		await expect(signer.verify("hello", "signature")).resolves.toBe(true);
		expect(HMAC.sign).toHaveBeenCalledWith("hello", "secret", "HS256");
		expect(HMAC.verify).toHaveBeenCalledWith("hello", "signature", "secret", "HS256");
	});

	it("creates a hs512 signer", async() => {
		vi.spyOn(HMAC, "sign").mockResolvedValue("signature");
		vi.spyOn(HMAC, "verify").mockResolvedValue(true);
		const signer = Signer.createHS512({
			secret: "secret",
		});

		expect(signer.algorithm).toBe("HS512");
		await expect(signer.sign("hello")).resolves.toBe("signature");
		await expect(signer.verify("hello", "signature")).resolves.toBe(true);
		expect(HMAC.sign).toHaveBeenCalledWith("hello", "secret", "HS512");
		expect(HMAC.verify).toHaveBeenCalledWith("hello", "signature", "secret", "HS512");
	});

	it("creates a rs256 signer", async() => {
		vi.spyOn(RSA, "sign").mockResolvedValue("signature");
		vi.spyOn(RSA, "verify").mockResolvedValue(true);
		const signer = Signer.createRS256({
			privateKey: "private-key",
			publicKey: "public-key",
		});

		expect(signer.algorithm).toBe("RS256");
		await expect(signer.sign("hello")).resolves.toBe("signature");
		await expect(signer.verify("hello", "signature")).resolves.toBe(true);
		expect(RSA.sign).toHaveBeenCalledWith("hello", "private-key", "RS256");
		expect(RSA.verify).toHaveBeenCalledWith("hello", "signature", "public-key", "RS256");
	});

	it("creates a rs512 signer", async() => {
		vi.spyOn(RSA, "sign").mockResolvedValue("signature");
		vi.spyOn(RSA, "verify").mockResolvedValue(true);
		const signer = Signer.createRS512({
			privateKey: "private-key",
			publicKey: "public-key",
		});

		expect(signer.algorithm).toBe("RS512");
		await expect(signer.sign("hello")).resolves.toBe("signature");
		await expect(signer.verify("hello", "signature")).resolves.toBe(true);
		expect(RSA.sign).toHaveBeenCalledWith("hello", "private-key", "RS512");
		expect(RSA.verify).toHaveBeenCalledWith("hello", "signature", "public-key", "RS512");
	});
});
