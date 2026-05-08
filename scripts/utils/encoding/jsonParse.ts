import type { Json } from "@duplojs/utils";

export function jsonParse(value: string) {
	try {
		return JSON.parse(value) as Json;
	} catch {
		return undefined;
	}
}
