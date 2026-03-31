import { andThen } from "@scripts/core/tokenHandler/shared";

describe("andThen", () => {
	it("calls the callback with a value", () => {
		const callback = vi.fn((value: string) => `${value}-done`);

		const result = andThen("hello", callback);

		expect(callback).toHaveBeenCalledWith("hello");
		expect(result).toBe("hello-done");
	});

	it("chains a promise value", async() => {
		const callback = vi.fn((value: string) => `${value}-done`);

		const result = andThen(Promise.resolve("hello"), callback);

		await expect(result).resolves.toBe("hello-done");
		expect(callback).toHaveBeenCalledWith("hello");
	});
});
