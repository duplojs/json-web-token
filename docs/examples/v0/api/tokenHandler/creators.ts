import { D, DPE, E, unwrap } from "@duplojs/utils";
import { Cipher, Signer, createTokenHandler } from "@json-web-token/v0";

const tokenHandler = createTokenHandler({
	maxAge: D.createTime(10, "minute"),
	signer: Signer.createHS256,
	cipher: Cipher.createRSAOAEP,
	customPayloadShape: {
		userId: DPE.string(),
	},
});

const token = await tokenHandler.createOrThrow(
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

const verifiedTokenResult = await tokenHandler.verify("receive-token", {
	signer: {
		secret: "my-secret",
	},
	cipher: {
		privateKey: "private-key",
		publicKey: "public-key",
	},
});

if (E.isRight(verifiedTokenResult)) {
	const verifiedToken = unwrap(verifiedTokenResult);
	const userId = verifiedToken.payload.userId;
}
