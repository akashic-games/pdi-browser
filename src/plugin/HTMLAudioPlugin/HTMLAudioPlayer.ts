import * as pdi from "@akashic/pdi-types";
import { AudioManager } from "../../AudioManager";
import { AudioPlayer } from "../AudioPlayer";
import { HTMLAudioAsset } from "./HTMLAudioAsset";
import * as autoPlayHelper from "./HTMLAudioAutoplayHelper";

export class HTMLAudioPlayer extends AudioPlayer {
	private _endedEventHandler: () => void;
	private _audioInstance: HTMLAudioElement;
	private _manager: AudioManager;
	private _isWaitingPlayEvent: boolean;
	private _isStopRequested: boolean;
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
		var audio = asset.cloneElement();
		if (audio) {
			autoPlayHelper.setupChromeMEIWorkaround(audio);
			audio.volume = this._calculateVolume();
			audio.play().catch((_err) => { /* user interactの前にplay()を呼ぶとエラーになる。これはHTMLAudioAutoplayHelperで吸収する */});

			audio.loop = asset.loop;
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
			this._audioInstance.pause();
			this._audioInstance = null;
		}
	}

	private _calculateVolume(): number {
		return this._system._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
	}
}
