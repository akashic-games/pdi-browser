import type * as pdi from "@akashic/pdi-types";
import type { AudioManager } from "../../AudioManager";
import { AudioPlayer } from "../AudioPlayer";
import type { HTMLAudioAsset } from "./HTMLAudioAsset";
import { HTMLAudioPlayerContext } from "./HTMLAudioPlayerContext";

export class HTMLAudioPlayer extends AudioPlayer {
	private _manager: AudioManager;
	private _context: HTMLAudioPlayerContext | null;

	constructor(system: pdi.AudioSystem, manager: AudioManager) {
		super(system);
		this._manager = manager;
		this._context = null;
	}

	play(asset: HTMLAudioAsset): void {
		if (this._context) {
			if (asset.id === this._context.asset.id) {
				// 同一 ID のアセットは使い回す
				super.stop();
				this._context.rewind();
				super.play(asset);
				return;
			}
			this._context.destroy();
		}

		const context = new HTMLAudioPlayerContext({ asset });
		context.onStop.add(this.stop, this);
		context.play();
		this._context = context;

		super.play(asset);
	}

	stop(): void {
		this._context?.pause();
		super.stop();
	}

	changeVolume(volume: number): void {
		super.changeVolume(volume);
		this._context?.setVolume(this._calculateVolume());
	}

	_changeMuted(muted: boolean): void {
		super._changeMuted(muted);
		this._context?.setVolume(this._calculateVolume());
	}

	notifyMasterVolumeChanged(): void {
		this._context?.setVolume(this._calculateVolume());
	}

	private _calculateVolume(): number {
		return this._system._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
	}
}
