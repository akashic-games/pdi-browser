import type * as pdi from "@akashic/pdi-types";
import type { WebGLBackSurface } from "./WebGLBackSurface";
import { WebGLColor } from "./WebGLColor";
import { WebGLRenderingState } from "./WebGLRenderingState";
import type { RenderTarget, WebGLSharedObject } from "./WebGLSharedObject";

export class WebGLRenderer implements pdi.Renderer {
	static DEFAULT_CAPACITY: number = 16;

	protected _shared: WebGLSharedObject;
	protected _renderTarget: RenderTarget;
	protected _whiteColor: number[];
	private _stateStack: WebGLRenderingState[];
	private _stateStackPointer: number;
	private _capacity: number;

	constructor(shared: WebGLSharedObject, renderTarget: RenderTarget) {
		this._stateStack = [];
		this._stateStackPointer = 0;
		this._capacity = 0;
		this._reallocation(WebGLRenderer.DEFAULT_CAPACITY);
		this._whiteColor = [1.0, 1.0, 1.0, 1.0];
		this._shared = shared;
		this._renderTarget = renderTarget;
	}

	clear(): void {
		this._shared.clear();
	}

	begin(): void {
		// do nothing.
	}

	end(): void {
		this._shared.end();
	}

	save(): void {
		this._pushState();
	}

	restore(): void {
		this._popState();
	}

	translate(x: number, y: number): void {
		this.currentState().transformer.translate(x, y);
	}

	transform(matrix: number[]): void {
		this.currentState().transformer.transform(matrix);
	}

	opacity(opacity: number): void {
		this.currentState().globalAlpha *= opacity;
	}

	setCompositeOperation(operation: pdi.CompositeOperationString): void {
		this.currentState().globalCompositeOperation = operation;
	}

	currentState(): WebGLRenderingState {
		return this._stateStack[this._stateStackPointer];
	}

	fillRect(x: number, y: number, width: number, height: number, cssColor: string): void {
		this._shared.draw(
			this.currentState(), this._shared.getFillRectSurfaceTexture(), 0, 0, width, height, x, y, WebGLColor.get(cssColor)
		);
	}

	drawSprites(surface: WebGLBackSurface, offsetX: number[], offsetY: number[], width: number[], height: number[],
	            canvasOffsetX: number[], canvasOffsetY: number[], count: number): void {
		for (let i = 0; i < count; ++i) {
			this.drawImage(surface, offsetX[i], offsetY[i],
				width[i], height[i], canvasOffsetX[i], canvasOffsetY[i]);
		}
	}

	drawImage(surface: WebGLBackSurface,
	          offsetX: number, offsetY: number, width: number, height: number,
	          canvasOffsetX: number, canvasOffsetY: number): void {

		if (!surface._drawable) {
			throw new Error("WebGLRenderer#drawImage: no drawable surface.");
		}

		// WebGLTexture でないなら変換する (HTMLVideoElement は対応しない)
		// NOTE: 対象の surface が動画の場合、独立した framebuffer に描画した方がパフォーマンス上優位になり得る
		if (!(surface._drawable.texture instanceof WebGLTexture)) {
			this._shared.makeTextureForSurface(surface);
		}

		if (!surface._drawable.texture) {
			throw new Error("WebGLRenderer#drawImage: could not create a texture.");
		}

		this._shared.draw(
			this.currentState(), surface._drawable, offsetX, offsetY, width, height,
			canvasOffsetX, canvasOffsetY, this._whiteColor
		);
	}

	setTransform(matrix: number[]): void {
		this.currentState().transformer.setTransform(matrix);
	}

	setOpacity(opacity: number): void {
		this.currentState().globalAlpha = opacity;
	}

	setShaderProgram(shaderProgram: pdi.ShaderProgram): void {
		this.currentState().shaderProgram = this._shared.initializeShaderProgram(shaderProgram);
	}

	isSupportedShaderProgram(): boolean {
		return true;
	}

	changeViewportSize(width: number, height: number): void {
		const old = this._renderTarget;
		this._renderTarget = {
			width: old.width,
			height: old.height,
			viewportWidth: width,
			viewportHeight: height,
			texture: old.texture,
			framebuffer: old.framebuffer
		};
	}

	destroy(): void {
		this._shared.requestDeleteRenderTarget(this._renderTarget);
		this._shared = undefined!;
		this._renderTarget = undefined!;
		this._whiteColor = undefined!;
	}

	_getImageData(): pdi.ImageData {
		throw new Error("WebGLRenderer#_getImageData() is not implemented");
	}

	_putImageData(
		_imageData: ImageData,
		_dx: number,
		_dy: number,
		_dirtyX?: number,
		_dirtyY?: number,
		_dirtyWidth?: number,
		_dirtyHeight?: number
	): void {
		throw new Error("WebGLRenderer#_putImageData() is not implemented");
	}

	private _pushState(): void {
		const old = this.currentState();
		++this._stateStackPointer;
		if (this._isOverCapacity()) {
			this._reallocation(this._stateStackPointer + 1);
		}
		this.currentState().copyFrom(old);
	}

	private _popState(): void {
		if (this._stateStackPointer > 0) {
			this.currentState().shaderProgram = null;
			--this._stateStackPointer;
		} else {
			throw new Error("WebGLRenderer#restore: state stack under-flow.");
		}
	}

	private _isOverCapacity(): boolean {
		return this._capacity <= this._stateStackPointer;
	}

	private _reallocation(newCapacity: number): void {
		// 指数的成長ポリシーの再割当:
		const oldCapacity = this._capacity;
		if (oldCapacity < newCapacity) {
			if (newCapacity < (oldCapacity * 2)) {
				this._capacity *= 2;
			} else {
				this._capacity = newCapacity;
			}
			for (let i = oldCapacity; i < this._capacity; ++i) {
				this._stateStack.push(new WebGLRenderingState());
			}
		}
	}
}
