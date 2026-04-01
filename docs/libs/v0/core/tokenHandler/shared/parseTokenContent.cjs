'use strict';

var utils = require('@duplojs/utils');
var base64Url = require('../../../utils/encoding/base64Url.cjs');
var jsonParse = require('../../../utils/encoding/jsonParse.cjs');
var text = require('../../../utils/encoding/text.cjs');

function createParseTokenContent(params) {
    const { headerParser, payloadParser } = params;
    return (encodedHeader, encodedPayload) => {
        if (!encodedHeader
            || !encodedPayload
            || !base64Url.isBase64Url(encodedHeader)
            || !base64Url.isBase64Url(encodedPayload)) {
            return utils.E.left("decode-error");
        }
        const headerJsonResult = jsonParse.jsonParse(text.decodeText(base64Url.decodeBase64Url(encodedHeader)));
        if (utils.E.isLeft(headerJsonResult)) {
            return utils.E.left("decode-error");
        }
        const headerResult = headerParser.parse(headerJsonResult);
        if (utils.E.isLeft(headerResult)) {
            return utils.E.left("header-parse-error", utils.unwrap(headerResult));
        }
        const payloadJsonResult = jsonParse.jsonParse(text.decodeText(base64Url.decodeBase64Url(encodedPayload)));
        if (utils.E.isLeft(payloadJsonResult)) {
            return utils.E.left("decode-error");
        }
        const payloadResult = payloadParser.parse(payloadJsonResult);
        if (utils.E.isLeft(payloadResult)) {
            return utils.E.left("payload-parse-error", utils.unwrap(payloadResult));
        }
        return {
            header: utils.unwrap(headerResult),
            payload: utils.unwrap(payloadResult),
        };
    };
}

exports.createParseTokenContent = createParseTokenContent;
