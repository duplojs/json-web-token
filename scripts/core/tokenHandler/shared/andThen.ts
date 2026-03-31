import type { MaybePromise } from "@duplojs/utils";

export function andThen<
	GenericInput extends unknown,
	GenericOutput extends unknown,
>(
	value: MaybePromise<GenericInput>,
	callback: (value: GenericInput) => MaybePromise<GenericOutput>,
): MaybePromise<GenericOutput> {
	if (value instanceof Promise) {
		return value.then(callback);
	}

	return callback(value);
}
