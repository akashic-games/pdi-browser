import * as g from "@akashic/akashic-engine";
import { Surface } from "../Surface";
import { ExceptionFactory } from "../utils/ExceptionFactory";
import { Asset } from "./Asset";

export class ImageAssetSurface extends Surface {
	renderer(): g.RendererLike {
		throw new Error("ImageAssetSurface cannot be rendered.");
	}

	isPlaying(): boolean {
		return false;
	}
}

export class HTMLImageAsset extends Asset implements g.ImageAssetLike {
	type: "image" = "image";
	width: number;
	height: number;
	hint: g.ImageAssetHint;
	data: any;
	_surface: ImageAssetSurface;

	constructor(id: string, path: string, width: number, height: number) {
		super(id, path);
		this.width = width;
		this.height = height;
		this.data = undefined;
		this._surface = undefined;
	}

	initialize(hint: g.ImageAssetHint): void {
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

	_load(loader: g.AssetLoadHandler): void {
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
