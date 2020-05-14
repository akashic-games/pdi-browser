import * as g from "@akashic/akashic-engine";
import { XHRLoader } from "../utils/XHRLoader";
import { Asset } from "./Asset";

export class XHRTextAsset extends Asset implements g.TextAssetLike {
	type: "text" = "text";
	data: string | undefined;

	constructor(id: string, path: string) {
		super(id, path);
	}

	_load(handler: g.AssetLoadHandler): void {
		const loader = new XHRLoader();
		loader.get(this.path, (error, responseText) => {
			if (error) {
				handler._onAssetError(this, error);
				return;
			}
			this.data = responseText;
			handler._onAssetLoad(this);
		});
	}

	destroy(): void {
		this.data = undefined;
		super.destroy();
	}
}
