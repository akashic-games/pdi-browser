import * as g from "@akashic/akashic-engine";
import { XHRLoader } from "../utils/XHRLoader";

export class XHRTextAsset extends g.TextAsset {

	constructor(id: string, path: string) {
		super(id, path);
		this.data = undefined;
	}

	_load(handler: g.AssetLoadHandler): void {
		var loader = new XHRLoader();
		loader.get(this.path, (error, responseText) => {
			if (error) {
				handler._onAssetError(this, error);
				return;
			}
			this.data = responseText;
			handler._onAssetLoad(this);
		});
	}
}
