import * as pdi from "@akashic/pdi-types";

export abstract class Surface implements pdi.Surface {
	width: number;
	height: number;
	_drawable: any;
	_destroyed: boolean;

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
		this._destroyed = false;
	}

	abstract renderer(): pdi.Renderer;

	abstract isPlaying(): boolean;

	destroy(): void {
		this._destroyed = true;
	}

	destroyed(): boolean {
		return this._destroyed;
	}
}
