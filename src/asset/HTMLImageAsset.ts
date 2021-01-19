import * as pdi from "@akashic/pdi-types";
import { Surface } from "../Surface";
import { ExceptionFactory } from "../utils/ExceptionFactory";
import { Asset } from "./Asset";

export class ImageAssetSurface extends Surface {
	renderer(): pdi.Renderer {
		throw new Error("ImageAssetSurface cannot be rendered.");
	}

	isPlaying(): boolean {
		return false;
	}
}

export class HTMLImageAsset extends Asset implements pdi.ImageAsset {
	type: "image" = "image";
	width: number;
	height: number;
	hint: pdi.ImageAssetHint | undefined;
	data: any;
	_surface: ImageAssetSurface | undefined;

	constructor(id: string, path: string, width: number, height: number) {
		super(id, path);
		this.width = width;
		this.height = height;
		this.data = undefined;
		this._surface = undefined;
	}

	initialize(hint: pdi.ImageAssetHint): void {
		this.hint = hint;
	}

	destroy(): void {
		if (this._surface && !this._surface.destroyed()) {
			this._surface.destroy();
		}
		this.data = undefined;
		this._surface = undefined;
		super.destroy();
	}

	_load(loader: pdi.AssetLoadHandler): void {
		const image = new Image();

		if (this.hint && this.hint.untainted) {
			image.crossOrigin = "anonymous";
		}
		image.onerror = () => {
			loader._onAssetError(this, ExceptionFactory.createAssetLoadError("HTMLImageAsset unknown loading error"));
		};
		image.onload = () => {
			this.data = image;
			loader._onAssetLoad(this);
		};
		image.src = this.path;
	}

	asSurface(): ImageAssetSurface {
		if (!this.data) {
			throw new Error("ImageAssetImpl#asSurface: not yet loaded.");
		}
		if (this._surface) {
			return this._surface;
		}
		this._surface = new ImageAssetSurface(this.width, this.height, this.data);
		return this._surface;
	}
}
