import * as EE from "@duplojs/utils/either";
import type * as DP from "@duplojs/utils/dataParser";
import type { TokenHandlerConfig } from "./index";
import { type ParseTokenContent } from "./shared";
interface CreateTokenHandlerDecodeMethodParams {
    readonly config: TokenHandlerConfig;
    readonly parseTokenContent: ParseTokenContent;
}
export declare function createTokenHandlerDecodeMethod(params: CreateTokenHandlerDecodeMethodParams): (token: string, params?: {
    cipher?: object;
}) => Promise<{
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
} | EE.Left<"token-format"> | EE.Left<"header-decode-error"> | EE.Left<"header-parse-error", DP.DataParserError> | EE.Left<"payload-decode-error"> | EE.Left<"payload-parse-error", DP.DataParserError>>;
export {};
