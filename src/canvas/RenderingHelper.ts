import type { RendererCandidate } from "@akashic/pdi-types";

interface WebGLRendererCandidate extends RendererCandidate {
	type: "webgl";
	options?: {
		enableDepth: boolean;
	};
}

export module RenderingHelper {
	export function toPowerOfTwo(x: number): number {
		if ((x & (x - 1)) !== 0) {
			let y = 1;
			while (y < x) {
				y *= 2;
			}
			return y;
		}
		return x;
	}

	export function clamp(x: number): number {
		return Math.min(Math.max(x, 0.0), 1.0);
	}

	export function usedWebGL(rendererCandidates?: (string | RendererCandidate)[]): false | Required<WebGLRendererCandidate> {
		if (!rendererCandidates || rendererCandidates.length === 0) {
			return false;
		}

		const candidate = rendererCandidates[0];

		if (typeof candidate === "string") {
			if (candidate === "webgl") {
				return {
					type: "webgl",
					options: {
						enableDepth: false
					}
				};
			}
		} else if (candidate.type === "webgl") {
			const webglRendererCandidate = candidate as WebGLRendererCandidate;
			return {
				type: "webgl",
				options: {
					enableDepth: !!webglRendererCandidate.options?.enableDepth
				}
			};
		}

		return false;
	}
}
