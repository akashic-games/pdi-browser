import * as g from "@akashic/akashic-engine";
import { AffineTransformer } from "../AffineTransformer";

export class WebGLRenderingState {
	globalAlpha: number;
	globalCompositeOperation: g.CompositeOperation;
	transformer: AffineTransformer;
	shaderProgram: g.ShaderProgram;

	constructor(rhs?: WebGLRenderingState) {
		if (rhs) {
			this.globalAlpha = rhs.globalAlpha;
			this.globalCompositeOperation = rhs.globalCompositeOperation;
			this.transformer = new AffineTransformer(rhs.transformer);
			this.shaderProgram = rhs.shaderProgram;
		} else {
			this.globalAlpha = 1.0;
			this.globalCompositeOperation = g.CompositeOperation.SourceOver;
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
