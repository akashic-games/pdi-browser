"use strict";
import type * as pdi from "@akashic/pdi-types";
import type { AudioAsset } from "../../asset/AudioAsset";
import type { AudioManager } from "../../AudioManager";
import { CachedLoader } from "../../utils/CachedLoader";
import type { AudioPlayer } from "../AudioPlayer";
import type { AudioPlugin } from "../AudioPlugin";
import { detectSupportedFormats } from "../audioUtil";
import { HTMLAudioAsset } from "./HTMLAudioAsset";
import { HTMLAudioPlayer } from "./HTMLAudioPlayer";

export class HTMLAudioPlugin implements AudioPlugin {
	private _supportedFormats: string[] = [];
	// 音声アセットのリソースのキャッシュ付きローダー
	private _cachedLoader: CachedLoader<string, { audio: HTMLAudioElement; url: string }>;

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
		this.supportedFormats = detectSupportedFormats();
		// 音声ファイルのファイルサイズ取得が困難なので、保存可能容量として音声の合計再生時間を利用。100分を上限とする
		this._cachedLoader =
			new CachedLoader<string, { audio: HTMLAudioElement; url: string }>(HTMLAudioAsset._loadImpl, { limitSize: 6000000 });
	}

	get supportedFormats(): string[] {
		return this._supportedFormats;
	}

	set supportedFormats(supportedFormats: string[]) {
		this._supportedFormats = supportedFormats;
		HTMLAudioAsset.supportedFormats = supportedFormats;
	}

	createAsset(
		id: string,
		path: string,
		duration: number,
		system: pdi.AudioSystem,
		loop: boolean,
		hint: pdi.AudioAssetHint,
		offset: number
	): AudioAsset {
		const asset = new HTMLAudioAsset(id, path, duration, system, loop, hint, offset);
		asset._cachedLoader = this._cachedLoader;
		return asset;
	}

	createPlayer(system: pdi.AudioSystem, manager: AudioManager): AudioPlayer {
		return new HTMLAudioPlayer(system, manager);
	}

	clear(): void {
		this._cachedLoader.reset();
	}
}
