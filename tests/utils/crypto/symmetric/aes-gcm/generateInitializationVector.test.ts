import { AES_GCM } from "@scripts";

describe("generateInitializationVector", () => {
	it("returns 12 bytes", () => {
		const result = AES_GCM.generateInitializationVector();

		expect(result).toBeInstanceOf(Uint8Array);
		expect(result).toHaveLength(12);
	});
});
