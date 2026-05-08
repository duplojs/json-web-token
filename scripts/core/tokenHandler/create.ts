import { callThen, unwrap } from "@duplojs/utils";
import * as DD from "@duplojs/utils/date";
import type * as DP from "@duplojs/utils/dataParser";
import * as EE from "@duplojs/utils/either";
import { encodeBase64Url } from "@scripts/utils";
import type { TokenHandlerConfig } from "./index";
import { nowInSeconds, resolveCipher, resolveSigner, type TokenHeaderContent, type TokenPayloadContent } from "./shared";

interface CreateTokenHandlerCreateMethodParams {
	readonly config: TokenHandlerConfig;
	readonly headerParser: DP.DataParser<TokenHeaderContent>;
	readonly payloadParser: DP.DataParser<TokenPayloadContent>;
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
		| EE.Left<"header-parse-error", DP.DataParserError>
		| EE.Left<"payload-parse-error", DP.DataParserError>
		> {
		const signer = resolveSigner(config.signer, params?.signer);
		const cipher = resolveCipher(config.cipher, params?.cipher);
		const issuedAt = nowInSeconds(config.now);
		const defaultHeaderValue = {
			typ: "JWT",
			alg: signer.algorithm,
		};
		const headerResult = (
			params?.header && headerParser.parse({
				...params.header,
				...defaultHeaderValue,
			})
		) ?? defaultHeaderValue;
		if (EE.isLeft(headerResult)) {
			return EE.left("header-parse-error", unwrap(headerResult));
		}

		const payloadResult = payloadParser.parse({
			iss: config.issuer,
			sub: config.subject,
			aud: config.audience,
			iat: issuedAt,
			exp: DD.computeTime(config.maxAge, "second") + issuedAt,
			...payload,
		});
		if (EE.isLeft(payloadResult)) {
			return EE.left("payload-parse-error", unwrap(payloadResult));
		}

		const encodedHeader = encodeBase64Url(JSON.stringify(unwrap(headerResult)));
		const encodedPayload = encodeBase64Url(JSON.stringify(unwrap(payloadResult)));
		const signingInput = `${encodedHeader}.${encodedPayload}`;

		return callThen(
			signer.sign(signingInput),
			(signature) => {
				const token = `${signingInput}.${signature}`;

				if (cipher !== undefined) {
					return cipher.encrypt(token);
				}

				return token;
			},
		);
	};
}
