import type * as pdi from "@akashic/pdi-types";
import { ExceptionFactory } from "../utils/ExceptionFactory";
import { SVGImageAsset } from "./SVGImageAsset";

/**
 * 文字列を解釈して動的に SVG を生成する VectorImageAsset 。
 * `width`, `height` は `_load()` 完了まで確定しない (`0` である) 点に注意。
 */
export class DynamicSVGImageAsset extends SVGImageAsset {
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
		const doc = parser.parseFromString(svgString, "text/xml");
		const inlineSVG = doc.getElementsByTagName("svg")[0];

		// これが無いと image/svg+xml が解釈されない
		if (!inlineSVG.getAttribute("xmlns")) {
			inlineSVG.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		}
		if (!inlineSVG.getAttribute("width")) {
			throw new Error("must give width in the root element.");
		}
		if (!inlineSVG.getAttribute("height")) {
			throw new Error("must give height in the root element.");
		}

		const base64SVG = btoa(decodeURIComponent(encodeURIComponent(new XMLSerializer().serializeToString(inlineSVG))));
		const width = inlineSVG.getAttribute("width");
		const height = inlineSVG.getAttribute("height");

		// TODO: px 以外の単位の場合の対応

		this.width = parseInt(width, 10);
		this.height = parseInt(height, 10);

		const image = new Image();

		if (this.hint && this.hint.untainted) {
			image.crossOrigin = "anonymous";
		}
		image.onerror = () => {
			loader._onAssetError(this, ExceptionFactory.createAssetLoadError("DynamicSVGImageAsset unknown loading error"));
		};
		image.onload = () => {
			this.data = image;
			loader._onAssetLoad(this);
		};
		image.src = "data:image/svg+xml;base64," + base64SVG;
	}
}
