import { type Kind, type SimplifyTopLevel } from "@duplojs/utils";
import type * as DD from "@duplojs/utils/date";
import * as EE from "@duplojs/utils/either";
import * as DP from "@duplojs/utils/dataParser";
import type * as OO from "@duplojs/utils/object";
import type { CreateSigner, Signer } from "../signer";
import type { CreateCipher, Cipher } from "../cipher";
import type { ExtractRequiredKeys, UnknownToUndefined } from "../types";
declare const tokenHandlerConfigDataParser: DP.DataParserObject<{
    readonly shape: {
        readonly issuer: DP.DataParserOptional<{
            readonly inner: DP.DataParserString<{
                readonly errorMessage?: string | undefined;
                readonly coerce: boolean;
                readonly checkers: readonly [];
            }>;
            readonly coalescingValue: unknown;
            readonly errorMessage?: string | undefined;
            readonly checkers: readonly [];
        }>;
        readonly audience: DP.DataParserOptional<{
            readonly inner: DP.DataParserUnion<{
                readonly options: readonly [DP.DataParserString<{
                    readonly errorMessage?: string | undefined;
                    readonly coerce: boolean;
                    readonly checkers: readonly [];
                }>, DP.DataParserArray<{
                    readonly element: DP.DataParserString<{
                        readonly errorMessage?: string | undefined;
                        readonly coerce: boolean;
                        readonly checkers: readonly [];
                    }>;
                    readonly errorMessage?: string | undefined;
                    readonly checkers: readonly [];
                }>];
                readonly errorMessage?: string | undefined;
                readonly checkers: readonly [];
            }>;
            readonly coalescingValue: unknown;
            readonly errorMessage?: string | undefined;
            readonly checkers: readonly [];
        }>;
        readonly subject: DP.DataParserOptional<{
            readonly inner: DP.DataParserString<{
                readonly errorMessage?: string | undefined;
                readonly coerce: boolean;
                readonly checkers: readonly [];
            }>;
            readonly coalescingValue: unknown;
            readonly errorMessage?: string | undefined;
            readonly checkers: readonly [];
        }>;
        readonly maxAge: DP.DataParserTime<{
            readonly errorMessage?: string | undefined;
            readonly coerce: boolean;
            readonly checkers: readonly [];
        }>;
    };
    readonly errorMessage?: string | undefined;
    readonly optimizedShape: import("@duplojs/utils").Memoized<{
        readonly key: string;
        readonly value: DP.DataParser;
    }[]>;
    readonly checkers: readonly [];
}>;
export type TokenHandlerConfig<GenericSignerAlgorithm extends string = string, GenericCipherAlgorithm extends string = string> = SimplifyTopLevel<{
    now?(): DD.TheDate;
    signer: Signer<GenericSignerAlgorithm> | CreateSigner<GenericSignerAlgorithm, any>;
    cipher?: Cipher<GenericCipherAlgorithm> | CreateCipher<GenericCipherAlgorithm, any>;
} & DP.Output<typeof tokenHandlerConfigDataParser>>;
type SignerAlgorithm<GenericSignerAlgorithm extends Signer | CreateSigner<string, any>> = GenericSignerAlgorithm extends (...args: any[]) => {
    algorithm: infer InferredAlgorithm;
} ? InferredAlgorithm : GenericSignerAlgorithm extends {
    algorithm: infer InferredAlgorithm;
} ? InferredAlgorithm : never;
export type DefaultTokenHeaderKeys = "typ" | "alg";
export type DefaultTokenPayloadKeys = "iss" | "sub" | "aud" | "exp" | "iat";
export interface DecodeOutput<GenericTokenHandlerConfig extends TokenHandlerConfig, GenericCustomPayload extends Record<string, unknown>, GenericCustomHeader extends Record<string, unknown>> {
    readonly header: SimplifyTopLevel<{
        readonly typ: "JWT";
        readonly alg: SignerAlgorithm<GenericTokenHandlerConfig["signer"]>;
    } & Readonly<GenericCustomHeader>>;
    readonly payload: SimplifyTopLevel<{
        readonly iss: UnknownToUndefined<GenericTokenHandlerConfig["issuer"]>;
        readonly sub: UnknownToUndefined<GenericTokenHandlerConfig["subject"]>;
        readonly aud: UnknownToUndefined<GenericTokenHandlerConfig["audience"]>;
        readonly exp: number;
        readonly iat: number;
    } & Readonly<GenericCustomPayload>>;
}
type VerifyParams<GenericTokenHandlerConfig extends TokenHandlerConfig> = (GenericTokenHandlerConfig["signer"] extends (params: infer InferredSignerParams) => any ? {
    signer: InferredSignerParams;
} : {}) & (GenericTokenHandlerConfig["cipher"] extends (params: infer InferredCipherParams) => any ? {
    cipher: InferredCipherParams;
} : {}) & {
    tolerance?: DD.TheTime;
};
type CreateParams<GenericTokenHandlerConfig extends TokenHandlerConfig, GenericCustomHeader extends Record<string, unknown>> = (GenericTokenHandlerConfig["signer"] extends (params: infer InferredSignerParams) => any ? {
    signer: InferredSignerParams;
} : {}) & (GenericTokenHandlerConfig["cipher"] extends (params: infer InferredCipherParams) => any ? {
    cipher: InferredCipherParams;
} : {}) & (keyof GenericCustomHeader extends never ? {} : ExtractRequiredKeys<GenericCustomHeader> extends never ? {
    header?: GenericCustomHeader;
} : {
    header: GenericCustomHeader;
});
type DecodeParams<GenericTokenHandlerConfig extends TokenHandlerConfig> = (GenericTokenHandlerConfig["cipher"] extends (params: infer InferredCipherParams) => any ? {
    cipher: InferredCipherParams;
} : {});
type ComputeParams<GenericParams extends object> = keyof GenericParams extends never ? [] : ExtractRequiredKeys<GenericParams> extends never ? [params?: GenericParams] : [params: GenericParams];
declare const tokenHandlerKind: import("@duplojs/utils").KindHandler<import("@duplojs/utils").KindDefinition<"@DuplojsJsonWebToken/token-handler", unknown>>;
export interface TokenHandler<GenericTokenHandlerConfig extends TokenHandlerConfig = TokenHandlerConfig, GenericCustomPayload extends Record<string, unknown> = {}, GenericCustomHeader extends Record<string, unknown> = {}> extends Kind<typeof tokenHandlerKind.definition> {
    /**
     * **Checks that a token is valid and trusted.**
     * 
     * Use `verify` when a received token must be accepted or rejected.  
     * It decrypts the token when needed, decodes and parses its content, verifies the signature, then checks configured claims: issuer, subject, audience, and expiration.
     * 
     * Verification failures are normal business results. The method returns left values instead of throwing so callers can branch on cases such as `expired`, `signature-invalid`, or `audience-invalid`.
     * 
     * ### Example
     * ```ts
     * const result = await asyncPipe(
     * 	"received-token",
     * 	(token) => tokenHandler.verify(
     * 		token,
     * 		{
     * 			tolerance: D.createTime(30, "second"),
     * 		},
     * 	),
     * 	E.whenIsRight(
     * 		({ payload }) => {
     * 			const userId = payload.userId;
     * 		},
     * 	),
     * );
     * ```
     * 
     * ### Result
     * - `token-verified`: The token is valid and trusted.
     * - `token-format`: Token segments are missing or malformed.
     * - `header-decode-error`: Header cannot be decoded as JSON.
     * - `header-parse-error`: Header does not match the configured shape.
     * - `payload-decode-error`: Payload cannot be decoded as JSON.
     * - `payload-parse-error`: Payload does not match the configured shape.
     * - `signature-invalid`: Signature is missing, malformed, or invalid.
     * - `issue-invalid`: Issuer does not match the configured issuer.
     * - `subject-invalid`: Subject does not match the configured subject.
     * - `audience-invalid`: Audience does not match the configured audience.
     * - `expired`: Token expiration is older than the current date plus tolerance.
     * 
     */
    verify(token: string, ...args: ComputeParams<VerifyParams<GenericTokenHandlerConfig>>): Promise<EE.Right<"token-verified", SimplifyTopLevel<DecodeOutput<GenericTokenHandlerConfig, GenericCustomPayload, GenericCustomHeader>>> | EE.Left<"token-format"> | EE.Left<"header-decode-error"> | EE.Left<"header-parse-error", DP.DataParserError> | EE.Left<"payload-decode-error"> | EE.Left<"payload-parse-error", DP.DataParserError> | EE.Left<"signature-invalid"> | EE.Left<"issue-invalid"> | EE.Left<"subject-invalid"> | EE.Left<"audience-invalid"> | EE.Left<"expired">>;
    /**
     * **Reads token content without checking trust.**
     * 
     * Use `decode` when you only need to inspect the token header or payload.  
     * It decrypts the token when a cipher is configured, decodes the header and payload, and validates both against the handler shapes.
     * 
     * `decode` does not verify the signature, issuer, subject, audience, or expiration. For authentication or authorization decisions, use `verify`.
     * 
     * ### Example
     * ```ts
     * const result = await tokenHandler.decode("received-token");
     * 
     * if (E.isRight(result)) {
     * 	const decodedToken = unwrap(result);
     * 	const userId = decodedToken.payload.userId;
     * }
     * ```
     * 
     * ### Result
     * - `token-decoded`: Header and payload were decoded and parsed.
     * - `token-format`: Token segments are missing or malformed.
     * - `header-decode-error`: Header cannot be decoded as JSON.
     * - `header-parse-error`: Header does not match the configured shape.
     * - `payload-decode-error`: Payload cannot be decoded as JSON.
     * - `payload-parse-error`: Payload does not match the configured shape.
     * 
     */
    decode(token: string, ...args: ComputeParams<DecodeParams<GenericTokenHandlerConfig>>): Promise<EE.Right<"token-decoded", SimplifyTopLevel<DecodeOutput<GenericTokenHandlerConfig, GenericCustomPayload, GenericCustomHeader>>> | EE.Left<"token-format"> | EE.Left<"header-decode-error"> | EE.Left<"header-parse-error", DP.DataParserError> | EE.Left<"payload-decode-error"> | EE.Left<"payload-parse-error", DP.DataParserError>>;
    /**
     * **Creates a token and returns an either result.**
     * 
     * Use `create` when token creation can be handled as a normal result in your flow.  
     * The method builds the final payload with configured claims (`iss`, `sub`, `aud`, `iat`, `exp`), validates the header and payload shapes, signs the token, then encrypts it when a cipher is configured.
     * 
     * Unlike `createOrThrow`, this method never throws for validation failures. It returns a left value that can be matched with the rest of your business logic.
     * 
     * ### Example
     * ```ts
     * const result = await tokenHandler.create(
     * 	{
     * 		userId: "1",
     * 	},
     * 	{
     * 		header: {
     * 			kid: "main",
     * 		},
     * 	},
     * );
     * 
     * if (E.isRight(result)) {
     * 	const token = unwrap(result);
     * }
     * ```
     * 
     * ### Result
     * - `token-created`: Token creation succeeded.
     * - `header-parse-error`: Custom header fields do not match `customHeaderShape`.
     * - `payload-parse-error`: Payload fields do not match `customPayloadShape`.
     * 
     */
    create(payload: GenericCustomPayload, ...args: ComputeParams<CreateParams<GenericTokenHandlerConfig, GenericCustomHeader>>): Promise<EE.Right<"token-created", string> | EE.Left<"header-parse-error", DP.DataParserError> | EE.Left<"payload-parse-error", DP.DataParserError>>;
    /**
     * **Creates a token and throws on creation errors.**
     * 
     * Use `createOrThrow` when a token creation failure means the application code is wrong: invalid payload shape, invalid custom header, or missing creator parameters.  
     * It delegates to `create`, unwraps the `token-created` result, and throws `TokenHandlerCreateError` when `create` returns a left value.
     * 
     * This is usually the most convenient method for issuing tokens because invalid creation inputs are often development errors, not user-facing authentication failures.
     * 
     * ### Example
     * ```ts
     * const token = await tokenHandler.createOrThrow(
     * 	{
     * 		userId: "1",
     * 	},
     * 	{
     * 		header: {
     * 			kid: "main",
     * 		},
     * 	},
     * );
     * ```
     * 
     * ### Result
     * Returns the created token string.
     * 
     * @throws `TokenHandlerCreateError` when token creation returns a left value.
     * 
     */
    createOrThrow(payload: GenericCustomPayload, ...args: ComputeParams<CreateParams<GenericTokenHandlerConfig, GenericCustomHeader>>): Promise<string>;
}
declare const TokenHandlerWrongConfig_base: import("@duplojs/utils").KindClass<import("@duplojs/utils").KindHandler<import("@duplojs/utils").KindDefinition<"@DuplojsJsonWebToken/token-handler", unknown>>, ErrorConstructor>;
export declare class TokenHandlerWrongConfig extends TokenHandlerWrongConfig_base {
    constructor(error: DP.DataParserError);
}
declare const TokenHandlerCreateError_base: import("@duplojs/utils").KindClass<import("@duplojs/utils").KindHandler<import("@duplojs/utils").KindDefinition<"@DuplojsJsonWebToken/token-handler", unknown>>, ErrorConstructor>;
export declare class TokenHandlerCreateError extends TokenHandlerCreateError_base {
    constructor(error: EE.Left);
}
declare const SymbolErrorForbidden: unique symbol;
type ForbiddenDataParser<GenericDataParserShape extends DP.DataParserObjectShape> = DP.Contain<DP.DataParserObject<SimplifyTopLevel<Omit<DP.DataParserDefinitionObject, "shape"> & {
    readonly shape: DP.DataParserObjectShapeOutput<GenericDataParserShape>;
}>>, DP.DataParserBigInt | DP.DataParserUnknown> extends true ? {
    [SymbolErrorForbidden]: "Consists of a prohibited data parser.";
} : GenericDataParserShape;
/**
 * **Creates a token handler with validation.**
 * 
 * ### Parameters
 * - `params.maxAge`: Token lifetime
 * - `params.signer`: Signer or creator
 * - `params.cipher`: Cipher or creator
 * - `params.issuer`: Default issuer claim
 * - `params.subject`: Default subject claim
 * - `params.audience`: Default audience claim
 * - `params.now`: Current date override
 * - `params.customPayloadShape`: Custom payload shape
 * - `params.customHeaderShape`: Custom header shape
 * 
 * ### Example
 * ```ts
 * import { asyncPipe, D, DPE, E } from "@duplojs/utils";
 * import { Signer, createTokenHandler } from "@duplojs/json-web-token";
 * 
 * const tokenHandler = createTokenHandler({
 * 	maxAge: D.createTime(15, "minute"),
 * 	signer: Signer.createHS256({
 * 		secret: "my-secret",
 * 	}),
 * 	issuer: "duplo-app",
 * 	audience: ["web"],
 * 	customPayloadShape: {
 * 		userId: DPE.string(),
 * 		role: DPE.literal("admin"),
 * 	},
 * 	customHeaderShape: {
 * 		kid: DPE.string().optional(),
 * 	},
 * });
 * 
 * const token = await tokenHandler.createOrThrow(
 * 	{
 * 		userId: "1",
 * 		role: "admin",
 * 	},
 * 	{
 * 		header: {
 * 			kid: "main",
 * 		},
 * 	},
 * );
 * 
 * // send to client ...
 * 
 * const result = await asyncPipe(
 * 	"receive-token",
 * 	tokenHandler.verify,
 * 	E.whenIsRight(
 * 		({ payload }) => {
 * 			const userId = payload.userId;
 * 		},
 * 	),
 * );
 * ```
 * 
 * @remarks
 * - `verify` also checks issuer, subject, audience and expiration.
 * - `create`, `decode` and `verify` return either values.
 * - Successful results use `token-created`, `token-decoded` and `token-verified`.
 * - `createOrThrow` unwraps `token-created` or throws when token creation returns a left value.
 * - Creator inputs move signer and cipher params to `create`, `createOrThrow`, `decode` and `verify`.
 * - Custom shapes cannot redefine reserved JWT keys.
 * 
 * @see https://json-web-token.duplojs.dev/en/v0/api/tokenHandler
 * 
 */
export declare function createTokenHandler<GenericTokenHandlerConfig extends TokenHandlerConfig, GenericCustomPayload extends DP.DataParserObjectShape, GenericCustomHeader extends DP.DataParserObjectShape = {}>(params: (GenericTokenHandlerConfig & {
    readonly customPayloadShape: (GenericCustomPayload & ForbiddenDataParser<GenericCustomPayload> & OO.ForbiddenKey<GenericCustomPayload, DefaultTokenPayloadKeys>);
    readonly customHeaderShape?: (GenericCustomHeader & ForbiddenDataParser<GenericCustomHeader> & OO.ForbiddenKey<GenericCustomHeader, DefaultTokenHeaderKeys>);
})): TokenHandler<GenericTokenHandlerConfig, DP.DataParserObjectShapeOutput<GenericCustomPayload>, DP.DataParserObjectShapeOutput<GenericCustomHeader>>;
export {};
