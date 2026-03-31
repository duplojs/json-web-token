import { RSA_OAEP } from "@scripts/utils";
import { factory } from "./factory";

export interface CreateRSAOAEPParams {
	readonly privateKey: string;
	readonly publicKey: string;
}

export const createRSAOAEP = factory(
	"RSA-OAEP",
	(params: CreateRSAOAEPParams, algorithm) => ({
		encrypt: (element) => RSA_OAEP.encrypt(element, params.publicKey, algorithm),
		decrypt: (element) => RSA_OAEP.decrypt(element, params.privateKey, algorithm),
	}),
);

export interface CreateRSAOAEP256Params {
	readonly privateKey: string;
	readonly publicKey: string;
}

export const createRSAOAEP256 = factory(
	"RSA-OAEP-256",
	(params: CreateRSAOAEP256Params, algorithm) => ({
		encrypt: (element) => RSA_OAEP.encrypt(element, params.publicKey, algorithm),
		decrypt: (element) => RSA_OAEP.decrypt(element, params.privateKey, algorithm),
	}),
);
