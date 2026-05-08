import * as EE from "@duplojs/utils/either";
import type * as DP from "@duplojs/utils/dataParser";
import type * as DD from "@duplojs/utils/date";
import type { TokenHandlerConfig } from "./index";
import { type ParseTokenContent } from "./shared";
interface CreateTokenHandlerVerifyMethodParams {
    readonly config: TokenHandlerConfig;
    readonly parseTokenContent: ParseTokenContent;
}
export declare function createTokenHandlerVerifyMethod(params: CreateTokenHandlerVerifyMethodParams): (token: string, params?: {
    signer?: object;
    cipher?: object;
    tolerance?: DD.TheTime;
}) => Promise<{
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
} | EE.Left<"token-format"> | EE.Left<"header-decode-error"> | EE.Left<"header-parse-error", DP.DataParserError> | EE.Left<"payload-decode-error"> | EE.Left<"payload-parse-error", DP.DataParserError> | EE.Left<"signature-invalid"> | EE.Left<"issue-invalid"> | EE.Left<"subject-invalid"> | EE.Left<"audience-invalid"> | EE.Left<"expired">>;
export {};
