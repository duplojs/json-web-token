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
});

const token = await tokenHandler.create({
	userId: "1",
});

// send to client ...

const verifiedToken = await tokenHandler.verify("receive-token");
