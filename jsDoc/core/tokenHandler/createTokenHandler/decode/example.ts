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
});

const result = await tokenHandler.decode("received-token");

if (E.isRight(result)) {
	const decodedToken = unwrap(result);
	const userId = decodedToken.payload.userId;
}
