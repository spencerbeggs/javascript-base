import { describe, expect, it, jest } from "@jest/globals";
import { hello } from "#module";

describe("module#hello", () => {
	it("logs 'Hello, world!", async () => {
		jest.spyOn(global.console, "log").mockImplementation();
		await hello();
		expect(console.log).toHaveBeenCalledWith("Hello, world!");
	});
});
