import type { ExpectType } from "@duplojs/utils";
import { Signer } from "@scripts";

describe("factory", () => {
	it("creates a signer creator", () => {
		const createSigner = Signer.factory(
			"TEST",
			(params: { prefix: string }, algorithm) => ({
				sign: (content) => `${algorithm}:${params.prefix}:${content}`,
				verify: (content, signature) => signature === `${algorithm}:${params.prefix}:${content}`,
			}),
		);
		const signer = createSigner({ prefix: "value" });

		type check = ExpectType<typeof createSigner.algorithm, "TEST", "strict">;

		expect(createSigner.algorithm).toBe("TEST");
		expect(signer.sign("hello")).toBe("TEST:value:hello");
		expect(signer.verify("hello", "TEST:value:hello")).toBe(true);
	});

	it("passes the params and algorithm to methods", () => {
		const methods = vi.fn((params: { prefix: string }, algorithm: "TEST") => ({
			sign: (content: string) => `${algorithm}:${params.prefix}:${content}`,
			verify: (content: string, signature: string) => signature === `${algorithm}:${params.prefix}:${content}`,
		}));
		const createSigner = Signer.factory("TEST", methods);
		const signer = createSigner({ prefix: "value" });

		expect(methods).toHaveBeenCalledWith({ prefix: "value" }, "TEST");
		expect(signer.sign("hello")).toBe("TEST:value:hello");
	});
});
