import { Signer } from "@scripts";
import { resolveSigner } from "@scripts/core/tokenHandler/shared";

describe("resolveSigner", () => {
	it("returns the signer object", () => {
		const signer = Signer.factory(
			"TEST",
			() => ({
				sign: (value) => value,
				verify: () => true,
			}),
		)({});

		expect(resolveSigner(signer, {})).toBe(signer);
	});

	it("calls the signer creator", () => {
		const signer = Signer.factory(
			"TEST",
			() => ({
				sign: (value) => value,
				verify: () => true,
			}),
		)({});
		const createSigner = vi.fn(() => signer);

		expect(resolveSigner(createSigner as never, { key: "value" })).toBe(signer);
		expect(createSigner).toHaveBeenCalledWith({ key: "value" });
	});
});
