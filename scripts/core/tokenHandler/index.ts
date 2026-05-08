import { unwrap, type Kind, type SimplifyTopLevel, kindHeritage, type RemoveKind, forward } from "@duplojs/utils";
import type * as DD from "@duplojs/utils/date";
import * as EE from "@duplojs/utils/either";
import * as DP from "@duplojs/utils/dataParser";
import type * as OO from "@duplojs/utils/object";
import { createJsonWebTokenKind } from "@scripts/kind";
import type { CreateSigner, Signer } from "../signer";
import type { CreateCipher, Cipher } from "../cipher";
import type { ExtractRequiredKeys, UnknownToUndefined } from "../types";
import { createTokenHandlerCreateMethod } from "./create";
import { createTokenHandlerDecodeMethod } from "./decode";
import { createTokenHandlerVerifyMethod } from "./verify";
import { createParseTokenContent } from "./shared";

const tokenHandlerConfigDataParser = DP.object({
	issuer: DP.optional(DP.string()),
	audience: DP.optional(
		DP.union([
			DP.string(),
			DP.array(DP.string()),
		]),
	),
	subject: DP.optional(DP.string()),
	maxAge: DP.time(),
});

export type TokenHandlerConfig<
	GenericSignerAlgorithm extends string = string,
	GenericCipherAlgorithm extends string = string,
> = SimplifyTopLevel<
	& {
		now?(): DD.TheDate;
		signer: Signer<GenericSignerAlgorithm> | CreateSigner<GenericSignerAlgorithm, any>;
		cipher?: Cipher<GenericCipherAlgorithm> | CreateCipher<GenericCipherAlgorithm, any>;
	}
	& DP.Output<typeof tokenHandlerConfigDataParser>
>;

type SignerAlgorithm<
	GenericSignerAlgorithm extends Signer | CreateSigner<string, any>,
> = GenericSignerAlgorithm extends (...args: any[]) => { algorithm: infer InferredAlgorithm }
	? InferredAlgorithm
	: GenericSignerAlgorithm extends { algorithm: infer InferredAlgorithm }
		? InferredAlgorithm
		: never;

export type DefaultTokenHeaderKeys = "typ" | "alg";
export type DefaultTokenPayloadKeys = "iss" | "sub" | "aud" | "exp" | "iat";

export interface DecodeOutput<
	GenericTokenHandlerConfig extends TokenHandlerConfig,
	GenericCustomPayload extends Record<string, unknown>,
	GenericCustomHeader extends Record<string, unknown>,
> {
	readonly header: SimplifyTopLevel<
	{
		readonly typ: "JWT";
		readonly alg: SignerAlgorithm<GenericTokenHandlerConfig["signer"]>;
	}
	& Readonly<GenericCustomHeader>
	>;
	readonly payload: SimplifyTopLevel<
	{
		readonly iss: UnknownToUndefined<GenericTokenHandlerConfig["issuer"]>;
		readonly sub: UnknownToUndefined<GenericTokenHandlerConfig["subject"]>;
		readonly aud: UnknownToUndefined<GenericTokenHandlerConfig["audience"]>;
		readonly exp: number;
		readonly iat: number;
	}
	& Readonly<GenericCustomPayload>
	>;
}

type VerifyParams<
	GenericTokenHandlerConfig extends TokenHandlerConfig,
> =
	& (
		GenericTokenHandlerConfig["signer"] extends (params: infer InferredSignerParams) => any
			? { signer: InferredSignerParams }
			: {}
	)
	& (
		GenericTokenHandlerConfig["cipher"] extends (params: infer InferredCipherParams) => any
			? { cipher: InferredCipherParams }
			: {}
	)
	& {
		tolerance?: DD.TheTime;
	};

type CreateParams<
	GenericTokenHandlerConfig extends TokenHandlerConfig,
	GenericCustomHeader extends Record<string, unknown>,
> =
	& (
		GenericTokenHandlerConfig["signer"] extends (params: infer InferredSignerParams) => any
			? { signer: InferredSignerParams }
			: {}
	)
	& (
		GenericTokenHandlerConfig["cipher"] extends (params: infer InferredCipherParams) => any
			? { cipher: InferredCipherParams }
			: {}
	)
	& (
		keyof GenericCustomHeader extends never
			? {}
			: ExtractRequiredKeys<GenericCustomHeader> extends never
				? { header?: GenericCustomHeader }
				: { header: GenericCustomHeader }
	);

type DecodeParams<
	GenericTokenHandlerConfig extends TokenHandlerConfig,
> =
	& (
		GenericTokenHandlerConfig["cipher"] extends (params: infer InferredCipherParams) => any
			? { cipher: InferredCipherParams }
			: {}
	);

type ComputeParams<
	GenericParams extends object,
> = keyof GenericParams extends never
	? []
	: ExtractRequiredKeys<GenericParams> extends never
		? [params?: GenericParams]
		: [params: GenericParams];

const tokenHandlerKind = createJsonWebTokenKind("token-handler");

export interface TokenHandler<
	GenericTokenHandlerConfig extends TokenHandlerConfig = TokenHandlerConfig,
	GenericCustomPayload extends Record<string, unknown> = {},
	GenericCustomHeader extends Record<string, unknown> = {},
