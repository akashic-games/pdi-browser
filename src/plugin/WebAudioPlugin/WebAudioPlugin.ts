"use strict";
import * as g from "@akashic/akashic-engine";
import { AudioAsset } from "../../asset/AudioAsset";
import { AudioManager } from "../../AudioManager";
import { AudioPlayer } from "../AudioPlayer";
import { AudioPlugin } from "../AudioPlugin";
import { WebAudioAsset } from "./WebAudioAsset";
import * as autoPlayHelper from "./WebAudioAutoplayHelper";
import { WebAudioPlayer } from "./WebAudioPlayer";

export class WebAudioPlugin implements AudioPlugin {
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

	private _supportedFormats: string[];

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
		system: g.AudioSystemLike,
		loop: boolean,
		hint: g.AudioAssetHint
	): AudioAsset {
		return new WebAudioAsset(id, assetPath, duration, system, loop, hint);
	}

	createPlayer(system: g.AudioSystemLike, manager: AudioManager): AudioPlayer {
		return new WebAudioPlayer(system, manager);
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
