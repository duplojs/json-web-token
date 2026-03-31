import { D } from "@duplojs/utils";

export function nowInSeconds(func?: () => D.TheDate) {
	const now = func?.() ?? D.now();

	return Math.floor(D.toTimestamp(now) / 1000);
}
