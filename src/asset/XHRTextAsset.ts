import * as pdi from "@akashic/pdi-types";
import { XHRLoader } from "../utils/XHRLoader";
import { Asset } from "./Asset";

export class XHRTextAsset extends Asset implements pdi.TextAsset {
	type: "text" = "text";
	data: string = null!;

	constructor(id: string, path: string) {
		super(id, path);
	}

	_load(handler: pdi.AssetLoadHandler): void {
		const loader = new XHRLoader();
		loader.get(this.path, (error, responseText) => {
			if (error) {
				handler._onAssetError(this, error);
				return;
			}
			this.data = responseText!;
			handler._onAssetLoad(this);
		});
	}

	destroy(): void {
		this.data = null!;
		super.destroy();
	}
}
