import type { MaybePromise, Kind } from "@duplojs/utils";
declare const signerKind: import("@duplojs/utils").KindHandler<import("@duplojs/utils").KindDefinition<"@DuplojsJsonWebToken/signer", unknown>>;
export interface Signer<GenericAlgorithm extends string = string> extends Kind<typeof signerKind.definition> {
    readonly algorithm: GenericAlgorithm;
    sign(content: string): MaybePromise<string>;
    verify(content: string, signature: string): MaybePromise<boolean>;
}
export interface CreateSigner<GenericAlgorithm extends string, GenericParams extends unknown> {
    readonly algorithm: GenericAlgorithm;
    (params: NoInfer<GenericParams>): Signer<GenericAlgorithm>;
}
/**
 * **Creates a signer creator from custom methods.**
 * 
 * ### Parameters
 * - `algorithm`: Signer algorithm name
 * - `methods`: Build sign and verify
 * 
 * ### Example
 * ```ts
 * const createApiSigner = Signer.factory(
 * 	"API",
 * 	(params: { secret: string }, algorithm) => ({
 * 		sign(content) {
 * 			return `${algorithm}:${params.secret}:${content}`;
 * 		},
 * 		verify(content, signature) {
 * 			return signature === `${algorithm}:${params.secret}:${content}`;
 * 		},
 * 	}),
 * );
 * 
 * const signer = createApiSigner({
 * 	secret: "my-secret",
 * });
 * 
 * const signature = await signer.sign("user:1");
 * const isValid = await signer.verify("user:1", signature);
 * ```
 * 
 * @remarks
 * - The returned creator also exposes `algorithm`.
 * - `sign` and `verify` can be sync or async.
 * 
 * @see https://json-web-token.duplojs.dev/en/v0/api/signer
 * 
 */
export declare function factory<const GenericAlgorithm extends string, GenericMethodsParams extends unknown>(algorithm: GenericAlgorithm, methods: (params: GenericMethodsParams, algorithm: NoInfer<GenericAlgorithm>) => {
    sign(content: string): MaybePromise<string>;
    verify(content: string, signature: string): MaybePromise<boolean>;
}): CreateSigner<GenericAlgorithm, GenericMethodsParams>;
export {};
