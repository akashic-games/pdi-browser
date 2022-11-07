"use strict";
import type * as pdi from "@akashic/pdi-types";
import type { AudioAsset } from "../../asset/AudioAsset";
import type { AudioManager } from "../../AudioManager";
import type { AudioPlayer } from "../AudioPlayer";
import type { AudioPlugin } from "../AudioPlugin";
import { ProxyAudioAsset } from "./ProxyAudioAsset";
import type { ProxyAudioHandlerSet } from "./ProxyAudioHandlerSet";
import { ProxyAudioPlayer } from "./ProxyAudioPlayer";

export class ProxyAudioPlugin implements AudioPlugin {
	supportedFormats: string[] = [];
	private _handlerSet: ProxyAudioHandlerSet;

	static isSupported(): boolean {
		return true;
	}

	constructor(handlerSet: ProxyAudioHandlerSet) {
		this._handlerSet = handlerSet;
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
		return new ProxyAudioAsset(this._handlerSet, id, assetPath, duration, system, loop, hint, offset);
	}

	createPlayer(system: pdi.AudioSystem, manager: AudioManager): AudioPlayer {
		return new ProxyAudioPlayer(this._handlerSet, system, manager);
	}
}
