import type * as pdi from "@akashic/pdi-types";
import { Context2DSurface } from "../canvas/context2d/Context2DSurface";
import { Surface } from "../Surface";
import { ExceptionFactory } from "../utils/ExceptionFactory";
import { Asset } from "./Asset";

export class SVGImageAssetSurface extends Surface {
	renderer(): pdi.Renderer {
		throw new Error("SVGImageAssetSurface cannot be rendered.");
	}

	isPlaying(): boolean {
		return false;
	}
}

export class SVGImageAsset extends Asset implements pdi.VectorImageAsset {
	type: "vector-image" = "vector-image";
	width: number;
	height: number;
	hint: pdi.ImageAssetHint | undefined;
	data: HTMLImageElement | null;
	_surface: SVGImageAssetSurface | null;

	constructor(id: string, path: string, width: number, height: number, hint?: pdi.ImageAssetHint) {
		super(id, path);
		this.width = width;
		this.height = height;
		this.hint = hint;
		this.data = null;
		this._surface = null;
	}

	destroy(): void {
		this.data = null;
		this.hint = undefined;
		this._surface = null;
		super.destroy();
	}

	_load(loader: pdi.AssetLoadHandler): void {
		const image = new Image();

		if (this.hint && this.hint.untainted) {
			image.crossOrigin = "anonymous";
		}
		image.onerror = () => {
			loader._onAssetError(this, ExceptionFactory.createAssetLoadError("SVGImageAsset unknown loading error"));
		};
		image.onload = () => {
			this.data = image;
			loader._onAssetLoad(this);
		};
		image.src = this.path;
	}

	createSurface(
		width: number,
		height: number,
		sx: number = 0,
		sy: number = 0,
		sWidth?: number,
		sHeight?: number
	): Surface | null {
		const { width: viewportWidth, height: viewportHeight, data } = this;
		if (!data) {
			throw new Error("SVGImageAsset#asSurface: not yet loaded.");
		}
		if (!this._surface) {
			this._surface = new SVGImageAssetSurface(viewportWidth, viewportHeight, data);
		}
		if (!sWidth) {
			sWidth = viewportWidth;
		}
		if (!sHeight) {
			sHeight = viewportHeight;
		}

		const surface = new Context2DSurface(width, height);
		const renderer = surface.renderer();
		renderer.save();
		renderer.transform([width / sWidth, 0, 0, height / sHeight, 0, 0]);
		renderer.drawImage(this._surface, sx, sy, sWidth, sHeight, 0, 0);
		renderer.restore();
		return surface;
	}
}
