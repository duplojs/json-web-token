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
            readonly errorMessage?: string | undefined;
            readonly coalescingValue: unknown;
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
            readonly errorMessage?: string | undefined;
            readonly coalescingValue: unknown;
            readonly checkers: readonly [];
        }>;
        readonly subject: DP.DataParserOptional<{
            readonly inner: DP.DataParserString<{
                readonly errorMessage?: string | undefined;
                readonly coerce: boolean;
                readonly checkers: readonly [];
            }>;
            readonly errorMessage?: string | undefined;
            readonly coalescingValue: unknown;
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
    verify(token: string, ...args: ComputeParams<VerifyParams<GenericTokenHandlerConfig>>): Promise<SimplifyTopLevel<DecodeOutput<GenericTokenHandlerConfig, GenericCustomPayload, GenericCustomHeader>> | EE.Left<"token-format"> | EE.Left<"header-decode-error"> | EE.Left<"header-parse-error", DP.DataParserError> | EE.Left<"payload-decode-error"> | EE.Left<"payload-parse-error", DP.DataParserError> | EE.Left<"signature-invalid"> | EE.Left<"issue-invalid"> | EE.Left<"subject-invalid"> | EE.Left<"audience-invalid"> | EE.Left<"expired">>;
    decode(token: string, ...args: ComputeParams<DecodeParams<GenericTokenHandlerConfig>>): Promise<SimplifyTopLevel<DecodeOutput<GenericTokenHandlerConfig, GenericCustomPayload, GenericCustomHeader>> | EE.Left<"token-format"> | EE.Left<"header-decode-error"> | EE.Left<"header-parse-error", DP.DataParserError> | EE.Left<"payload-decode-error"> | EE.Left<"payload-parse-error", DP.DataParserError>>;
    create(payload: GenericCustomPayload, ...args: ComputeParams<CreateParams<GenericTokenHandlerConfig, GenericCustomHeader>>): Promise<string | EE.Left<"header-parse-error", DP.DataParserError> | EE.Left<"payload-parse-error", DP.DataParserError>>;
    createOrThrow(payload: GenericCustomPayload, ...args: ComputeParams<CreateParams<GenericTokenHandlerConfig, GenericCustomHeader>>): Promise<string>;
}
declare const TokenHandlerWrongConfig_base: new (params: {
    "@DuplojsJsonWebToken/token-handler"?: unknown;
}, parentParams: readonly [message?: string | undefined, options?: ErrorOptions | undefined]) => Kind<import("@duplojs/utils").KindDefinition<"@DuplojsJsonWebToken/token-handler", unknown>, unknown> & Kind<import("@duplojs/utils").KindDefinition<"token-handler-wrong-config", unknown>, unknown> & Error;
export declare class TokenHandlerWrongConfig extends TokenHandlerWrongConfig_base {
    constructor(error: DP.DataParserError);
}
declare const TokenHandlerCreateError_base: new (params: {
    "@DuplojsJsonWebToken/token-handler"?: unknown;
}, parentParams: readonly [message?: string | undefined, options?: ErrorOptions | undefined]) => Kind<import("@duplojs/utils").KindDefinition<"@DuplojsJsonWebToken/token-handler", unknown>, unknown> & Error & Kind<import("@duplojs/utils").KindDefinition<"token-handler-create-error", unknown>, unknown>;
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
 * const verifiedToken = await tokenHandler.verify("receive-token");
 * ```
 * 
 * @remarks
 * - `verify` also checks issuer, subject, audience and expiration.
 * - `createOrThrow` throws when token creation returns a left value.
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
