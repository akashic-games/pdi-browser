"use strict";
import * as g from "@akashic/akashic-engine";
import { AudioAsset } from "../../asset/AudioAsset";
import { AudioManager } from "../../AudioManager";
import { AudioPlayer } from "../AudioPlayer";
import { AudioPlugin } from "../AudioPlugin";
import { ProxyAudioHandlerSet } from "./ProxyAudioHandlerSet";
import { ProxyAudioAsset } from "./ProxyAudioAsset";
import { ProxyAudioPlayer } from "./ProxyAudioPlayer";

export class ProxyAudioPlugin implements AudioPlugin {
	static isSupported(): boolean {
		return true;
	}

	supportedFormats: string[] = [];
	private _handlerSet: ProxyAudioHandlerSet;

	constructor(handlerSet: ProxyAudioHandlerSet) {
		this._handlerSet = handlerSet;
	}

	createAsset(
		id: string,
		assetPath: string,
		duration: number,
		system: g.AudioSystemLike,
		loop: boolean,
		hint: g.AudioAssetHint
	): AudioAsset {
		return new ProxyAudioAsset(this._handlerSet, id, assetPath, duration, system, loop, hint);
	}

	createPlayer(system: g.AudioSystemLike, manager: AudioManager): AudioPlayer {
		return new ProxyAudioPlayer(this._handlerSet, system, manager);
	}
}
