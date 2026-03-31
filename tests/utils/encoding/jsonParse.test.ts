import { E } from "@duplojs/utils";
import { jsonParse } from "@scripts";

describe("jsonParse", () => {
	it("parses valid json", () => {
		const result = jsonParse("{\"name\":\"duplo\",\"ok\":true,\"list\":[1,2,3]}");

		expect(E.isLeft(result)).toBe(false);

		expect(result).toEqual({
			name: "duplo",
			ok: true,
			list: [1, 2, 3],
		});
	});

	it("returns left on invalid json", () => {
		expect(E.isLeft(jsonParse("{"))).toBe(true);
	});
});
