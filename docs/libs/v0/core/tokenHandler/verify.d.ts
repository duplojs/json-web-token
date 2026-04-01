import { E, type DP } from "@duplojs/utils";
import type { TokenHandlerConfig } from "./index";
import { type ParseTokenContent } from "./shared";
interface CreateTokenHandlerVerifyMethodParams {
    readonly config: TokenHandlerConfig;
    readonly parseTokenContent: ParseTokenContent;
}
export declare function createTokenHandlerVerifyMethod(params: CreateTokenHandlerVerifyMethodParams): (token: string, params?: {
    signer?: object;
    cipher?: object;
}) => Promise<{
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
} | E.Left<"decode-error"> | E.Left<"header-parse-error", DP.DataParserError> | E.Left<"payload-parse-error", DP.DataParserError> | E.Left<"signature-invalid"> | E.Left<"issue-invalid"> | E.Left<"subject-invalid"> | E.Left<"audience-invalid"> | E.Left<"expired">>;
export {};
