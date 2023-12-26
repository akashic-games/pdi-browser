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
	private _loopTimeoutId: any;

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
			// NOTE: 後方互換のため、offset の指定がない場合は duration を無視 (終端まで再生)
			const duration = (asset.duration != null && asset.offset != null) ? asset.duration / 1000 : null;
			const offset = (asset.offset ?? 0) / 1000;
			const loopStart = (asset.loop && asset.loopOffset != null) ? asset.loopOffset / 1000 : offset;
			const end = (duration != null) ? offset + duration : null;

			audio.currentTime = offset;
			if (loopStart === 0 && end == null) {
				audio.loop = asset.loop;
				audio.addEventListener("ended", this._endedEventHandler);
			} else {
				if (!asset.loop) {
					audio.addEventListener("ended", this._endedEventHandler);
				} else {
					audio.addEventListener("ended", () => {
						audio.currentTime = loopStart;
						audio.play();
					});
				}
				if (end != null) {
					let previousCurrentTime = 0;
					const onEnded =  (): void => {
						this._clearTimer();
						if (asset.loop) {
							audio.currentTime = loopStart;
						} else {
							audio.pause();
						}
					};
					audio.addEventListener("timeupdate", () => {
						const diff = Math.max(0, audio.currentTime - previousCurrentTime);
						previousCurrentTime = audio.currentTime;
						if (end <= audio.currentTime) {
							onEnded();
						} else if (end <= audio.currentTime + diff) { // 次の timeupdate イベントまでに end を超えることが確定していれば、見越し時間で停止処理を行う
							this._clearTimer();
							this._loopTimeoutId = setTimeout(() => {
								onEnded();
							}, (end - audio.currentTime) * 1000);
						}
					});
				}
			}

			setupChromeMEIWorkaround(audio);
			audio.volume = this._calculateVolume();
			audio.play().catch((_err) => { /* user interactの前にplay()を呼ぶとエラーになる。これはHTMLAudioAutoplayHelperで吸収する */});
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

	private _clearTimer(): void {
		if (this._loopTimeoutId != null) {
			clearTimeout(this._loopTimeoutId);
			this._loopTimeoutId = null;
		}
	}

	private _clearEndedEventHandler(): void {
		if (this._audioInstance)
			this._audioInstance.removeEventListener("ended", this._endedEventHandler, false);
		if (this._dummyDurationWaitTimer != null) {
			clearTimeout(this._dummyDurationWaitTimer);
			this._dummyDurationWaitTimer = null;
		}
		this._clearTimer();
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
