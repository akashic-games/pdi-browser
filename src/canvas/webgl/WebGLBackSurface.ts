import { WebGLBackSurfaceRenderer } from "./WebGLBackSurfaceRenderer";
import { WebGLSurfaceTexture } from "./WebGLSharedObject";
import { WebGLPrimarySurface } from "./WebGLPrimarySurface";

export class WebGLBackSurface extends WebGLPrimarySurface {
	_drawable: WebGLSurfaceTexture | null = null;
	protected _renderer: WebGLBackSurfaceRenderer | null = null;

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
		this._renderer = null;
		this._drawable = null;
		super.destroy();
	}
}
