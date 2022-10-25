import type * as pdi from "@akashic/pdi-types";
import type { AffineTransformer } from "../AffineTransformer";
import { WebGLBackSurface } from "./WebGLBackSurface";
import { WebGLPrimarySurface } from "./WebGLPrimarySurface";
import type { WebGLRenderingState } from "./WebGLRenderingState";
import { WebGLShaderProgram } from "./WebGLShaderProgram";
import { WebGLTextureAtlas } from "./WebGLTextureAtlas";

export interface WebGLSurfaceTexture {
	texture: WebGLTexture | null;
	textureOffsetX: number;
	textureOffsetY: number;
	textureWidth: number;
	textureHeight: number;
}

export interface RenderTarget {
	width: number;
	height: number;
	viewportWidth: number;
	viewportHeight: number;
	framebuffer: WebGLFramebuffer | null;
	texture: WebGLTexture | null;
}

export class WebGLSharedObject {
	private _context: WebGLRenderingContext;
	private _surface: WebGLPrimarySurface;

	private _renderTarget: RenderTarget = undefined!;
	private _defaultShaderProgram: WebGLShaderProgram = undefined!;
	private _textureAtlas: WebGLTextureAtlas = undefined!;
	private _fillRectTexture: WebGLTexture = undefined!;
	private _fillRectSurfaceTexture: WebGLSurfaceTexture = undefined!;

	private _maxSpriteCount: number = undefined!;
	private _vertices: WebGLBuffer = undefined!;
	private _verticesCache: Float32Array = undefined!;
	private _numSprites: number = undefined!;
	private _renderTargetStack: RenderTarget[] = undefined!;

	private _currentTexture: WebGLTexture | null = undefined!;
	private _currentColor: number[] = undefined!;
	private _currentAlpha: number = undefined!;
	private _currentCompositeOperation: pdi.CompositeOperationString | null = undefined!;
	private _currentShaderProgram: WebGLShaderProgram = undefined!;

	private _compositeOps: {[key in pdi.CompositeOperationString]: [number, number]; } = undefined!;
	private _deleteRequestedTargets: RenderTarget[] = undefined!;

	constructor(width: number, height: number) {
		const surface = new WebGLPrimarySurface(this, width, height);
		const context = surface.canvas.getContext("webgl", { depth: false, preserveDrawingBuffer: true });
		if (!context) {
			throw new Error("WebGLSharedObject#constructor: could not initialize WebGLRenderingContext");
		}

		this._surface = surface;
		this._context = context;
		this._init();
	}

	getFillRectSurfaceTexture(): WebGLSurfaceTexture {
		return this._fillRectSurfaceTexture;
	}

	getPrimarySurface(): WebGLPrimarySurface {
		// NOTE: 一つの WebGLSharedObject は一つの primary surface のみを保持するものとする。
		return this._surface;
	}

	createBackSurface(width: number, height: number): WebGLBackSurface {
		return new WebGLBackSurface(this, width, height);
	}

	pushRenderTarget(renderTarget: RenderTarget): void {
		this._commit();

		this._renderTargetStack.push(renderTarget);
		this._context.bindFramebuffer(this._context.FRAMEBUFFER, renderTarget.framebuffer);
		this._context.viewport(0, 0, renderTarget.viewportWidth, renderTarget.viewportHeight);
	}

	popRenderTarget(): void {
		this._commit();

		this._renderTargetStack.pop();
		const renderTarget = this.getCurrentRenderTarget();
		this._context.bindFramebuffer(this._context.FRAMEBUFFER, renderTarget.framebuffer);
		this._context.viewport(0, 0, renderTarget.viewportWidth, renderTarget.viewportHeight);
	}

	getCurrentRenderTarget(): RenderTarget {
		return this._renderTargetStack[this._renderTargetStack.length - 1];
	}

	begin(): void {
		this.clear();
		this._currentShaderProgram.use();
		this._currentShaderProgram.set_aVertex(this._vertices);
		this._currentShaderProgram.set_uColor(this._currentColor);
		this._currentShaderProgram.set_uAlpha(this._currentAlpha);
		this._currentShaderProgram.set_uSampler(0);
		this._currentShaderProgram.updateUniforms();
	}

	clear(): void {
		this._context.clear(this._context.COLOR_BUFFER_BIT);
	}

