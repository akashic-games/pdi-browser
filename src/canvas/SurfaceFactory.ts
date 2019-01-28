import * as g from "@akashic/akashic-engine";
import { Platform } from "../Platform";
import { CanvasSurface } from "./CanvasSurface";

export module SurfaceFactory {
	export function createPrimarySurface(width: number, height: number, rendererCandidates?: string[]): CanvasSurface {
		return new CanvasSurface(width, height);
	}

	export function createBackSurface(width: number, height: number, platform: Platform, rendererCandidates?: string[]): g.Surface {
		return new CanvasSurface(width, height);
	}
}
