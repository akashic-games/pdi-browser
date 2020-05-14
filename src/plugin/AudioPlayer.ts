import * as g from "@akashic/akashic-engine";
import { AudioAsset } from "../asset/AudioAsset";

export abstract class AudioPlayer implements g.AudioPlayerLike {
	currentAudio: AudioAsset | undefined;
	onPlay: g.Trigger<g.AudioPlayerEvent> = new g.Trigger();
	onStop: g.Trigger<g.AudioPlayerEvent> = new g.Trigger();
	volume: number;
	played: g.Trigger<g.AudioPlayerEvent> = this.onPlay;
	stopped: g.Trigger<g.AudioPlayerEvent> = this.onStop;
	_muted: boolean;
	_system: g.AudioSystemLike;

	constructor(system: g.AudioSystemLike) {
		this.volume = system.volume;
		this._muted = system._muted;
		this._system = system;
	}

	play(audio: AudioAsset): void {
		this.currentAudio = audio;
		this.onPlay.fire({
			player: this,
			audio: audio
		});
	}

	stop(): void {
		var audio = this.currentAudio;
		if (!audio) return;
		this.currentAudio = undefined;
		this.onStop.fire({
			player: this,
			audio: audio
		});
	}

	canHandleStopped(): boolean {
		return true;
	}

	changeVolume(volume: number): void {
		this.volume = volume;
	}

	_changeMuted(muted: boolean): void {
		this._muted = muted;
	}

	_notifyVolumeChanged(): void {
		// AudioPlayerの音量を AudioSystem の音量で上書きしていたため、最終音量が正常に計算できていなかった。
		// 暫定対応として、 changeVolume() に AudioPlayer 自身の音量を渡す事により最終音量の計算を実行させる。
		this.changeVolume(this.volume);
	}

	// マスター音量の変更の通知を受け取る
	abstract notifyMasterVolumeChanged(): void;
}
