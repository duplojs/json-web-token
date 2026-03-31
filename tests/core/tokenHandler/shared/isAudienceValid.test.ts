import { isAudienceValid } from "@scripts/core/tokenHandler/shared";

describe("isAudienceValid", () => {
	it("returns true without expected audience", () => {
		expect(isAudienceValid(undefined, "hello")).toBe(true);
	});

	it("returns false without token audience", () => {
		expect(isAudienceValid("hello", undefined)).toBe(false);
	});

	it("returns true when one audience matches", () => {
		expect(isAudienceValid(["hello", "world"], ["test", "world"])).toBe(true);
	});

	it("returns false when nothing matches", () => {
		expect(isAudienceValid(["hello", "world"], ["test", "value"])).toBe(false);
	});
});
