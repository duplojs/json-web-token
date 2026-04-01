import { readFile } from "node:fs/promises";
import { setCurrentWorkingDirectory } from "@duplojs/server-utils";
import { asserts, D, DPE, E, isType } from "@duplojs/utils";
import { Cipher, Signer, createTokenHandler, decodeBase64Url, decodeText, encodeBase64Url } from "@duplojs/json-web-token";

describe("createTokenHandler", () => {
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

	const createCustomSigner = Signer.factory(
		"CUSTOM",
		(params: { prefix: string }) => ({
			sign(content) {
				return encodeBase64Url(`${params.prefix}:${content}`);
			},
			verify(content, signature) {
				return signature === encodeBase64Url(`${params.prefix}:${content}`);
			},
		}),
	);

	const createCustomCipher = Cipher.factory(
		"CUSTOM",
		(params: { prefix: string }) => ({
			encrypt(value) {
				return encodeBase64Url(`${params.prefix}:${value}`);
			},
			decrypt(value) {
				const decryptedValue = decodeText(decodeBase64Url(value));

				return decryptedValue.slice(`${params.prefix}:`.length);
			},
		}),
	);

	function createExpectedSeconds(now: D.TheDate, maxAge: D.TheTime) {
		const issuedAt = Math.floor(D.toTimestamp(now) / 1000);

		return {
			issuedAt,
			expiration: issuedAt + D.computeTime(maxAge, "second"),
		};
	}

	async function expectLeftInformation(
		result: unknown,
		information: string,
	) {
		expect(await result).toMatchObject({
			"@duplojs/utils/kind/@DuplojsUtilsEither/information": information,
		});
	}

	it("creates verifies and decodes a hs256 token without cipher", async() => {
		const now = D.now();
		const maxAge = D.createTime(30, "minute");
		const { issuedAt, expiration } = createExpectedSeconds(now, maxAge);
		const tokenHandler = createTokenHandler({
			issuer: "duplo",
			subject: "user",
			audience: ["app"],
			maxAge,
			now: () => now,
			signer: Signer.createHS256({ secret: "secret" }),
			customPayloadShape: {
				id: DPE.string(),
				role: DPE.literal("admin"),
			},
			customHeaderShape: {
				kid: DPE.string().optional(),
			},
		});

		const token = await tokenHandler.create(
			{
				id: "1",
				role: "admin",
			},
			{
				header: {
					kid: "main",
				},
			},
		);
		asserts(token, isType("string"));

		expect(await tokenHandler.decode(token)).toEqual({
			header: {
				typ: "JWT",
				alg: "HS256",
				kid: "main",
			},
			payload: {
				iss: "duplo",
				sub: "user",
				aud: ["app"],
				exp: expiration,
				iat: issuedAt,
				id: "1",
				role: "admin",
			},
		});
		expect(await tokenHandler.verify(token)).toEqual({
			header: {
				typ: "JWT",
				alg: "HS256",
				kid: "main",
			},
			payload: {
				iss: "duplo",
				sub: "user",
				aud: ["app"],
				exp: expiration,
				iat: issuedAt,
				id: "1",
				role: "admin",
			},
		});
	});

	it("creates verifies and decodes a hs512 token with rsa oaep", async() => {
		const cipherKeys = await readKeyPair("rsa-oaep");
		const now = D.now();
		const maxAge = D.createTime(20, "minute");
		const { issuedAt, expiration } = createExpectedSeconds(now, maxAge);
		const tokenHandler = createTokenHandler({
			maxAge,
			now: () => now,
			signer: Signer.createHS512({ secret: "secret" }),
			cipher: Cipher.createRSAOAEP(cipherKeys),
			customPayloadShape: {
				id: DPE.string(),
			},
		});

		const token = await tokenHandler.create({
			id: "42",
		});
		asserts(token, isType("string"));

		expect(await tokenHandler.decode(token)).toEqual({
			header: {
				typ: "JWT",
				alg: "HS512",
			},
			payload: {
				iss: undefined,
				sub: undefined,
				aud: undefined,
				exp: expiration,
				iat: issuedAt,
				id: "42",
			},
		});
		expect(await tokenHandler.verify(token)).toEqual({
			header: {
				typ: "JWT",
				alg: "HS512",
			},
			payload: {
				iss: undefined,
				sub: undefined,
				aud: undefined,
				exp: expiration,
				iat: issuedAt,
				id: "42",
			},
		});
	});

	it("creates and verifies a hs256 token with rsa oaep 256", async() => {
		const cipherKeys = await readKeyPair("rsa-oaep-256");
		const now = D.now();
		const maxAge = D.createTime(20, "minute");
		const { issuedAt, expiration } = createExpectedSeconds(now, maxAge);
		const tokenHandler = createTokenHandler({
			maxAge,
			now: () => now,
			signer: Signer.createHS256({ secret: "secret" }),
			cipher: Cipher.createRSAOAEP256(cipherKeys),
			customPayloadShape: {
				id: DPE.string(),
			},
		});

		const token = await tokenHandler.create({
			id: "91",
		});
		asserts(token, isType("string"));

		expect(await tokenHandler.verify(token)).toEqual({
			header: {
				typ: "JWT",
				alg: "HS256",
			},
			payload: {
				iss: undefined,
				sub: undefined,
				aud: undefined,
				exp: expiration,
				iat: issuedAt,
				id: "91",
			},
		});
	});

	it("creates and verifies a token with a custom signer from factory", async() => {
		const now = D.now();
		const maxAge = D.createTime(15, "minute");
		const { issuedAt, expiration } = createExpectedSeconds(now, maxAge);
		const tokenHandler = createTokenHandler({
			maxAge,
			now: () => now,
			signer: createCustomSigner({ prefix: "custom-sign" }),
			customPayloadShape: {
				id: DPE.string(),
			},
			customHeaderShape: {
				kid: DPE.string().optional(),
			},
		});

		const token = await tokenHandler.create({
			id: "12",
		});
		asserts(token, isType("string"));

		expect(await tokenHandler.verify(token)).toEqual({
			header: {
				typ: "JWT",
				alg: "CUSTOM",
			},
			payload: {
				iss: undefined,
				sub: undefined,
				aud: undefined,
				exp: expiration,
				iat: issuedAt,
				id: "12",
			},
		});
	});

	it("creates and verifies a token with a custom signer and custom cipher from factories", async() => {
		const now = D.now();
		const maxAge = D.createTime(20, "minute");
		const { issuedAt, expiration } = createExpectedSeconds(now, maxAge);
		const tokenHandler = createTokenHandler({
			issuer: "duplo",
			audience: ["web"],
			maxAge,
			now: () => now,
			signer: createCustomSigner({ prefix: "custom-sync-sign" }),
			cipher: createCustomCipher({ prefix: "custom-sync-cipher" }),
			customPayloadShape: {
				id: DPE.string(),
				mode: DPE.literal("custom"),
			},
		});

		const token = await tokenHandler.create({
			id: "23",
			mode: "custom",
		});
		asserts(token, isType("string"));

		expect(await tokenHandler.verify(token)).toEqual({
			header: {
				typ: "JWT",
				alg: "CUSTOM",
			},
			payload: {
				iss: "duplo",
				sub: undefined,
				aud: ["web"],
				exp: expiration,
				iat: issuedAt,
				id: "23",
				mode: "custom",
			},
		});
	});

	it("returns expired after the max age", async() => {
		const createdAt = D.now();
		const verifiedAt = D.addMinutes(createdAt, 2);
		const signer = Signer.createHS256({ secret: "secret" });
		const createHandler = createTokenHandler({
			maxAge: D.createTime(1, "minute"),
			now: () => createdAt,
			signer,
			customPayloadShape: {
				id: DPE.string(),
			},
		});
		const verifyHandler = createTokenHandler({
			maxAge: D.createTime(1, "minute"),
			now: () => verifiedAt,
			signer,
			customPayloadShape: {
				id: DPE.string(),
			},
		});
		const token = await createHandler.create({
			id: "1",
		});
		asserts(token, isType("string"));

		await expectLeftInformation(
			verifyHandler.verify(token),
			"expired",
		);
	});

	it("creates and verifies a token with signer and cipher creators passed directly", async() => {
		const cipherKeys = await readKeyPair("rsa-oaep");
		const now = D.now();
		const maxAge = D.createTime(10, "minute");
		const { issuedAt, expiration } = createExpectedSeconds(now, maxAge);
		const tokenHandler = createTokenHandler({
			maxAge,
			now: () => now,
			signer: Signer.createHS256,
			cipher: Cipher.createRSAOAEP,
			customPayloadShape: {
				id: DPE.string(),
			},
		});

		const token = await tokenHandler.create(
			{
				id: "09",
			},
			{
				signer: {
					secret: "secret",
				},
				cipher: cipherKeys,
			},
		);
		asserts(token, isType("string"));

		expect(await tokenHandler.verify(
			token,
			{
				signer: {
					secret: "secret",
				},
				cipher: cipherKeys,
			},
		)).toEqual({
			header: {
				typ: "JWT",
				alg: "HS256",
			},
			payload: {
				iss: undefined,
				sub: undefined,
				aud: undefined,
				exp: expiration,
				iat: issuedAt,
				id: "09",
			},
		});
		await expectLeftInformation(
			tokenHandler.verify(token, {
				signer: {
					secret: "wrong-secret",
				},
				cipher: cipherKeys,
			}),
			"signature-invalid",
		);
	});
});
