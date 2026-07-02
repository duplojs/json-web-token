import { asyncPipe, D, DPE, E } from "@duplojs/utils";
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
	},
});

const result = await asyncPipe(
	"received-token",
	(token) => tokenHandler.verify(
		token,
		{
			tolerance: D.createTime(30, "second"),
		},
	),
	E.whenIsRight(
		({ payload }) => {
			const userId = payload.userId;
		},
	),
);
