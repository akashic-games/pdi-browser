import type * as pdi from "@akashic/pdi-types";
import type { AudioManager } from "../../AudioManager";
import { AudioPlayer } from "../AudioPlayer";
import { AudioElementPlayer } from "./AudioElementPlayer";
import type { HTMLAudioAsset } from "./HTMLAudioAsset";

export class HTMLAudioPlayer extends AudioPlayer {
	private _manager: AudioManager;
	private _player: AudioElementPlayer | null;

	constructor(system: pdi.AudioSystem, manager: AudioManager) {
		super(system);
		this._manager = manager;
		this._player = null;
	}

	play(asset: HTMLAudioAsset): void {
		if (this._player) {
			if (asset.id === this._player.id) {
				// 同一 ID のアセットは使い回す
				super.stop();
				this._player.rewind();
				super.play(asset);
				return;
			}
			this._player.destroy();
		}

		const player = new AudioElementPlayer({
			id: asset.id,
			element: asset.cloneElement(),
			duration: asset.duration ?? +Infinity,
			offset: asset.offset ?? 0,
			loop: !!asset.loop,
			loopOffset: asset.loopOffset ?? 0,
		});
		player.setVolume(this._calculateVolume());
		player.onStop.add(this.stop, this);
		player.play();
		this._player = player;

		super.play(asset);
	}

	stop(): void {
		this._player?.pause();
		super.stop();
	}

	changeVolume(volume: number): void {
		super.changeVolume(volume);
		this._player?.setVolume(this._calculateVolume());
	}

	_changeMuted(muted: boolean): void {
		super._changeMuted(muted);
		this._player?.setVolume(this._calculateVolume());
	}

	notifyMasterVolumeChanged(): void {
		this._player?.setVolume(this._calculateVolume());
	}

	private _calculateVolume(): number {
		return this._system._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
	}
}
