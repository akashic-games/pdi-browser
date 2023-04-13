"use strict";
import type * as pdi from "@akashic/pdi-types";
import type { AudioAsset } from "../../asset/AudioAsset";
import type { AudioManager } from "../../AudioManager";
import type { AudioPlayer } from "../AudioPlayer";
import type { AudioPlugin } from "../AudioPlugin";
import { detectSupportedFormats } from "../audioUtil";
import { WebAudioAsset } from "./WebAudioAsset";
import * as autoPlayHelper from "./WebAudioAutoplayHelper";
import { WebAudioPlayer } from "./WebAudioPlayer";

export class WebAudioPlugin implements AudioPlugin {
	private _supportedFormats: string[] = [];

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
		this.supportedFormats = detectSupportedFormats();
		autoPlayHelper.setupChromeMEIWorkaround();
	}

	createAsset(
		id: string,
		assetPath: string,
		duration: number,
		system: pdi.AudioSystem,
		loop: boolean,
		hint: pdi.AudioAssetHint,
		offset: number
	): AudioAsset {
		return new WebAudioAsset(id, assetPath, duration, system, loop, hint, offset);
	}

	createPlayer(system: pdi.AudioSystem, manager: AudioManager): AudioPlayer {
		return new WebAudioPlayer(system, manager);
	}
}
