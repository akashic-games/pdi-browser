import { WebGLSharedObject, RenderTarget } from "./WebGLSharedObject";
import { WebGLRenderer } from "./WebGLRenderer";

export class WebGLPrimarySurfaceRenderer extends WebGLRenderer {

	constructor(shared: WebGLSharedObject, renderTarget: RenderTarget) {
		super(shared, renderTarget);
		this._shared.pushRenderTarget(this._renderTarget);
	}

	begin(): void {
		super.begin();
		this._shared.begin();
	}
}
