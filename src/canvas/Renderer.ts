import type * as pdi from "@akashic/pdi-types";

export interface Renderer extends pdi.Renderer {
	/**
	 * pdi-browser 独自のメソッド。
	 * CanvasRender の場合は `CanvasRenderingContext2D` 、WebGL の場合は `WebGLRenderingContext` を返す。
	 */
	getContext(): any;
}
