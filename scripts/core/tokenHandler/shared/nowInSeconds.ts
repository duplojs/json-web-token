import * as DD from "@duplojs/utils/date";

export function nowInSeconds(func?: () => DD.TheDate) {
	const now = func?.() ?? DD.now();

	return Math.floor(DD.toTimestamp(now) / 1000);
}
