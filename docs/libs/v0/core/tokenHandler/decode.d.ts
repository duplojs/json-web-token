import { E, type DP } from "@duplojs/utils";
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
} | E.Left<"token-format"> | E.Left<"header-decode-error"> | E.Left<"header-parse-error", DP.DataParserError> | E.Left<"payload-decode-error"> | E.Left<"payload-parse-error", DP.DataParserError>>;
export {};
