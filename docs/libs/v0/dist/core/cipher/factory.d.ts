import type { Kind, MaybePromise } from "@duplojs/utils";
declare const cipherKind: import("@duplojs/utils").KindHandler<import("@duplojs/utils").KindDefinition<"@DuplojsJsonWebToken/cipher", unknown>>;
export interface Cipher<GenericAlgorithm extends string = string> extends Kind<typeof cipherKind.definition> {
    readonly algorithm: GenericAlgorithm;
    encrypt(element: string): MaybePromise<string>;
    decrypt(element: string): MaybePromise<string>;
}
export interface CreateCipher<GenericAlgorithm extends string, GenericParams extends unknown> {
    readonly algorithm: GenericAlgorithm;
    (params: NoInfer<GenericParams>): Cipher<GenericAlgorithm>;
}
/**
 * **Creates a cipher creator from custom methods.**
 * 
 * ### Parameters
 * - `algorithm`: Cipher algorithm name
 * - `methods`: Build encrypt and decrypt
 * 
 * ### Example
 * ```ts
 * const createWrappedCipher = Cipher.factory(
 * 	"WRAPPED",
 * 	(params: { prefix: string }, algorithm) => ({
 * 		encrypt(value) {
 * 			return encodeBase64Url(`${algorithm}:${params.prefix}:${value}`);
 * 		},
 * 		decrypt(value) {
 * 			const rawValue = decodeText(decodeBase64Url(value));
 * 
 * 			return rawValue.slice(`${algorithm}:${params.prefix}:`.length);
 * 		},
 * 	}),
 * );
 * 
 * const cipher = createWrappedCipher({
 * 	prefix: "internal",
 * });
 * 
 * const encrypted = await cipher.encrypt("payload");
 * const decrypted = await cipher.decrypt(encrypted);
 * ```
 * 
 * @remarks
 * - The returned creator also exposes `algorithm`.
 * - `encrypt` and `decrypt` can be sync or async.
 * 
 * @see https://json-web-token.duplojs.dev/en/v0/api/cipher
 * 
 */
export declare function factory<const GenericAlgorithm extends string, GenericMethodsParams extends unknown>(algorithm: GenericAlgorithm, methods: (params: GenericMethodsParams, algorithm: NoInfer<GenericAlgorithm>) => {
    encrypt(element: string): MaybePromise<string>;
    decrypt(element: string): MaybePromise<string>;
}): CreateCipher<GenericAlgorithm, GenericMethodsParams>;
export {};
