import type { IsEqual } from "@duplojs/utils";
export type UnknownToUndefined<GenericValue extends unknown> = IsEqual<GenericValue, unknown> extends true ? undefined : GenericValue;
