import * as pdi from "@akashic/akashic-pdi";
import { Trigger } from "@akashic/trigger";
import { AudioAsset } from "../asset/AudioAsset";

export abstract class AudioPlayer implements pdi.AudioPlayer {
	currentAudio: AudioAsset | undefined;
	onPlay: Trigger<pdi.AudioPlayerEvent> = new Trigger();
	onStop: Trigger<pdi.AudioPlayerEvent> = new Trigger();
	volume: number;
	played: Trigger<pdi.AudioPlayerEvent> = this.onPlay;
	stopped: Trigger<pdi.AudioPlayerEvent> = this.onStop;
	_muted: boolean;
	_system: pdi.AudioSystem;

	constructor(system: pdi.AudioSystem) {
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
