'use strict';

var utils = require('@duplojs/utils');
var kind = require('../../kind.cjs');
var create = require('./create.cjs');
var decode = require('./decode.cjs');
var verify = require('./verify.cjs');
var parseTokenContent = require('./shared/parseTokenContent.cjs');

const tokenHandlerConfigDataParser = utils.DPE.object({
    issuer: utils.DPE.string().optional(),
    audience: utils.DPE.union([
        utils.DPE.string(),
        utils.DPE.string().array(),
    ]).optional(),
    subject: utils.DPE.string().optional(),
    maxAge: utils.DPE.time(),
});
const tokenHandlerKind = kind.createJsonWebTokenKind("token-handler");
class TokenHandlerWrongConfig extends utils.kindHeritage("token-handler-wrong-config", tokenHandlerKind, Error) {
    constructor(error) {
        super({}, ["Token handler config is wrong. Please check your definition shape."]);
    }
}
class TokenHandlerCreateError extends utils.kindHeritage("token-handler-create-error", tokenHandlerKind, Error) {
    constructor(error) {
        super({}, [`Token creation failed with "${utils.E.informationKind.getValue(error)}".`]);
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
    if (utils.E.isLeft(configResult)) {
        throw new TokenHandlerWrongConfig(utils.unwrap(configResult));
    }
    const config = {
        ...utils.unwrap(configResult),
        now: params.now,
        signer: params.signer,
        cipher: params.cipher,
    };
    const payloadParser = utils.DPE.object({
        iss: utils.DPE.string().optional(),
        sub: utils.DPE.string().optional(),
        aud: utils.DPE.union([
            utils.DPE.string(),
            utils.DPE.string().array(),
        ]).optional(),
        exp: utils.DPE.number(),
        iat: utils.DPE.number(),
        ...params.customPayloadShape,
    });
    const headerParser = utils.DPE.object({
        ...(params.customHeaderShape ?? {}),
        typ: utils.DPE.literal("JWT"),
        alg: utils.DPE.literal(config.signer.algorithm),
    });
    const parseTokenContent$1 = parseTokenContent.createParseTokenContent({
        headerParser,
        payloadParser,
    });
    const createToken = create.createTokenHandlerCreateMethod({
        config,
        headerParser,
        payloadParser,
    });
    return tokenHandlerKind.setTo({
        create: createToken,
        decode: decode.createTokenHandlerDecodeMethod({
            config,
            parseTokenContent: parseTokenContent$1,
        }),
        verify: verify.createTokenHandlerVerifyMethod({
            config,
            parseTokenContent: parseTokenContent$1,
        }),
        createOrThrow(payload, params) {
            return createToken(payload, params)
                .then((value) => {
                if (utils.E.isLeft(value)) {
                    throw new TokenHandlerCreateError(value);
                }
                return value;
            });
        },
    });
}

exports.TokenHandlerCreateError = TokenHandlerCreateError;
exports.TokenHandlerWrongConfig = TokenHandlerWrongConfig;
exports.createTokenHandler = createTokenHandler;
