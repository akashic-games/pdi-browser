export class CanvasDisposer {
	private _idCounter: number = 0;
	private _canvasMap: {[id: string]: HTMLCanvasElement} = {};
	private _registry: FinalizationRegistry<string>;

	constructor() {
		// FIXME: PhantomJS の利用停止後に削除
		if (typeof FinalizationRegistry === "undefined") {
			return;
		}
		this._registry = new FinalizationRegistry(this._dispose.bind(this));
	}

	register(target: any, canvas: HTMLCanvasElement): void {
		const id = `${this._idCounter++}`;
		this._canvasMap[id] = canvas;
		this._registry.register(target, id);
	}

	private _dispose(id: string): void {
		const canvas = this._canvasMap[id];
		if (!canvas) return;

		canvas.width = 1;
		canvas.height = 1;
		delete this._canvasMap[id];
	}
}
