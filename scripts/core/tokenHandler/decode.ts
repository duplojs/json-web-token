import { E, type DP, type MaybePromise } from "@duplojs/utils";
import type { TokenHandlerConfig } from "./index";
import { andThen, resolveCipher, type ParseTokenContent } from "./shared";

interface CreateTokenHandlerDecodeMethodParams {
	readonly config: TokenHandlerConfig;
	readonly parseTokenContent: ParseTokenContent;
}

export function createTokenHandlerDecodeMethod(
	params: CreateTokenHandlerDecodeMethodParams,
) {
	const { config, parseTokenContent } = params;

	return function decode(
		token: string,
		params?: {
			cipher?: object;
		},
	): MaybePromise<
		| {
			header: Record<string, unknown>;
			payload: Record<string, unknown>;
		}
		| E.Left<"decode-error">
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>
		> {
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

		const cipher = resolveCipher(config.cipher, params?.cipher);
		const decryptedToken = cipher === undefined
			? token
			: cipher.decrypt(token);

		return andThen(
			decryptedToken,
			decodeFlow,
		);
	};
}
