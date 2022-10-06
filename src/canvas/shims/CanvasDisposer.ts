export class CanvasDisposer {
	private _idCounter: number = 0;
	private _canvasMap: {[id: string]: HTMLCanvasElement} = {};
	private _registry: FinalizationRegistry<string> | null; // FinalizationRegistry 非対応環境では null

	constructor() {
		this._registry = typeof FinalizationRegistry !== "undefined" ? new FinalizationRegistry(this._dispose.bind(this)) : null;
	}

	register(target: object, canvas: HTMLCanvasElement): void {
		if (!this._registry) return;
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
