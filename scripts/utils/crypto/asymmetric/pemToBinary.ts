import { decodeBase64 } from "@scripts/utils";

const pemWrapperRegex = /-----BEGIN [^-]+-----|-----END [^-]+-----|\s+/g;

export function pemToBinary(key: string) {
	return decodeBase64(
		key.replace(pemWrapperRegex, ""),
	);
}
