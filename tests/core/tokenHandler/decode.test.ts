import { D, E } from "@duplojs/utils";
import { factory as cipherFactory } from "@scripts/core/cipher/factory";
import { createTokenHandlerDecodeMethod } from "@scripts/core/tokenHandler/decode";

describe("createTokenHandlerDecodeMethod", () => {
	it("decodes a token without cipher", async() => {
		const parseTokenContent = vi.fn(() => ({
			header: {
				typ: "JWT",
				alg: "HS256",
			},
			payload: {
				exp: 1,
				iat: 1,
			},
		}));
		const decode = createTokenHandlerDecodeMethod({
			config: {
				maxAge: D.createTime(1, "hour"),
				signer: {} as never,
			},
			parseTokenContent: parseTokenContent as never,
		});

		await expect(decode("header.payload.signature")).resolves.toEqual({
			header: {
				typ: "JWT",
				alg: "HS256",
			},
			payload: {
				exp: 1,
				iat: 1,
			},
		});
		expect(parseTokenContent).toHaveBeenCalledWith("header", "payload");
	});

	it("returns the token format error", async() => {
		const error = E.left("token-format");
		const parseTokenContent = vi.fn(() => error);
		const decode = createTokenHandlerDecodeMethod({
			config: {
				maxAge: D.createTime(1, "hour"),
				signer: {} as never,
			},
			parseTokenContent: parseTokenContent as never,
		});

		await expect(decode("header.payload.signature")).resolves.toEqual(error);
	});

	it("returns the header decode error", async() => {
		const error = E.left("header-decode-error");
		const parseTokenContent = vi.fn(() => error);
		const decode = createTokenHandlerDecodeMethod({
			config: {
				maxAge: D.createTime(1, "hour"),
				signer: {} as never,
			},
			parseTokenContent: parseTokenContent as never,
		});

		await expect(decode("header.payload.signature")).resolves.toEqual(error);
	});

	it("decodes a token with an async cipher", async() => {
		const parseTokenContent = vi.fn(() => ({
			header: {
				typ: "JWT",
				alg: "HS256",
			},
			payload: {
				exp: 1,
				iat: 1,
				sub: "1",
			},
		}));
		const cipher = cipherFactory(
			"TEST",
			() => ({
				encrypt: (value) => value,
				decrypt: () => Promise.resolve("header.payload.signature"),
			}),
		)({});
		const decode = createTokenHandlerDecodeMethod({
			config: {
				maxAge: D.createTime(1, "hour"),
				signer: {} as never,
				cipher,
			},
			parseTokenContent: parseTokenContent as never,
		});

		await expect(decode("encrypted-token")).resolves.toEqual({
			header: {
				typ: "JWT",
				alg: "HS256",
			},
			payload: {
				exp: 1,
				iat: 1,
				sub: "1",
			},
		});
		expect(parseTokenContent).toHaveBeenCalledWith("header", "payload");
	});
});
