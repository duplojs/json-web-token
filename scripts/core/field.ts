import type { DP, Kind, MaybePromise } from "@duplojs/utils";
import { createJsonWebTokenKind } from "@scripts/kind";

const fieldKind = createJsonWebTokenKind("field");

export type Field<
	GenericDataParser extends DP.DataParser = DP.DataParser,
> = Kind<typeof fieldKind.definition> & {
	readonly dataParser: GenericDataParser;
	validator(input: DP.Output<GenericDataParser>): MaybePromise<boolean>;
};

export function createField<
	const GenericDataParser extends DP.DataParser,
>(
	dataParser: GenericDataParser,
	validator: (input: DP.Output<GenericDataParser>) => MaybePromise<boolean>,
): Field<GenericDataParser> {
	return fieldKind.setTo({
		dataParser,
		validator,
	});
}
