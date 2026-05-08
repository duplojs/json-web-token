declare module "@duplojs/utils" {
    interface ReservedKindNamespace {
        DuplojsJsonWebToken: true;
    }
}
export declare const createJsonWebTokenKind: <GenericName extends string, GenericKindValue extends unknown = unknown>(name: GenericName & import("@duplojs/utils/string").ForbiddenString<GenericName, "/" | "@">) => import("@duplojs/utils").KindHandler<import("@duplojs/utils").KindDefinition<`@DuplojsJsonWebToken/${GenericName}`, GenericKindValue>>;
