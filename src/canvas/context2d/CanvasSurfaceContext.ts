import { CanvasRenderingState } from "./CanvasRenderingState";

export class CanvasSurfaceContext {
	protected _context: CanvasRenderingContext2D;
	protected _stateStack: CanvasRenderingState[] = [];

	protected _currentFillStyle: string | CanvasGradient | CanvasPattern;
	protected _currentFont: string;
	protected _currentTextAlign: string;
	protected _currentTextBaseline: string;
	protected _currentLineJoin: string;
	protected _currentLineWidth: number;
	protected _currentStrokeStyle: string | CanvasGradient | CanvasPattern;
	protected _currentGlobalAlpha: number;
	protected _currentGlobalCompositeOperation: string;

	private _modifiedTransform: boolean = false;

	constructor(context: CanvasRenderingContext2D) {
		this._context = context;
		const state = new CanvasRenderingState();
		this._currentFillStyle = state.fillStyle;
		this._currentFont = state.font;
		this._currentTextAlign = state.textAlign;
		this._currentTextBaseline = state.textBaseline;
		this._currentLineJoin = state.lineJoin;
		this._currentLineWidth = state.lineWidth;
		this._currentStrokeStyle = state.strokeStyle;
		this._currentGlobalAlpha = state.globalAlpha;
		this._currentGlobalCompositeOperation = state.globalCompositeOperation;
		this.pushState(state);
	}

	set fillStyle(fillStyle: string | CanvasGradient | CanvasPattern) {
		this.currentState().fillStyle = fillStyle;
	}

	get fillStyle() {
		return this.currentState().fillStyle;
	}

	set font(font: string) {
		this.currentState().font = font;
	}

	get font() {
		return this.currentState().font;
	}

	set textAlign(textAlign: string) {
		this.currentState().textAlign = textAlign;
	}

	get textAlign() {
		return this.currentState().textAlign;
	}

	set textBaseline(textBaseline: string) {
		this.currentState().textBaseline = textBaseline;
	}

	get textBaseline() {
		return this.currentState().textBaseline;
	}

	set lineJoin(lineJoin: string) {
		this.currentState().lineJoin = lineJoin;
	}

	get lineJoin() {
		return this.currentState().lineJoin;
	}

	set lineWidth(lineWidth: number) {
		this.currentState().lineWidth = lineWidth;
	}

	get lineWidth() {
		return this.currentState().lineWidth;
	}

	set strokeStyle(strokeStyle: string | CanvasGradient | CanvasPattern) {
		this.currentState().strokeStyle = strokeStyle;
	}

	get strokeStyle() {
		return this.currentState().strokeStyle;
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

	transform(matrix: number[]): void {
		this.currentState().transformer.transform(matrix);
		this._modifiedTransform = true;
	}

	setTransform(matrix: number[]) {
		this.currentState().transformer.setTransform(matrix);
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

	private pushState(state: CanvasRenderingState) {
		this._stateStack.push(state);
	}

	private popState() {
		if (this._stateStack.length <= 1) {
			return;
		}
		this._stateStack.pop();
		this._modifiedTransform = true;
	}

	private currentState(): CanvasRenderingState {
		return this._stateStack[this._stateStack.length - 1];
	}

	private prerender() {
		const currentState = this.currentState();

		if (currentState.fillStyle !== this._currentFillStyle) {
			this._context.fillStyle = currentState.fillStyle;
			this._currentFillStyle = currentState.fillStyle;
		}
		if (currentState.font !== this._currentFont) {
			this._context.font = currentState.font;
			this._currentFont = currentState.font;
		}
		if (currentState.textAlign !== this._currentTextAlign) {
			this._context.textAlign = currentState.textAlign;
			this._currentTextAlign = currentState.textAlign;
		}
		if (currentState.textBaseline !== this._currentTextBaseline) {
			this._context.textBaseline = currentState.textBaseline;
			this._currentTextBaseline = currentState.textBaseline;
		}
		if (currentState.lineJoin !== this._currentLineJoin) {
			this._context.lineJoin = currentState.lineJoin;
			this._currentLineJoin = currentState.lineJoin;
		}
		if (currentState.lineWidth !== this._currentLineWidth) {
			this._context.lineWidth = currentState.lineWidth;
			this._currentLineWidth = currentState.lineWidth;
		}
		if (currentState.strokeStyle !== this._currentStrokeStyle) {
			this._context.strokeStyle = currentState.strokeStyle;
			this._currentStrokeStyle = currentState.strokeStyle;
		}
		if (currentState.globalAlpha !== this._currentGlobalAlpha) {
			this._context.globalAlpha = currentState.globalAlpha;
			this._currentGlobalAlpha = currentState.globalAlpha;
		}
		if (currentState.globalCompositeOperation !== this._currentGlobalCompositeOperation) {
			this._context.globalCompositeOperation = currentState.globalCompositeOperation;
			this._currentGlobalCompositeOperation = currentState.globalCompositeOperation;
		}
		if (this._modifiedTransform) {
			const transformer = this.currentState().transformer;
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
}
