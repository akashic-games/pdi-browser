import * as g from "@akashic/akashic-engine";

export class ImageAssetSurface extends g.Surface {
	constructor(width: number, height: number, drawable: any) {
		super(width, height, drawable);
	}

	renderer(): g.Renderer {
		throw g.ExceptionFactory.createAssertionError("ImageAssetSurface cannot be rendered.");
	}

	isPlaying(): boolean {
		return false;
	}
}

export class HTMLImageAsset extends g.ImageAsset {
	data: any;
	_surface: g.Surface;

	constructor(id: string, path: string, width: number, height: number) {
		super(id, path, width, height);
		this.data = undefined;
		this._surface = undefined;
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
		var image = new Image();
		image.onerror = () => {
			loader._onAssetError(this, g.ExceptionFactory.createAssetLoadError("HTMLImageAsset unknown loading error"));
		};
		image.onload = () => {
			this.data = image;
			loader._onAssetLoad(this);
		};
		image.crossOrigin = "anonymous";
		image.src = this.path;
	}

	asSurface(): g.Surface {
		if (!this.data) {
			throw g.ExceptionFactory.createAssertionError("ImageAssetImpl#asSurface: not yet loaded.");
		}
		if (this._surface) {
			return this._surface;
		}
		this._surface = new ImageAssetSurface(this.width, this.height, this.data);
		return this._surface;
	}
}
