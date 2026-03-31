import { Cipher } from "@scripts";
import { resolveCipher } from "@scripts/core/tokenHandler/shared";

describe("resolveCipher", () => {
	it("returns the cipher object", () => {
		const cipher = Cipher.factory(
			"TEST",
			() => ({
				encrypt: (value) => value,
				decrypt: (value) => value,
			}),
		)({});

		expect(resolveCipher(cipher, {})).toBe(cipher);
	});

	it("calls the cipher creator", () => {
		const cipher = Cipher.factory(
			"TEST",
			() => ({
				encrypt: (value) => value,
				decrypt: (value) => value,
			}),
		)({});
		const createCipher = vi.fn(() => cipher);

		expect(resolveCipher(createCipher as never, { key: "value" })).toBe(cipher);
		expect(createCipher).toHaveBeenCalledWith({ key: "value" });
	});

	it("returns undefined without cipher", () => {
		expect(resolveCipher(undefined, {})).toBeUndefined();
	});
});
