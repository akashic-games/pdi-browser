import type * as pdi from "@akashic/pdi-types";
import { ExceptionFactory } from "../utils/ExceptionFactory";
import { SVGImageAsset } from "./SVGImageAsset";

/**
 * 文字列を解釈して動的に SVG を生成する VectorImageAsset 。
 * `width`, `height` は `_load()` 完了まで確定しない (`0` である) 点に注意。
 */
export class GeneratedSVGImageAsset extends SVGImageAsset {
	_svgString: string;

	constructor(id: string, path: string, data: string) {
		super(id, path, 0, 0);
		this._svgString = data;
	}

	destroy(): void {
		this._svgString = null!;
		super.destroy();
	}

	_load(loader: pdi.AssetLoadHandler): void {
		const svgString = this._svgString;
		const parser = new DOMParser();
		let base64SVG: string;

		try {
			const doc = parser.parseFromString(svgString, "text/xml");
			const inlineSVG = doc.getElementsByTagName("svg")[0];
			const stringWidth = inlineSVG.getAttribute("width");
			const stringHeight = inlineSVG.getAttribute("height");

			if (stringWidth == null) {
				throw new Error("must give width in the root element.");
			}
			if (stringHeight == null) {
				throw new Error("must give height in the root element.");
			}
			if (!isPixelUnits(stringWidth)) {
				throw new Error("the width in the root element must be given in \"px\" units");
			}
			if (!isPixelUnits(stringHeight)) {
				throw new Error("the height in the root element must be given in \"px\" units");
			}

			base64SVG = window.btoa(svgString);

			// 小数は切り上げる
			this.width = Math.ceil(parseFloat(stringWidth));
			this.height = Math.ceil(parseFloat(stringHeight));

		} catch (e) {
			loader._onAssetError(this, ExceptionFactory.createAssetLoadError(e.message, false, e));
			return;
		}

		const image = new Image();

		if (this.hint?.untainted) {
			image.crossOrigin = "anonymous";
		}
		image.onerror = (e) => {
			loader._onAssetError(
				this,
				ExceptionFactory.createAssetLoadError("GeneratedSVGImageAsset: unknown loading error", undefined, e)
			);
		};
		image.onload = () => {
			this.data = image;
			loader._onAssetLoad(this);
		};
		image.src = "data:image/svg+xml;base64," + base64SVG;
	}
}

/**
 * "1.00", "1.0e2", "10%", "20px" などの文字列の単位が px かどうかチェックする。
 */
function isPixelUnits(value: string): boolean {
	// @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number
	// [+-]? [0-9]* "." [0-9]+ ([Ee] integer)?
	return /^[+-]?[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?(?:px)?$/.test(value);
}
