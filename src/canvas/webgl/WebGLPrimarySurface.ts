import { CanvasSurface } from "../CanvasSurface";
import { WebGLPrimarySurfaceRenderer } from "./WebGLPrimarySurfaceRenderer";
import type { WebGLRenderer } from "./WebGLRenderer";
import type { WebGLSharedObject } from "./WebGLSharedObject";

export class WebGLPrimarySurface extends CanvasSurface {
	protected _shared: WebGLSharedObject;
	protected _renderer: WebGLPrimarySurfaceRenderer | undefined;

	constructor(shared: WebGLSharedObject, width: number, height: number) {
		super(width, height);
		this.canvas.style.position = "absolute";
		this._shared = shared;
	}

	renderer(): WebGLRenderer {
		if (! this._renderer) {
			this._renderer = new WebGLPrimarySurfaceRenderer(
				this._shared,
				this._shared.getPrimaryRenderTarget(this.width, this.height)
			);
		}
		return this._renderer;
	}

	// override
	changePhysicalScale(xScale: number, yScale: number): void {
		const width = Math.ceil(this.width * xScale);
		const height = Math.ceil(this.height * yScale);
		this.canvas.width = width;
		this.canvas.height = height;
		this.renderer().changeViewportSize(width, height);
	}

	isPlaying(): boolean {
		return false;
	}
}
