import { CanvasRenderingState } from "./CanvasRenderingState";

export class CanvasSurfaceContext {
	protected _context: CanvasRenderingContext2D;
	protected _stateStack: CanvasRenderingState[] = [];

	protected _contextFillStyle: string | CanvasGradient | CanvasPattern;
	protected _contextGlobalAlpha: number;
	protected _contextGlobalCompositeOperation: string;

	private _modifiedTransform: boolean = false;

	constructor(context: CanvasRenderingContext2D) {
		this._context = context;
		const state = new CanvasRenderingState();
		this._contextFillStyle = state.fillStyle;
		this._contextGlobalAlpha = state.globalAlpha;
		this._contextGlobalCompositeOperation = state.globalCompositeOperation;
		this.pushState(state);
	}

	set fillStyle(fillStyle: string | CanvasGradient | CanvasPattern) {
		this.currentState().fillStyle = fillStyle;
	}

	get fillStyle() {
		return this.currentState().fillStyle;
	}

	set globalAlpha(globalAlpha: number) {
		this.currentState().globalAlpha = globalAlpha;
	}

	get globalAlpha() {
		return this.currentState().globalAlpha;
	}

	set globalCompositeOperation(operation: string) {
		this.currentState().globalCompositeOperation = operation;
	}

	get globalCompositeOperation() {
		return this.currentState().globalCompositeOperation;
	}

	getCanvasRenderingContext2D(): CanvasRenderingContext2D {
		return this._context;
	}

	clearRect(x: number, y: number, width: number, height: number): void {
		this.prerender();
		this._context.clearRect(x, y, width, height);
	}

	save(): void {
		const state = new CanvasRenderingState(this.currentState());
		this.pushState(state);
	}

	restore(): void {
		this.popState();
	}

	scale(x: number, y: number): void {
		this.currentState().transformer.scale(x, y);
		this._modifiedTransform = true;
	}

	drawImage(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap,
	          srcX: number, srcY: number, srcW: number, srcH: number, dstX: number, dstY: number, dstW: number, dstH: number) {
		this.prerender();
		this._context.drawImage(image, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
	}

	fillRect(x: number, y: number, width: number, height: number): void {
		this.prerender();
		this._context.fillRect(x, y, width, height);
	}

	fillText(text: string, x: number, y: number, maxWidth: number): void {
		this.prerender();
		this._context.fillText(text, x, y, maxWidth);
	}

	strokeText(text: string, x: number, y: number, maxWidth?: number): void {
		this.prerender();
		this._context.strokeText(text, x, y, maxWidth);
	}

	translate(x: number, y: number): void {
		this.currentState().transformer.translate(x, y);
		this._modifiedTransform = true;
	}

	transform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): void {
		this.currentState().transformer.transform([m11, m12, m21, m22, dx, dy]);
		this._modifiedTransform = true;
	}

	setTransform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number) {
		this.currentState().transformer.setTransform([m11, m12, m21, m22, dx, dy]);
		this._modifiedTransform = true;
	}

	setGlobalAlpha(globalAlpha: number) {
		this.currentState().globalAlpha = globalAlpha;
	}

	getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
		return this._context.getImageData(sx, sy, sw, sh);
	}

	putImageData(imagedata: ImageData, dx: number, dy: number,
	             dirtyX?: number, dirtyY?: number, dirtyWidth?: number, dirtyHeight?: number): void {
		this._context.putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
	}

	prerender() {
		const currentState = this.currentState();

		if (currentState.fillStyle !== this._contextFillStyle) {
			this._context.fillStyle = currentState.fillStyle;
			this._contextFillStyle = currentState.fillStyle;
		}
		if (currentState.globalAlpha !== this._contextGlobalAlpha) {
			this._context.globalAlpha = currentState.globalAlpha;
			this._contextGlobalAlpha = currentState.globalAlpha;
		}
		if (currentState.globalCompositeOperation !== this._contextGlobalCompositeOperation) {
			this._context.globalCompositeOperation = currentState.globalCompositeOperation;
			this._contextGlobalCompositeOperation = currentState.globalCompositeOperation;
		}
		if (this._modifiedTransform) {
			const transformer = currentState.transformer;
			this._context.setTransform(
				transformer.matrix[0],
				transformer.matrix[1],
				transformer.matrix[2],
				transformer.matrix[3],
				transformer.matrix[4],
				transformer.matrix[5]
			);
			this._modifiedTransform = false;
		}
	}

	private pushState(state: CanvasRenderingState) {
		this._stateStack.push(state);
	}

	private popState() {
		if (this._stateStack.length <= 1) {
			return;
		}
		this._stateStack.pop();
		this._modifiedTransform = true;
		// TODO: `_context` が外部(Context2DRenderer)で破壊されているのでここで値を反映している。本来 `_context` の操作は全てこのクラスに集約すべきである。
		this._contextFillStyle = this._context.fillStyle;
		this._contextGlobalAlpha = this._context.globalAlpha;
		this._contextGlobalCompositeOperation = this._context.globalCompositeOperation;
	}

	private currentState(): CanvasRenderingState {
		return this._stateStack[this._stateStack.length - 1];
	}
}
