import { Signer } from "@duplojs/json-web-token";

const createCustomSigner = Signer.factory(
	"CUSTOM",
	(params: { secret: string }, algorithm) => ({
		sign(content) {
			return `${algorithm}:${params.secret}:${content}`;
		},
		verify(content, signature) {
			return signature === `${algorithm}:${params.secret}:${content}`;
		},
	}),
);

const signer = createCustomSigner({
	secret: "my-secret",
});

const signature = await signer.sign("user:1");
const isValid = await signer.verify("user:1", signature);
