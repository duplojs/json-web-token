import { E, type DP } from "@duplojs/utils";
export type TokenHeaderContent = {
    typ: "JWT";
    alg: string;
} & Record<string, unknown>;
export type TokenPayloadContent = {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp: number;
    iat: number;
} & Record<string, unknown>;
export interface ObjectParser<GenericOutput extends object = object> {
    parse(value: unknown): any;
}
interface CreateParseTokenContentParams {
    readonly headerParser: ObjectParser<TokenHeaderContent>;
    readonly payloadParser: ObjectParser<TokenPayloadContent>;
}
export type ParseTokenContentResult = {
    header: TokenHeaderContent;
    payload: TokenPayloadContent;
} | E.Left<"decode-error"> | E.Left<"header-parse-error", DP.DataParserError> | E.Left<"payload-parse-error", DP.DataParserError>;
export type ParseTokenContent = (encodedHeader: string | undefined, encodedPayload: string | undefined) => ParseTokenContentResult;
export declare function createParseTokenContent(params: CreateParseTokenContentParams): ParseTokenContent;
export {};
