import * as g from "@akashic/akashic-engine";
import { AudioManager } from "../../AudioManager";
import { AudioPlayer } from "../AudioPlayer";
import { ProxyAudioAsset } from "./ProxyAudioAsset";
import { ProxyAudioHandlerSet } from "./ProxyAudioHandlerSet";

export class ProxyAudioPlayer extends g.AudioPlayer implements AudioPlayer {
	private _audioPlayerId: string | null;
	private _handlerSet: ProxyAudioHandlerSet;
	private _manager: AudioManager;

	constructor(handlerSet: ProxyAudioHandlerSet, system: g.AudioSystem, manager: AudioManager) {
		super(system);
		this._audioPlayerId = null;
		this._handlerSet = handlerSet;
		this._manager = manager;
	}

	changeVolume(volume: number): void {
		super.changeVolume(volume);
		this._notifyVolumeToHandler();
	}

	_changeMuted(muted: boolean): void {
		super._changeMuted(muted);
		this._notifyVolumeToHandler();
	}

	play(asset: ProxyAudioAsset): void {
		if (this._audioPlayerId != null) {
			this.stop();
		}
		this._audioPlayerId = this._handlerSet.createAudioPlayer(asset.id);
		this._handlerSet.changeAudioVolume(this._audioPlayerId, this._calculateVolume());
		this._handlerSet.playAudioPlayer(this._audioPlayerId);
		super.play(asset);
	}

	stop(): void {
		if (this._audioPlayerId != null) {
			this._handlerSet.stopAudioPlayer(this._audioPlayerId);
			this._handlerSet.destroyAudioPlayer(this._audioPlayerId);
			this._audioPlayerId = null;
		}
		super.stop();
	}

	notifyMasterVolumeChanged(): void {
		this._notifyVolumeToHandler();
	}

	private _notifyVolumeToHandler(): void {
		if (this._audioPlayerId != null) {
			this._handlerSet.changeAudioVolume(this._audioPlayerId, this._calculateVolume());
		}
	}

	private _calculateVolume(): number {
		return this._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
	}
}
