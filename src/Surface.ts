import * as pdi from "@akashic/pdi-types";

export abstract class Surface implements pdi.Surface {
	width: number;
	height: number;
	_drawable: any;
	_destroyed: boolean = null!;

	constructor(width: number, height: number, drawable: any) {
		this.width = width;
		this.height = height;
		this._drawable = drawable;
		if (width % 1 !== 0 || height % 1 !== 0) {
			throw new Error("Surface#constructor: width and height must be integers");
		}

		this.width = width;
		this.height = height;
		this._drawable = drawable;
		// this._destroyedは破棄時に一度だけ代入する特殊なフィールドなため、コンストラクタで初期値を代入しない
	}

	abstract renderer(): pdi.Renderer;

	abstract isPlaying(): boolean;

	destroy(): void {
		this._destroyed = true;
	}

	destroyed(): boolean {
		// _destroyedはundefinedかtrueなため、常にbooleanが返すように!!演算子を用いる
		return !!this._destroyed;
	}
}
