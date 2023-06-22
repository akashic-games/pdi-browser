import * as fs from "fs";
import * as path from "path";
import type { AssetLoadError, AssetLoadHandler, ScriptAsset, ScriptAssetRuntimeValue } from "@akashic/pdi-types";
import type { Asset } from "../Asset";
import { XHRScriptAsset } from "../XHRScriptAsset";

class MockXHRScriptAsset extends XHRScriptAsset {
	_load(handler: AssetLoadHandler): void {
		// NOTE: Node 環境では XMLHttpRequest が利用できないため処理を上書き
		fs.readFile(this.path, { encoding: "utf-8" }, (error, data) => {
			if (error) {
				handler._onAssetError(
					this,
					{
						name: "AssetLoadError",
						message: error.message,
						retriable: false
					}
				);
				return;
			}
			this.script = data;
			handler._onAssetLoad(this);
		});
	}
}

function createMockRuntimeValue(id: string): ScriptAssetRuntimeValue {
	const exports = {};
	return {
		game: {},
		exports,
		filename: "",
		dirname: "",
		module: {
			require,
			exports,
			id,
			filename: "",
			parent: null,
			loaded: false,
			children: [],
			paths: [],
		}
	};
}

describe("XHRScriptAsset", () => {
	const testScriptPath = path.join(__dirname, "fixtures", "test.js");

	it("can execute script file as a CommonJS-like module", (done) => {
		const mockRuntimeValue = createMockRuntimeValue("test");
		const script = new MockXHRScriptAsset("id", testScriptPath);
		script._load({
			_onAssetLoad(asset: ScriptAsset) {
				const exports = mockRuntimeValue.module.exports;
				asset.execute(mockRuntimeValue);
				expect(exports.foo).toBe(42);
				expect(exports.bar(5)).toBe(25); // 5 ** 2
				done();
			},
			_onAssetError(_asset: Asset, error: AssetLoadError) {
				done(error);
			},
		});
	});

	it("can export an array of strings specified in exports field", (done) => {
		const mockRuntimeValue = createMockRuntimeValue("test");
		const exports = mockRuntimeValue.exports;
		const script = new MockXHRScriptAsset("id", testScriptPath, ["localVariable", "localVariable2", "undefinedValue"]);
		script._load({
			_onAssetLoad(asset: ScriptAsset) {
				asset.execute(mockRuntimeValue);
				expect(exports.foo).toBe(42);
				expect(exports.bar(5)).toBe(25); // 5 ** 2
				expect(exports.localVariable).toBe("local");
				expect(exports.localVariable2).toBe("local2");
				expect(exports.undefinedValue).toBeUndefined(); // 未定義の変数を指定してもエラーとならないことを確認
				done();
			},
			_onAssetError(_asset: Asset, error: AssetLoadError) {
				done(error);
			},
		});
	});
});
