import { D, unwrap, type DP, DPE, E, type Kind, type SimplifyTopLevel, A, type IsEqual, kindHeritage, type MaybePromise } from "@duplojs/utils";
import { decodeBase64Url, decodeText, encodeBase64Url, jsonParse } from "@scripts/encoding";
import { createJsonWebTokenKind } from "@scripts/kind";
import type { Signer } from "../signed";
import type { Cipher } from "./cipher";

const clientConfigDataParser = DPE.object({
	issuer: DPE.string().optional(),
	audience: DPE.union([
		DPE.string(),
		DPE.string().array(),
	]).optional(),
	subject: DPE.string().optional(),
	tolerance: DPE.time().optional(),
	maxAge: DPE.time(),
});

export type ClientConfig<
	GenericSignerAlgorithm extends string = string,
	GenericCipherAlgorithm extends string = string,
> = SimplifyTopLevel<
	& {
		now?(): D.TheDate;
		signer: Signer<GenericSignerAlgorithm> | ((params: any) => Signer<GenericSignerAlgorithm>);
		cipher?: Cipher<GenericCipherAlgorithm>;
	}
	& DPE.Output<typeof clientConfigDataParser>
>;

type UnknownToUndefined<
	GenericValue extends unknown,
> = IsEqual<GenericValue, unknown> extends true
	? undefined
	: GenericValue;

export type SignerAlgorithm<
	GenericSignerAlgorithm extends Signer | ((params: any) => Signer),
> = GenericSignerAlgorithm extends (...args: any[]) => { algorithm: infer InferredAlgorithm }
	? InferredAlgorithm
	: GenericSignerAlgorithm extends { algorithm: infer InferredAlgorithm }
		? InferredAlgorithm
		: never;

export interface DecodeOutput<
	GenericClientConfig extends ClientConfig,
	GenericCustomPayload extends Record<string, unknown>,
	GenericCustomHeader extends Record<string, unknown>,
> {
	readonly header: SimplifyTopLevel<
	{
		readonly typ: "JWT";
		readonly alg: SignerAlgorithm<GenericClientConfig["signer"]>;
	}
	& Readonly<GenericCustomHeader>
	>;
	readonly payload: SimplifyTopLevel<
	{
		readonly iss: UnknownToUndefined<GenericClientConfig["issuer"]>;
		readonly sub: UnknownToUndefined<GenericClientConfig["subject"]>;
		readonly aud: UnknownToUndefined<GenericClientConfig["audience"]>;
		readonly exp: number;
		readonly iat: number;
	}
	& Readonly<GenericCustomPayload>
	>;
}

export interface Methods<
	GenericClientConfig extends ClientConfig = ClientConfig,
	GenericCustomPayload extends Record<string, unknown> = {},
	GenericCustomHeader extends Record<string, unknown> = {},
> {
	verify(
		token: string,
		...args: GenericClientConfig["signer"] extends (params: infer InferredParams) => any
			? [params: InferredParams]
			: []
	):
		| Promise<SimplifyTopLevel<DecodeOutput<GenericClientConfig, GenericCustomPayload, GenericCustomHeader>>>
		| E.Left<"decode-error">
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>
		| E.Left<"signature-invalid">
		| E.Left<"issue-invalid">
		| E.Left<"subject-invalid">
		| E.Left<"audience-invalid">
		| E.Left<"expired">;
	decode(
		token: string,
		...args: GenericClientConfig["signer"] extends (params: infer InferredParams) => any
			? [params: InferredParams]
			: []
	):
		| Promise<SimplifyTopLevel<DecodeOutput<GenericClientConfig, GenericCustomPayload, GenericCustomHeader>>>
		| E.Left<"decode-error">
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>;
	create(
		payload: GenericCustomPayload,
		...args: GenericClientConfig["signer"] extends (params: infer InferredParams) => any
			? [params: InferredParams, header?: GenericCustomHeader]
			: [header?: GenericCustomHeader]
	):
		| Promise<string>
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>;
}

interface Element<
	GenericDataParser extends DP.DataParser = DP.DataParser,
> {
	dataParser: GenericDataParser;
	validator(input: DP.Output<GenericDataParser>): MaybePromise<boolean>;
}

type ExtractDataParserShape<
	GenericElementShape extends Record<string, Element | DP.DataParser>,
> = {
	[Key in keyof GenericElementShape]:
	GenericElementShape[Key] extends Element<infer InferredDataParser>
		? InferredDataParser
		: GenericElementShape[Key] extends DP.DataParser
			? GenericElementShape[Key]
			: never;
};

const tt = {
	one: DPE.number(),
	two: {
		dataParser: DPE.string(),
		validator: (input: string) => true,
	},
};

type ttt = ExtractDataParserShape<typeof tt>;

const clientKind = createJsonWebTokenKind("client");

export type Client<
	GenericConfig extends ClientConfig,
	GenericMethods extends Methods<GenericConfig>,
> = Kind<typeof clientKind.definition> & GenericMethods;

export class ClientWrongConfig extends kindHeritage(
	"client-wrong-config",
	clientKind,
	Error,
) {
	public constructor(error: DP.DataParserError) {
		super({}, ["Client config is wrong. Please check your definition shape."]);
	}
}

