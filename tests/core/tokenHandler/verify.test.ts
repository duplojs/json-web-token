import { D, E } from "@duplojs/utils";
import { Cipher, Signer } from "@scripts";
import { createTokenHandlerVerifyMethod } from "@scripts/core/tokenHandler/verify";

describe("createTokenHandlerVerifyMethod", () => {
	function createDecodedPayload(
		payload?: Partial<Record<string, unknown>>,
	) {
		return {
			header: {
				typ: "JWT",
				alg: "HS256",
			},
			payload: {
				iss: "issuer",
				sub: "subject",
				aud: ["app"],
				exp: Math.floor(D.toTimestamp(D.now()) / 1000) + 3600,
				iat: 1,
				...payload,
			},
		};
	}

	const createSigner = Signer.factory(
		"HS256",
		(params: { verifyResult: boolean }) => ({
			sign: () => "c2ln",
			verify: () => params.verifyResult,
		}),
	);

	it("returns a signature error when the signature is missing", async() => {
		const parseTokenContent = vi.fn();
		const verify = createTokenHandlerVerifyMethod({
			config: {
				maxAge: D.createTime(1, "hour"),
				signer: createSigner({ verifyResult: true }),
			},
			parseTokenContent: parseTokenContent as never,
		});

		await expect(verify("header.payload")).resolves.toEqual(E.left("signature-invalid"));
		expect(parseTokenContent).not.toHaveBeenCalled();
	});

	it("returns a signature error when the signature is not base64url", async() => {
		const parseTokenContent = vi.fn();
		const verify = createTokenHandlerVerifyMethod({
			config: {
				maxAge: D.createTime(1, "hour"),
				signer: createSigner({ verifyResult: true }),
			},
			parseTokenContent: parseTokenContent as never,
		});

		await expect(verify("header.payload.abcde")).resolves.toEqual(E.left("signature-invalid"));
		expect(parseTokenContent).not.toHaveBeenCalled();
	});

	it("returns the parse error", async() => {
		const error = E.left("decode-error");
		const parseTokenContent = vi.fn(() => error);
		const verify = createTokenHandlerVerifyMethod({
			config: {
				maxAge: D.createTime(1, "hour"),
				signer: createSigner({ verifyResult: true }),
			},
			parseTokenContent: parseTokenContent as never,
		});

		await expect(verify("header.payload.c2ln")).resolves.toEqual(error);
	});

	it("returns a signature error when verify fails", async() => {
		const parseTokenContent = vi.fn(() => createDecodedPayload());
		const verify = createTokenHandlerVerifyMethod({
			config: {
				maxAge: D.createTime(1, "hour"),
				signer: createSigner({ verifyResult: false }),
			},
			parseTokenContent: parseTokenContent as never,
		});

		await expect(verify("header.payload.c2ln")).resolves.toEqual(E.left("signature-invalid"));
	});

	it("returns an issue error when the issuer is wrong", async() => {
		const parseTokenContent = vi.fn(() => createDecodedPayload({
			iss: "other",
		}));
		const verify = createTokenHandlerVerifyMethod({
			config: {
				issuer: "issuer",
				maxAge: D.createTime(1, "hour"),
				signer: createSigner({ verifyResult: true }),
			},
			parseTokenContent: parseTokenContent as never,
		});

		await expect(verify("header.payload.c2ln")).resolves.toEqual(E.left("issue-invalid"));
	});

	it("returns a subject error when the subject is wrong", async() => {
		const parseTokenContent = vi.fn(() => createDecodedPayload({
			sub: "other",
		}));
		const verify = createTokenHandlerVerifyMethod({
			config: {
				subject: "subject",
				maxAge: D.createTime(1, "hour"),
				signer: createSigner({ verifyResult: true }),
			},
			parseTokenContent: parseTokenContent as never,
		});

		await expect(verify("header.payload.c2ln")).resolves.toEqual(E.left("subject-invalid"));
	});

	it("returns an audience error when the audience is wrong", async() => {
		const parseTokenContent = vi.fn(() => createDecodedPayload({
			aud: ["other"],
		}));
		const verify = createTokenHandlerVerifyMethod({
			config: {
				audience: ["app"],
				maxAge: D.createTime(1, "hour"),
				signer: createSigner({ verifyResult: true }),
			},
			parseTokenContent: parseTokenContent as never,
		});

		await expect(verify("header.payload.c2ln")).resolves.toEqual(E.left("audience-invalid"));
	});

	it("returns an expired error when the token is too old", async() => {
		const parseTokenContent = vi.fn(() => createDecodedPayload({
			exp: 0,
		}));
		const verify = createTokenHandlerVerifyMethod({
			config: {
				maxAge: D.createTime(1, "hour"),
				now: () => D.now(),
				signer: createSigner({ verifyResult: true }),
			},
			parseTokenContent: parseTokenContent as never,
		});

		await expect(verify("header.payload.c2ln")).resolves.toEqual(E.left("expired"));
	});

	it("verifies a token with async cipher and signer", async() => {
		const parseTokenContent = vi.fn(() => createDecodedPayload());
		const cipher = Cipher.factory(
			"TEST",
			() => ({
				encrypt: (value) => value,
				decrypt: () => Promise.resolve("header.payload.c2ln"),
			}),
		)({});
		const signer = Signer.factory(
			"TEST",
			() => ({
				sign: () => "c2ln",
				verify: () => Promise.resolve(true),
			}),
		)({});
		const verify = createTokenHandlerVerifyMethod({
			config: {
				maxAge: D.createTime(1, "hour"),
				signer,
				cipher,
			},
			parseTokenContent: parseTokenContent as never,
		});

		await expect(verify("encrypted-token")).resolves.toEqual(createDecodedPayload());
		expect(parseTokenContent).toHaveBeenCalledWith("header", "payload");
	});
});
