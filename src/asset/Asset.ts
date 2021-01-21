import * as pdi from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";

export abstract class Asset implements pdi.Asset {
	abstract type: string;
	id: string;
	path: string;
	originalPath: string;
	onDestroyed: Trigger<pdi.Asset> = new Trigger();

	constructor(id: string, path: string) {
		this.id = id;
		this.originalPath = path;
		this.path = this._assetPathFilter(path);
	}

	destroy(): void {
		this.onDestroyed.fire(this);
		this.id = null!;
		this.originalPath = null!;
		this.path = null!;
		this.onDestroyed.destroy();
		this.onDestroyed = null!;
	}

	destroyed(): boolean {
		return this.id === null;
	}

	inUse(): boolean {
		return false;
	}

	abstract _load(loader: pdi.AssetLoadHandler): void;

	_assetPathFilter(path: string): string {
		// 拡張子の補完・読み替えが必要なassetはこれをオーバーライドすればよい。(対応形式が限定されるaudioなどの場合)
		return path;
	}
}
