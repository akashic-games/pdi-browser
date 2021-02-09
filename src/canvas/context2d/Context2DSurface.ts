import { CanvasSurface } from "../CanvasSurface";
import { CanvasSurfaceContext } from "./CanvasSurfaceContext";
import { Context2DRenderer } from "./Context2DRenderer";

export class Context2DSurface extends CanvasSurface {
	protected _renderer: Context2DRenderer = null!;
	protected _context: CanvasSurfaceContext = null!;

	context(): CanvasSurfaceContext {
		if (!this._context) {
			const context = this.canvas.getContext("2d");
			if (!context) {
				throw new Error("Context2DSurface#context: cannot get context 2d.");
			}
			this._context = new CanvasSurfaceContext(context);
		}
		return this._context;
	}

	renderer(): Context2DRenderer {
		if (!this._renderer) {
			this._renderer = new Context2DRenderer(this);
		}
		return this._renderer;
	}

	changePhysicalScale(xScale: number, yScale: number): void {
		this.canvas.width = this.width * xScale;
		this.canvas.height = this.height * yScale;
		this._context.scale(xScale, yScale);
	}

	isPlaying(): boolean {
		return false;
	}
}
