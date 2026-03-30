import { HMAC, RSA } from "@scripts/utils";
import { signerFactory } from "./factory";

export interface CreateHS256SignerParams {
	readonly secret: string;
}

export const createHS256Signer = signerFactory(
	"HS256",
	(params: CreateHS256SignerParams, algorithm) => ({
		sign: (content) => HMAC.sign(content, params.secret, algorithm),
		verify: (content, signature) => HMAC.verify(content, signature, params.secret, algorithm),
	}),
);

export interface CreateHS512SignerParams {
	readonly secret: string;
}

export const createHS512Signer = signerFactory(
	"HS512",
	(params: CreateHS512SignerParams, algorithm) => ({
		sign: (content) => HMAC.sign(content, params.secret, algorithm),
		verify: (content, signature) => HMAC.verify(content, signature, params.secret, algorithm),
	}),
);

export interface CreateRS256SignerParams {
	readonly privateKey: string;
	readonly publicKey: string;
}

export const createRS256Signer = signerFactory(
	"RS256",
	(params: CreateRS256SignerParams, algorithm) => ({
		sign: (content) => RSA.sign(content, params.privateKey, algorithm),
		verify: (content, signature) => RSA.verify(content, signature, params.publicKey, algorithm),
	}),
);

export interface CreateRS512SignerParams {
	readonly privateKey: string;
	readonly publicKey: string;
}

export const createRS512Signer = signerFactory(
	"RS512",
	(params: CreateRS512SignerParams, algorithm) => ({
		sign: (content) => RSA.sign(content, params.privateKey, algorithm),
		verify: (content, signature) => RSA.verify(content, signature, params.publicKey, algorithm),
	}),
);
