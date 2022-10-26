import type * as pdi from "@akashic/pdi-types";
import { XHRLoader } from "../utils/XHRLoader";
import { Asset } from "./Asset";

export class XHRTextAsset extends Asset implements pdi.TextAsset {
	type: "text" = "text";
	data: string = ""; // _load() までは空文字が代入されている点に注意

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
			if (!responseText) {
				handler._onAssetError(
					this,
					{
						name: "AssetLoadError",
						message: "XHRTextAsset#_load(): no data received",
						retriable: false
					});
				return;
			}
			this.data = responseText;
			handler._onAssetLoad(this);
		});
	}

	destroy(): void {
		this.data = undefined!;
		super.destroy();
	}
}
