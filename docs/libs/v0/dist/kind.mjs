import { createKindNamespace } from '@duplojs/utils';

const createJsonWebTokenKind = createKindNamespace(
// @ts-expect-error reserved kind namespace
"DuplojsJsonWebToken");

export { createJsonWebTokenKind };
