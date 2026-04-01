import { E, unwrap } from '@duplojs/utils';
import { isBase64Url, decodeBase64Url } from '../../../utils/encoding/base64Url.mjs';
import { jsonParse } from '../../../utils/encoding/jsonParse.mjs';
import { decodeText } from '../../../utils/encoding/text.mjs';

function createParseTokenContent(params) {
    const { headerParser, payloadParser } = params;
    return (encodedHeader, encodedPayload) => {
        if (!encodedHeader
            || !encodedPayload
            || !isBase64Url(encodedHeader)
            || !isBase64Url(encodedPayload)) {
            return E.left("decode-error");
        }
        const headerJsonResult = jsonParse(decodeText(decodeBase64Url(encodedHeader)));
        if (E.isLeft(headerJsonResult)) {
            return E.left("decode-error");
        }
        const headerResult = headerParser.parse(headerJsonResult);
        if (E.isLeft(headerResult)) {
            return E.left("header-parse-error", unwrap(headerResult));
        }
        const payloadJsonResult = jsonParse(decodeText(decodeBase64Url(encodedPayload)));
        if (E.isLeft(payloadJsonResult)) {
            return E.left("decode-error");
        }
        const payloadResult = payloadParser.parse(payloadJsonResult);
        if (E.isLeft(payloadResult)) {
            return E.left("payload-parse-error", unwrap(payloadResult));
        }
        return {
            header: unwrap(headerResult),
            payload: unwrap(payloadResult),
        };
    };
}

export { createParseTokenContent };
