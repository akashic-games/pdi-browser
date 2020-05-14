import * as g from "@akashic/akashic-engine";
import { AudioAsset } from "../../asset/AudioAsset";
import { ExceptionFactory } from "../../utils/ExceptionFactory";
import { ProxyAudioHandlerSet } from "./ProxyAudioHandlerSet";

export class ProxyAudioAsset extends AudioAsset {
	private _handlerSet: ProxyAudioHandlerSet;

	constructor(
		handlerSet: ProxyAudioHandlerSet,
		id: string,
		assetPath: string,
		duration: number,
		system: g.AudioSystemLike,
		loop: boolean,
		hint: g.AudioAssetHint
	) {
		super(id, assetPath, duration, system, loop, hint);
		this._handlerSet = handlerSet;
	}

	destroy(): void {
		this._handlerSet.unloadAudioAsset(this.id);
		super.destroy();
	}

	_load(loader: g.AssetLoadHandler): void {
		this._handlerSet.loadAudioAsset({
			id: this.id,
			assetPath: this.path,
			duration: this.duration,
			loop: this.loop,
			hint: this.hint
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
}
