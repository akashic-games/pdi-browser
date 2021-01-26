import * as pdi from "@akashic/pdi-types";
import { RenderingHelper } from "../RenderingHelper";
import { WebGLSharedObject, WebGLSurfaceTexture } from "./WebGLSharedObject";
import { WebGLTextureMap } from "./WebGLTextureMap";

export class WebGLTextureAtlas {
	// 確保するテクスチャのサイズ (実際のゲームに合わせてチューニングする必要がある)
	private static TEXTURE_SIZE: number = 1024;

	// 確保するテクスチャの数 (実際のゲームに合わせてチューニングする必要がある)
	private static TEXTURE_COUNT: number = 16;

	// 空テクスチャ
	emptyTexturePixels: Uint8Array;

	private _maps: WebGLTextureMap[];
	private _insertPos: number;

	constructor() {
		this._maps = [];
		this._insertPos = 0;
		this.emptyTexturePixels = new Uint8Array(WebGLTextureAtlas.TEXTURE_SIZE * WebGLTextureAtlas.TEXTURE_SIZE * 4);
	}

	/**
	 * 新しいシーンに遷移したとき呼ぶ。
	 */
	clear(): void {
		for (var i = 0; i < this._maps.length; ++i) {
			this._maps[i].dispose();
		}
	}

	/**
	 * 現在のテクスチャ領域使用効率を表示する。
	 */
	showOccupancy(): void {
		for (var i = 0; i < this._maps.length; ++i) {
			console.log("occupancy[" + i + "]: " + this._maps[i].occupancy());
		}
	}

	/**
	 * pdi.Surface 用にテクスチャを作成する。
	 */
	makeTextureForSurface(shared: WebGLSharedObject, surface: pdi.Surface): void {
		var image = surface._drawable;
		if (!image || image.texture) {
			return;
		}

		var width: number = image.width;
		var height: number = image.height;

		// サイズが大きいので単体のテクスチャとして扱う
		if ((width >= WebGLTextureAtlas.TEXTURE_SIZE) || (height >= WebGLTextureAtlas.TEXTURE_SIZE)) {

			// 画像サイズが 2^n でないときはリサイズする
			var w = RenderingHelper.toPowerOfTwo(image.width);
			var h = RenderingHelper.toPowerOfTwo(image.height);
			if ((w !== image.width) || (h !== image.height)) {
				var canvas = document.createElement("canvas");
				canvas.width = w;
				canvas.height = h;

				var canvasContext = canvas.getContext("2d")!;
				canvasContext.globalCompositeOperation = "copy";
				canvasContext.drawImage(image, 0, 0);

				image = canvasContext.getImageData(0, 0, w, h);
			}

			surface._drawable.texture = shared.makeTexture(image);
			surface._drawable.textureOffsetX = 0;
			surface._drawable.textureOffsetY = 0;
			surface._drawable.textureWidth   = w;
			surface._drawable.textureHeight  = h;
			return;
		}

		this._assign(shared, surface, this._maps);
	}

	/**
	 * 適当なテクスチャアトラスにサーフィスを割り当てる
	 */
	private _assign(shared: WebGLSharedObject, surface: pdi.Surface, maps: WebGLTextureMap[]): void {
		// テクスチャアトラスに割り当てる
		var map: WebGLTextureMap | null;
		for (var i = 0; i < maps.length; ++i) {
			map = maps[(i + this._insertPos) % maps.length].insert(surface);
			if (map) {
				// 登録する
				this._register(shared, map, surface._drawable);
				this._insertPos = i;
				return;
			}
		}
		map = null;

		// テクスチャ容量があふれるので古いやつを消して再利用する
		if (maps.length >= WebGLTextureAtlas.TEXTURE_COUNT) {
			map = maps.shift()!; // maps.lengthは1以上を期待できるので、Shift() は undefined を返さないと仮定する
			shared.disposeTexture(map.texture);
			map.dispose();
			shared.clearTexture(this.emptyTexturePixels, WebGLTextureAtlas.TEXTURE_SIZE, WebGLTextureAtlas.TEXTURE_SIZE, map.texture);
		}

		// 再利用できない場合は、新規生成する
		if (!map) {
			map = new WebGLTextureMap(
				shared.makeTextureRaw(
					WebGLTextureAtlas.TEXTURE_SIZE,
					WebGLTextureAtlas.TEXTURE_SIZE),
				0,
				0,
				WebGLTextureAtlas.TEXTURE_SIZE,
				WebGLTextureAtlas.TEXTURE_SIZE);
		}

		// 登録する
		maps.push(map);
		map = map.insert(surface)!; // TODO: _assign() を呼び出し元に統合して `!` の妥当性を メソッドに完結して評価できるようにする
		this._register(shared, map, surface._drawable);
	}

	/**
	 * テクスチャを登録する。
	 */
	private _register(shared: WebGLSharedObject, map: WebGLTextureMap, image: WebGLSurfaceTexture): void {
		image.texture = map.texture;
		image.textureOffsetX = map.offsetX;
		image.textureOffsetY = map.offsetY;
		image.textureWidth = WebGLTextureAtlas.TEXTURE_SIZE;
		image.textureHeight = WebGLTextureAtlas.TEXTURE_SIZE;

		shared.assignTexture(image, map.offsetX, map.offsetY, map.texture);
	}
}
