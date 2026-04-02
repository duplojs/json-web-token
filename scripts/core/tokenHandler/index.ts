import { type D, type DP, unwrap, DPE, E, type Kind, type SimplifyTopLevel, kindHeritage, type O, type RemoveKind } from "@duplojs/utils";
import { createJsonWebTokenKind } from "@scripts/kind";
import type { CreateSigner, Signer } from "../signer";
import type { CreateCipher, Cipher } from "../cipher";
import type { ExtractRequiredKeys, UnknownToUndefined } from "../types";
import { createTokenHandlerCreateMethod } from "./create";
import { createTokenHandlerDecodeMethod } from "./decode";
import { createTokenHandlerVerifyMethod } from "./verify";
import { andThen, createParseTokenContent } from "./shared";

const tokenHandlerConfigDataParser = DPE.object({
	issuer: DPE.string().optional(),
	audience: DPE.union([
		DPE.string(),
		DPE.string().array(),
	]).optional(),
	subject: DPE.string().optional(),
	maxAge: DPE.time(),
});

export type TokenHandlerConfig<
	GenericSignerAlgorithm extends string = string,
	GenericCipherAlgorithm extends string = string,
> = SimplifyTopLevel<
	& {
		now?(): D.TheDate;
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
		tolerance?: D.TheTime;
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

export interface TokenHandlerMethods<
	GenericTokenHandlerConfig extends TokenHandlerConfig = TokenHandlerConfig,
	GenericCustomPayload extends Record<string, unknown> = {},
	GenericCustomHeader extends Record<string, unknown> = {},
> {
	verify(
		token: string,
		...args: ComputeParams<VerifyParams<GenericTokenHandlerConfig>>
	): Promise<
		| SimplifyTopLevel<DecodeOutput<GenericTokenHandlerConfig, GenericCustomPayload, GenericCustomHeader>>
		| E.Left<"token-format">
		| E.Left<"header-decode-error">
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-decode-error">
		| E.Left<"payload-parse-error", DP.DataParserError>
		| E.Left<"signature-invalid">
		| E.Left<"issue-invalid">
		| E.Left<"subject-invalid">
		| E.Left<"audience-invalid">
		| E.Left<"expired">
	>;
	decode(
		token: string,
		...args: ComputeParams<DecodeParams<GenericTokenHandlerConfig>>
	): Promise<
		| SimplifyTopLevel<DecodeOutput<GenericTokenHandlerConfig, GenericCustomPayload, GenericCustomHeader>>
		| E.Left<"token-format">
		| E.Left<"header-decode-error">
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-decode-error">
		| E.Left<"payload-parse-error", DP.DataParserError>
	>;
	create(
		payload: GenericCustomPayload,
		...args: ComputeParams<CreateParams<GenericTokenHandlerConfig, GenericCustomHeader>>
	): Promise<
		| string
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>
	>;
	createOrThrow(
		payload: GenericCustomPayload,
		...args: ComputeParams<CreateParams<GenericTokenHandlerConfig, GenericCustomHeader>>
	): Promise<string>;
}

const tokenHandlerKind = createJsonWebTokenKind("token-handler");

export type TokenHandler<
	GenericTokenHandlerConfig extends TokenHandlerConfig = TokenHandlerConfig,
	GenericCustomPayload extends Record<string, unknown> = {},
	GenericCustomHeader extends Record<string, unknown> = {},
> = Kind<typeof tokenHandlerKind.definition> & TokenHandlerMethods<
	GenericTokenHandlerConfig,
	GenericCustomPayload,
	GenericCustomHeader
>;

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
	public constructor(error: E.Left) {
		super({}, [`Token creation failed with "${E.informationKind.getValue(error)}".`]);
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
	params:
		& GenericTokenHandlerConfig
		& {
			readonly customPayloadShape:
			& GenericCustomPayload
			& ForbiddenDataParser<GenericCustomPayload>
			& O.ForbiddenKey<GenericCustomPayload, DefaultTokenPayloadKeys>;
			readonly customHeaderShape?:
			& GenericCustomHeader
			& ForbiddenDataParser<GenericCustomHeader>
			& O.ForbiddenKey<GenericCustomHeader, DefaultTokenHeaderKeys>;
		},
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
	if (E.isLeft(configResult)) {
		throw new TokenHandlerWrongConfig(unwrap(configResult));
	}

	const config = {
		...unwrap(configResult),
		now: params.now,
		signer: params.signer,
		cipher: params.cipher,
	};

	const payloadParser = DPE.object({
		iss: DPE.string().optional(),
		sub: DPE.string().optional(),
		aud: DPE.union([
			DPE.string(),
			DPE.string().array(),
		]).optional(),
		exp: DPE.number(),
		iat: DPE.number(),
		...params.customPayloadShape,
	});
	const headerParser = DPE.object({
		...(params.customHeaderShape ?? {}),
		typ: DPE.literal("JWT"),
		alg: DPE.literal(config.signer.algorithm),
	});

	const parseTokenContent = createParseTokenContent({
		headerParser,
		payloadParser,
	});

	return tokenHandlerKind.setTo(
		{
			create: createTokenHandlerCreateMethod({
				config,
				headerParser,
				payloadParser,
			}),
			decode: createTokenHandlerDecodeMethod({
				config,
				parseTokenContent,
			}),
			verify: createTokenHandlerVerifyMethod({
				config,
				parseTokenContent,
			}),
			createOrThrow(payload: object, params?: object) {
				return andThen(
					createTokenHandlerCreateMethod({
						config,
						headerParser,
						payloadParser,
					})(payload, params),
					(value) => {
						if (E.isLeft(value)) {
							throw new TokenHandlerCreateError(value);
						}
						return value;
					},
				);
			},
		} satisfies Record<keyof RemoveKind<TokenHandler>, any>,
	) as never;
}
