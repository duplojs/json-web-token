import { HMAC } from "@scripts";

describe("sign", () => {
	it("signs content", async() => {
		const result = await HMAC.sign("hello", "secret", "HS256");

		expect(typeof result).toBe("string");
		expect(result.length).toBeGreaterThan(0);
	});

	it("changes with the algorithm", async() => {
		const hs256 = await HMAC.sign("hello", "secret", "HS256");
		const hs512 = await HMAC.sign("hello", "secret", "HS512");

		expect(hs256).not.toBe(hs512);
	});
});
