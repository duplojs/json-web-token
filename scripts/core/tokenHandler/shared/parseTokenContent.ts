import { E, unwrap, type DP } from "@duplojs/utils";
import { decodeBase64Url, decodeText, isBase64Url, jsonParse } from "@scripts/utils";

export type TokenHeaderContent = {
	typ: "JWT";
	alg: string;
} & Record<string, unknown>;

export type TokenPayloadContent = {
	iss?: string;
	sub?: string;
	aud?: string | string[];
	exp: number;
	iat: number;
} & Record<string, unknown>;

export interface ObjectParser<
	GenericOutput extends object = object,
> {
	parse(value: unknown): any;
}

interface CreateParseTokenContentParams {
	readonly headerParser: ObjectParser<TokenHeaderContent>;
	readonly payloadParser: ObjectParser<TokenPayloadContent>;
}

export type ParseTokenContentResult =
	| {
		header: TokenHeaderContent;
		payload: TokenPayloadContent;
	}
	| E.Left<"decode-error">
	| E.Left<"header-parse-error", DP.DataParserError>
	| E.Left<"payload-parse-error", DP.DataParserError>;

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
		};
	};
}
