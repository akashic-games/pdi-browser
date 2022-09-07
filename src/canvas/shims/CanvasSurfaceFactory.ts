import { Context2DSurface } from "../context2d/Context2DSurface";
import { CanvasDisposer } from "./CanvasDisposer";

export class SurfaceFactory {
	_disposer: CanvasDisposer = new CanvasDisposer();

	createPrimarySurface(width: number, height: number, _rendererCandidates?: string[]): Context2DSurface {
		return new Context2DSurface(width, height);
	}

	createBackSurface(width: number, height: number, _rendererCandidates?: string[]): Context2DSurface {
		const surface = new Context2DSurface(width, height);
		this._disposer.register(surface, surface.getHTMLElement() as HTMLCanvasElement);
		return surface;
	}
}
