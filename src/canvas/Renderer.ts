import type * as pdi from "@akashic/pdi-types";

export interface Renderer extends pdi.Renderer {
	/**
	 * pdi-browser 独自のメソッド。
	 * CanvasRender の場合は `CanvasRenderingContext2D` 、WebGL の場合は `WebGLRenderingContext` を返す。
	 */
	getContext(): unknown;

	/**
	 * pdi-browser 独自のメソッド。
	 * レンダラに蓄積された描画バッファを即時実行する。通常ゲーム開発者がこのメソッドを利用する必要はない。
	 */
	flush(): void;
}
