import { unwrap, type D, type DP, DPE, E, type Kind, type SimplifyTopLevel, A } from "@duplojs/utils";
import { HMAC, decodeBase64Url, decodeText, encodeBase64Url, jsonParse } from "@scripts/core";
import { createJsonWebTokenKind } from "@scripts/kind";

const clientConfigDataParser = DPE.object({
	algorithm: DPE.literal(["HS256", "HS512"]),
	signingKey: DPE.string(),
	// anticipation asymmetric algo
	verifyKey: DPE.string().optional(),
	issuer: DPE.string().optional(),
	audience: DPE.union([
		DPE.string(),
		DPE.string().array(),
	]).optional(),
	subject: DPE.string().optional(),
	tolerance: DPE.time().optional(),
	maxAge: DPE.time().optional(),
});

export type ClientConfig = SimplifyTopLevel<DPE.Output<typeof clientConfigDataParser> & { now?(): D.TheDate }>;

export interface DecodeOutput<
	GenericClientConfig extends ClientConfig,
	GenericCustomHeader extends Record<string, unknown>,
	GenericCustomPayload extends Record<string, unknown>,
> {
	readonly header: SimplifyTopLevel<
	{
		readonly typ: "JWT";
		readonly alg: GenericClientConfig["algorithm"];
	}
	& Readonly<GenericCustomHeader>
	>;
	readonly payload: SimplifyTopLevel<
	{
		readonly iss: GenericClientConfig["issuer"];
		readonly sub: GenericClientConfig["subject"];
		readonly aud: GenericClientConfig["audience"];
		readonly exp: number;
		readonly iat: number;
	}
	& Readonly<GenericCustomPayload>
	>;
}

export interface Methods<
	GenericClientConfig extends ClientConfig = ClientConfig,
	GenericCustomHeader extends Record<string, unknown> = {},
	GenericCustomPayload extends Record<string, unknown> = {},
> {
	verify(token: string):
		| Promise<SimplifyTopLevel<DecodeOutput<GenericClientConfig, GenericCustomHeader, GenericCustomPayload>>>
		| E.Left<"decode-error">
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>
		| E.Left<"signature-invalid">
		| E.Left<"issue-invalid">
		| E.Left<"subject-invalid">
		| E.Left<"audience-invalid">
		| E.Left<"expired">;
	decode(token: string):
		| SimplifyTopLevel<DecodeOutput<GenericClientConfig, GenericCustomHeader, GenericCustomPayload>>
		| E.Left<"decode-error">
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>;
	create(payload: GenericCustomPayload, header?: GenericCustomHeader):
		| Promise<string>
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>;
}

const clientKind = createJsonWebTokenKind("SignedJwtClient");

export type Client<
	GenericMethods extends Methods,
> = Kind<typeof clientKind.definition> & GenericMethods;

const tokenSplitRegex = /^(.+)\.([^.]+)$/;

function nowInSeconds(config: ClientConfig) {
	const now = config.now?.() ?? new Date();

	return Math.floor(now.getTime() / 1000);
}

function getExpirationInSeconds(config: ClientConfig, issuedAt: number) {
	const maxAge = config.maxAge?.toNative();

	return typeof maxAge === "number"
		? issuedAt + Math.floor(maxAge / 1000)
		: Number.MAX_SAFE_INTEGER;
}

function getToleranceInSeconds(config: ClientConfig) {
	return Math.floor((config.tolerance?.toNative() ?? 0) / 1000);
}

