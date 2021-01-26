import * as pdi from "@akashic/pdi-types";
import { AudioManager } from "../../AudioManager";
import { AudioPlayer } from "../AudioPlayer";
import { WebAudioAsset } from "./WebAudioAsset";
import * as helper from "./WebAudioHelper";

export class WebAudioPlayer extends AudioPlayer {
	_endedEventHandler: () => void;
	private _gainNode: GainNode;
	private _sourceNode: AudioBufferSourceNode | null = null;
	private _audioContext: AudioContext;
	private _manager: AudioManager;
	private _dummyDurationWaitTimer: any = null;

	constructor(system: pdi.AudioSystem, manager: AudioManager) {
		super(system);
		this._audioContext = helper.getAudioContext();
		this._manager = manager;
		this._gainNode = helper.createGainNode(this._audioContext);
		this._gainNode.connect(this._audioContext.destination);
		this._endedEventHandler = () => {
			this._onAudioEnded();
		};
	}

	changeVolume(volume: number): void {
		super.changeVolume(volume);
		this._gainNode.gain.value = this._calculateVolume();
	}

	_changeMuted(muted: boolean): void {
		super._changeMuted(muted);
		this._gainNode.gain.value = this._calculateVolume();
	}

	play(asset: WebAudioAsset): void {
		if (this.currentAudio) {
			this.stop();
		}
		if (asset.data) {
			var bufferNode = helper.createBufferNode(this._audioContext);
			bufferNode.loop = asset.loop;
			bufferNode.buffer = asset.data;
			this._gainNode.gain.value = this._calculateVolume();
			bufferNode.connect(this._gainNode);
			this._sourceNode = bufferNode;
			// Chromeだとevent listerで指定した場合に動かないことがある
			// https://github.com/mozilla-appmaker/appmaker/issues/1984
			this._sourceNode.onended = this._endedEventHandler;
			this._sourceNode.start(0);
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
		if (this._sourceNode)
			this._sourceNode.stop(0);
		super.stop();
	}

	notifyMasterVolumeChanged(): void {
		this._gainNode.gain.value = this._calculateVolume();
	}

	private _onAudioEnded(): void {
		this._clearEndedEventHandler();
		super.stop();
	}

	private _clearEndedEventHandler(): void {
		if (this._sourceNode)
			this._sourceNode.onended = null;
		if (this._dummyDurationWaitTimer != null) {
			clearTimeout(this._dummyDurationWaitTimer);
			this._dummyDurationWaitTimer = null;
		}
	}

	private _calculateVolume(): number {
		return this._system._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
	}
}
