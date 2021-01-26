import { CanvasSurface } from "../CanvasSurface";
import { RenderingHelper } from "../RenderingHelper";
import { Context2DSurface } from "../context2d/Context2DSurface";
import { WebGLSharedObject } from "../webgl/WebGLSharedObject";

export class SurfaceFactory {
	_shared: WebGLSharedObject | null = null;

	createPrimarySurface(width: number, height: number, rendererCandidates?: string[]): CanvasSurface {
		if (RenderingHelper.usedWebGL(rendererCandidates)) {
			if (!this._shared) {
				this._shared = new WebGLSharedObject(width, height);
			}
			return this._shared.getPrimarySurface();
		} else {
			return new Context2DSurface(width, height);
		}
	}

	/**
	 * このメソッドが呼び出される前に、createPrimarySurface() が呼ばれている必要がある
	 */
	createBackSurface(width: number, height: number, rendererCandidates?: string[]): CanvasSurface {
		if (RenderingHelper.usedWebGL(rendererCandidates)) {
			return this._shared!.createBackSurface(width, height);
		} else {
			return new Context2DSurface(width, height);
		}
	}
}