	draw(
		state: WebGLRenderingState,
		surfaceTexture: WebGLSurfaceTexture,
		offsetX: number,
		offsetY: number,
		width: number,
		height: number,
		canvasOffsetX: number,
		canvasOffsetY: number,
		color: number[]
	): void {

		if (this._numSprites >= this._maxSpriteCount) {
			this._commit();
		}

		let shaderProgram: WebGLShaderProgram;

		// fillRectの場合はデフォルトのシェーダを利用
		if (surfaceTexture === this._fillRectSurfaceTexture || state.shaderProgram == null || state.shaderProgram._program == null) {
			shaderProgram = this._defaultShaderProgram;
		} else {
			shaderProgram = state.shaderProgram._program;
		}

		// シェーダプログラムを設定
		if (this._currentShaderProgram !== shaderProgram) {
			this._commit();
			this._currentShaderProgram = shaderProgram;

			this._currentShaderProgram.use();
			this._currentShaderProgram.updateUniforms();

			// シェーダプログラム変更時は全ての設定をクリア
			this._currentCompositeOperation = null;
			this._currentAlpha = null!; // TODO: 型定義の見直し
			this._currentColor = [];
			this._currentTexture = null;
		}

		// テクスチャを設定
		if (this._currentTexture !== surfaceTexture.texture) {
			this._currentTexture = surfaceTexture.texture;
			this._commit();
			this._context.bindTexture(this._context.TEXTURE_2D, surfaceTexture.texture);
		}

		// 色を設定
		if (this._currentColor[0] !== color[0] ||
			this._currentColor[1] !== color[1] ||
			this._currentColor[2] !== color[2] ||
			this._currentColor[3] !== color[3]) {
			this._currentColor = color;
			this._commit();
			this._currentShaderProgram.set_uColor(color);
		}

		// アルファを指定
		if (this._currentAlpha !== state.globalAlpha) {
			this._currentAlpha = state.globalAlpha;
			this._commit();
			this._currentShaderProgram.set_uAlpha(state.globalAlpha);
		}

		// 合成モードを設定
		if (this._currentCompositeOperation !== state.globalCompositeOperation) {
			this._currentCompositeOperation = state.globalCompositeOperation;
			this._commit();
			const compositeOperation = this._compositeOps[this._currentCompositeOperation];
			this._context.blendFunc(compositeOperation[0], compositeOperation[1]);
		}

		const tw = 1.0 / surfaceTexture.textureWidth;
		const th = 1.0 / surfaceTexture.textureHeight;

		const ox = surfaceTexture.textureOffsetX;
		const oy = surfaceTexture.textureOffsetY;

		const s = tw * (ox + offsetX + width );
		const t = th * (oy + offsetY + height);
		const u = tw * (ox + offsetX);
		const v = th * (oy + offsetY);

		// 変換行列を設定
		this._register(
			this._transformVertex(canvasOffsetX, canvasOffsetY, width, height, state.transformer), [u, v, s, v, s, t, u, v, s, t, u, t]
		);
	}

	end(): void {
		this._commit();

		if (this._deleteRequestedTargets.length > 0) {
			for (let i = 0; i < this._deleteRequestedTargets.length; ++i) {
				this.deleteRenderTarget(this._deleteRequestedTargets[i]);
			}
			this._deleteRequestedTargets = [];
		}
	}

	makeTextureForSurface(surface: pdi.Surface): void {
		this._textureAtlas.makeTextureForSurface(this, surface);
	}

	disposeTexture(texture: WebGLTexture): void {
		if (this._currentTexture === texture) {
			this._commit();
		}
	}

	/**
	 * image を GPU 上のテクスチャメモリ領域にコピーする.
	 */
	assignTexture(image: any, x: number, y: number, texture: WebGLTexture): void {
		this._context.bindTexture(this._context.TEXTURE_2D, texture);

		if (image instanceof HTMLVideoElement) {
			throw new Error("WebGLRenderer#assignTexture: HTMLVideoElement is not supported.");
		}

		this._context.texSubImage2D(this._context.TEXTURE_2D, 0, x, y, this._context.RGBA, this._context.UNSIGNED_BYTE, image);
		this._context.bindTexture(this._context.TEXTURE_2D, this._currentTexture);
	}

	/**
	 * GPU 上のテクスチャメモリ領域を texturePixels でクリアする.
	 *
	 * NOTE: 本来はGPUデバイス上で領域をクリアすることが望ましく、ホストから都度領域を転送する texSubImage2D() は適当でない。
	 * FBOをTextureにバインドさせる方式などを考慮すべきである。
	 * ただし、以下の2点より本操作の最適化を見送っている。
	 * - 処理速度上最良のケースは本操作の呼び出しを行わないことである
	 * - 本操作の呼び出し頻度がWebGLTextureAtlas#TEXTURE_SIZEやWebGLTextureAtlas#TEXTURE_COUNTの値に依存するため、
	 *   そちらをチューニングする方が優先度が高い
	 */
	clearTexture(texturePixels: Uint8Array, width: number, height: number, texture: WebGLTexture): void {
		this._context.bindTexture(this._context.TEXTURE_2D, texture);
		this._context.texSubImage2D(
			this._context.TEXTURE_2D, 0, 0, 0, width, height, this._context.RGBA,
			this._context.UNSIGNED_BYTE, texturePixels
		);
		this._context.bindTexture(this._context.TEXTURE_2D, this._currentTexture);
	}

