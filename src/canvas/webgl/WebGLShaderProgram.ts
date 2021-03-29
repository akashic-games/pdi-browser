import * as pdi from "@akashic/pdi-types";

interface UniformCache {
	name: string;
	update: (loc: WebGLUniformLocation, v: number | Int32Array | Float32Array) => void;
	beforeValue: any;
	isArray: boolean;
	loc: WebGLUniformLocation;
}

type UniformSetter = (loc: WebGLUniformLocation, v: number | Int32Array | Float32Array) => void;

export class WebGLShaderProgram {
	program: WebGLProgram;

	private static _DEFAULT_VERTEX_SHADER: string =
	"#version 100\n" +
		"precision mediump float;\n" +
		"attribute vec4 aVertex;\n" +
		"varying vec2 vTexCoord;\n" +
		"varying vec4 vColor;\n" +
		"uniform vec4 uColor;\n" +
		"uniform float uAlpha;\n" +
		"void main() {" +
		"    gl_Position = vec4(aVertex.xy, 0.0, 1.0);" +
		"    vTexCoord = aVertex.zw;" +
		"    vColor = uColor * uAlpha;" +
		"}";

	private static _DEFAULT_FRAGMENT_SHADER: string =
	"#version 100\n" +
		"precision mediump float;\n" +
		"varying vec2 vTexCoord;\n" +
		"varying vec4 vColor;\n" +
		"uniform sampler2D uSampler;\n" +
		"void main() {" +
		"    gl_FragColor = texture2D(uSampler, vTexCoord) * vColor;" +
		"}";

	private _context: WebGLRenderingContext;
	private _aVertex: number;
	private _uColor: WebGLUniformLocation;
	private _uAlpha: WebGLUniformLocation;
	private _uSampler: WebGLUniformLocation;

	private _uniforms: {[key: string]: pdi.ShaderUniform};
	private _uniformCaches: UniformCache[];
	private _uniformSetterTable: { [type: string]: UniformSetter };

