import { kindHeritage, DPE, E, unwrap } from '@duplojs/utils';
import { createJsonWebTokenKind } from '../../kind.mjs';
import { createTokenHandlerCreateMethod } from './create.mjs';
import { createTokenHandlerDecodeMethod } from './decode.mjs';
import { createTokenHandlerVerifyMethod } from './verify.mjs';
import { createParseTokenContent } from './shared/parseTokenContent.mjs';

const tokenHandlerConfigDataParser = DPE.object({
    issuer: DPE.string().optional(),
    audience: DPE.union([
        DPE.string(),
        DPE.string().array(),
    ]).optional(),
    subject: DPE.string().optional(),
    tolerance: DPE.time().optional(),
    maxAge: DPE.time(),
});
const tokenHandlerKind = createJsonWebTokenKind("token-handler");
class TokenHandlerWrongConfig extends kindHeritage("token-handler-wrong-config", tokenHandlerKind, Error) {
    constructor(error) {
        super({}, ["Token handler config is wrong. Please check your definition shape."]);
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
        tolerance: params.tolerance,
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
    });
}

export { TokenHandlerWrongConfig, createTokenHandler };
