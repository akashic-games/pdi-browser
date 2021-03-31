import { WebGLBackSurface } from "./WebGLBackSurface";
import { WebGLRenderer } from "./WebGLRenderer";
import { WebGLRenderingState } from "./WebGLRenderingState";
import { WebGLSharedObject } from "./WebGLSharedObject";

export class WebGLBackSurfaceRenderer extends WebGLRenderer {

	constructor(surface: WebGLBackSurface, shared: WebGLSharedObject) {
		super(shared, shared.createRenderTarget(surface.width, surface.height));

		surface._drawable = {
			texture: this._renderTarget.texture,
			textureOffsetX: 0,
			textureOffsetY: 0,
			textureWidth: surface.width,
			textureHeight: surface.height
		};
	}

	begin(): void {
		super.begin();

		// Canvas座標系とWebGL座標系の相互変換
		// height は描画対象の高さを与える
		this.save();
		const rs = new WebGLRenderingState(this.currentState());
		const matrix = rs.transformer.matrix;
		matrix[1] *= -1;
		matrix[3] *= -1;
		matrix[5] = -matrix[5] + this._renderTarget.height;

		this.currentState().copyFrom(rs);
		this._shared.pushRenderTarget(this._renderTarget);
	}

	end(): void {
		this.restore();
		this._shared.popRenderTarget();
		super.end();
	}
}
