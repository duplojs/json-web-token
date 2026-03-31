import { A } from "@duplojs/utils";

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

	const expected = A.coalescing(expectedAudience);
	const actual = A.coalescing(tokenAudience);

	return expected.some(
		(value) => actual.includes(value),
	);
}
