import { D, DPE } from "@duplojs/utils";
import { Cipher, Signer, createTokenHandler } from "@duplojs/json-web-token";

const tokenHandler = createTokenHandler({
	maxAge: D.createTime(10, "minute"),
	signer: Signer.createHS256,
	cipher: Cipher.createRSAOAEP,
	customPayloadShape: {
		userId: DPE.string(),
	},
});

const token = await tokenHandler.create(
	{
		userId: "1",
	},
	{
		signer: {
			secret: "my-secret",
		},
		cipher: {
			privateKey: "private-key",
			publicKey: "public-key",
		},
	},
);

// send to client ...

const verifiedToken = await tokenHandler.verify("receive-token", {
	signer: {
		secret: "my-secret",
	},
	cipher: {
		privateKey: "private-key",
		publicKey: "public-key",
	},
});
