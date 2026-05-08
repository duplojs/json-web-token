import { unwrap } from '@duplojs/utils';
import * as EE from '@duplojs/utils/either';
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
            return EE.left("token-format");
        }
        const headerJsonResult = jsonParse(decodeText(decodeBase64Url(encodedHeader)));
        if (headerJsonResult === undefined) {
            return EE.left("header-decode-error");
        }
        const headerResult = headerParser.parse(headerJsonResult);
        if (EE.isLeft(headerResult)) {
            return EE.left("header-parse-error", unwrap(headerResult));
        }
        const payloadJsonResult = jsonParse(decodeText(decodeBase64Url(encodedPayload)));
        if (payloadJsonResult === undefined) {
            return EE.left("payload-decode-error");
        }
        const payloadResult = payloadParser.parse(payloadJsonResult);
        if (EE.isLeft(payloadResult)) {
            return EE.left("payload-parse-error", unwrap(payloadResult));
        }
        return {
            header: unwrap(headerResult),
            payload: unwrap(payloadResult),
        };
    };
}

export { createParseTokenContent };
