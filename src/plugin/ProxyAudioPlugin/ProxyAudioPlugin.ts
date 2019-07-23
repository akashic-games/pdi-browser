"use strict";
import * as g from "@akashic/akashic-engine";
import { AudioPlugin } from "../AudioPlugin";
import { ProxyAudioHandlerSet } from "./ProxyAudioHandlerSet";
import { ProxyAudioAsset } from "./ProxyAudioAsset";
import { ProxyAudioPlayer } from "./ProxyAudioPlayer";
import { AudioManager } from "../../AudioManager";

export class ProxyAudioPlugin implements AudioPlugin {
	supportedFormats: string[] = [];

	static isSupported(): boolean {
		return true;
	}

	private _handlerSet: ProxyAudioHandlerSet;

	constructor(handlerSet: ProxyAudioHandlerSet) {
		this._handlerSet = handlerSet;
	}

	createAsset(id: string, assetPath: string, duration: number, system: g.AudioSystem, loop: boolean, hint: g.AudioAssetHint): g.AudioAsset {
		return new ProxyAudioAsset(this._handlerSet, id, assetPath, duration, system, loop, hint);
	}

	createPlayer(system: g.AudioSystem, manager: AudioManager): g.AudioPlayer {
		return new ProxyAudioPlayer(this._handlerSet, system, manager);
	}
}
