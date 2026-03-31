import { E } from "@duplojs/utils";
import { encodeBase64Url } from "@scripts";
import { createParseTokenContent } from "@scripts/core/tokenHandler/shared";

describe("createParseTokenContent", () => {
	it("returns decode error without parts", () => {
		const parseTokenContent = createParseTokenContent({
			headerParser: { parse: vi.fn() },
			payloadParser: { parse: vi.fn() },
		});

		expect(parseTokenContent(undefined, "payload")).toEqual(E.left("decode-error"));
		expect(parseTokenContent("header", undefined)).toEqual(E.left("decode-error"));
	});

	it("returns decode error with invalid base64url", () => {
		const parseTokenContent = createParseTokenContent({
			headerParser: { parse: vi.fn() },
			payloadParser: { parse: vi.fn() },
		});

		expect(parseTokenContent("@@", "payload")).toEqual(E.left("decode-error"));
		expect(parseTokenContent("header", "@@")).toEqual(E.left("decode-error"));
	});

	it("returns decode error with invalid header json", () => {
		const parseTokenContent = createParseTokenContent({
			headerParser: { parse: vi.fn() },
			payloadParser: { parse: vi.fn() },
		});

		expect(
			parseTokenContent(
				encodeBase64Url("{"),
				encodeBase64Url("{\"exp\":1,\"iat\":1}"),
			),
		).toEqual(E.left("decode-error"));
	});

	it("returns header parse error", () => {
		const parserError = { type: "header" };
		const headerParser = {
			parse: vi.fn(() => E.left("invalid-header", parserError)),
		};
		const payloadParser = {
			parse: vi.fn(() => ({
				exp: 1,
				iat: 1,
			})),
		};
		const parseTokenContent = createParseTokenContent({
			headerParser,
			payloadParser,
		});

		expect(
			parseTokenContent(
				encodeBase64Url("{\"typ\":\"JWT\",\"alg\":\"HS256\"}"),
				encodeBase64Url("{\"exp\":1,\"iat\":1}"),
			),
		).toEqual(E.left("header-parse-error", parserError));
		expect(headerParser.parse).toHaveBeenCalledWith({
			typ: "JWT",
			alg: "HS256",
		});
	});

	it("returns decode error with invalid payload json", () => {
		const parseTokenContent = createParseTokenContent({
			headerParser: {
				parse: vi.fn(() => ({
					typ: "JWT",
					alg: "HS256",
				})),
			},
			payloadParser: { parse: vi.fn() },
		});

		expect(
			parseTokenContent(
				encodeBase64Url("{\"typ\":\"JWT\",\"alg\":\"HS256\"}"),
				encodeBase64Url("{"),
			),
		).toEqual(E.left("decode-error"));
	});

	it("returns payload parse error", () => {
		const parserError = { type: "payload" };
		const headerParser = {
			parse: vi.fn(() => ({
				typ: "JWT",
				alg: "HS256",
			})),
		};
		const payloadParser = {
			parse: vi.fn(() => E.left("invalid-payload", parserError)),
		};
		const parseTokenContent = createParseTokenContent({
			headerParser,
			payloadParser,
		});

		expect(
			parseTokenContent(
				encodeBase64Url("{\"typ\":\"JWT\",\"alg\":\"HS256\"}"),
				encodeBase64Url("{\"exp\":1,\"iat\":1}"),
			),
		).toEqual(E.left("payload-parse-error", parserError));
		expect(payloadParser.parse).toHaveBeenCalledWith({
			exp: 1,
			iat: 1,
		});
	});

	it("returns parsed content", () => {
		const header = {
			typ: "JWT",
			alg: "HS256",
		};
		const payload = {
			exp: 1,
			iat: 1,
			sub: "1",
		};
		const headerParser = {
			parse: vi.fn(() => header),
		};
		const payloadParser = {
			parse: vi.fn(() => payload),
		};
		const parseTokenContent = createParseTokenContent({
			headerParser,
			payloadParser,
		});

		expect(
			parseTokenContent(
				encodeBase64Url("{\"typ\":\"JWT\",\"alg\":\"HS256\"}"),
				encodeBase64Url("{\"exp\":1,\"iat\":1,\"sub\":\"1\"}"),
			),
		).toEqual({
			header,
			payload,
		});
	});
});
