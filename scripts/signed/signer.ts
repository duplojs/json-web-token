import { type MaybePromise, type Kind } from "@duplojs/utils";
import { createJsonWebTokenKind } from "@scripts/kind";

const signerKind = createJsonWebTokenKind("signer");

export interface Signer<
	GenericAlgorithm extends string,
> extends Kind<typeof signerKind.definition> {
	readonly algorithm: GenericAlgorithm;
	sign(content: string): MaybePromise<string>;
	verify(content: string, signature: string): MaybePromise<boolean>;
}

export function createSigner<
	const GenericAlgorithm extends string,
>(
	params: {
		readonly algorithm: GenericAlgorithm;
		sign(content: string): MaybePromise<string>;
		verify(content: string, signature: string): MaybePromise<boolean>;
	},
): Signer<GenericAlgorithm> {
	return signerKind.setTo(
		params,
	);
}
