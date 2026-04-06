import { callThen, E, type DP } from "@duplojs/utils";
import type { TokenHandlerConfig } from "./index";
import { resolveCipher, type ParseTokenContent } from "./shared";

interface CreateTokenHandlerDecodeMethodParams {
	readonly config: TokenHandlerConfig;
	readonly parseTokenContent: ParseTokenContent;
}

export function createTokenHandlerDecodeMethod(
	params: CreateTokenHandlerDecodeMethodParams,
) {
	const { config, parseTokenContent } = params;

	return async function(
		token: string,
		params?: {
			cipher?: object;
		},
	): Promise<
		| {
			header: Record<string, unknown>;
			payload: Record<string, unknown>;
		}
		| E.Left<"token-format">
		| E.Left<"header-decode-error">
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-decode-error">
		| E.Left<"payload-parse-error", DP.DataParserError>
		> {
		const cipher = resolveCipher(config.cipher, params?.cipher);
		const decryptedToken = cipher === undefined
			? token
			: cipher.decrypt(token);

		return callThen(
			decryptedToken,
			(token) => {
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
			},
		);
	};
}
