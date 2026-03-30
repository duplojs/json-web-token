import { D, DP, unwrap, DPE, E, type Kind, type SimplifyTopLevel, A, type IsEqual, kindHeritage } from "@duplojs/utils";
import { decodeBase64Url, decodeText, encodeBase64Url, jsonParse } from "@scripts/utils";
import { createJsonWebTokenKind } from "@scripts/kind";
import type { CreateSigner, Signer } from "./signer";
import type { Cipher } from "./cipher";
import type { Field } from "./field";

const tokenHandlerConfigDataParser = DPE.object({
	issuer: DPE.string().optional(),
	audience: DPE.union([
		DPE.string(),
		DPE.string().array(),
	]).optional(),
	subject: DPE.string().optional(),
	tolerance: DPE.time().optional(),
	maxAge: DPE.time(),
});

export type TokenHandlerConfig<
	GenericSignerAlgorithm extends string = string,
	GenericCipherAlgorithm extends string = string,
> = SimplifyTopLevel<
	& {
		now?(): D.TheDate;
		signer: Signer<GenericSignerAlgorithm> | CreateSigner<GenericSignerAlgorithm, any>;
		cipher?: Cipher<GenericCipherAlgorithm>;
	}
	& DP.Output<typeof tokenHandlerConfigDataParser>
>;

export type Shape = Record<string, Field | DP.DataParser>;

export type ExtractDataParserFromShape<
	GenericShape extends Shape,
> = {
	[Key in keyof GenericShape]:
	GenericShape[Key] extends Field<infer InferredDataParser>
		? InferredDataParser
		: GenericShape[Key] extends DP.DataParser
			? GenericShape[Key]
			: never;
};

export type UnknownToUndefined<
	GenericValue extends unknown,
> = IsEqual<GenericValue, unknown> extends true
	? undefined
	: GenericValue;

export type SignerAlgorithm<
	GenericSignerAlgorithm extends Signer | CreateSigner<string, any>,
> = GenericSignerAlgorithm extends (...args: any[]) => { algorithm: infer InferredAlgorithm }
	? InferredAlgorithm
	: GenericSignerAlgorithm extends { algorithm: infer InferredAlgorithm }
		? InferredAlgorithm
		: never;

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

export interface TokenHandlerMethods<
	GenericTokenHandlerConfig extends TokenHandlerConfig = TokenHandlerConfig,
	GenericCustomPayload extends Record<string, unknown> = {},
	GenericCustomHeader extends Record<string, unknown> = {},
