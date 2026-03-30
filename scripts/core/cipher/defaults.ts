import { RSA_OAEP } from "@scripts/utils";
import { cipherFactory } from "./factory";

export interface CreateRSAOAEPCipher {
	readonly privateKey: string;
	readonly publicKey: string;
}

export const createRSAOAEPCipher = cipherFactory(
	"RSA-OAEP",
	(params: CreateRSAOAEPCipher, algorithm) => ({
		encrypt: (element) => RSA_OAEP.encrypt(element, params.privateKey, algorithm),
		decrypt: (element) => RSA_OAEP.decrypt(element, params.publicKey, algorithm),
	}),
);

export interface CreateRSAOAEP256Cipher {
	readonly privateKey: string;
	readonly publicKey: string;
}

export const createRSAOAEP256Cipher = cipherFactory(
	"RSA-OAEP-256",
	(params: CreateRSAOAEPCipher, algorithm) => ({
		encrypt: (element) => RSA_OAEP.encrypt(element, params.privateKey, algorithm),
		decrypt: (element) => RSA_OAEP.decrypt(element, params.publicKey, algorithm),
	}),
);
