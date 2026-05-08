import { callThen } from "@duplojs/utils";
import * as EE from "@duplojs/utils/either";
import type * as DP from "@duplojs/utils/dataParser";
import type * as DD from "@duplojs/utils/date";
import { isBase64Url } from "@scripts/utils";
import type { TokenHandlerConfig } from "./index";
import { getToleranceInSeconds, isAudienceValid, nowInSeconds, resolveCipher, resolveSigner, type ParseTokenContent } from "./shared";

interface CreateTokenHandlerVerifyMethodParams {
	readonly config: TokenHandlerConfig;
	readonly parseTokenContent: ParseTokenContent;
}

export function createTokenHandlerVerifyMethod(
	params: CreateTokenHandlerVerifyMethodParams,
) {
	const { config, parseTokenContent } = params;

	return async function(
		token: string,
		params?: {
			signer?: object;
			cipher?: object;
			tolerance?: DD.TheTime;
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
		| EE.Left<"signature-invalid">
		| EE.Left<"issue-invalid">
		| EE.Left<"subject-invalid">
		| EE.Left<"audience-invalid">
		| EE.Left<"expired">
		> {
		const cipher = resolveCipher(config.cipher, params?.cipher);
		const decryptedToken = cipher === undefined
			? token
			: cipher.decrypt(token);

		return callThen(
			decryptedToken,
			(token: string) => {
				const [encodedHeader, encodedPayload, signature] = token.split(".");

				if (!signature || !isBase64Url(signature)) {
					return EE.left("signature-invalid");
				}

				const decodeResult = parseTokenContent(
					encodedHeader,
					encodedPayload,
				);

				if (EE.isLeft(decodeResult)) {
					return decodeResult;
				}

				const signer = resolveSigner(config.signer, params?.signer);

				return callThen(
					signer.verify(
						`${encodedHeader}.${encodedPayload}`,
						signature,
					),
					(isValid) => {
						if (!isValid) {
							return EE.left("signature-invalid");
						}

						if (
							typeof config.issuer !== "undefined"
							&& decodeResult.payload.iss !== config.issuer
						) {
							return EE.left("issue-invalid");
						}

						if (
							typeof config.subject !== "undefined"
							&& decodeResult.payload.sub !== config.subject
						) {
							return EE.left("subject-invalid");
						}

						if (
							!isAudienceValid(
								config.audience,
								decodeResult.payload.aud,
							)
						) {
							return EE.left("audience-invalid");
						}

						if (
							(decodeResult.payload.exp + getToleranceInSeconds(params?.tolerance))
							< nowInSeconds(config.now)
						) {
							return EE.left("expired");
						}

						return {
							header: decodeResult.header,
							payload: decodeResult.payload,
						};
					},
				);
			},
		);
	};
}
