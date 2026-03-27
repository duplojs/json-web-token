import type { MaybePromise, Kind, RemoveKind } from "@duplojs/utils";
import { createJsonWebTokenKind } from "@scripts/kind";

const signerKind = createJsonWebTokenKind("signer");

export interface Signer<
	GenericAlgorithm extends string = string,
> extends Kind<typeof signerKind.definition> {
	readonly algorithm: GenericAlgorithm;
	sign(content: string): MaybePromise<string>;
	verify(content: string, signature: string): MaybePromise<boolean>;
}

export function signerFactory<
	const GenericAlgorithm extends string,
	GenericMethodsParams extends unknown,
>(
	algorithm: GenericAlgorithm,
	methods: (params: GenericMethodsParams, algorithm: NoInfer<GenericAlgorithm>) => {
		sign(content: string): MaybePromise<string>;
		verify(content: string, signature: string): MaybePromise<boolean>;
	},
): (params: NoInfer<GenericMethodsParams>) => Signer<GenericAlgorithm> {
	return (params) => signerKind
		.setTo(
			{
				algorithm,
				...methods(params, algorithm),
			} satisfies RemoveKind<Signer>,
		);
}
