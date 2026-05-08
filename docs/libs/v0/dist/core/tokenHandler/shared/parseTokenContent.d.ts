import * as EE from "@duplojs/utils/either";
import type * as DP from "@duplojs/utils/dataParser";
export type TokenHeaderContent = {
    typ: "JWT";
    alg: string;
} & Record<string, unknown>;
export interface TokenPayloadContent {
    [key: string]: unknown;
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp: number;
    iat: number;
}
interface CreateParseTokenContentParams {
    readonly headerParser: DP.DataParser<TokenHeaderContent>;
    readonly payloadParser: DP.DataParser<TokenPayloadContent>;
}
export type ParseTokenContentResult = {
    header: TokenHeaderContent;
    payload: TokenPayloadContent;
} | EE.Left<"token-format"> | EE.Left<"header-decode-error"> | EE.Left<"header-parse-error", DP.DataParserError> | EE.Left<"payload-decode-error"> | EE.Left<"payload-parse-error", DP.DataParserError>;
export type ParseTokenContent = (encodedHeader: string | undefined, encodedPayload: string | undefined) => ParseTokenContentResult;
export declare function createParseTokenContent(params: CreateParseTokenContentParams): ParseTokenContent;
export {};
