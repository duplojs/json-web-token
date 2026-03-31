import { HMAC } from "@scripts";

describe("verify", () => {
	it("returns true with the right signature", async() => {
		const signature = await HMAC.sign("hello", "secret", "HS256");

		await expect(HMAC.verify("hello", signature, "secret", "HS256")).resolves.toBe(true);
	});

	it("returns false with a wrong signature", async() => {
		const signature = await HMAC.sign("hello", "secret", "HS256");

		await expect(HMAC.verify("hello!", signature, "secret", "HS256")).resolves.toBe(false);
	});
});