function nowInSeconds(config: ClientConfig) {
	const now = config.now?.() ?? D.now();

	return Math.floor(D.toTimestamp(now) / 1000);
}

function getToleranceInSeconds(config: ClientConfig) {
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

declare const SymbolErrorForbidden: unique symbol;

export type ForbiddenDataParser<
	GenericDataParserShape extends DP.DataParserObjectShape,
> = DP.Contain<
	DP.DataParserObject<
		SimplifyTopLevel<
			& Omit<DP.DataParserDefinitionObject, "shape">
			& {
				readonly shape: GenericDataParserShape;
			}
		>
	>,
	| DP.DataParserBigInt
	| DP.DataParserUnknown
> extends true
	? { [SymbolErrorForbidden]: "Consists of a prohibited data parser." }
	: GenericDataParserShape;

export function createClient<
	GenericClientConfig extends ClientConfig,
	GenericCustomPayload extends DP.DataParserObjectShape,
	GenericCustomHeader extends DP.DataParserObjectShape = {},
>(
	params: {
		readonly config: GenericClientConfig;
		readonly customPayloadShape: GenericCustomPayload & ForbiddenDataParser<GenericCustomPayload>;
		readonly customHeaderShape?: GenericCustomHeader & ForbiddenDataParser<GenericCustomHeader>;
	},
):
	| Client<
		GenericClientConfig,
		Methods<
			GenericClientConfig,
			DP.DataParserObjectShapeOutput<GenericCustomPayload>,
			DP.DataParserObjectShapeOutput<GenericCustomHeader>
		>
	> {
	const configResult = clientConfigDataParser.parse(params.config);

	if (E.isLeft(configResult)) {
		throw new ClientWrongConfig(unwrap(configResult));
	}

	const config = {
		...unwrap(configResult),
		now: params.config.now,
		signer: params.config.signer,
		cipher: params.config.cipher,
	} as GenericClientConfig;

	const headerParser = DPE.object({
		typ: DPE.literal(["JWT"]),
		alg: DPE.literal(config.signer.algorithm),
		...(params.customHeaderShape ?? {}),
	});
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

	type DecodedTokenOutput = DecodeOutput<
		GenericClientConfig,
		DP.DataParserObjectShapeOutput<GenericCustomPayload>,
		DP.DataParserObjectShapeOutput<GenericCustomHeader>
	>;

	const decodeFlow = (
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
		} as unknown as DecodedTokenOutput;
	};

	const verifyFlow = (
		decodeResult: DecodedTokenOutput,
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

	const decryptFlow = (
		token: string,
	) => {
		if (!config.cipher) {
			return token;
		}

		return config.cipher.decrypt(token);
	};

	return clientKind.setTo(
		{
			create(
				payload: DP.DataParserObjectShapeOutput<GenericCustomPayload>,
				header?: DP.DataParserObjectShapeOutput<GenericCustomHeader>,
			) {
				const issuedAt = nowInSeconds(config);
				const headerResult = headerParser.parse({
					typ: "JWT",
					alg: config.signer.algorithm,
					...(header ?? {}),
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
				const createTokenFlow = (
					signature: string,
				) => {
					const token = `${signingInput}.${signature}`;

					if (!config.cipher) {
						return token;
					}

					return config.cipher.encrypt(token);
				};
				const signatureResult = config.signer.sign(signingInput);

				if (signatureResult instanceof Promise) {
					return signatureResult.then(
						(signature) => createTokenFlow(signature),
					);
				}

				return createTokenFlow(signatureResult);
			},
			decode(token: string) {
				const decodeTokenFlow = (
					decryptedToken: string,
				) => {
					const [encodedHeader, encodedPayload] = decryptedToken.split(".");

					const decodeResult = decodeFlow(encodedHeader, encodedPayload);

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
					return decryptResult.then(
						(decryptedToken) => decodeTokenFlow(decryptedToken),
					);
				}

				return decodeTokenFlow(decryptResult);
			},
			verify(token: string) {
				const verifyTokenFlow = (
					decryptedToken: string,
				) => {
					const [encodedHeader, encodedPayload, signature] = decryptedToken.split(".");

					if (!signature) {
						return E.left("signature-invalid");
					}

					const decodeResult = decodeFlow(encodedHeader, encodedPayload);

					if (E.isLeft(decodeResult)) {
						return decodeResult;
					}

					const verifyResult = config.signer.verify(
						`${encodedHeader}.${encodedPayload}`,
						signature,
					);

					if (verifyResult instanceof Promise) {
						return verifyResult.then(
							(isValid) => verifyFlow(decodeResult, isValid),
						);
					}

					return verifyFlow(decodeResult, verifyResult);
				};
				const decryptResult = decryptFlow(token);

				if (decryptResult instanceof Promise) {
					return decryptResult.then(
						(decryptedToken) => verifyTokenFlow(decryptedToken),
					);
				}

				return verifyTokenFlow(decryptResult);
			},
		},
	) as Client<
		GenericClientConfig,
		Methods<
			GenericClientConfig,
			DP.DataParserObjectShapeOutput<GenericCustomPayload>,
			DP.DataParserObjectShapeOutput<GenericCustomHeader>
		>
	>;
}
