import type * as pdi from "@akashic/pdi-types";
import { XHRLoader } from "../utils/XHRLoader";
import { Asset } from "./Asset";

export class XHRScriptAsset extends Asset implements pdi.ScriptAsset {
	type: "script" = "script";
	script: string = ""; // _load() までは空文字が代入されている点に注意
	exports: string[];

	constructor(id: string, path: string, exports: string[] = []) {
		super(id, path);
		this.exports = exports;
	}

	_load(handler: pdi.AssetLoadHandler): void {
		const loader = new XHRLoader();
		loader.get(this.path, (error, responseText) => {
			if (error) {
				handler._onAssetError(this, error);
				return;
			}
			this.script = responseText + "\n";
			handler._onAssetLoad(this);
		});
	}

	execute(execEnv: pdi.ScriptAssetRuntimeValue): any {
		// TODO: この方式では読み込んだスクリプトがcookie参照できる等本質的な危険性がある
		// 信頼できないスクリプトを読み込むようなケースでは、iframeに閉じ込めて実行などの方式を検討する事。
		const func = this._wrap();
		func(execEnv);
		return execEnv.module.exports;
	}

	destroy(): void {
		this.script = undefined!;
		super.destroy();
	}

	_wrap(): Function {
		let postScript: string = "";
		for (const key of this.exports) {
			postScript += `exports["${key}"] = typeof ${key} !== "undefined" ? ${key} : undefined;\n`;
		}

		const func = new Function(
			"g",
			"(function(exports, require, module, __filename, __dirname) {\n" +
			this.script + "\n" +
			postScript + "\n" +
			"})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);"
		);

		return func;
	}
}
