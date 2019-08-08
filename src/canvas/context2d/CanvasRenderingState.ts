import { AffineTransformer } from "../AffineTransformer";

export class CanvasRenderingState {
	fillStyle: string | CanvasGradient | CanvasPattern;
	font: string;
	textAlign: string;
	textBaseline: string;
	lineJoin: string;
	lineWidth: number;
	strokeStyle: string | CanvasGradient | CanvasPattern;
	globalAlpha: number;
	globalCompositeOperation: string;
	transformer: AffineTransformer;

	constructor(crs?: CanvasRenderingState) {
		if (crs) {
			this.fillStyle = crs.fillStyle;
			this.font = crs.font;
			this.textAlign = crs.textAlign;
			this.textBaseline = crs.textBaseline;
			this.lineJoin = crs.lineJoin;
			this.lineWidth = crs.lineWidth;
			this.strokeStyle = crs.strokeStyle;
			this.globalAlpha = crs.globalAlpha;
			this.globalCompositeOperation = crs.globalCompositeOperation;
			this.transformer = new AffineTransformer(crs.transformer);
		} else {
			this.fillStyle = "#000000";
			this.font = "10px sans-serif";
			this.textAlign = "start";
			this.textBaseline = "alphabetic";
			this.lineJoin = "miter";
			this.lineWidth = 1.0;
			this.strokeStyle = "#000000";
			this.globalAlpha = 1.0;
			this.globalCompositeOperation = "source-over";
			this.transformer = new AffineTransformer();
		}
	}
}
