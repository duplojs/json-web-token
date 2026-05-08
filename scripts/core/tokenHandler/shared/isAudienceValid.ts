import * as AA from "@duplojs/utils/array";

export function isAudienceValid(
	expectedAudience: string | string[] | undefined,
	tokenAudience: string | string[] | undefined,
) {
	if (typeof expectedAudience === "undefined") {
		return true;
	}

	if (typeof tokenAudience === "undefined") {
		return false;
	}

	const expected = AA.coalescing(expectedAudience);
	const actual = AA.coalescing(tokenAudience);

	return expected.some(
		(value) => actual.includes(value),
	);
}
