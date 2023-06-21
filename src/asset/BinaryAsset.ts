import type * as pdi from "@akashic/pdi-types";
import { XHRLoader } from "../utils/XHRLoader";
import { Asset } from "./Asset";

export class BinaryAsset extends Asset implements pdi.BinaryAsset {
	type: "binary" = "binary";
	data: ArrayBuffer;

	constructor(id: string, assetPath: string) {
		super(id, assetPath);
		this.data = undefined!;
	}

	destroy(): void {
		this.data = undefined!;
		super.destroy();
	}

	_load(handler: pdi.AssetLoadHandler): void {
		const loader = new XHRLoader();
		loader.getArrayBuffer(this.path, (error, responseData) => {
			if (error) {
				handler._onAssetError(this, error);
				return;
			}
			if (responseData == null) {
				handler._onAssetError(
					this,
					{
						name: "AssetLoadError",
						retriable: false,
						message: "BinaryAsset#_load(): no data received"
					}
				);
				return;
			}
			this.data = responseData;
			handler._onAssetLoad(this);
		});
	}
}
