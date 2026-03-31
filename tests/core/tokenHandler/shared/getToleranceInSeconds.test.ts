import { D } from "@duplojs/utils";
import { getToleranceInSeconds } from "@scripts/core/tokenHandler/shared";

describe("getToleranceInSeconds", () => {
	it("returns the tolerance in seconds", () => {
		const result = getToleranceInSeconds(D.createTime(2, "minute"));

		expect(result).toBe(120);
	});

	it("returns zero without tolerance", () => {
		const result = getToleranceInSeconds();

		expect(result).toBe(0);
	});
});
