import { type RemoveKind, type Kind, type MaybePromise } from "@duplojs/utils";
import { createJsonWebTokenKind } from "@scripts/kind";

const cipherKind = createJsonWebTokenKind("cipher");

export interface Cipher<
	GenericAlgorithm extends string = string,
> extends Kind<typeof cipherKind.definition> {
	readonly algorithm: GenericAlgorithm;
	encrypt(element: string): MaybePromise<string>;
	decrypt(element: string): MaybePromise<string>;
}

export function cipherFactory<
	const GenericAlgorithm extends string,
	GenericMethodsParams extends unknown,
>(
	algorithm: GenericAlgorithm,
	methods: (params: GenericMethodsParams, algorithm: NoInfer<GenericAlgorithm>) => {
		encrypt(element: string): MaybePromise<string>;
		decrypt(element: string): MaybePromise<string>;
	},
): (params: NoInfer<GenericMethodsParams>) => Cipher<GenericAlgorithm> {
	return (params) => cipherKind.setTo(
		{
			algorithm,
			...methods(params, algorithm),
		} satisfies RemoveKind<Cipher<GenericAlgorithm>>,
	);
}
