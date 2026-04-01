import { E, type Json } from "@duplojs/utils";
export declare function jsonParse(value: string): Json | E.Left<"json-parse-error", undefined>;
