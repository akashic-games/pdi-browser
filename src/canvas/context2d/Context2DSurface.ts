import * as g from "@akashic/akashic-engine";
import { Context2DRenderer } from "./Context2DRenderer";
import { CanvasSurface } from "../CanvasSurface";

export class Context2DSurface extends CanvasSurface {
	protected _context: CanvasRenderingContext2D;

	context(): CanvasRenderingContext2D {
		if (!this._context) {
			this._context = this.canvas.getContext("2d");
		}
		return this._context;
	}

	renderer(): g.Renderer {
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
