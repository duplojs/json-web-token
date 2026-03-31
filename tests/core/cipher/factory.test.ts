import type { ExpectType } from "@duplojs/utils";
import { Cipher } from "@scripts";

describe("factory", () => {
	it("creates a cipher creator", () => {
		const createCipher = Cipher.factory(
			"TEST",
			(params: { prefix: string }, algorithm) => ({
				encrypt: (element) => `${algorithm}:${params.prefix}:${element}`,
				decrypt: (element) => `${params.prefix}:${algorithm}:${element}`,
			}),
		);
		const cipher = createCipher({ prefix: "value" });

		type check = ExpectType<typeof createCipher.algorithm, "TEST", "strict">;

		expect(createCipher.algorithm).toBe("TEST");
		expect(cipher.encrypt("hello")).toBe("TEST:value:hello");
		expect(cipher.decrypt("hello")).toBe("value:TEST:hello");
	});

	it("passes the params and algorithm to methods", () => {
		const methods = vi.fn((params: { prefix: string }, algorithm: "TEST") => ({
			encrypt: (element: string) => `${algorithm}:${params.prefix}:${element}`,
			decrypt: (element: string) => `${params.prefix}:${algorithm}:${element}`,
		}));
		const createCipher = Cipher.factory("TEST", methods);
		const cipher = createCipher({ prefix: "value" });

		expect(methods).toHaveBeenCalledWith({ prefix: "value" }, "TEST");
		expect(cipher.encrypt("hello")).toBe("TEST:value:hello");
	});
});