	private static _makeShader(gl: WebGLRenderingContext, typ: number, src: string): WebGLShader {
		var shader = gl.createShader(typ);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			var msg = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
			throw new Error(msg);
		}
		return shader;
	}

	private static _makeShaderProgram(gl: WebGLRenderingContext, vSrc: string, fSrc: string): WebGLProgram {
		var program = gl.createProgram();

		var vShader = WebGLShaderProgram._makeShader(gl, gl.VERTEX_SHADER, vSrc);
		gl.attachShader(program, vShader);
		gl.deleteShader(vShader);

		var fShader = WebGLShaderProgram._makeShader(gl, gl.FRAGMENT_SHADER, fSrc);
		gl.attachShader(program, fShader);
		gl.deleteShader(fShader);

		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			var msg = gl.getProgramInfoLog(program);
			gl.deleteProgram(program);
			throw new Error(msg);
		}

		return program;
	}

	constructor(context: WebGLRenderingContext, fSrc?: string, uniforms?: {[key: string]: pdi.ShaderUniform}) {
		var vSrc = WebGLShaderProgram._DEFAULT_VERTEX_SHADER;
		var fSrc = fSrc || WebGLShaderProgram._DEFAULT_FRAGMENT_SHADER;

		const program = WebGLShaderProgram._makeShaderProgram(context, vSrc, fSrc);

		this.program = program;
		this._context = context;
		this._aVertex = context.getAttribLocation(this.program, "aVertex");
		this._uColor = context.getUniformLocation(this.program, "uColor");
		this._uAlpha = context.getUniformLocation(this.program, "uAlpha");
		this._uSampler = context.getUniformLocation(this.program, "uSampler");

		this._uniforms = uniforms;
		this._uniformCaches = [];
		this._uniformSetterTable = {
			"float": this._uniform1f.bind(this) as UniformSetter,
			"int": this._uniform1i.bind(this) as UniformSetter,
			"float_v": this._uniform1fv.bind(this) as UniformSetter,
			"int_v": this._uniform1iv.bind(this) as UniformSetter,
			"vec2": this._uniform2fv.bind(this) as UniformSetter,
			"vec3": this._uniform3fv.bind(this) as UniformSetter,
			"vec4": this._uniform4fv.bind(this) as UniformSetter,
			"ivec2": this._uniform2iv.bind(this) as UniformSetter,
			"ivec3": this._uniform3iv.bind(this) as UniformSetter,
			"ivec4": this._uniform4iv.bind(this) as UniformSetter,
			"mat2": this._uniformMatrix2fv.bind(this) as UniformSetter,
			"mat3": this._uniformMatrix3fv.bind(this) as UniformSetter,
			"mat4": this._uniformMatrix4fv.bind(this) as UniformSetter
		};
	}

	/**
	 * シェーダの attribute 変数 aVertex にバッファを登録する。
	 * use()/unuse() 間のみで効果がある。
	 */
	set_aVertex(buffer: WebGLBuffer): void {
		this._context.bindBuffer(this._context.ARRAY_BUFFER, buffer);
		this._context.enableVertexAttribArray(this._aVertex);
		this._context.vertexAttribPointer(this._aVertex, 4, this._context.FLOAT, false, 0, 0);
	}

	/**
	 * シェーダの uniform 変数 uColor に値を設定する。
	 * use()/unuse() 間のみで効果がある。
	 */
	set_uColor(rgba: number[]): void {
		this._context.uniform4f(this._uColor, rgba[0], rgba[1], rgba[2], rgba[3]);
	}

	/**
	 * シェーダの uniform 変数 uAlpha に値を設定する。
	 * use()/unuse() 間のみで効果がある。
	 */
	set_uAlpha(alpha: number): void {
		this._context.uniform1f(this._uAlpha, alpha);
	}

	/**
	 * シェーダの uniform 変数 uSampler にテクスチャステージ番号を設定する。
	 * use()/unuse() 間のみで効果がある。
	 */
	set_uSampler(value: number): void {
		this._context.uniform1i(this._uSampler, value);
	}

	/**
	 * ユーザ定義された uniform 値を更新する。
	 * use()/unuse() 間のみで効果がある。
	 */
	updateUniforms(): void {
		for (let i = 0; i < this._uniformCaches.length; ++i) {
			const cache = this._uniformCaches[i];
			const value = this._uniforms[cache.name].value;
			if (!cache.isArray && value === cache.beforeValue)
				continue;
			cache.update(cache.loc, value);
			cache.beforeValue = value;
		}
	}

	/**
	 * ユーザ定義されたシェーダの uniform 変数を初期化する。
	 */
	initializeUniforms(): void {
		let uniformCaches: UniformCache[] = [];
		const uniforms = this._uniforms;

		if (uniforms != null) {
			Object.keys(uniforms).forEach(k => {
				let type = uniforms[k].type;
				const isArray = !(typeof uniforms[k].value === "number");
				// typeがfloatまたはintで、valueが配列であれば配列としてuniform値を転送する。
				if (isArray && (type === "int" || type === "float")) {
					type += "_v";
				}
				const update = this._uniformSetterTable[type];
				if (!update) {
					throw new Error(
						"WebGLShaderProgram#initializeUniforms: Uniform type '" + type + "' is not supported."
					);
				}

				uniformCaches.push({
					name: k,
					update,
					beforeValue: null,
					isArray,
					loc: this._context.getUniformLocation(this.program, k)
				});
			});
		}

		this._uniformCaches = uniformCaches;
	}

	/**
	 * シェーダを有効化する。
	 */
	use(): void {
		this._context.useProgram(this.program);
	}

	/**
	 * シェーダを無効化する。
	 */
	unuse(): void {
		this._context.useProgram(null);
	}

	destroy(): void {
		this._context.deleteProgram(this.program);
	}

	private _uniform1f(loc: WebGLUniformLocation, v: number): void {
		this._context.uniform1f(loc, v);
	}

	private _uniform1i(loc: WebGLUniformLocation, v: number): void {
		this._context.uniform1i(loc, v);
	}

	private _uniform1fv(loc: WebGLUniformLocation, v: Float32Array): void {
		this._context.uniform1fv(loc, v);
	}

	private _uniform1iv(loc: WebGLUniformLocation, v: Int32Array): void {
		this._context.uniform1iv(loc, v);
	}

	private _uniform2fv(loc: WebGLUniformLocation, v: Float32Array): void {
		this._context.uniform2fv(loc, v);
	}

	private _uniform3fv(loc: WebGLUniformLocation, v: Float32Array): void {
		this._context.uniform3fv(loc, v);
	}

	private _uniform4fv(loc: WebGLUniformLocation, v: Float32Array): void {
		this._context.uniform4fv(loc, v);
	}

	private _uniform2iv(loc: WebGLUniformLocation, v: Int32Array): void {
		this._context.uniform2iv(loc, v);
	}

	private _uniform3iv(loc: WebGLUniformLocation, v: Int32Array): void {
		this._context.uniform3iv(loc, v);
	}

	private _uniform4iv(loc: WebGLUniformLocation, v: Int32Array): void {
		this._context.uniform4iv(loc, v);
	}

	private _uniformMatrix2fv(loc: WebGLUniformLocation, v: Float32Array): void {
		this._context.uniformMatrix2fv(loc, false, v);
	}

	private _uniformMatrix3fv(loc: WebGLUniformLocation, v: Float32Array): void {
		this._context.uniformMatrix3fv(loc, false, v);
	}

	private _uniformMatrix4fv(loc: WebGLUniformLocation, v: Float32Array): void {
		this._context.uniformMatrix4fv(loc, false, v);
	}
}
