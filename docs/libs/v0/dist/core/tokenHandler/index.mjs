import { kindHeritage, unwrap, forward } from '@duplojs/utils';
import * as EE from '@duplojs/utils/either';
import * as DP from '@duplojs/utils/dataParser';
import { createJsonWebTokenKind } from '../../kind.mjs';
import { createTokenHandlerCreateMethod } from './create.mjs';
import { createTokenHandlerDecodeMethod } from './decode.mjs';
import { createTokenHandlerVerifyMethod } from './verify.mjs';
import { createParseTokenContent } from './shared/parseTokenContent.mjs';

const tokenHandlerConfigDataParser = DP.object({
    issuer: DP.optional(DP.string()),
    audience: DP.optional(DP.union([
        DP.string(),
        DP.array(DP.string()),
    ])),
    subject: DP.optional(DP.string()),
    maxAge: DP.time(),
});
const tokenHandlerKind = createJsonWebTokenKind("token-handler");
class TokenHandlerWrongConfig extends kindHeritage("token-handler-wrong-config", tokenHandlerKind, Error) {
    constructor(error) {
        super({}, ["Token handler config is wrong. Please check your definition shape."]);
    }
}
class TokenHandlerCreateError extends kindHeritage("token-handler-create-error", tokenHandlerKind, Error) {
    constructor(error) {
        super({}, [`Token creation failed with "${EE.informationKind.getValue(error)}".`]);
    }
}
/**
 * {@include core/tokenHandler/createTokenHandler/index.md}
 */
function createTokenHandler(params) {
    const configResult = tokenHandlerConfigDataParser.parse({
        issuer: params.issuer,
        audience: params.audience,
        subject: params.subject,
        maxAge: params.maxAge,
    });
    if (EE.isLeft(configResult)) {
        throw new TokenHandlerWrongConfig(unwrap(configResult));
    }
    const config = {
        ...unwrap(configResult),
        now: params.now,
        signer: params.signer,
        cipher: params.cipher,
    };
    const payloadParser = DP.object({
        iss: DP.optional(DP.string()),
        sub: DP.optional(DP.string()),
        aud: DP.optional(DP.union([
            DP.string(),
            DP.array(DP.string()),
        ])),
        exp: DP.number(),
        iat: DP.number(),
        ...forward(params.customPayloadShape),
    });
    const headerParser = DP.object({
        ...(params.customHeaderShape ?? {}),
        typ: DP.literal("JWT"),
        alg: DP.literal(config.signer.algorithm),
    });
    const parseTokenContent = createParseTokenContent({
        headerParser,
        payloadParser,
    });
    const createToken = createTokenHandlerCreateMethod({
        config,
        headerParser,
        payloadParser,
    });
    return tokenHandlerKind.setTo({
        create: createToken,
        decode: createTokenHandlerDecodeMethod({
            config,
            parseTokenContent,
        }),
        verify: createTokenHandlerVerifyMethod({
            config,
            parseTokenContent,
        }),
        createOrThrow(payload, params) {
            return createToken(payload, params)
                .then((value) => {
                if (EE.isLeft(value)) {
                    throw new TokenHandlerCreateError(value);
                }
                return value;
            });
        },
    });
}

export { TokenHandlerCreateError, TokenHandlerWrongConfig, createTokenHandler };
