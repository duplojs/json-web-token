import { D, DPE, E, unwrap } from "@duplojs/utils";
import { Signer, createTokenHandler } from "@json-web-token/v0";

const tokenHandler = createTokenHandler({
	maxAge: D.createTime(1, "hour"),
	signer: Signer.createHS256({ secret: "my-secret" }),
	issuer: "admin-app",
	customPayloadShape: {
		userId: DPE.string(),
		role: DPE.literal("admin"),
	},
	customHeaderShape: {
		kid: DPE.string().optional(),
	},
});

const token = await tokenHandler.createOrThrow(
	{
		userId: "42",
		role: "admin",
	},
	{
		header: {
			kid: "main",
		},
	},
);

// send to client ...

const decodedTokenResult = await tokenHandler.decode("receive-token");

if (E.isRight(decodedTokenResult)) {
	const decodedToken = unwrap(decodedTokenResult);
	const userId = decodedToken.payload.userId;
}
