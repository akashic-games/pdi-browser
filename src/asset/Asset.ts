import type * as pdi from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";
import { XHRLoader } from "../utils/XHRLoader";

export abstract class Asset implements pdi.Asset {
	abstract type: string;
	id: string;
	path: string;
	originalPath: string;
	onDestroyed: Trigger<pdi.Asset> = new Trigger();

	_withCredentials: boolean | RegExp = false;

	constructor(id: string, path: string) {
		this.id = id;
		this.originalPath = path;
		this.path = this._assetPathFilter(path);
	}

	destroy(): void {
		this.onDestroyed.fire(this);
		this.id = undefined!;
		this.originalPath = undefined!;
		this.path = undefined!;
		this.onDestroyed.destroy();
		this.onDestroyed = undefined!;
	}

	destroyed(): boolean {
		return this.id === undefined;
	}

	inUse(): boolean {
		return false;
	}

	abstract _load(loader: pdi.AssetLoadHandler): void;

	_assetPathFilter(path: string): string {
		// 拡張子の補完・読み替えが必要なassetはこれをオーバーライドすればよい。(対応形式が限定されるaudioなどの場合)
		return path;
	}

	_createLoader(): XHRLoader {
		const withCredentials = this._withCredentials instanceof RegExp
			? this._withCredentials.test(this.path)
			: this._withCredentials;
		return new XHRLoader({ withCredentials });
	}
}
