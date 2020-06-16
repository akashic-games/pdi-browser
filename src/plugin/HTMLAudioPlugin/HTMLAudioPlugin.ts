"use strict";
import * as pdi from "@akashic/akashic-pdi";
import { AudioManager } from "../../AudioManager";
import { AudioAsset } from "../../asset/AudioAsset";
import { AudioPlayer } from "../AudioPlayer";
import { AudioPlugin } from "../AudioPlugin";
import { HTMLAudioAsset } from "./HTMLAudioAsset";
import { HTMLAudioPlayer } from "./HTMLAudioPlayer";

export class HTMLAudioPlugin implements AudioPlugin {
	// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio.js
	// https://github.com/CreateJS/SoundJS/blob/master/src/soundjs/htmlaudio/HTMLAudioPlugin.js
	static isSupported(): boolean {
		// Audio要素を実際に作って、canPlayTypeが存在するかで確認する
		var audioElement = document.createElement("audio");
		var result = false;
		try {
			result = (audioElement.canPlayType !== undefined);
		} catch (e) {
			// ignore Error
		}

		return result;
	}

	private _supportedFormats: string[];

	constructor() {
		this._supportedFormats = this._detectSupportedFormats();
		HTMLAudioAsset.supportedFormats = this.supportedFormats;
	}

	get supportedFormats(): string[] {
		return this._supportedFormats;
	}

	set supportedFormats(supportedFormats: string[]) {
		this._supportedFormats = supportedFormats;
		HTMLAudioAsset.supportedFormats = supportedFormats;
	}

	createAsset(id: string, path: string, duration: number, system: pdi.AudioSystem, loop: boolean, hint: pdi.AudioAssetHint): AudioAsset {
		return new HTMLAudioAsset(id, path, duration, system, loop, hint);
	}

	createPlayer(system: pdi.AudioSystem, manager: AudioManager): AudioPlayer {
		return new HTMLAudioPlayer(system, manager);
	}

	private _detectSupportedFormats(): string[] {
		// Edgeは再生できるファイル形式とcanPlayTypeの結果が一致しないため、固定でAACを利用する
		if (navigator.userAgent.indexOf("Edge/") !== -1) return ["aac"];

		// Audio要素を実際に作って、canPlayTypeで再生できるかを判定する
		var audioElement = document.createElement("audio");
		var supportedFormats: string[] = [];
		try {
			var supportedExtensions = ["ogg", "aac", "mp4"];
			for (var i = 0, len = supportedExtensions.length; i < len; i++) {
				var ext = supportedExtensions[i];
				var canPlay = audioElement.canPlayType("audio/" + ext) as string;
				var supported = (canPlay !== "no" && canPlay !== "");
				if (supported) {
					supportedFormats.push(ext);
				}
			}
		} catch (e) {
			// ignore Error
		}
		return supportedFormats;
	}
}
