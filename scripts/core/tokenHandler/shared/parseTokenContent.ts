import { unwrap } from "@duplojs/utils";
import * as EE from "@duplojs/utils/either";
import type * as DP from "@duplojs/utils/dataParser";
import { decodeBase64Url, decodeText, isBase64Url, jsonParse } from "@scripts/utils";

export type TokenHeaderContent = {
	typ: "JWT";
	alg: string;
} & Record<string, unknown>;

export interface TokenPayloadContent {
	[key: string]: unknown;
	iss?: string;
	sub?: string;
	aud?: string | string[];
	exp: number;
	iat: number;
}

interface CreateParseTokenContentParams {
	readonly headerParser: DP.DataParser<TokenHeaderContent>;
	readonly payloadParser: DP.DataParser<TokenPayloadContent>;
}

export type ParseTokenContentResult =
	| {
		header: TokenHeaderContent;
		payload: TokenPayloadContent;
	}
	| EE.Left<"token-format">
	| EE.Left<"header-decode-error">
	| EE.Left<"header-parse-error", DP.DataParserError>
	| EE.Left<"payload-decode-error">
	| EE.Left<"payload-parse-error", DP.DataParserError>;

export type ParseTokenContent = (
	encodedHeader: string | undefined,
	encodedPayload: string | undefined,
) => ParseTokenContentResult;

export function createParseTokenContent(
	params: CreateParseTokenContentParams,
): ParseTokenContent {
	const { headerParser, payloadParser } = params;

	return (encodedHeader, encodedPayload) => {
		if (
			!encodedHeader
			|| !encodedPayload
			|| !isBase64Url(encodedHeader)
			|| !isBase64Url(encodedPayload)
		) {
			return EE.left("token-format");
		}

		const headerJsonResult = jsonParse(
			decodeText(decodeBase64Url(encodedHeader)),
		);
		if (headerJsonResult === undefined) {
			return EE.left("header-decode-error");
		}

		const headerResult = headerParser.parse(headerJsonResult);
		if (EE.isLeft(headerResult)) {
			return EE.left("header-parse-error", unwrap(headerResult));
		}

		const payloadJsonResult = jsonParse(
			decodeText(decodeBase64Url(encodedPayload)),
		);
		if (payloadJsonResult === undefined) {
			return EE.left("payload-decode-error");
		}

		const payloadResult = payloadParser.parse(payloadJsonResult);
		if (EE.isLeft(payloadResult)) {
			return EE.left("payload-parse-error", unwrap(payloadResult));
		}

		return {
			header: unwrap(headerResult),
			payload: unwrap(payloadResult),
		};
	};
}
