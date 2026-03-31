import { HMAC, RSA } from "@scripts/utils";
import { factory } from "./factory";

export interface CreateHS256Params {
	readonly secret: string;
}

export const createHS256 = factory(
	"HS256",
	(params: CreateHS256Params, algorithm) => ({
		sign: (content) => HMAC.sign(content, params.secret, algorithm),
		verify: (content, signature) => HMAC.verify(content, signature, params.secret, algorithm),
	}),
);

export interface CreateHS512Params {
	readonly secret: string;
}

export const createHS512 = factory(
	"HS512",
	(params: CreateHS512Params, algorithm) => ({
		sign: (content) => HMAC.sign(content, params.secret, algorithm),
		verify: (content, signature) => HMAC.verify(content, signature, params.secret, algorithm),
	}),
);

export interface CreateRS256Params {
	readonly privateKey: string;
	readonly publicKey: string;
}

export const createRS256 = factory(
	"RS256",
	(params: CreateRS256Params, algorithm) => ({
		sign: (content) => RSA.sign(content, params.privateKey, algorithm),
		verify: (content, signature) => RSA.verify(content, signature, params.publicKey, algorithm),
	}),
);

export interface CreateRS512Params {
	readonly privateKey: string;
	readonly publicKey: string;
}

export const createRS512 = factory(
	"RS512",
	(params: CreateRS512Params, algorithm) => ({
		sign: (content) => RSA.sign(content, params.privateKey, algorithm),
		verify: (content, signature) => RSA.verify(content, signature, params.publicKey, algorithm),
	}),
);
