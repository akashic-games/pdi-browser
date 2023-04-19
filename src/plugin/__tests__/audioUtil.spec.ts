import { addExtname, resolveExtname } from "../audioUtil";

describe("audioUtil", () => {
	describe("addExtname", () => {
		it("拡張子を追加する", () => {
			expect(addExtname("/foo/bar", ".ogg")).toBe("/foo/bar.ogg");
			expect(addExtname("foo/multi.dots.filename", ".m4a")).toBe("foo/multi.dots.filename.m4a");
		});

		it("クエリパラメータを避けて拡張子を追加する", () => {
			expect(addExtname("/foo/bar?query=true", ".ogg")).toBe("/foo/bar.ogg?query=true");
		});
	});

	describe("resolveExtname", () => {
		it("extensionsがなければ空配列とみなす", () => {
			expect(resolveExtname(null, ["m4a", "aac", "ogg"])).toBe(null);
			expect(resolveExtname([], ["m4a", "aac", "ogg"])).toBe(null);
		});

		it("supportedFormatsの順で優先的に選択する", () => {
			expect(resolveExtname([".ogg", ".aac"], ["m4a", "aac", "ogg"])).toBe(".aac");
		});
	});
});
