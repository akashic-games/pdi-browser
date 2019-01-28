import * as g from "@akashic/akashic-engine";
import { Context2DRenderer } from "./Context2DRenderer";

export class CanvasSurface extends g.Surface {
	canvas: HTMLCanvasElement;
	protected _context: CanvasRenderingContext2D;
	protected _renderer: g.Renderer;

	constructor(width: number, height: number) {
		var canvas = document.createElement("canvas");
		super(width, height, canvas);
		canvas.width = width;
		canvas.height = height;
		this.canvas = canvas;
		this._context = canvas.getContext("2d");
		this._renderer = undefined;
	}

	renderer(): g.Renderer {
		if (!this._renderer) {
			this._renderer = new Context2DRenderer(this, this._context);
		}
		return this._renderer;
	}

	getHTMLElement(): HTMLElement {
		return this.canvas;
	}

	/**
	 * 描き込み時の拡大率(と描画領域のサイズ)を変更する。
	 * このメソッドによって描画領域のサイズは変化し、それにより表示上のサイズも変化するが、
	 * 「ゲームコンテンツから見たサーフェスとしてのサイズ」(生成時に指定されたサイズ)は変わらない点に注意。
	 *
	 * このメソッドと `changeVisualScale()` との違いは、拡大時、高解像度の画像の縮小して描き込む時に現れる。
	 * このメソッドによる拡大は、表示上の拡大率のみを変更する `changeVisualScale()` と異なり、
	 * 「縮小と拡大の変換行列をかけて大きなcanvasに描き込む」ことになるため、描画元の解像度を活かすことができる。
	 *
	 * このメソッドは、このサーフェスへの描画中(`this.renderer().begin()` から `end()` までの間)に呼び出してはならない。
	 */
	changePhysicalScale(xScale: number, yScale: number): void {
		this.canvas.width = this.width * xScale;
		this.canvas.height = this.height * yScale;
		this._context.scale(xScale, yScale);
	}

	/**
	 * 表示上の拡大率を変更する。
	 * `changeRawSize()` との差異に注意。
	 */
	changeVisualScale(xScale: number, yScale: number): void {
		/*
		 Canvas要素のリサイズをCSS transformで行う。
		 CSSのwidth/height styleによるリサイズはおかしくなるケースが存在するので、可能な限りtransformを使う。
		 - https://twitter.com/uupaa/status/639002317576998912
		 - http://havelog.ayumusato.com/develop/performance/e554-paint_gpu_acceleration_problems.html
		 - http://buccchi.jp/blog/2013/03/android_canvas_deathpoint/
		 */
		var canvasStyle = <any>this.canvas.style;
		if ("transform" in canvasStyle) {
			canvasStyle.transformOrigin = "0 0";
			canvasStyle.transform = "scale(" + xScale + "," + yScale + ")";
		} else if ("webkitTransform" in canvasStyle) {
			canvasStyle.webkitTransformOrigin = "0 0";
			canvasStyle.webkitTransform = "scale(" + xScale + "," + yScale + ")";
		} else {
			canvasStyle.width = Math.floor(xScale * this.width) + "px";
			canvasStyle.height = Math.floor(yScale * this.width) + "px";
		}
	}

	isPlaying(): boolean {
		throw g.ExceptionFactory.createAssertionError("CanvasSurface#isPlaying() is not implemented");
	}
}
