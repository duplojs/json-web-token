import type { MaybePromise } from "@duplojs/utils";
export declare function andThen<GenericInput extends unknown, GenericOutput extends unknown>(value: MaybePromise<GenericInput>, callback: (value: GenericInput) => MaybePromise<GenericOutput>): MaybePromise<GenericOutput>;
