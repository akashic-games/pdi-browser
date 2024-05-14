import type { RendererCandidate } from "@akashic/pdi-types";
import type { CanvasSurface } from "../CanvasSurface";
import { Context2DSurface } from "../context2d/Context2DSurface";
import { RenderingHelper } from "../RenderingHelper";
import { WebGLSharedObject } from "../webgl/WebGLSharedObject";
import { CanvasDisposer } from "./CanvasDisposer";

export class SurfaceFactory {
	_shared: WebGLSharedObject | undefined;
	_disposer: CanvasDisposer = new CanvasDisposer();

	createPrimarySurface(width: number, height: number, rendererCandidates?: (string | RendererCandidate)[]): CanvasSurface {
		const usedWebGL = RenderingHelper.usedWebGL(rendererCandidates);
		if (usedWebGL) {
			if (!this._shared) {
				this._shared = new WebGLSharedObject({ width, height, enableDepth: usedWebGL.options.enableDepth });
			}
			return this._shared.getPrimarySurface();
		} else {
			return new Context2DSurface(width, height);
		}
	}

	createBackSurface(width: number, height: number, rendererCandidates?: (string | RendererCandidate)[]): CanvasSurface {
		const surface = RenderingHelper.usedWebGL(rendererCandidates)
			? this._shared!.createBackSurface(width, height)
			: new Context2DSurface(width, height);
		this._disposer.register(surface, surface.getHTMLElement() as HTMLCanvasElement);
		return surface;
	}
}
