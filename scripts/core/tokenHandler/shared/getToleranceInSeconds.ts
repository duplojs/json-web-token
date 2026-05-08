import * as DD from "@duplojs/utils/date";

export function getToleranceInSeconds(tolerance?: DD.TheTime) {
	return tolerance
		? DD.computeTime(tolerance, "second")
		: 0;
}
