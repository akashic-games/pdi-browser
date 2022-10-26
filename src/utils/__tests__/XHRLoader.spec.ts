import { XHRLoader } from "../XHRLoader";

describe("XHRLoader", () => {
	it("has default timeout", () => {
		const loader = new XHRLoader();
		expect(loader.timeout).not.toBeUndefined();
	});
});