	makeTextureRaw(width: number, height: number, pixels: Uint8Array | null = null): WebGLTexture {
		const texture = this._context.createTexture();
		if (!texture) {
			throw new Error("WebGLSharedObject#makeTextureRaw(): could not create WebGLTexture");
		}

		this._context.bindTexture(this._context.TEXTURE_2D, texture);
		this._context.pixelStorei(this._context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_WRAP_S, this._context.CLAMP_TO_EDGE);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_WRAP_T, this._context.CLAMP_TO_EDGE);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MAG_FILTER, this._context.NEAREST);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MIN_FILTER, this._context.NEAREST);

		this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGBA,
			width, height, 0, this._context.RGBA, this._context.UNSIGNED_BYTE, pixels);

		this._context.bindTexture(this._context.TEXTURE_2D, this._currentTexture);

		return texture;
	}

	makeTexture(data: HTMLImageElement|HTMLCanvasElement|ImageData): WebGLTexture {
		const texture = this._context.createTexture();
		if (!texture) {
			throw new Error("WebGLSharedObject#makeTexture(): could not create WebGLTexture");
		}

		this._context.bindTexture(this._context.TEXTURE_2D, texture);
		this._context.pixelStorei(this._context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_WRAP_S, this._context.CLAMP_TO_EDGE);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_WRAP_T, this._context.CLAMP_TO_EDGE);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MAG_FILTER, this._context.NEAREST);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MIN_FILTER, this._context.NEAREST);

		if (data instanceof HTMLImageElement) {
			this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGBA,
				this._context.RGBA, this._context.UNSIGNED_BYTE, data);
		} else if (data instanceof HTMLCanvasElement) {
			this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGBA,
				this._context.RGBA, this._context.UNSIGNED_BYTE, data);
		} else if (data instanceof ImageData) {
			this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGBA,
				this._context.RGBA, this._context.UNSIGNED_BYTE, data);
		}

		this._context.bindTexture(this._context.TEXTURE_2D, this._currentTexture);

		return texture;
	}

	getPrimaryRenderTarget(_width: number, _height: number): RenderTarget {
		return this._renderTarget;
	}

	createRenderTarget(width: number, height: number): RenderTarget {
		const context = this._context;

		const framebuffer = context.createFramebuffer();
		context.bindFramebuffer(context.FRAMEBUFFER, framebuffer);

		const texture = context.createTexture();
		context.bindTexture(context.TEXTURE_2D, texture);
		context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
		context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
		context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
		context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);

		context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, width, height, 0, context.RGBA, context.UNSIGNED_BYTE, null);
		context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, texture, 0);

		context.bindTexture(context.TEXTURE_2D, this._currentTexture);

		const renderTaget = this.getCurrentRenderTarget();
		context.bindFramebuffer(context.FRAMEBUFFER, renderTaget.framebuffer);

		return {
			width,
			height,
			viewportWidth: width,
			viewportHeight: height,
			framebuffer,
			texture
		};
	}

	requestDeleteRenderTarget(renderTaget: RenderTarget): void {
		this._deleteRequestedTargets.push(renderTaget);
	}

	deleteRenderTarget(renderTaget: RenderTarget): void {
		const context = this._context;

		if (this.getCurrentRenderTarget() === renderTaget) {
			this._commit();
		}
		context.deleteFramebuffer(renderTaget.framebuffer);
		context.deleteTexture(renderTaget.texture);
	}

	getContext(): WebGLRenderingContext {
		return this._context;
	}

	getDefaultShaderProgram(): WebGLShaderProgram {
		return this._defaultShaderProgram;
	}

	initializeShaderProgram(shaderProgram: pdi.ShaderProgram | null): pdi.ShaderProgram | null {
		if (shaderProgram) {
			if (!shaderProgram._program) {
				const program = new WebGLShaderProgram(
					this._context,
					shaderProgram.fragmentShader,
					shaderProgram.uniforms
				);
				program.initializeUniforms();
				shaderProgram._program = program;
			}
		}

		return shaderProgram;
	}

	private _init(): void {
		const program = new WebGLShaderProgram(this._context);

		// 描画用リソース
		this._textureAtlas = new WebGLTextureAtlas();
		this._fillRectTexture = this.makeTextureRaw(1, 1, new Uint8Array([255, 255, 255, 255]));
		this._fillRectSurfaceTexture = {
			texture: this._fillRectTexture,
			textureWidth: 1,
			textureHeight: 1,
			textureOffsetX: 0,
			textureOffsetY: 0
		};
		this._renderTarget = {
			width: this._surface.width,
			height: this._surface.height,
			viewportWidth: this._surface.width,
			viewportHeight: this._surface.height,
			framebuffer: null,
			texture: null
		};

		// 描画命令をため込んでおくバッファ
		this._maxSpriteCount = 1024;
		this._vertices = this._makeBuffer(this._maxSpriteCount * 24 * 4);
		this._verticesCache = new Float32Array(this._maxSpriteCount * 24);
		this._numSprites = 0; // the number of sprites
		this._currentTexture = null;
		this._currentColor = [1.0, 1.0, 1.0, 1.0];
		this._currentAlpha = 1.0;
		this._currentCompositeOperation = "source-over";
		this._currentShaderProgram = program;
		this._defaultShaderProgram = program;
		this._renderTargetStack = [];
		this._deleteRequestedTargets = [];

		// シェーダの設定
		this._currentShaderProgram.use();
		try {
			this._currentShaderProgram.set_aVertex(this._vertices);
			this._currentShaderProgram.set_uColor(this._currentColor);
			this._currentShaderProgram.set_uAlpha(this._currentAlpha);
			this._currentShaderProgram.set_uSampler(0);
		} finally {
			this._currentShaderProgram.unuse();
		}

		// WebGL のパラメータを設定
		this._context.enable(this._context.BLEND);
		this._context.activeTexture(this._context.TEXTURE0);
		this._context.bindTexture(this._context.TEXTURE_2D, this._fillRectTexture);

		this._compositeOps = {
			"source-atop": [this._context.DST_ALPHA, this._context.ONE_MINUS_SRC_ALPHA],
			"experimental-source-in": [this._context.DST_ALPHA, this._context.ZERO],
			"experimental-source-out": [this._context.ONE_MINUS_DST_ALPHA, this._context.ZERO],
			"source-over": [this._context.ONE, this._context.ONE_MINUS_SRC_ALPHA],
			"experimental-destination-atop": [this._context.ONE_MINUS_DST_ALPHA, this._context.SRC_ALPHA],
			"experimental-destination-in": [this._context.ZERO, this._context.SRC_ALPHA],
			"destination-out": [this._context.ZERO, this._context.ONE_MINUS_SRC_ALPHA],
			"destination-over": [this._context.ONE_MINUS_DST_ALPHA, this._context.ONE],
			"lighter": [this._context.ONE, this._context.ONE],
			"copy": [this._context.ONE, this._context.ZERO],
			"xor": [this._context.ONE_MINUS_DST_ALPHA, this._context.ONE_MINUS_SRC_ALPHA]
		};

		const compositeOperation = this._compositeOps[this._currentCompositeOperation];
		this._context.blendFunc(compositeOperation[0], compositeOperation[1]);
	}

	private _makeBuffer(data: any): WebGLBuffer {
		const buffer = this._context.createBuffer();
		if (!buffer) {
			throw new Error("WebGLSharedObject#_makeBuffer(): could not create WebGLBuffer");
		}

		this._context.bindBuffer(this._context.ARRAY_BUFFER, buffer);
		this._context.bufferData(this._context.ARRAY_BUFFER, data, this._context.DYNAMIC_DRAW);
		return buffer;
	}

	private _transformVertex(x: number, y: number, w: number, h: number, transformer: AffineTransformer): number[] {
		const renderTaget = this.getCurrentRenderTarget();
		const cw =  2.0 / renderTaget.width;
		const ch = -2.0 / renderTaget.height;

		const m = transformer.matrix;

		const a = cw * w * m[0];
		const b = ch * w * m[1];
		const c = cw * h * m[2];
		const d = ch * h * m[3];
		const e = cw * (x * m[0] + y * m[2] + m[4]) - 1.0;
		const f = ch * (x * m[1] + y * m[3] + m[5]) + 1.0;

		return [
			e, f, a + e, b + f, a + c + e, b + d + f,
			e, f, a + c + e, b + d + f, c + e, d + f
		];
	}

	private _register(vertex: number[], texCoord: number[]): void {
		const offset = this._numSprites * 6;
		++this._numSprites;
		for (let i = 0; i < 6; ++i) {
			this._verticesCache[4 * (i + offset) + 0] = vertex[2 * i + 0];
			this._verticesCache[4 * (i + offset) + 1] = vertex[2 * i + 1];
			this._verticesCache[4 * (i + offset) + 2] = texCoord[2 * i + 0];
			this._verticesCache[4 * (i + offset) + 3] = texCoord[2 * i + 1];
		}
	}

	private _commit(): void {
		if (this._numSprites > 0) {
			this._context.bindBuffer(this._context.ARRAY_BUFFER, this._vertices);
			this._context.bufferSubData(this._context.ARRAY_BUFFER, 0,
				this._verticesCache.subarray(0, this._numSprites * 24));

			this._context.drawArrays(this._context.TRIANGLES, 0, this._numSprites * 6);
			this._numSprites = 0;
		}
	}
}
