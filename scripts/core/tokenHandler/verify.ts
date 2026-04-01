import { E, type DP } from "@duplojs/utils";
import { isBase64Url } from "@scripts/utils";
import type { TokenHandlerConfig } from "./index";
import { andThen, getToleranceInSeconds, isAudienceValid, nowInSeconds, resolveCipher, resolveSigner, type ParseTokenContent } from "./shared";

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
		},
	): Promise<
		| {
			header: Record<string, unknown>;
			payload: Record<string, unknown>;
		}
		| E.Left<"decode-error">
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>
		| E.Left<"signature-invalid">
		| E.Left<"issue-invalid">
		| E.Left<"subject-invalid">
		| E.Left<"audience-invalid">
		| E.Left<"expired">
		> {
		const verifyFlow = (
			token: string,
		) => {
			const [encodedHeader, encodedPayload, signature] = token.split(".");

			if (!signature || !isBase64Url(signature)) {
				return E.left("signature-invalid");
			}

			const decodeResult = parseTokenContent(
				encodedHeader,
				encodedPayload,
			);

			if (E.isLeft(decodeResult)) {
				return decodeResult;
			}

			const signer = resolveSigner(config.signer, params?.signer);
			const finishVerify = (
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
					(decodeResult.payload.exp + getToleranceInSeconds(config.tolerance))
					< nowInSeconds(config.now)
				) {
					return E.left("expired");
				}

				return {
					header: decodeResult.header,
					payload: decodeResult.payload,
				};
			};

			return andThen(
				signer.verify(
					`${encodedHeader}.${encodedPayload}`,
					signature,
				),
				finishVerify,
			);
		};

		const cipher = resolveCipher(config.cipher, params?.cipher);
		const decryptedToken = cipher === undefined
			? token
			: cipher.decrypt(token);

		return andThen(
			decryptedToken,
			verifyFlow,
		);
	};
}
