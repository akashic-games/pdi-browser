import * as g from "@akashic/akashic-engine";
import { CanvasSurface } from "./CanvasSurface";
import { RenderingHelper } from "./RenderingHelper";

export class Context2DRenderer extends g.Renderer {
	private surface: CanvasSurface;
	private context: CanvasRenderingContext2D;

	constructor(surface: CanvasSurface, context: CanvasRenderingContext2D) {
		super();
		this.surface = surface;
		this.context = context;
	}

	clear(): void {
		this.context.clearRect(0, 0, this.surface.width, this.surface.height);
	}

	drawImage(surface: g.Surface, offsetX: number, offsetY: number,
	          width: number, height: number, canvasOffsetX: number, canvasOffsetY: number): void {
		this.context.drawImage(surface._drawable, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, width, height);
	}

	drawSprites(surface: g.Surface,
	            offsetX: number[], offsetY: number[],
	            width: number[], height: number[],
	            canvasOffsetX: number[], canvasOffsetY: number[],
	            count: number): void {
		for (var i = 0; i < count; ++i) {
			this.drawImage(surface, offsetX[i], offsetY[i], width[i], height[i], canvasOffsetX[i], canvasOffsetY[i]);
		}
	}

	drawSystemText(text: string, x: number, y: number, maxWidth: number, fontSize: number,
	               textAlign: g.TextAlign, textBaseline: g.TextBaseline, textColor: string, fontFamily: g.FontFamily,
	               strokeWidth: number, strokeColor: string, strokeOnly: boolean): void {
		RenderingHelper.drawSystemTextByContext2D(
			this.context, text, x, y, maxWidth, fontSize, textAlign, textBaseline, textColor, fontFamily,
			strokeWidth, strokeColor, strokeOnly
		);
	}

	translate(x: number, y: number): void {
		this.context.translate(x, y);
	}

	transform(matrix: number[]): void {
		this.context.transform.apply(this.context, matrix as [number, number, number, number, number, number]);
	}

	opacity(opacity: number): void {
		// Note:globalAlphaの初期値が1であることは仕様上保証されているため、常に掛け合わせる
		this.context.globalAlpha *= opacity;
	}

	save(): void {
		this.context.save();
	}

	restore(): void {
		this.context.restore();
	}

	fillRect(x: number, y: number, width: number, height: number, cssColor: string): void {
		var _fillStyle = this.context.fillStyle;
		this.context.fillStyle = cssColor;
		this.context.fillRect(x, y, width, height);
		this.context.fillStyle = _fillStyle;
	}

	setCompositeOperation(operation: g.CompositeOperation): void {
		this.context.globalCompositeOperation = RenderingHelper.toTextFromCompositeOperation(operation);
	}

	setOpacity(opacity: number): void {
		this.context.globalAlpha = opacity;
	}

	setTransform(matrix: number[]): void {
		(this.context.setTransform as 
			(a: number, b: number, c: number, d: number, e: number, f: number) => void)
			.apply(this.context, matrix as [number, number, number, number, number, number]);
	}
}