function isAudienceValid(
	expectedAudience: ClientConfig["audience"],
	tokenAudience: ClientConfig["audience"],
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

export function factory<
	GenericClientConfig extends ClientConfig,
	GenericCustomHeader extends DP.DataParserObjectShape = {},
	GenericCustomPayload extends DP.DataParserObjectShape = {},
>(
	params: {
		readonly config: GenericClientConfig;
		readonly customPayloadShape: GenericCustomPayload;
		readonly customHeaderShape?: GenericCustomHeader;
	},
):
	| Client<
		Methods<
			GenericClientConfig,
			DP.DataParserObjectShapeOutput<GenericCustomHeader>,
			DP.DataParserObjectShapeOutput<GenericCustomPayload>
		>>
	| E.Left<"config-invalid", DP.DataParserError> {
	const configResult = clientConfigDataParser.parse(params.config);

	if (E.isLeft(configResult)) {
		return E.left("config-invalid", unwrap(configResult));
	}

	const parsedConfig = unwrap(configResult);

	const headerParser = DPE.object({
		typ: DPE.literal(["JWT"]),
		alg: DPE.literal([parsedConfig.algorithm]),
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
		DP.DataParserObjectShapeOutput<GenericCustomHeader>,
		DP.DataParserObjectShapeOutput<GenericCustomPayload>
	> & {
		signature: string;
		signingInput: string;
	};

	const decodeToken = (
		token: string,
	) => {
		const matchResult = token.match(tokenSplitRegex);

		if (!matchResult) {
			return E.left("decode-error");
		}

		const [encodedHeader, encodedPayload] = matchResult[1]!.split(".");

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
			signature: matchResult[2]!,
			signingInput: matchResult[1]!,
		} as unknown as DecodedTokenOutput;
	};

	return clientKind.setTo(
		{
			create(
				payload: DP.DataParserObjectShapeOutput<GenericCustomPayload>,
				header?: DP.DataParserObjectShapeOutput<GenericCustomHeader>,
			) {
				const issuedAt = nowInSeconds(parsedConfig);
				const headerResult = headerParser.parse({
					typ: "JWT",
					alg: parsedConfig.algorithm,
					...(header ?? {}),
				});
				if (E.isLeft(headerResult)) {
					return E.left("header-parse-error", unwrap(headerResult));
				}

				const payloadResult = payloadParser.parse({
					iss: parsedConfig.issuer,
					sub: parsedConfig.subject,
					aud: parsedConfig.audience,
					iat: issuedAt,
					exp: getExpirationInSeconds(parsedConfig, issuedAt),
					...payload,
				});
				if (E.isLeft(payloadResult)) {
					return E.left("payload-parse-error", unwrap(payloadResult));
				}

				const encodedHeader = encodeBase64Url(JSON.stringify(unwrap(headerResult)));
				const encodedPayload = encodeBase64Url(JSON.stringify(unwrap(payloadResult)));
				const signingInput = `${encodedHeader}.${encodedPayload}`;

				return HMAC.sign(
					signingInput,
					parsedConfig.signingKey,
					parsedConfig.algorithm,
				).then(
					(signature) => `${signingInput}.${signature}`,
				);
			},
			decode(token: string) {
				const decodeResult = decodeToken(token);

				if (E.isLeft(decodeResult)) {
					return decodeResult;
				}

				return {
					header: decodeResult.header,
					payload: decodeResult.payload,
				};
			},
			verify(token: string) {
				const decodeResult = decodeToken(token);

				if (E.isLeft(decodeResult)) {
					return decodeResult;
				}

				const verificationKey = parsedConfig.verifyKey ?? parsedConfig.signingKey;

				return HMAC.verify(
					decodeResult.signingInput,
					decodeResult.signature,
					verificationKey,
					parsedConfig.algorithm,
				).then(
					(isValid) => {
						if (!isValid) {
							return E.left("signature-invalid");
						}

						if (
							typeof parsedConfig.issuer !== "undefined"
							&& decodeResult.payload.iss !== parsedConfig.issuer
						) {
							return E.left("issue-invalid");
						}

						if (
							typeof parsedConfig.subject !== "undefined"
							&& decodeResult.payload.sub !== parsedConfig.subject
						) {
							return E.left("subject-invalid");
						}

						if (
							!isAudienceValid(
								parsedConfig.audience,
								decodeResult.payload.aud,
							)
						) {
							return E.left("audience-invalid");
						}

						if (
							(decodeResult.payload.exp + getToleranceInSeconds(parsedConfig))
							< nowInSeconds(parsedConfig)
						) {
							return E.left("expired");
						}

						return {
							header: decodeResult.header,
							payload: decodeResult.payload,
						};
					},
				);
			},
		},
	) as Client<
		Methods<
			GenericClientConfig,
			DP.DataParserObjectShapeOutput<GenericCustomHeader>,
			DP.DataParserObjectShapeOutput<GenericCustomPayload>
		>
	>;
}

