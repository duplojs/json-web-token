import { callThen } from "@duplojs/utils";
import * as EE from "@duplojs/utils/either";
import type * as DP from "@duplojs/utils/dataParser";
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
		| EE.Left<"token-format">
		| EE.Left<"header-decode-error">
		| EE.Left<"header-parse-error", DP.DataParserError>
		| EE.Left<"payload-decode-error">
		| EE.Left<"payload-parse-error", DP.DataParserError>
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

				if (EE.isLeft(decodeResult)) {
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
