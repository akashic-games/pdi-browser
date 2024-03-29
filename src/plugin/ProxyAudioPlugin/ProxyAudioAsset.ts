import type * as pdi from "@akashic/pdi-types";
import { AudioAsset } from "../../asset/AudioAsset";
import { ExceptionFactory } from "../../utils/ExceptionFactory";
import type { ProxyAudioHandlerSet } from "./ProxyAudioHandlerSet";

export class ProxyAudioAsset extends AudioAsset {
	private _handlerSet: ProxyAudioHandlerSet;

	constructor(
		handlerSet: ProxyAudioHandlerSet,
		id: string,
		assetPath: string,
		duration: number,
		system: pdi.AudioSystem,
		loop: boolean,
		hint: pdi.AudioAssetHint,
		offset: number
	) {
		super(id, assetPath, duration, system, loop, hint, offset);
		this._handlerSet = handlerSet;
	}

	destroy(): void {
		this._handlerSet.unloadAudioAsset(this.id);
		super.destroy();
	}

	_load(loader: pdi.AssetLoadHandler): void {
		this._handlerSet.loadAudioAsset({
			id: this.id,
			assetPath: this.path,
			duration: this.duration,
			loop: this.loop,
			hint: this.hint,
			offset: this.offset
		}, (err?: any) => {
			if (err) {
				loader._onAssetError(this, ExceptionFactory.createAssetLoadError(err));
			} else {
				loader._onAssetLoad(this);
			}
		});
	}

	_assetPathFilter(path: string): string {
		return path;
	}

	_modifyPath(path: string): string {
		return path;
	}
}
