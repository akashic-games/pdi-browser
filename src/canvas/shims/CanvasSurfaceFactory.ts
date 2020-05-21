import { Context2DSurface } from "../context2d/Context2DSurface";

export class SurfaceFactory {
	createPrimarySurface(width: number, height: number, _rendererCandidates?: string[]): Context2DSurface {
		return new Context2DSurface(width, height);
	}

	createBackSurface(width: number, height: number, _rendererCandidates?: string[]): Context2DSurface {
		return new Context2DSurface(width, height);
	}
}
