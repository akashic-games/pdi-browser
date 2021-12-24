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

	export function usedWebGL(rendererCandidates?: string[]): boolean {
		let used = false;
		if (rendererCandidates && (0 < rendererCandidates.length)) {
			used = (rendererCandidates[0] === "webgl");
		}
		return used;
	}
}
