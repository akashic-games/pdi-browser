import * as g from "@akashic/akashic-engine";
import { Context2DSurface } from "./Context2DSurface";
import { CanvasSurfaceContext } from "./CanvasSurfaceContext";

const compositeOperationTable: { [P in g.CompositeOperationString]: string } = {
	"source-over": "source-over",
	"source-atop": "source-atop",
	"lighter": "lighter",
	"copy": "copy",
	"experimental-source-in": "source-in",
	"experimental-source-out": "source-out",
	"experimental-destination-atop": "destination-atop",
	"experimental-destination-in": "destination-in",
	"destination-out": "destination-out",
	"destination-over": "destination-over",
	"xor": "xor"
};

export class Context2DRenderer extends g.Renderer {
	private surface: Context2DSurface;
	private context: CanvasSurfaceContext;
	private canvasRenderingContext2D: CanvasRenderingContext2D;

	constructor(surface: Context2DSurface) {
		super();
		this.surface = surface;
		this.context = surface.context();
		this.canvasRenderingContext2D = this.context.getCanvasRenderingContext2D();
	}

	begin(): void {
		super.begin();
		this.canvasRenderingContext2D.save();
		this.context.save();
	}

	end(): void {
		this.canvasRenderingContext2D.restore();
		this.context.restore();
		super.end();
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
		var context = this.canvasRenderingContext2D;
		var fontFamilyValue: string;
		var textAlignValue: CanvasTextAlign;
		var textBaselineValue: CanvasTextBaseline;
		this.context.prerender();
		context.save();
		switch (fontFamily) {
			case g.FontFamily.Monospace:
				fontFamilyValue = "monospace";
				break;
			case g.FontFamily.Serif:
				fontFamilyValue = "serif";
				break;
			default:
				fontFamilyValue = "sans-serif";
				break;
		}
		context.font = fontSize + "px " + fontFamilyValue;
		switch (textAlign) {
			case g.TextAlign.Right:
				textAlignValue = "right";
				break;
			case g.TextAlign.Center:
				textAlignValue = "center";
				break;
			default:
				textAlignValue = "left";
				break;
		}
		context.textAlign = textAlignValue;
		switch (textBaseline) {
			case g.TextBaseline.Top:
				textBaselineValue = "top";
				break;
			case g.TextBaseline.Middle:
				textBaselineValue = "middle";
				break;
			case g.TextBaseline.Bottom:
				textBaselineValue = "bottom";
				break;
			default:
				textBaselineValue = "alphabetic";
				break;
		}
		context.textBaseline = textBaselineValue;
		context.lineJoin = "bevel";
		if (strokeWidth > 0) {
			context.lineWidth = strokeWidth;
			context.strokeStyle = strokeColor;
			if (typeof maxWidth === "undefined") {
				context.strokeText(text, x, y);
			} else {
				context.strokeText(text, x, y, maxWidth);
			}
		}
		if (!strokeOnly) {
			context.fillStyle = textColor;
			context.fillText(text, x, y, maxWidth);
		}
		context.restore();
	}

	translate(x: number, y: number): void {
		this.context.translate(x, y);
	}

	transform(matrix: number[]): void {
		this.context.transform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
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
		this.context.fillStyle = cssColor;
		this.context.fillRect(x, y, width, height);
	}

	setCompositeOperation(operation: g.CompositeOperationString): void {
		this.context.globalCompositeOperation = compositeOperationTable[operation] || "source-over";
	}

	setOpacity(opacity: number): void {
		this.context.globalAlpha = opacity;
	}

	setTransform(matrix: number[]): void {
		this.context.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
	}

	setShaderProgram(shaderProgram: g.ShaderProgram | null): void {
		throw g.ExceptionFactory.createAssertionError("Context2DRenderer#setShaderProgram() is not implemented");
	}

	isSupportedShaderProgram(): boolean {
		return false;
	}

	_getImageData(sx: number, sy: number, sw: number, sh: number): g.ImageData {
		return this.context.getImageData(sx, sy, sw, sh);
	}

	_putImageData(imageData: ImageData, dx: number, dy: number, dirtyX: number = 0, dirtyY: number = 0,
	              dirtyWidth: number = imageData.width, dirtyHeight: number = imageData.height): void {
		this.context.putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
	}
}
