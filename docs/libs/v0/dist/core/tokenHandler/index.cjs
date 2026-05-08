'use strict';

var utils = require('@duplojs/utils');
var EE = require('@duplojs/utils/either');
var DP = require('@duplojs/utils/dataParser');
var kind = require('../../kind.cjs');
var create = require('./create.cjs');
var decode = require('./decode.cjs');
var verify = require('./verify.cjs');
var parseTokenContent = require('./shared/parseTokenContent.cjs');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var EE__namespace = /*#__PURE__*/_interopNamespaceDefault(EE);
var DP__namespace = /*#__PURE__*/_interopNamespaceDefault(DP);

const tokenHandlerConfigDataParser = DP__namespace.object({
    issuer: DP__namespace.optional(DP__namespace.string()),
    audience: DP__namespace.optional(DP__namespace.union([
        DP__namespace.string(),
        DP__namespace.array(DP__namespace.string()),
    ])),
    subject: DP__namespace.optional(DP__namespace.string()),
    maxAge: DP__namespace.time(),
});
const tokenHandlerKind = kind.createJsonWebTokenKind("token-handler");
class TokenHandlerWrongConfig extends utils.kindHeritage("token-handler-wrong-config", tokenHandlerKind, Error) {
    constructor(error) {
        super({}, ["Token handler config is wrong. Please check your definition shape."]);
    }
}
class TokenHandlerCreateError extends utils.kindHeritage("token-handler-create-error", tokenHandlerKind, Error) {
    constructor(error) {
        super({}, [`Token creation failed with "${EE__namespace.informationKind.getValue(error)}".`]);
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
    if (EE__namespace.isLeft(configResult)) {
        throw new TokenHandlerWrongConfig(utils.unwrap(configResult));
    }
    const config = {
        ...utils.unwrap(configResult),
        now: params.now,
        signer: params.signer,
        cipher: params.cipher,
    };
    const payloadParser = DP__namespace.object({
        iss: DP__namespace.optional(DP__namespace.string()),
        sub: DP__namespace.optional(DP__namespace.string()),
        aud: DP__namespace.optional(DP__namespace.union([
            DP__namespace.string(),
            DP__namespace.array(DP__namespace.string()),
        ])),
        exp: DP__namespace.number(),
        iat: DP__namespace.number(),
        ...utils.forward(params.customPayloadShape),
    });
    const headerParser = DP__namespace.object({
        ...(params.customHeaderShape ?? {}),
        typ: DP__namespace.literal("JWT"),
        alg: DP__namespace.literal(config.signer.algorithm),
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
                if (EE__namespace.isLeft(value)) {
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
