import { D, unwrap, type DP, DPE, E, type Kind, type SimplifyTopLevel, A, type IsEqual } from "@duplojs/utils";
import { decodeBase64Url, decodeText, encodeBase64Url, jsonParse } from "@scripts/core";
import { createJsonWebTokenKind } from "@scripts/kind";
import type { Signer } from "./signer";

const clientConfigDataParser = DPE.object({
	issuer: DPE.string().optional(),
	audience: DPE.union([
		DPE.string(),
		DPE.string().array(),
	]).optional(),
	subject: DPE.string().optional(),
	tolerance: DPE.time().optional(),
	maxAge: DPE.time().optional(),
});

export type ClientConfig<
	GenericAlgorithm extends string = string,
> = SimplifyTopLevel<
	& {
		now?(): D.TheDate;
		signer: Signer<GenericAlgorithm>;
	}
	& DPE.Output<typeof clientConfigDataParser>
>;

type UnknownToUndefined<
	GenericValue extends unknown,
> = IsEqual<GenericValue, unknown> extends true
	? undefined
	: GenericValue;

export interface DecodeOutput<
	GenericClientConfig extends ClientConfig,
	GenericCustomPayload extends Record<string, unknown>,
	GenericCustomHeader extends Record<string, unknown>,
> {
	readonly header: SimplifyTopLevel<
	{
		readonly typ: "JWT";
		readonly alg: GenericClientConfig["signer"]["algorithm"];
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
	verify(token: string):
		| Promise<SimplifyTopLevel<DecodeOutput<GenericClientConfig, GenericCustomPayload, GenericCustomHeader>>>
		| E.Left<"decode-error">
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>
		| E.Left<"signature-invalid">
		| E.Left<"issue-invalid">
		| E.Left<"subject-invalid">
		| E.Left<"audience-invalid">
		| E.Left<"expired">;
	decode(token: string):
		| SimplifyTopLevel<DecodeOutput<GenericClientConfig, GenericCustomPayload, GenericCustomHeader>>
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
	const now = config.now?.() ?? D.now();

	return Math.floor(D.toTimestamp(now) / 1000);
}

function getExpirationInSeconds(config: ClientConfig, issuedAt: number) {
	return config.maxAge
		? issuedAt + D.computeTime(config.maxAge, "second")
		: D.maxTimeValue;
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
	DP.DataParserBigInt
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
		Methods<
			GenericClientConfig,
			DP.DataParserObjectShapeOutput<GenericCustomPayload>,
			DP.DataParserObjectShapeOutput<GenericCustomHeader>
		>>
	| E.Left<"config-invalid", DP.DataParserError> {
	const configResult = clientConfigDataParser.parse(params.config);

	if (E.isLeft(configResult)) {
		return E.left("config-invalid", unwrap(configResult));
	}

	const config = {
		...unwrap(configResult),
		now: params.config.now,
		signer: params.config.signer,
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
			content: matchResult[1]!,
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
					exp: getExpirationInSeconds(config, issuedAt),
					...payload,
				});
				if (E.isLeft(payloadResult)) {
					return E.left("payload-parse-error", unwrap(payloadResult));
				}

				const encodedHeader = encodeBase64Url(JSON.stringify(unwrap(headerResult)));
				const encodedPayload = encodeBase64Url(JSON.stringify(unwrap(payloadResult)));
				const signingInput = `${encodedHeader}.${encodedPayload}`;
				const signatureResult = config.signer.sign(signingInput);

				if (signatureResult instanceof Promise) {
					return signatureResult.then(
						(signature) => `${signingInput}.${signature}`,
					);
				}

				return `${signingInput}.${signatureResult}`;
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

				const verifyResult = config.signer.verify(
					decodeResult.signingInput,
					decodeResult.signature,
				);

				if (verifyResult instanceof Promise) {
					return verifyResult.then(
						(isValid) => verifyFlow(decodeResult, isValid),
					);
				}

				return verifyFlow(decodeResult, verifyResult);
			},
		},
	) as Client<
		Methods<
			GenericClientConfig,
			DP.DataParserObjectShapeOutput<GenericCustomPayload>,
			DP.DataParserObjectShapeOutput<GenericCustomHeader>
		>
	>;
}
