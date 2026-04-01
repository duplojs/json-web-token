import { Cipher, decodeBase64Url, decodeText, encodeBase64Url } from "@duplojs/json-web-token";

const createWrappedCipher = Cipher.factory(
	"WRAPPED",
	(params: { prefix: string }, algorithm) => ({
		encrypt(value) {
			return encodeBase64Url(`${algorithm}:${params.prefix}:${value}`);
		},
		decrypt(value) {
			const rawValue = decodeText(decodeBase64Url(value));

			return rawValue.slice(`${algorithm}:${params.prefix}:`.length);
		},
	}),
);

const cipher = createWrappedCipher({
	prefix: "internal",
});

const encrypted = await cipher.encrypt("payload");
const decrypted = await cipher.decrypt(encrypted);
