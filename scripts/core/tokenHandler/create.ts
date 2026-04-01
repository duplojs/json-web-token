import { D, E, unwrap, type DP } from "@duplojs/utils";
import { encodeBase64Url } from "@scripts/utils";
import type { TokenHandlerConfig } from "./index";
import { andThen, nowInSeconds, resolveCipher, resolveSigner, type ObjectParser, type TokenHeaderContent, type TokenPayloadContent } from "./shared";

interface CreateTokenHandlerCreateMethodParams {
	readonly config: TokenHandlerConfig;
	readonly headerParser: ObjectParser<TokenHeaderContent>;
	readonly payloadParser: ObjectParser<TokenPayloadContent>;
}

export function createTokenHandlerCreateMethod(
	params: CreateTokenHandlerCreateMethodParams,
) {
	const { config, headerParser, payloadParser } = params;

	return async function(
		payload: object,
		params?: {
			header?: object;
			signer?: object;
			cipher?: object;
		},
	): Promise<
		| string
		| E.Left<"header-parse-error", DP.DataParserError>
		| E.Left<"payload-parse-error", DP.DataParserError>
		> {
		const signer = resolveSigner(config.signer, params?.signer);
		const cipher = resolveCipher(config.cipher, params?.cipher);
		const issuedAt = nowInSeconds(config.now);
		const headerResult = headerParser.parse({
			...(params?.header ?? {}),
			typ: "JWT",
			alg: signer.algorithm,
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
		const encryptFlow = (
			signature: string,
		) => {
			const token = `${signingInput}.${signature}`;

			if (cipher !== undefined) {
				return cipher.encrypt(token);
			}

			return token;
		};

		return andThen(
			signer.sign(signingInput),
			encryptFlow,
		);
	};
}
