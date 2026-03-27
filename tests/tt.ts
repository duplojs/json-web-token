import { D, DP, E, type ExpectType } from "@duplojs/utils";
import { EncryptedToken, HMAC } from "@scripts";
import { signerFactory } from "@scripts/clients/signed";

const createHS256Signer = signerFactory(
	"HS256",
	(params: { secret: string }, algorithm) => ({
		sign: (content) => HMAC.sign(content, params.secret, algorithm),
		verify: (content, signature) => HMAC.verify(content, signature, params.secret, algorithm),
	}),
);

const client = EncryptedToken.createClient({
	config: {
		maxAge: D.createTime(8, "hour"),
		signer: createHS256Signer,
		audience: ["hello"],
	},
	customPayloadShape: {
		id: DP.string(),
	},
});

const token = await client.create({ id: "1" }, { secret: "secret" });

if (E.isLeft(token)) {
	throw new Error("boom");
}

const verifyResult = await client.verify(token, { secret: "secret" });

if (E.isLeft(verifyResult)) {
	throw new Error("boom");
}

type check = ExpectType<
	typeof verifyResult,
	{
		readonly header: {
			readonly typ: "JWT";
			readonly alg: "HS256";
		};
		readonly payload: {
			readonly id: string;
			readonly iss: undefined;
			readonly sub: undefined;
			readonly aud: string[];
			readonly exp: number;
			readonly iat: number;
		};
	},
	"strict"
>;
