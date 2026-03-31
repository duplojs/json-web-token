import { D } from "@duplojs/utils";
import { nowInSeconds } from "@scripts/core/tokenHandler/shared";

describe("nowInSeconds", () => {
	it("uses the config now function", () => {
		const now = D.now();
		const result = nowInSeconds(() => now);

		expect(result).toBe(Math.floor(D.toTimestamp(now) / 1000));
	});

	it("uses D.now without config now", () => {
		const before = Math.floor(D.toTimestamp(D.now()) / 1000);

		const result = nowInSeconds();
		const after = Math.floor(D.toTimestamp(D.now()) / 1000);

		expect(result).toBeGreaterThanOrEqual(before);
		expect(result).toBeLessThanOrEqual(after);
	});
});
