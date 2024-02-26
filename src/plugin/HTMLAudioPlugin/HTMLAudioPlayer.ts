import type * as pdi from "@akashic/pdi-types";
import type { AudioManager } from "../../AudioManager";
import { AudioPlayer } from "../AudioPlayer";
import type { HTMLAudioAsset } from "./HTMLAudioAsset";
import { setupChromeMEIWorkaround } from "./HTMLAudioAutoplayHelper";

export class HTMLAudioPlayer extends AudioPlayer {
	private _endedEventHandler: () => void;
	private _audioInstance: HTMLAudioElement | null = null;
	private _manager: AudioManager;
	private _isWaitingPlayEvent: boolean = false;
	private _isStopRequested: boolean = false;
	private _onPlayEventHandler: () => void;
	private _dummyDurationWaitTimer: any;

	constructor(system: pdi.AudioSystem, manager: AudioManager) {
		super(system);
		this._manager = manager;
		this._endedEventHandler = () => {
			this._onAudioEnded();
		};
		this._onPlayEventHandler = () => {
			this._onPlayEvent();
		};
		this._dummyDurationWaitTimer = null;
	}

	play(asset: HTMLAudioAsset): void {
		if (this.currentAudio) {
			this.stop();
		}
		const audio = asset.cloneElement();

		if (audio) {
			if (!asset.offset) {
				// offsetが指定されていない場合、durationを無視して全体再生する
				audio.loop = asset.loop;
			} else {
				const offsetSec = (asset.offset ?? 0) / 1000;
				const durationEndSec = asset.duration / 1000 + offsetSec;
				audio.currentTime = offsetSec;
				audio.ontimeupdate = () => {
					if (durationEndSec <= audio.currentTime) {
						if (asset.loop) {
							audio.currentTime = offsetSec;
						} else {
							audio.pause();
						}
					}
				};
				audio.onended = () => {
					if (asset.loop) {
						audio.currentTime = offsetSec;
						audio.play();
					}
				};
			}

			setupChromeMEIWorkaround(audio);
			audio.volume = this._calculateVolume();
			audio.play().catch((_err) => { /* user interactの前にplay()を呼ぶとエラーになる。これはHTMLAudioAutoplayHelperで吸収する */});
			// FIXME: 部分ループ再生の場合、音声再生1周目終了時に内部情報を削除してしまうため、この後にstop()を呼び出しても音声が止まらない問題がある
			audio.addEventListener("ended", this._endedEventHandler, false);
			audio.addEventListener("play", this._onPlayEventHandler, false);
			this._isWaitingPlayEvent = true;
			this._audioInstance = audio;
		} else {
			// 再生できるオーディオがない場合。duration後に停止処理だけ行う(処理のみ進め音は鳴らさない)
			this._dummyDurationWaitTimer = setTimeout(this._endedEventHandler, asset.duration);
		}
		super.play(asset);
	}

	stop(): void {
		if (!this.currentAudio) {
			super.stop();
			return;
		}
		this._clearEndedEventHandler();

		if (this._audioInstance) {
			if (!this._isWaitingPlayEvent) {
				// _audioInstance が再び play されることは無いので、 removeEventListener("play") する必要は無い
				this._audioInstance.pause();
				this._audioInstance = null;
			} else {
				this._isStopRequested = true;
			}
		}
		super.stop();
	}

	changeVolume(volume: number): void {
		super.changeVolume(volume);
		if (this._audioInstance) {
			this._audioInstance.volume = this._calculateVolume();
		}
	}

	_changeMuted(muted: boolean): void {
		super._changeMuted(muted);
		if (this._audioInstance) {
			this._audioInstance.volume = this._calculateVolume();
		}
	}

	notifyMasterVolumeChanged(): void {
		if (this._audioInstance) {
			this._audioInstance.volume = this._calculateVolume();
		}
	}

	private _onAudioEnded(): void {
		this._clearEndedEventHandler();
		super.stop();
	}

	private _clearEndedEventHandler(): void {
		if (this._audioInstance)
			this._audioInstance.removeEventListener("ended", this._endedEventHandler, false);
		if (this._dummyDurationWaitTimer != null) {
			clearTimeout(this._dummyDurationWaitTimer);
			this._dummyDurationWaitTimer = null;
		}
	}

	// audio.play() は非同期なので、 play が開始される前に stop を呼ばれた場合はこのハンドラ到達時に停止する
	private _onPlayEvent(): void {
		if (!this._isWaitingPlayEvent) return;
		this._isWaitingPlayEvent = false;
		if (this._isStopRequested) {
			this._isStopRequested = false;
			// _audioInstance が再び play されることは無いので、 removeEventListener("play") する必要は無い
			this._audioInstance?.pause();
			this._audioInstance = null;
		}
	}

	private _calculateVolume(): number {
		return this._system._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
	}
}
