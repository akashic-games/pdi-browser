"use strict";
import * as pdi from "@akashic/pdi-types";
import { AudioAsset } from "../../asset/AudioAsset";
import { AudioManager } from "../../AudioManager";
import { AudioPlayer } from "../AudioPlayer";
import { AudioPlugin } from "../AudioPlugin";
import { ProxyAudioAsset } from "./ProxyAudioAsset";
import { ProxyAudioHandlerSet } from "./ProxyAudioHandlerSet";
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
		hint: pdi.AudioAssetHint
	): AudioAsset {
		return new ProxyAudioAsset(this._handlerSet, id, assetPath, duration, system, loop, hint);
	}

	createPlayer(system: pdi.AudioSystem, manager: AudioManager): AudioPlayer {
		return new ProxyAudioPlayer(this._handlerSet, system, manager);
	}
}
