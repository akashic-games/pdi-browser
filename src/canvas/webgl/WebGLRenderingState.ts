import type * as pdi from "@akashic/pdi-types";
import { AffineTransformer } from "../AffineTransformer";

export class WebGLRenderingState {
	globalAlpha: number;
	globalCompositeOperation: pdi.CompositeOperationString;
	transformer: AffineTransformer;
	shaderProgram: pdi.ShaderProgram;

	constructor(rhs?: WebGLRenderingState) {
		if (rhs) {
			this.globalAlpha = rhs.globalAlpha;
			this.globalCompositeOperation = rhs.globalCompositeOperation;
			this.transformer = new AffineTransformer(rhs.transformer);
			this.shaderProgram = rhs.shaderProgram;
		} else {
			this.globalAlpha = 1.0;
			this.globalCompositeOperation = "source-over";
			this.transformer = new AffineTransformer();
			this.shaderProgram = null;
		}
	}

	copyFrom(rhs: WebGLRenderingState): WebGLRenderingState {
		this.globalAlpha = rhs.globalAlpha;
		this.globalCompositeOperation = rhs.globalCompositeOperation;
		this.transformer.copyFrom(rhs.transformer);
		this.shaderProgram = rhs.shaderProgram;
		return this;
	}
}
