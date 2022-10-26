"use strict";
import type * as pdi from "@akashic/pdi-types";
import type { AudioAsset } from "../../asset/AudioAsset";
import type { AudioManager } from "../../AudioManager";
import type { AudioPlayer } from "../AudioPlayer";
import type { AudioPlugin } from "../AudioPlugin";
import { HTMLAudioAsset } from "./HTMLAudioAsset";
import { HTMLAudioPlayer } from "./HTMLAudioPlayer";

export class HTMLAudioPlugin implements AudioPlugin {
	private _supportedFormats: string[];

	// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio.js
	// https://github.com/CreateJS/SoundJS/blob/master/src/soundjs/htmlaudio/HTMLAudioPlugin.js
	static isSupported(): boolean {
		// Audio要素を実際に作って、canPlayTypeが存在するかで確認する
		const audioElement = document.createElement("audio");
		let result = false;
		try {
			result = (audioElement.canPlayType !== undefined);
		} catch (e) {
			// ignore Error
		}

		return result;
	}

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

	createAsset(id: string, path: string, duration: number, system: pdi.AudioSystem, loop: boolean, hint: pdi.AudioAssetHint, offset: number): AudioAsset {
		return new HTMLAudioAsset(id, path, duration, system, loop, hint, offset);
	}

	createPlayer(system: pdi.AudioSystem, manager: AudioManager): AudioPlayer {
		return new HTMLAudioPlayer(system, manager);
	}

	private _detectSupportedFormats(): string[] {
		// Edgeは再生できるファイル形式とcanPlayTypeの結果が一致しないため、固定でAACを利用する
		if (navigator.userAgent.indexOf("Edge/") !== -1) return ["aac"];

		// Audio要素を実際に作って、canPlayTypeで再生できるかを判定する
		const audioElement = document.createElement("audio");
		const supportedFormats: string[] = [];
		try {
			const supportedExtensions = ["ogg", "aac", "mp4"];
			for (let i = 0, len = supportedExtensions.length; i < len; i++) {
				const ext = supportedExtensions[i];
				const canPlay = audioElement.canPlayType("audio/" + ext) as string;
				const supported = (canPlay !== "no" && canPlay !== "");
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
