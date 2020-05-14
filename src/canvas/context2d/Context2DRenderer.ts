import * as g from "@akashic/akashic-engine";
import { CanvasSurfaceContext } from "./CanvasSurfaceContext";
import { Context2DSurface } from "./Context2DSurface";

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

export class Context2DRenderer implements g.RendererLike {
	private surface: Context2DSurface;
	private context: CanvasSurfaceContext;
	private canvasRenderingContext2D: CanvasRenderingContext2D;

	constructor(surface: Context2DSurface) {
		this.surface = surface;
		this.context = surface.context();
		this.canvasRenderingContext2D = this.context.getCanvasRenderingContext2D();
	}

	begin(): void {
		this.canvasRenderingContext2D.save();
		this.context.save();
	}

	end(): void {
		this.canvasRenderingContext2D.restore();
		this.context.restore();
	}

	clear(): void {
		this.context.clearRect(0, 0, this.surface.width, this.surface.height);
	}

	drawImage(
		surface: Context2DSurface,
		offsetX: number,
		offsetY: number,
		width: number,
		height: number,
		canvasOffsetX: number,
		canvasOffsetY: number
	): void {
		this.context.drawImage(surface._drawable, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, width, height);
	}

	drawSprites(
		surface: Context2DSurface,
		offsetX: number[],
		offsetY: number[],
		width: number[],
		height: number[],
		canvasOffsetX: number[],
		canvasOffsetY: number[],
		count: number
	): void {
		for (var i = 0; i < count; ++i) {
			this.drawImage(surface, offsetX[i], offsetY[i], width[i], height[i], canvasOffsetX[i], canvasOffsetY[i]);
		}
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

	setShaderProgram(_shaderProgram: g.ShaderProgram | null): void {
		throw new Error("Context2DRenderer#setShaderProgram() is not implemented");
	}

	isSupportedShaderProgram(): boolean {
		return false;
	}

	_getImageData(sx: number, sy: number, sw: number, sh: number): g.ImageData {
		return this.context.getImageData(sx, sy, sw, sh);
	}

	_putImageData(
		imageData: ImageData,
		dx: number,
		dy: number,
		dirtyX: number = 0,
		dirtyY: number = 0,
		dirtyWidth: number = imageData.width,
		dirtyHeight: number = imageData.height
	): void {
		this.context.putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
	}
}
