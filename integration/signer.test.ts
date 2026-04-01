import { readFile } from "node:fs/promises";
import { setCurrentWorkingDirectory } from "@duplojs/server-utils";
import { asserts, E } from "@duplojs/utils";
import { Signer } from "@duplojs/json-web-token";

describe("Signer", () => {
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

	it("signs and verifies with hs256", async() => {
		const secret = "secret-hs256";
		const content = "content";

		const signer = Signer.createHS256({ secret });

		const signature = await signer.sign(content);

		await expect(
			signer.verify(content, signature),
		).resolves.toBe(true);
		await expect(
			signer.verify("other", signature),
		).resolves.toBe(false);
	});

	it("signs and verifies with hs512", async() => {
		const secret = "secret-hs512";
		const content = "content";

		const signer = Signer.createHS512({ secret });

		const signature = await signer.sign(content);

		await expect(
			signer.verify(content, signature),
		).resolves.toBe(true);
		await expect(
			signer.verify("other", signature),
		).resolves.toBe(false);
	});

	it("signs and verifies with rs256", async() => {
		const keys = await readKeyPair("rs256");
		const signer = Signer.createRS256(keys);
		const content = "content";

		const signature = await signer.sign(content);

		await expect(
			signer.verify(content, signature),
		).resolves.toBe(true);
		await expect(
			signer.verify("other", signature),
		).resolves.toBe(false);
	});

	it("signs and verifies with rs512", async() => {
		const keys = await readKeyPair("rs512");
		const signer = Signer.createRS512(keys);
		const content = "content";

		const signature = await signer.sign(content);

		await expect(
			signer.verify(content, signature),
		).resolves.toBe(true);
		await expect(
			signer.verify("other", signature),
		).resolves.toBe(false);
	});
});
