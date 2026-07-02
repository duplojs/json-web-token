import { D, DPE, E, unwrap } from "@duplojs/utils";
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

const result = await tokenHandler.create(
	{
		userId: "1",
	},
	{
		header: {
			kid: "main",
		},
	},
);

if (E.isRight(result)) {
	const token = unwrap(result);
}
