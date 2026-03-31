import { D } from "@duplojs/utils";

export function getToleranceInSeconds(tolerance?: D.TheTime) {
	return tolerance
		? D.computeTime(tolerance, "second")
		: 0;
}
