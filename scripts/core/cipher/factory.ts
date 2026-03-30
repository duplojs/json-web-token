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

export interface CreateCipher<
	GenericAlgorithm extends string,
	GenericParams extends unknown,
> {
	readonly algorithm: GenericAlgorithm;
	(params: NoInfer<GenericParams>): Cipher<GenericAlgorithm>;
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
): CreateCipher<GenericAlgorithm, GenericMethodsParams> {
	return Object.assign(
		(params: NoInfer<GenericMethodsParams>) => cipherKind
			.setTo(
					{
						algorithm,
						...methods(params, algorithm),
					} satisfies RemoveKind<Cipher>,
			),
		{
			algorithm,
		},
	);
}
