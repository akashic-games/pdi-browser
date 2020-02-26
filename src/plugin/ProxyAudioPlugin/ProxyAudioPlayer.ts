import * as g from "@akashic/akashic-engine";
import { AudioManager } from "../../AudioManager";
import { AudioPlayer } from "../AudioPlayer";
import { ProxyAudioAsset } from "./ProxyAudioAsset";
import { ProxyAudioHandlerSet } from "./ProxyAudioHandlerSet";

export class ProxyAudioPlayer extends g.AudioPlayer implements AudioPlayer {
	private static _audioPlayerIdCounter: number = 0;

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
		this._audioPlayerId = `ap${ProxyAudioPlayer._audioPlayerIdCounter++}`;
		this._handlerSet.createAudioPlayer({
			assetId: asset.id,
			audioPlayerId: this._audioPlayerId,
			isPlaying: true,
			volume: this._calculateVolume(),
			playbackRate: 1  // 未使用
		});
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
		return this._system._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
	}
}