>extends Kind<typeof tokenHandlerKind.definition> {
	verify(
		token: string,
		...args: ComputeParams<VerifyParams<GenericTokenHandlerConfig>>
	): Promise<
		| SimplifyTopLevel<DecodeOutput<GenericTokenHandlerConfig, GenericCustomPayload, GenericCustomHeader>>
		| EE.Left<"token-format">
		| EE.Left<"header-decode-error">
		| EE.Left<"header-parse-error", DP.DataParserError>
		| EE.Left<"payload-decode-error">
		| EE.Left<"payload-parse-error", DP.DataParserError>
		| EE.Left<"signature-invalid">
		| EE.Left<"issue-invalid">
		| EE.Left<"subject-invalid">
		| EE.Left<"audience-invalid">
		| EE.Left<"expired">
	>;
	decode(
		token: string,
		...args: ComputeParams<DecodeParams<GenericTokenHandlerConfig>>
	): Promise<
		| SimplifyTopLevel<DecodeOutput<GenericTokenHandlerConfig, GenericCustomPayload, GenericCustomHeader>>
		| EE.Left<"token-format">
		| EE.Left<"header-decode-error">
		| EE.Left<"header-parse-error", DP.DataParserError>
		| EE.Left<"payload-decode-error">
		| EE.Left<"payload-parse-error", DP.DataParserError>
	>;
	create(
		payload: GenericCustomPayload,
		...args: ComputeParams<CreateParams<GenericTokenHandlerConfig, GenericCustomHeader>>
	): Promise<
		| string
		| EE.Left<"header-parse-error", DP.DataParserError>
		| EE.Left<"payload-parse-error", DP.DataParserError>
	>;
	createOrThrow(
		payload: GenericCustomPayload,
		...args: ComputeParams<CreateParams<GenericTokenHandlerConfig, GenericCustomHeader>>
	): Promise<string>;
}

export class TokenHandlerWrongConfig extends kindHeritage(
	"token-handler-wrong-config",
	tokenHandlerKind,
	Error,
) {
	public constructor(error: DP.DataParserError) {
		super({}, ["Token handler config is wrong. Please check your definition shape."]);
	}
}

export class TokenHandlerCreateError extends kindHeritage(
	"token-handler-create-error",
	tokenHandlerKind,
	Error,
) {
	public constructor(error: EE.Left) {
		super({}, [`Token creation failed with "${EE.informationKind.getValue(error)}".`]);
	}
}

declare const SymbolErrorForbidden: unique symbol;

type ForbiddenDataParser<
	GenericDataParserShape extends DP.DataParserObjectShape,
> = DP.Contain<
	DP.DataParserObject<
		SimplifyTopLevel<
			& Omit<DP.DataParserDefinitionObject, "shape">
			& {
				readonly shape: DP.DataParserObjectShapeOutput<GenericDataParserShape>;
			}
		>
	>,
	| DP.DataParserBigInt
	| DP.DataParserUnknown
> extends true
	? { [SymbolErrorForbidden]: "Consists of a prohibited data parser." }
	: GenericDataParserShape;

/**
 * {@include core/tokenHandler/createTokenHandler/index.md}
 */
export function createTokenHandler<
	GenericTokenHandlerConfig extends TokenHandlerConfig,
	GenericCustomPayload extends DP.DataParserObjectShape,
	GenericCustomHeader extends DP.DataParserObjectShape = {},
>(
	params: (
		& GenericTokenHandlerConfig
		& {
			readonly customPayloadShape:(
				& GenericCustomPayload
				& ForbiddenDataParser<GenericCustomPayload>
				& OO.ForbiddenKey<GenericCustomPayload, DefaultTokenPayloadKeys>
			);
			readonly customHeaderShape?: (
				& GenericCustomHeader
				& ForbiddenDataParser<GenericCustomHeader>
				& OO.ForbiddenKey<GenericCustomHeader, DefaultTokenHeaderKeys>
			);
		}
	),
): TokenHandler<
		GenericTokenHandlerConfig,
		DP.DataParserObjectShapeOutput<GenericCustomPayload>,
		DP.DataParserObjectShapeOutput<GenericCustomHeader>
	> {
	const configResult = tokenHandlerConfigDataParser.parse({
		issuer: params.issuer,
		audience: params.audience,
		subject: params.subject,
		maxAge: params.maxAge,
	});
	if (EE.isLeft(configResult)) {
		throw new TokenHandlerWrongConfig(unwrap(configResult));
	}

	const config = {
		...unwrap(configResult),
		now: params.now,
		signer: params.signer,
		cipher: params.cipher,
	};

	const payloadParser = DP.object({
		iss: DP.optional(DP.string()),
		sub: DP.optional(DP.string()),
		aud: DP.optional(
			DP.union([
				DP.string(),
				DP.array(DP.string()),
			]),
		),
		exp: DP.number(),
		iat: DP.number(),
		...forward<DP.DataParserObjectShape>(params.customPayloadShape),
	});
	const headerParser = DP.object({
		...(params.customHeaderShape ?? {}),
		typ: DP.literal("JWT"),
		alg: DP.literal(config.signer.algorithm),
	});

	const parseTokenContent = createParseTokenContent({
		headerParser,
		payloadParser,
	});

	const createToken = createTokenHandlerCreateMethod({
		config,
		headerParser,
		payloadParser,
	});

	return tokenHandlerKind.setTo(
		{
			create: createToken,
			decode: createTokenHandlerDecodeMethod({
				config,
				parseTokenContent,
			}),
			verify: createTokenHandlerVerifyMethod({
				config,
				parseTokenContent,
			}),
			createOrThrow(payload: object, params?: object) {
				return createToken(payload, params)
					.then((value) => {
						if (EE.isLeft(value)) {
							throw new TokenHandlerCreateError(value);
						}
						return value;
					});
			},
		} satisfies Record<keyof RemoveKind<TokenHandler>, any>,
	) as never;
}
