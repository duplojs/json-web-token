import type * as DP from "@duplojs/utils/dataParser";
import * as EE from "@duplojs/utils/either";
import type { TokenHandlerConfig } from "./index";
import { type TokenHeaderContent, type TokenPayloadContent } from "./shared";
interface CreateTokenHandlerCreateMethodParams {
    readonly config: TokenHandlerConfig;
    readonly headerParser: DP.DataParser<TokenHeaderContent>;
    readonly payloadParser: DP.DataParser<TokenPayloadContent>;
}
export declare function createTokenHandlerCreateMethod(params: CreateTokenHandlerCreateMethodParams): (payload: object, params?: {
    header?: object;
    signer?: object;
    cipher?: object;
}) => Promise<string | EE.Left<"header-parse-error", DP.DataParserError> | EE.Left<"payload-parse-error", DP.DataParserError>>;
export {};
