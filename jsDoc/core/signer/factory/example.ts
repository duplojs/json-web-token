import { Signer } from "@duplojs/json-web-token";

const createApiSigner = Signer.factory(
	"API",
	(params: { secret: string }, algorithm) => ({
		sign(content) {
			return `${algorithm}:${params.secret}:${content}`;
		},
		verify(content, signature) {
			return signature === `${algorithm}:${params.secret}:${content}`;
		},
	}),
);

const signer = createApiSigner({
	secret: "my-secret",
});

const signature = await signer.sign("user:1");
const isValid = await signer.verify("user:1", signature);
