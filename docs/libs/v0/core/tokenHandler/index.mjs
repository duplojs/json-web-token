import { kindHeritage, E, DPE, unwrap } from '@duplojs/utils';
import { createJsonWebTokenKind } from '../../kind.mjs';
import { createTokenHandlerCreateMethod } from './create.mjs';
import { createTokenHandlerDecodeMethod } from './decode.mjs';
import { createTokenHandlerVerifyMethod } from './verify.mjs';
import { createParseTokenContent } from './shared/parseTokenContent.mjs';
import { andThen } from './shared/andThen.mjs';

const tokenHandlerConfigDataParser = DPE.object({
    issuer: DPE.string().optional(),
    audience: DPE.union([
        DPE.string(),
        DPE.string().array(),
    ]).optional(),
    subject: DPE.string().optional(),
    maxAge: DPE.time(),
});
const tokenHandlerKind = createJsonWebTokenKind("token-handler");
class TokenHandlerWrongConfig extends kindHeritage("token-handler-wrong-config", tokenHandlerKind, Error) {
    constructor(error) {
        super({}, ["Token handler config is wrong. Please check your definition shape."]);
    }
}
class TokenHandlerCreateError extends kindHeritage("token-handler-create-error", tokenHandlerKind, Error) {
    constructor(error) {
        super({}, [`Token creation failed with "${E.informationKind.getValue(error)}".`]);
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
    if (E.isLeft(configResult)) {
        throw new TokenHandlerWrongConfig(unwrap(configResult));
    }
    const config = {
        ...unwrap(configResult),
        now: params.now,
        signer: params.signer,
        cipher: params.cipher,
    };
    const payloadParser = DPE.object({
        iss: DPE.string().optional(),
        sub: DPE.string().optional(),
        aud: DPE.union([
            DPE.string(),
            DPE.string().array(),
        ]).optional(),
        exp: DPE.number(),
        iat: DPE.number(),
        ...params.customPayloadShape,
    });
    const headerParser = DPE.object({
        ...(params.customHeaderShape ?? {}),
        typ: DPE.literal("JWT"),
        alg: DPE.literal(config.signer.algorithm),
    });
    const parseTokenContent = createParseTokenContent({
        headerParser,
        payloadParser,
    });
    return tokenHandlerKind.setTo({
        create: createTokenHandlerCreateMethod({
            config,
            headerParser,
            payloadParser,
        }),
        decode: createTokenHandlerDecodeMethod({
            config,
            parseTokenContent,
        }),
        verify: createTokenHandlerVerifyMethod({
            config,
            parseTokenContent,
        }),
        createOrThrow(payload, params) {
            return andThen(createTokenHandlerCreateMethod({
                config,
                headerParser,
                payloadParser,
            })(payload, params), (value) => {
                if (E.isLeft(value)) {
                    throw new TokenHandlerCreateError(value);
                }
                return value;
            });
        },
    });
}

export { TokenHandlerCreateError, TokenHandlerWrongConfig, createTokenHandler };
