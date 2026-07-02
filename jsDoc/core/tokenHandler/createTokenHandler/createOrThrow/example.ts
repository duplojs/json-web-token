import { D, DPE } from "@duplojs/utils";
import { Signer, createTokenHandler } from "@duplojs/json-web-token";

const tokenHandler = createTokenHandler({
	maxAge: D.createTime(15, "minute"),
	signer: Signer.createHS256({
		secret: "my-secret",
	}),
	customPayloadShape: {
		userId: DPE.string(),
	},
	customHeaderShape: {
		kid: DPE.string().optional(),
	},
});

const token = await tokenHandler.createOrThrow(
	{
		userId: "1",
	},
	{
		header: {
			kid: "main",
		},
	},
);
