"use strict";
import * as pdi from "@akashic/pdi-types";
import { AudioAsset } from "../../asset/AudioAsset";
import { AudioManager } from "../../AudioManager";
import { AudioPlayer } from "../AudioPlayer";
import { AudioPlugin } from "../AudioPlugin";
import { WebAudioAsset } from "./WebAudioAsset";
import * as autoPlayHelper from "./WebAudioAutoplayHelper";
import { WebAudioPlayer } from "./WebAudioPlayer";

export class WebAudioPlugin implements AudioPlugin {
	private _supportedFormats: string[];

	// AudioContextが存在するかどうかで判定する
	// http://mohayonao.hatenablog.com/entry/2012/12/12/103009
	// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio/webaudio.js
	static isSupported(): boolean {
		if ("AudioContext" in window) {
			return true;
		} else if ("webkitAudioContext" in window) {
			return true;
		}
		return false;
	}


	get supportedFormats(): string[] {
		return this._supportedFormats;
	}

	set supportedFormats(supportedFormats: string[]) {
		this._supportedFormats = supportedFormats;
		WebAudioAsset.supportedFormats = supportedFormats;
	}

	constructor() {
		this.supportedFormats = this._detectSupportedFormats();
		autoPlayHelper.setupChromeMEIWorkaround();
	}

	createAsset(
		id: string,
		assetPath: string,
		duration: number,
		system: pdi.AudioSystem,
		loop: boolean,
		hint: pdi.AudioAssetHint
	): AudioAsset {
		return new WebAudioAsset(id, assetPath, duration, system, loop, hint);
	}

	createPlayer(system: pdi.AudioSystem, manager: AudioManager): AudioPlayer {
		return new WebAudioPlayer(system, manager);
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
