import * as g from "@akashic/akashic-engine";
import { Context2DSurface } from "./Context2DSurface";
import { CanvasSurfaceContext } from "./CanvasSurfaceContext";

export class Context2DRenderer extends g.Renderer {
	private surface: Context2DSurface;
	private context: CanvasSurfaceContext;

	constructor(surface: Context2DSurface) {
		super();
		this.surface = surface;
		this.context = surface.context();
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
		var context = this.context;
		var fontFamilyValue: string;
		var textAlignValue: string;
		var textBaselineValue: string;
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
		this.context.transform(matrix);
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

	setCompositeOperation(operation: g.CompositeOperation): void {
		var operationText: string;
		switch (operation) {
		case g.CompositeOperation.SourceAtop:
			operationText = "source-atop";
			break;
		case g.CompositeOperation.Lighter:
			operationText = "lighter";
			break;
		case g.CompositeOperation.Copy:
			operationText = "copy";
			break;
		case g.CompositeOperation.ExperimentalSourceIn:
			operationText = "source-in";
			break;
		case g.CompositeOperation.ExperimentalSourceOut:
			operationText = "source-out";
			break;
		case g.CompositeOperation.ExperimentalDestinationAtop:
			operationText = "destination-atop";
			break;
		case g.CompositeOperation.ExperimentalDestinationIn:
			operationText = "destination-in";
			break;
		case g.CompositeOperation.DestinationOut:
			operationText = "destination-out";
			break;
		case g.CompositeOperation.DestinationOver:
			operationText = "destination-over";
			break;
		case g.CompositeOperation.Xor:
			operationText = "xor";
			break;
		default:
			operationText = "source-over";
			break;
		}
		this.context.globalCompositeOperation = operationText;
	}

	setOpacity(opacity: number): void {
		this.context.globalAlpha = opacity;
	}

	setTransform(matrix: number[]): void {
		this.context.setTransform(matrix);
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
