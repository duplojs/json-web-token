import { asserts, D, DPE, isType } from "@duplojs/utils";
import { Signer, createTokenHandler } from "@duplojs/json-web-token";

const tokenHandler = createTokenHandler({
	maxAge: D.createTime(15, "minute"),
	signer: Signer.createHS256({
		secret: "my-secret",
	}),
	issuer: "duplo-app",
	audience: ["web"],
	customPayloadShape: {
		userId: DPE.string(),
		role: DPE.literal("admin"),
	},
	customHeaderShape: {
		kid: DPE.string().optional(),
	},
});

const token = await tokenHandler.create(
	{
		userId: "1",
		role: "admin",
	},
	{
		header: {
			kid: "main",
		},
	},
);

asserts(token, isType("string"));

const verifiedToken = await tokenHandler.verify(token);
