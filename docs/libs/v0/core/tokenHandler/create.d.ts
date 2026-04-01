import { E, type DP } from "@duplojs/utils";
import type { TokenHandlerConfig } from "./index";
import { type ObjectParser, type TokenHeaderContent, type TokenPayloadContent } from "./shared";
interface CreateTokenHandlerCreateMethodParams {
    readonly config: TokenHandlerConfig;
    readonly headerParser: ObjectParser<TokenHeaderContent>;
    readonly payloadParser: ObjectParser<TokenPayloadContent>;
}
export declare function createTokenHandlerCreateMethod(params: CreateTokenHandlerCreateMethodParams): (payload: object, params?: {
    header?: object;
    signer?: object;
    cipher?: object;
}) => Promise<string | E.Left<"header-parse-error", DP.DataParserError> | E.Left<"payload-parse-error", DP.DataParserError>>;
export {};
