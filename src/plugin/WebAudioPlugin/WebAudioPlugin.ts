"use strict";
import type * as pdi from "@akashic/pdi-types";
import type { AudioAsset } from "../../asset/AudioAsset";
import type { AudioManager } from "../../AudioManager";
import { CachedLoader } from "../../utils/CachedLoader";
import type { AudioPlayer } from "../AudioPlayer";
import type { AudioPlugin } from "../AudioPlugin";
import { detectSupportedFormats } from "../audioUtil";
import { loadArrayBuffer, WebAudioAsset } from "./WebAudioAsset";
import * as autoPlayHelper from "./WebAudioAutoplayHelper";
import { WebAudioPlayer } from "./WebAudioPlayer";

export class WebAudioPlugin implements AudioPlugin {
	private _supportedFormats: string[] = [];
	// 音声アセットのリソースのキャッシュ付きローダー
	// TODO: 不要なケースでは使用しない
	private _cachedLoader: CachedLoader<string, { audio: AudioBuffer; url: string }>;

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
		// 保存可能容量としてファイルサイズの合計値を利用。100MBを上限とする
		this._cachedLoader = new CachedLoader(loadArrayBuffer, { limitSize: 100000000 });
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
		const asset = new WebAudioAsset(id, assetPath, duration, system, loop, hint, offset);
		asset._loadFun = this._cachedLoader.load.bind(this._cachedLoader);
		return asset;
	}

	createPlayer(system: pdi.AudioSystem, manager: AudioManager): AudioPlayer {
		return new WebAudioPlayer(system, manager);
	}

	clear(): void {
		this._cachedLoader.reset();
	}
}
