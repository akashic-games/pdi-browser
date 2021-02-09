import * as pdi from "@akashic/pdi-types";
import { CanvasSurface } from "./CanvasSurface";
import { Context2DSurface } from "./context2d/Context2DSurface";

interface GlyphRenderSurfaceResult {
	surface: CanvasSurface;
	advanceWidth: number;
	imageData?: ImageData;
}

interface GlyphArea extends pdi.GlyphArea {
	x: number;
	y: number;
	width: number;
	height: number;
	offsetX?: number;
	offsetY?: number;
	advanceWidth?: number;
}

function createGlyphRenderedSurface(code: number, fontSize: number, cssFontFamily: string,
                                    baselineHeight: number, marginW: number, marginH: number,
                                    needImageData: boolean, fontColor: string, strokeWidth: number,
                                    strokeColor: string, strokeOnly: boolean, fontWeight: pdi.FontWeightString): GlyphRenderSurfaceResult {

	// 要求されたフォントサイズが描画可能な最小フォントサイズ以下だった場合、必要なスケーリング係数
	const scale = fontSize < GlyphFactory._environmentMinimumFontSize ? fontSize / GlyphFactory._environmentMinimumFontSize : 1;

	const surfaceWidth = Math.ceil((fontSize + marginW * 2) * scale);
	const surfaceHeight = Math.ceil((fontSize + marginH * 2) * scale);
	const surface = new Context2DSurface(surfaceWidth, surfaceHeight);

	// NOTE: canvasを直接操作する
	// 理由:
	// * Renderer#drawSystemText()を廃止または非推奨にしたいのでそれを用いず文字列を描画する
	// * RenderingHelperがcontextの状態を復帰するためTextMetricsを取れない
	const canvas = surface.canvas;
	const context = canvas.getContext("2d")!;

	const str = (code & 0xFFFF0000) ? String.fromCharCode((code & 0xFFFF0000) >>> 16, code & 0xFFFF) : String.fromCharCode(code);

	context.save();

	// CanvasRenderingContext2D.font
	// see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
	// > This string uses the same syntax as the CSS font specifier. The default font is 10px sans-serif.
	context.font = fontWeight + " " + fontSize + "px " + cssFontFamily;

	context.textAlign = "left";
	context.textBaseline = "alphabetic";
	context.lineJoin = "bevel";

	// 描画可能な最小フォントサイズ以下のフォントサイズはスケーリングで実現する
	if (scale !== 1) context.scale(scale, scale);

	if (strokeWidth > 0) {
		context.lineWidth = strokeWidth;
		context.strokeStyle = strokeColor;
		context.strokeText(str, marginW, marginH + baselineHeight);
	}

	if (!strokeOnly) {
		context.fillStyle = fontColor;
		context.fillText(str, marginW, marginH + baselineHeight);
	}

	const advanceWidth = context.measureText(str).width;

	context.restore();

	const result = {
		surface: surface,
		advanceWidth: advanceWidth,
		imageData: needImageData ? context.getImageData(0, 0, canvas.width, canvas.height) : undefined
	};

	return result;
}

function calcGlyphArea(imageData: ImageData): GlyphArea {
	let sx = imageData.width;
	let sy = imageData.height;
	let ex = 0;
	let ey = 0;
	let currentPos = 0;

	for (let y = 0, height = imageData.height; y < height; y = (y + 1) | 0) {
		for (let x = 0, width = imageData.width; x < width; x = (x + 1) | 0) {
			var a = imageData.data[currentPos + 3]; // get alpha value
			if (a !== 0) {
				if (x < sx) {
					sx = x;
				}
				if (x > ex) {
					ex = x;
				}
				if (y < sy) {
					sy = y;
				}
				if (y > ey) {
					ey = y;
				}
			}
			currentPos += 4; // go to next pixel
		}
	}

	let glyphArea: GlyphArea;
	if (sx === imageData.width) { // 空白文字
		glyphArea = { x: 0, y: 0, width: 0, height: 0 }; // 空の領域に設定
	} else {
		// sx, sy, ex, eyは座標ではなく画素のメモリ上の位置を指す添字。
		// 故にwidth, heightを算出する時 1 加算する。
		glyphArea = { x: sx, y: sy, width: ex - sx + 1, height: ey - sy + 1 };
	}

	return glyphArea;
}

function isGlyphAreaEmpty(glyphArea: pdi.GlyphArea): boolean {
	return glyphArea.width === 0 || glyphArea.height === 0;
}

// ジェネリックフォントファミリとして定義されているキーワードのリスト
// see: https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
const genericFontFamilyNames = [
	"serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"
];

// ジェネリックフォントファミリでない時クォートする。
// > Font family names must either be given quoted as strings, or unquoted as a sequence of one or more identifiers.
// > Generic family names are keywords and must not be quoted.
// see: https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
function quoteIfNonGeneric(name: string): string {
	return (genericFontFamilyNames.indexOf(name) !== -1) ? name : "\"" + name + "\"";
}

function createGlyph(
	code: number,
	x: number,
	y: number,
	width: number,
	height?: number,
	offsetX?: number,
	offsetY?: number,
	advanceWidth?: number,
	surface?: pdi.Surface,
	isSurfaceValid?: boolean
): pdi.Glyph {
	return {
		code,
		x,
		y,
		width: width || 0,
		height: height || 0,
		surface: surface || undefined,
		offsetX: offsetX || 0,
		offsetY: offsetY || 0,
		advanceWidth: advanceWidth || 0,
		isSurfaceValid: isSurfaceValid || false,
		_atlas: null
	};
}

