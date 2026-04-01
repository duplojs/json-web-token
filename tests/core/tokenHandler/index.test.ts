import { D, DPE, E } from "@duplojs/utils";
import { Cipher, Signer, TokenHandlerWrongConfig, createTokenHandler, encodeBase64Url } from "@scripts";

describe("createTokenHandler", () => {
	const signature = "dHl0dWk";

	it("throws with an invalid config", () => {
		expect(() => createTokenHandler({
			maxAge: undefined as never,
			signer: Signer.factory(
				"TEST",
				() => ({
					sign: () => signature,
					verify: () => true,
				}),
			)({}),
			customPayloadShape: {},
		})).toThrow(TokenHandlerWrongConfig);
	});

	it("creates decodes and verifies a token", async() => {
		const now = D.now();
		const issuedAt = Math.floor(D.toTimestamp(now) / 1000);
		const maxAge = D.createTime(1, "hour");
		const expected = {
			header: {
				kid: "main",
				typ: "JWT",
				alg: "TEST",
			},
			payload: {
				iss: "issuer",
				sub: "subject",
				aud: ["app"],
				exp: issuedAt + D.computeTime(maxAge, "second"),
				iat: issuedAt,
				id: "1",
			},
		};
		const tokenHandler = createTokenHandler({
			issuer: "issuer",
			subject: "subject",
			audience: ["app"],
			maxAge,
			now: () => now,
			signer: Signer.factory(
				"TEST",
				() => ({
					sign: () => signature,
					verify: (__, currentSignature) => currentSignature === signature,
				}),
			)({}),
			customPayloadShape: {
				id: DPE.string(),
			},
			customHeaderShape: {
				kid: DPE.string().optional(),
			},
		});

		const token = await tokenHandler.create(
			{
				id: "1",
			},
			{
				header: {
					kid: "main",
				},
			},
		);

		await expect(tokenHandler.decode(token as string)).resolves.toEqual(expected);
		await expect(tokenHandler.verify(token as string)).resolves.toEqual(expected);
	});

	it("returns the header parse error from create", async() => {
		const tokenHandler = createTokenHandler({
			maxAge: D.createTime(1, "hour"),
			signer: Signer.factory(
				"TEST",
				() => ({
					sign: () => signature,
					verify: () => true,
				}),
			)({}),
			customPayloadShape: {
				id: DPE.string(),
			},
			customHeaderShape: {
				kid: DPE.string(),
			},
		});

		await expect(
			tokenHandler.create(
				{
					id: "1",
				},
				{
					header: {
						kid: 1 as never,
					},
				},
			),
		).resolves.toMatchObject({
			"@duplojs/utils/kind/@DuplojsUtilsEither/information": "header-parse-error",
		});
	});

	it("returns the payload parse error from decode", async() => {
		const tokenHandler = createTokenHandler({
			maxAge: D.createTime(1, "hour"),
			signer: Signer.factory(
				"TEST",
				() => ({
					sign: () => signature,
					verify: () => true,
				}),
			)({}),
			customPayloadShape: {
				id: DPE.string(),
			},
		});
		const token = `${encodeBase64Url("{\"typ\":\"JWT\",\"alg\":\"TEST\"}")}.${encodeBase64Url("{\"exp\":1,\"iat\":1}")}.${signature}`;

		await expect(tokenHandler.decode(token)).resolves.toMatchObject({
			"@duplojs/utils/kind/@DuplojsUtilsEither/information": "payload-parse-error",
		});
	});

	it("uses signer and cipher params", async() => {
		const now = D.now();
		const issuedAt = Math.floor(D.toTimestamp(now) / 1000);
		const maxAge = D.createTime(1, "hour");
		const sign = vi.fn((value: string) => Promise.resolve(encodeBase64Url(value)));
		const verify = vi.fn(
			(value: string, signature: string) => Promise.resolve(signature === encodeBase64Url(value)),
		);
		const encrypt = vi.fn((value: string) => Promise.resolve(`secure:${value}`));
		const decrypt = vi.fn((value: string) => Promise.resolve(value.slice("secure:".length)));
		const tokenHandler = createTokenHandler({
			maxAge,
			now: () => now,
			signer: Signer.factory(
				"TEST",
				(params: { key: string }) => ({
					sign: (content) => sign(`${params.key}:${content}`),
					verify: (content, signature) => verify(`${params.key}:${content}`, signature),
				}),
			),
			cipher: Cipher.factory(
				"TEST",
				(params: { prefix: string }) => ({
					encrypt: (value) => encrypt(`${params.prefix}:${value}`),
					decrypt: (value) => decrypt(value).then((decryptedValue) => decryptedValue.slice(`${params.prefix}:`.length)),
				}),
			),
			customPayloadShape: {
				id: DPE.string(),
			},
		});
		const expected = {
			header: {
				typ: "JWT",
				alg: "TEST",
			},
			payload: {
				iss: undefined,
				sub: undefined,
				aud: undefined,
				exp: issuedAt + D.computeTime(maxAge, "second"),
				iat: issuedAt,
				id: "1",
			},
		};

		const tokenResult = await tokenHandler.create(
			{
				id: "1",
			},
			{
				signer: {
					key: "secret",
				},
				cipher: {
					prefix: "prefix",
				},
			},
		);
		const token = tokenResult as string;

		await expect(
			tokenHandler.decode(token, {
				cipher: {
					prefix: "prefix",
				},
			}),
		).resolves.toEqual(expected);
		await expect(
			tokenHandler.verify(token, {
				signer: {
					key: "secret",
				},
				cipher: {
					prefix: "prefix",
				},
			}),
		).resolves.toEqual(expected);
		expect(sign).toHaveBeenCalledTimes(1);
		expect(verify).toHaveBeenCalledTimes(1);
		expect(encrypt).toHaveBeenCalledTimes(1);
		expect(decrypt).toHaveBeenCalledTimes(2);
	});
});
