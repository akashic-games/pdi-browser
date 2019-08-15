import { AffineTransformer } from "../AffineTransformer";

export class CanvasRenderingState {
	fillStyle: string | CanvasGradient | CanvasPattern;
	globalAlpha: number;
	globalCompositeOperation: string;
	transformer: AffineTransformer;

	constructor(crs?: CanvasRenderingState) {
		if (crs) {
			this.fillStyle = crs.fillStyle;
			this.globalAlpha = crs.globalAlpha;
			this.globalCompositeOperation = crs.globalCompositeOperation;
			this.transformer = new AffineTransformer(crs.transformer);
		} else {
			this.fillStyle = "#000000";
			this.globalAlpha = 1.0;
			this.globalCompositeOperation = "source-over";
			this.transformer = new AffineTransformer();
		}
	}
}
