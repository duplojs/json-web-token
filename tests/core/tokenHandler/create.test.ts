import { D, E } from "@duplojs/utils";
import { Cipher, Signer, encodeBase64Url } from "@scripts";
import { createTokenHandlerCreateMethod } from "@scripts/core/tokenHandler/create";

describe("createTokenHandlerCreateMethod", () => {
	it("returns the header parse error", () => {
		const parserError = { type: "header" };
		const headerParser = {
			parse: vi.fn(() => E.left("invalid-header", parserError)),
		};
		const payloadParser = {
			parse: vi.fn(),
		};
		const create = createTokenHandlerCreateMethod({
			config: {
				maxAge: D.createTime(1, "hour"),
				signer: Signer.factory(
					"HS256",
					() => ({
						sign: () => "azerty",
						verify: () => true,
					}),
				)({}),
			},
			headerParser: headerParser as never,
			payloadParser: payloadParser as never,
		});

		expect(
			create(
				{ id: "1" },
				{
					header: {
						kid: "1",
					},
				},
			),
		).toEqual(E.left("header-parse-error", parserError));
		expect(payloadParser.parse).not.toHaveBeenCalled();
	});

	it("returns the payload parse error", () => {
		const now = D.now();
		const issuedAt = Math.floor(D.toTimestamp(now) / 1000);
		const parserError = { type: "payload" };
		const headerParser = {
			parse: vi.fn((value) => value),
		};
		const payloadParser = {
			parse: vi.fn(() => E.left("invalid-payload", parserError)),
		};
		const create = createTokenHandlerCreateMethod({
			config: {
				issuer: "issuer",
				subject: "subject",
				audience: ["app"],
				maxAge: D.createTime(1, "hour"),
				now: () => now,
				signer: Signer.factory(
					"HS256",
					() => ({
						sign: () => "azerty",
						verify: () => true,
					}),
				)({}),
			},
			headerParser: headerParser as never,
			payloadParser: payloadParser as never,
		});

		expect(create({ id: "1" })).toEqual(E.left("payload-parse-error", parserError));
		expect(payloadParser.parse).toHaveBeenCalledWith({
			iss: "issuer",
			sub: "subject",
			aud: ["app"],
			iat: issuedAt,
			exp: issuedAt + D.computeTime(D.createTime(1, "hour"), "second"),
			id: "1",
		});
	});

	it("creates a token without cipher", () => {
		const now = D.now();
		const issuedAt = Math.floor(D.toTimestamp(now) / 1000);
		const header = {
			kid: "1",
			typ: "JWT",
			alg: "HS256",
		};
		const payload = {
			iss: "issuer",
			sub: "subject",
			aud: ["app"],
			iat: issuedAt,
			exp: issuedAt + D.computeTime(D.createTime(1, "hour"), "second"),
			id: "1",
		};
		const headerParser = {
			parse: vi.fn(() => header),
		};
		const payloadParser = {
			parse: vi.fn(() => payload),
		};
		const sign = vi.fn(() => "azerty");
		const create = createTokenHandlerCreateMethod({
			config: {
				issuer: "issuer",
				subject: "subject",
				audience: ["app"],
				maxAge: D.createTime(1, "hour"),
				now: () => now,
				signer: Signer.factory(
					"HS256",
					() => ({
						sign,
						verify: () => true,
					}),
				)({}),
			},
			headerParser: headerParser as never,
			payloadParser: payloadParser as never,
		});

		const encodedHeader = encodeBase64Url(JSON.stringify(header));
		const encodedPayload = encodeBase64Url(JSON.stringify(payload));

		expect(
			create(
				{ id: "1" },
				{
					header: {
						kid: "1",
					},
				},
			),
		).toBe(`${encodedHeader}.${encodedPayload}.azerty`);
		expect(headerParser.parse).toHaveBeenCalledWith({
			kid: "1",
			typ: "JWT",
			alg: "HS256",
		});
		expect(payloadParser.parse).toHaveBeenCalledWith(payload);
		expect(sign).toHaveBeenCalledWith(`${encodedHeader}.${encodedPayload}`);
	});

	it("creates a token with async signer and cipher", async() => {
		const now = D.now();
		const issuedAt = Math.floor(D.toTimestamp(now) / 1000);
		const headerParser = {
			parse: vi.fn((value) => value),
		};
		const payloadParser = {
			parse: vi.fn((value) => value),
		};
		const sign = vi.fn((value: string) => Promise.resolve("azerty"));
		const encrypt = vi.fn((value: string) => Promise.resolve(`encrypted:${value}`));
		const create = createTokenHandlerCreateMethod({
			config: {
				maxAge: D.createTime(1, "hour"),
				now: () => now,
				signer: Signer.factory(
					"HS256",
					(params: { key: string }) => ({
						sign: (content) => sign(`${params.key}:${content}`),
						verify: () => true,
					}),
				),
				cipher: Cipher.factory(
					"TEST",
					(params: { prefix: string }) => ({
						encrypt: (value) => encrypt(`${params.prefix}:${value}`),
						decrypt: (value) => value,
					}),
				),
			},
			headerParser: headerParser as never,
			payloadParser: payloadParser as never,
		});

		const header = {
			typ: "JWT",
			alg: "HS256",
		};
		const payload = {
			iss: undefined,
			sub: undefined,
			aud: undefined,
			iat: issuedAt,
			exp: issuedAt + D.computeTime(D.createTime(1, "hour"), "second"),
			id: "1",
		};
		const encodedHeader = encodeBase64Url(JSON.stringify(header));
		const encodedPayload = encodeBase64Url(JSON.stringify(payload));
		const token = `${encodedHeader}.${encodedPayload}.azerty`;

		await expect(
			create(
				{ id: "1" },
				{
					signer: {
						key: "secret",
					},
					cipher: {
						prefix: "secure",
					},
				},
			),
		).resolves.toBe(`encrypted:secure:${token}`);
		expect(sign).toHaveBeenCalledWith(`secret:${encodedHeader}.${encodedPayload}`);
		expect(encrypt).toHaveBeenCalledWith(`secure:${token}`);
	});
});
