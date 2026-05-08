'use strict';

var utils = require('@duplojs/utils');
var EE = require('@duplojs/utils/either');
var base64Url = require('../../../utils/encoding/base64Url.cjs');
var jsonParse = require('../../../utils/encoding/jsonParse.cjs');
var text = require('../../../utils/encoding/text.cjs');

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

function createParseTokenContent(params) {
    const { headerParser, payloadParser } = params;
    return (encodedHeader, encodedPayload) => {
        if (!encodedHeader
            || !encodedPayload
            || !base64Url.isBase64Url(encodedHeader)
            || !base64Url.isBase64Url(encodedPayload)) {
            return EE__namespace.left("token-format");
        }
        const headerJsonResult = jsonParse.jsonParse(text.decodeText(base64Url.decodeBase64Url(encodedHeader)));
        if (headerJsonResult === undefined) {
            return EE__namespace.left("header-decode-error");
        }
        const headerResult = headerParser.parse(headerJsonResult);
        if (EE__namespace.isLeft(headerResult)) {
            return EE__namespace.left("header-parse-error", utils.unwrap(headerResult));
        }
        const payloadJsonResult = jsonParse.jsonParse(text.decodeText(base64Url.decodeBase64Url(encodedPayload)));
        if (payloadJsonResult === undefined) {
            return EE__namespace.left("payload-decode-error");
        }
        const payloadResult = payloadParser.parse(payloadJsonResult);
        if (EE__namespace.isLeft(payloadResult)) {
            return EE__namespace.left("payload-parse-error", utils.unwrap(payloadResult));
        }
        return {
            header: utils.unwrap(headerResult),
            payload: utils.unwrap(payloadResult),
        };
    };
}

exports.createParseTokenContent = createParseTokenContent;