export class GlyphFactory implements pdi.GlyphFactory {
	/**
	 * 実行環境が描画可能な最小フォントサイズ
	 */
	static _environmentMinimumFontSize: number;

	fontFamily: string | string[];
	fontSize: number;
	baselineHeight: number;
	fontColor: string;
	fontWeight: pdi.FontWeightString;
	strokeWidth: number;
	strokeColor: string;
	strokeOnly: boolean;

	_glyphAreas: {[key: number]: GlyphArea} = Object.create(null);
	_marginW: number;
	_marginH: number;

	_cssFontFamily: string;

	constructor(
		fontFamily: string|string[],
		fontSize: number,
		baselineHeight: number = fontSize,
		fontColor: string = "black",
		strokeWidth: number = 0,
		strokeColor: string = "black",
		strokeOnly: boolean = false,
		fontWeight: pdi.FontWeightString = "normal"
	) {
		this.fontFamily = fontFamily;
		this.fontSize = fontSize;
		this.baselineHeight = baselineHeight;
		this.fontColor = fontColor;
		this.strokeWidth = strokeWidth;
		this.strokeColor = strokeColor;
		this.strokeOnly = strokeOnly;
		this.fontWeight = fontWeight;

		this._cssFontFamily = (typeof fontFamily === "string")
			? quoteIfNonGeneric(fontFamily)
			: fontFamily.map(quoteIfNonGeneric).join(",");

		// Akashicエンジンは指定されたフォントに利用可能なものが見つからない時
		// `"sans-serif"` を利用する、と仕様して定められている。
		if (this._cssFontFamily.indexOf("sans-serif") === -1) {
			this._cssFontFamily += ",sans-serif";
		}

		// `this.fontSize`の大きさの文字を描画するためのサーフェスを生成する。
		// 一部の文字は縦横が`this.fontSize`幅の矩形に収まらない。
		// そこで上下左右にマージンを設ける。マージン幅は`this.fontSize`に
		// 0.3 を乗じたものにする。0.3に確たる根拠はないが、検証した範囲では
		// これで十分であることを確認している。
		//
		// strokeWidthサポートに伴い、輪郭線の厚みを加味している。
		this._marginW = Math.ceil(this.fontSize * 0.3 + this.strokeWidth / 2);
		this._marginH = Math.ceil(this.fontSize * 0.3 + this.strokeWidth / 2);

		if (GlyphFactory._environmentMinimumFontSize === undefined) {
			GlyphFactory._environmentMinimumFontSize = this.measureMinimumFontSize();
		}
	}

	create(code: number): pdi.Glyph {
		let result: GlyphRenderSurfaceResult | null = null;
		let glyphArea = this._glyphAreas[code];

		if (! glyphArea) {
			result = createGlyphRenderedSurface(
				code,
				this.fontSize, this._cssFontFamily, this.baselineHeight,
				this._marginW, this._marginH,
				true, this.fontColor, this.strokeWidth,
				this.strokeColor, this.strokeOnly, this.fontWeight
			);
			glyphArea = calcGlyphArea(result.imageData!); // createGlyphRenderedSurface() に needImageData: true が渡るため imageData は受け取れる
			glyphArea.advanceWidth = result.advanceWidth;
			this._glyphAreas[code] = glyphArea;
		}

		if (isGlyphAreaEmpty(glyphArea)) {
			if (result) {
				result.surface.destroy();
			}
			return createGlyph(code, 0, 0, 0, 0, 0, 0, glyphArea.advanceWidth, undefined, true);
		} else {
			// pdi.Glyphに格納するサーフェスを生成する。
			// glyphAreaはサーフェスをキャッシュしないため、描画する内容を持つグリフに対しては
			// サーフェスを生成する。もし前段でcalcGlyphArea()のためのサーフェスを生成して
			// いればここでは生成せずにそれを利用する。
			if (! result) {
				result = createGlyphRenderedSurface(
					code,
					this.fontSize, this._cssFontFamily, this.baselineHeight,
					this._marginW, this._marginH,
					false, this.fontColor, this.strokeWidth,
					this.strokeColor, this.strokeOnly, this.fontWeight
				);
			}
			return createGlyph(
				code,
				glyphArea.x, glyphArea.y,
				glyphArea.width, glyphArea.height,
				glyphArea.x - this._marginW, glyphArea.y - this._marginH,
				glyphArea.advanceWidth,
				result.surface,
				true
			);
		}
	}

	// 実行環境の描画可能なフォントサイズの最小値を返す
	measureMinimumFontSize(): number {
		let fontSize = 1;
		const str = "M";
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d")!;
		context.textAlign = "left";
		context.textBaseline = "alphabetic";
		context.lineJoin = "bevel";

		let preWidth: number;
		context.font = fontSize + "px sans-serif";
		let width = context.measureText(str).width;

		do {
			preWidth = width;
			fontSize += 1;
			context.font = fontSize + "px sans-serif";
			width = context.measureText(str).width;
		} while (preWidth === width || fontSize > 50); // フォントサイズに対応しない動作環境の場合を考慮して上限値を設ける
		return fontSize;
	}
}
