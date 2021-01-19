import * as pdi from "@akashic/pdi-types";
import { XHRLoader } from "../utils/XHRLoader";
import { Asset } from "./Asset";

export class XHRScriptAsset extends Asset implements pdi.ScriptAsset {
	static PRE_SCRIPT: string = "(function(exports, require, module, __filename, __dirname) {";
	static POST_SCRIPT: string = "\n})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);";

	type: "script" = "script";
	script: string = undefined!;

	_load(handler: pdi.AssetLoadHandler): void {
		var loader = new XHRLoader();
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
		var func = this._wrap();
		func(execEnv);	
		return execEnv.module.exports;
	}

	destroy(): void {
		this.script = undefined!;
		super.destroy();
	}

	_wrap(): Function {
		var func = new Function(
			"g",
			XHRScriptAsset.PRE_SCRIPT + this.script + XHRScriptAsset.POST_SCRIPT
		);
		return func;
	}
}
