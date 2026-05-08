import { Cipher, decodeBase64Url, decodeText, encodeBase64Url } from "@json-web-token/v0";

const createCustomCipher = Cipher.factory(
	"CUSTOM",
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

const cipher = createCustomCipher({
	prefix: "my-prefix",
});

const encrypted = await cipher.encrypt("user:1");
const decrypted = await cipher.decrypt(encrypted);