> {
	verify(
		token: string,
		...args: GenericTokenHandlerConfig["signer"] extends (params: infer InferredParams) => any
			? [params: InferredParams]
			: []
	):
		| Promise<SimplifyTopLevel<DecodeOutput<GenericTokenHandlerConfig, GenericCustomPayload, GenericCustomHeader>>>
		| E.Left<"decode-error">
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>
		| E.Left<"signature-invalid">
		| E.Left<"issue-invalid">
		| E.Left<"subject-invalid">
		| E.Left<"audience-invalid">
		| E.Left<"expired">;
	decode(token: string):
		| Promise<SimplifyTopLevel<DecodeOutput<GenericTokenHandlerConfig, GenericCustomPayload, GenericCustomHeader>>>
		| E.Left<"decode-error">
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>;
	create(
		payload: GenericCustomPayload,
		...args: GenericTokenHandlerConfig["signer"] extends (params: infer InferredParams) => any
			? [
				params: InferredParams,
				header?: GenericCustomHeader,
			]
			: [header?: GenericCustomHeader]
	):
		| Promise<string>
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>;
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

function nowInSeconds(config: TokenHandlerConfig) {
	const now = config.now?.() ?? D.now();

	return Math.floor(D.toTimestamp(now) / 1000);
}

function getToleranceInSeconds(config: TokenHandlerConfig) {
	return config.tolerance
		? D.computeTime(config.tolerance, "second")
		: 0;
}

function isAudienceValid(
	expectedAudience: string | string[] | undefined,
	tokenAudience: string | string[] | undefined,
) {
	if (typeof expectedAudience === "undefined") {
		return true;
	}

	if (typeof tokenAudience === "undefined") {
		return false;
	}

	const expected = A.coalescing(expectedAudience);
	const actual = A.coalescing(tokenAudience);

	return expected.some(
		(value) => actual.includes(value),
	);
}

function extractDataParserShape<
	GenericShape extends Shape,
>(
	shape: GenericShape,
): ExtractDataParserFromShape<GenericShape> {
	const result: Record<string, DP.DataParser> = {};

	for (const [key, value] of Object.entries(shape)) {
		result[key] = DP.dataParserKind.has(value)
			? value
			: value.dataParser;
	}

	return result as never;
}

declare const SymbolErrorForbidden: unique symbol;

export type ForbiddenDataParser<
	GenericShape extends Shape,
> = DP.Contain<
	DP.DataParserObject<
		SimplifyTopLevel<
			& Omit<DP.DataParserDefinitionObject, "shape">
			& {
				readonly shape: ExtractDataParserFromShape<GenericShape>;
			}
		>
	>,
	| DP.DataParserBigInt
	| DP.DataParserUnknown
> extends true
	? { [SymbolErrorForbidden]: "Consists of a prohibited data parser." }
	: GenericShape;

export function createTokenHandler<
	GenericTokenHandlerConfig extends TokenHandlerConfig,
	GenericCustomPayload extends Shape,
	GenericCustomHeader extends Shape = {},
>(
	params:
		& GenericTokenHandlerConfig
		& {
			readonly customPayloadShape:
			& GenericCustomPayload
			& ForbiddenDataParser<GenericCustomPayload>;
			readonly customHeaderShape?:
			& GenericCustomHeader
			& ForbiddenDataParser<GenericCustomHeader>;
		},
): TokenHandler<
		GenericTokenHandlerConfig,
		DP.DataParserObjectShapeOutput<
			ExtractDataParserFromShape<GenericCustomPayload>
		>,
		DP.DataParserObjectShapeOutput<
			ExtractDataParserFromShape<GenericCustomHeader>
		>
	> {
	const configResult = tokenHandlerConfigDataParser.parse({
		issuer: params.issuer,
		audience: params.audience,
		subject: params.subject,
		tolerance: params.tolerance,
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
	} as GenericTokenHandlerConfig;

	const payloadShape = extractDataParserShape(
		params.customPayloadShape,
	);
	const payloadParser = DPE.object({
		iss: DPE.string().optional(),
		sub: DPE.string().optional(),
		aud: DPE.union([
			DPE.string(),
			DPE.string().array(),
		]).optional(),
		exp: DPE.number(),
		iat: DPE.number(),
		...payloadShape,
	});
	const headerShape = params.customHeaderShape
		? extractDataParserShape(params.customHeaderShape)
		: {};
	const headerParser = DPE.object({
		...headerShape,
		typ: DPE.literal(["JWT"]),
		alg: DPE.literal([config.signer.algorithm]),
	});

	const resolveSigner = (
		args: unknown[],
	) => {
		if (typeof config.signer === "function") {
			return config.signer(
				args[0],
			);
		}

		return config.signer;
	};

	const parseTokenContent = (
		encodedHeader: string | undefined,
		encodedPayload: string | undefined,
	) => {
		if (!encodedHeader || !encodedPayload) {
			return E.left("decode-error");
		}

		const headerJsonResult = jsonParse(
			decodeText(decodeBase64Url(encodedHeader)),
		);
		if (E.isLeft(headerJsonResult)) {
			return E.left("decode-error");
		}

		const headerResult = headerParser.parse(headerJsonResult);
		if (E.isLeft(headerResult)) {
			return E.left("header-parse-error", unwrap(headerResult));
		}

		const payloadJsonResult = jsonParse(
			decodeText(decodeBase64Url(encodedPayload)),
		);
		if (E.isLeft(payloadJsonResult)) {
			return E.left("decode-error");
		}

		const payloadResult = payloadParser.parse(payloadJsonResult);
		if (E.isLeft(payloadResult)) {
			return E.left("payload-parse-error", unwrap(payloadResult));
		}

		return {
			header: unwrap(headerResult),
			payload: unwrap(payloadResult),
		} as unknown as DecodeOutput<
			GenericTokenHandlerConfig,
			DP.DataParserObjectShapeOutput<
				ExtractDataParserFromShape<GenericCustomPayload>
			>,
			DP.DataParserObjectShapeOutput<
				ExtractDataParserFromShape<GenericCustomHeader>
			>
		>;
	};

	const decryptFlow = (
		token: string,
	) => {
		if (config.cipher !== undefined) {
			return config.cipher.decrypt(token);
		}

		return token;
	};

	return tokenHandlerKind.setTo(
		{
			create(
				payload: DP.DataParserObjectShapeOutput<
					ExtractDataParserFromShape<GenericCustomPayload>
				>,
				...args: unknown[]
			) {
				const signer = resolveSigner(args);
				const header = typeof config.signer === "function"
					? args[1]
					: args[0];
				const issuedAt = nowInSeconds(config);
				const headerResult = headerParser.parse({
					...(header ?? {}),
					typ: "JWT",
					alg: signer.algorithm,
				});
				if (E.isLeft(headerResult)) {
					return E.left("header-parse-error", unwrap(headerResult));
				}

				const payloadResult = payloadParser.parse({
					iss: config.issuer,
					sub: config.subject,
					aud: config.audience,
					iat: issuedAt,
					exp: D.computeTime(config.maxAge, "second") + issuedAt,
					...payload,
				});
				if (E.isLeft(payloadResult)) {
					return E.left("payload-parse-error", unwrap(payloadResult));
				}

				const encodedHeader = encodeBase64Url(JSON.stringify(unwrap(headerResult)));
				const encodedPayload = encodeBase64Url(JSON.stringify(unwrap(payloadResult)));
				const signingInput = `${encodedHeader}.${encodedPayload}`;
				const encryptFlow = (
					signature: string,
				) => {
					const token = `${signingInput}.${signature}`;

					if (config.cipher !== undefined) {
						return config.cipher.encrypt(token);
					}

					return token;
				};
				const signatureResult = signer.sign(signingInput);

				if (signatureResult instanceof Promise) {
					return signatureResult.then(encryptFlow);
				}

				return encryptFlow(signatureResult);
			},
			decode(token: string) {
				const decodeFlow = (
					token: string,
				) => {
					const [encodedHeader, encodedPayload] = token.split(".");

					const decodeResult = parseTokenContent(
						encodedHeader,
						encodedPayload,
					);

					if (E.isLeft(decodeResult)) {
						return decodeResult;
					}

					return {
						header: decodeResult.header,
						payload: decodeResult.payload,
					};
				};

				const decryptResult = decryptFlow(token);

				if (decryptResult instanceof Promise) {
					return decryptResult.then(decodeFlow);
				}

				return decodeFlow(decryptResult);
			},
			verify(
				token: string,
				...args: unknown[]
			) {
				const verifyFlow = (
					token: string,
				) => {
					const [encodedHeader, encodedPayload, signature] = token.split(".");

					if (!signature) {
						return E.left("signature-invalid");
					}

					const decodeResult = parseTokenContent(
						encodedHeader,
						encodedPayload,
					);

					if (E.isLeft(decodeResult)) {
						return decodeResult;
					}

					const signer = resolveSigner(args);
					const verifyResult = signer.verify(
						`${encodedHeader}.${encodedPayload}`,
						signature,
					);
					const finishVerification = (
						isValid: boolean,
					) => {
						if (!isValid) {
							return E.left("signature-invalid");
						}

						if (
							typeof config.issuer !== "undefined"
							&& decodeResult.payload.iss !== config.issuer
						) {
							return E.left("issue-invalid");
						}

						if (
							typeof config.subject !== "undefined"
							&& decodeResult.payload.sub !== config.subject
						) {
							return E.left("subject-invalid");
						}

						if (
							!isAudienceValid(
								config.audience,
								decodeResult.payload.aud,
							)
						) {
							return E.left("audience-invalid");
						}

						if (
							(decodeResult.payload.exp + getToleranceInSeconds(config))
							< nowInSeconds(config)
						) {
							return E.left("expired");
						}

						return {
							header: decodeResult.header,
							payload: decodeResult.payload,
						};
					};

					if (verifyResult instanceof Promise) {
						return verifyResult.then(
							(isValid) => finishVerification(isValid),
						);
					}

					return finishVerification(verifyResult);
				};
				const decryptResult = decryptFlow(token);

				if (decryptResult instanceof Promise) {
					return decryptResult.then(verifyFlow);
				}

				return verifyFlow(decryptResult);
			},
		},
	) as never;
}
