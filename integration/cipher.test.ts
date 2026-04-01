import { readFile } from "fs/promises";
import { setCurrentWorkingDirectory } from "@duplojs/server-utils";
import { E, asserts } from "@duplojs/utils";
import { Cipher } from "@duplojs/json-web-token";

describe("Cipher", () => {
	asserts(
		setCurrentWorkingDirectory(import.meta.dirname),
		E.isRight,
	);

	async function readKeyPair(directory: string) {
		return {
			privateKey: await readFile(`keys/${directory}/private-key.pkcs8.pem`, "utf-8"),
			publicKey: await readFile(`keys/${directory}/public-key.spki.pem`, "utf-8"),
		};
	}

	it("encrypts and decrypts with rsa oaep", async() => {
		const keys = await readKeyPair("rsa-oaep");
		const cipher = Cipher.createRSAOAEP(keys);
		const content = "integration-content-rsa-oaep";

		const encrypted = await cipher.encrypt(content);

		expect(encrypted).not.toBe(content);
		await expect(cipher.decrypt(encrypted)).resolves.toBe(content);
	});

	it("encrypts and decrypts with rsa oaep 256", async() => {
		const keys = await readKeyPair("rsa-oaep-256");
		const cipher = Cipher.createRSAOAEP256(keys);
		const content = "integration-content-rsa-oaep-256";

		const encrypted = await cipher.encrypt(content);

		expect(encrypted).not.toBe(content);
		await expect(cipher.decrypt(encrypted)).resolves.toBe(content);
	});
});
