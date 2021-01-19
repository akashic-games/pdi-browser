import * as pdi from "@akashic/pdi-types";

export class WebGLTextureMap {
	// 各テクスチャを配置する際のマージンピクセル数
	// マージンを取らないと、隣接するテクスチャが滲んで描画される可能性がある。
	private static TEXTURE_MARGIN: number = 1;

	texture: WebGLTexture;
	offsetX: number;
	offsetY: number;
	private _width: number;
	private _height: number;
	private _left: WebGLTextureMap = null!;
	private _right: WebGLTextureMap = null!;
	private _surface: pdi.Surface = null!;

	constructor(texture: WebGLTexture, offsetX: number, offsetY: number, width: number, height: number) {
		this.texture = texture;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this._width = width;
		this._height = height;
	}

	dispose(): void {
		if (this._left) {
			this._left.dispose();
			this._left = null!;
		}
		if (this._right) {
			this._right.dispose();
			this._right = null!;
		}
		if (this._surface) {
			if (this._surface._drawable) {
				this._surface._drawable.texture = null;
			}
			this._surface = null!;
		}
	}

	capacity(): number {
		return this._width * this._height;
	}

	area(): number {
		if (!this._surface) {
			return 0;
		}

		var image = this._surface._drawable;
		var a = image.width * image.height;
		if (this._left) {
			a += this._left.area();
		}
		if (this._right) {
			a += this._right.area();
		}
		return a;
	}

	occupancy(): number {
		return this.area() / this.capacity();
	}

	insert(surface: pdi.Surface): WebGLTextureMap | null {
		var image = surface._drawable;

		// マージンを考慮した領域を確保
		var width = image.width + WebGLTextureMap.TEXTURE_MARGIN;
		var height = image.height + WebGLTextureMap.TEXTURE_MARGIN;

		// 再帰的にパッキング
		if (this._surface) {
			if (this._left) {
				var left = this._left.insert(surface);
				if (left) {
					return left;
				}
			}

			if (this._right) {
				var right = this._right.insert(surface);
				if (right) {
					return right;
				}
			}

			return null;
		}

		// 詰め込み不可能
		if ((this._width < width) || (this._height < height)) {
			return null;
		}

		var remainWidth = this._width - width;
		var remainHeight = this._height - height;

		if (remainWidth <= remainHeight) {
			this._left = new WebGLTextureMap(this.texture, this.offsetX + width, this.offsetY, remainWidth, height);
			this._right = new WebGLTextureMap(this.texture, this.offsetX, this.offsetY + height, this._width, remainHeight);
		} else {
			this._left = new WebGLTextureMap(this.texture, this.offsetX, this.offsetY + height, width, remainHeight);
			this._right = new WebGLTextureMap(this.texture, this.offsetX + width, this.offsetY, remainWidth, this._height);
		}

		this._surface = surface;

		return this;
	}
}
