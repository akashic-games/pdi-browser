import type * as pdi from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";
import type { AudioAsset } from "../asset/AudioAsset";

export abstract class AudioPlayer implements pdi.AudioPlayer {
	currentAudio: AudioAsset | undefined;
	onPlay: Trigger<pdi.AudioPlayerEvent> = new Trigger();
	onStop: Trigger<pdi.AudioPlayerEvent> = new Trigger();
	volume: number;
	played: Trigger<pdi.AudioPlayerEvent> = this.onPlay;
	stopped: Trigger<pdi.AudioPlayerEvent> = this.onStop;
	_muted: boolean; // 未使用。歴史的経緯のため残されている
	_system: pdi.AudioSystem;

	constructor(system: pdi.AudioSystem) {
		this.volume = 1;
		this._muted = false;
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
		const audio = this.currentAudio;
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

	// 歴史的経緯のためこの名前になっているが、対称性を考えればこのメソッドの正しい名前は _notifyMutedChanged() である。
	_changeMuted(_muted: boolean): void {
		// this._muted が未使用のため何もしない。
	}

	_notifyVolumeChanged(): void {
		// AudioPlayerの音量を AudioSystem の音量で上書きしていたため、最終音量が正常に計算できていなかった。
		// 暫定対応として、 changeVolume() に AudioPlayer 自身の音量を渡す事により最終音量の計算を実行させる。
		this.changeVolume(this.volume);
	}

	// マスター音量の変更の通知を受け取る
	abstract notifyMasterVolumeChanged(): void;
}
