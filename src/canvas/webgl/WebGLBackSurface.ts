import { WebGLBackSurfaceRenderer } from "./WebGLBackSurfaceRenderer";
import { WebGLPrimarySurface } from "./WebGLPrimarySurface";
import { WebGLSurfaceTexture } from "./WebGLSharedObject";

export class WebGLBackSurface extends WebGLPrimarySurface {
	_drawable: WebGLSurfaceTexture;
	protected _renderer: WebGLBackSurfaceRenderer;

	// override
	renderer(): WebGLBackSurfaceRenderer {
		if (! this._renderer) {
			this._renderer = new WebGLBackSurfaceRenderer(this, this._shared);
		}
		return this._renderer;
	}

	destroy(): void {
		if (this._renderer) {
			this._renderer.destroy();
		}
		this._renderer = undefined;
		this._drawable = undefined;
		super.destroy();
	}
}
