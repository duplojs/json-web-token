import { createKindNamespace } from "@duplojs/utils";

declare module "@duplojs/utils" {
	interface ReservedKindNamespace {
		DuplojsJsonWebToken: true;
	}
}

export const createJsonWebTokenKind = createKindNamespace(
	// @ts-expect-error reserved kind namespace
	"DuplojsJsonWebToken",
);
