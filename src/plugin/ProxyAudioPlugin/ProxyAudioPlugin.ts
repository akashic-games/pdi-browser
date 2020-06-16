"use strict";
import * as pdi from "@akashic/akashic-pdi";
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
		system: pdi.AudioSystem,
		loop: boolean,
		hint: pdi.AudioAssetHint
	): AudioAsset {
		return new ProxyAudioAsset(this._handlerSet, id, assetPath, duration, system, loop, hint);
	}

	createPlayer(system: pdi.AudioSystem, manager: AudioManager): AudioPlayer {
		return new ProxyAudioPlayer(this._handlerSet, system, manager);
	}
}
