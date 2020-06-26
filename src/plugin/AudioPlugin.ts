"use strict";
import * as pdi from "@akashic/pdi-types";
import { AudioAsset } from "../asset/AudioAsset";
import { AudioManager } from "../AudioManager";
import { AudioPlayer } from "./AudioPlayer";

// Audioプラグインの詳細は docs/audio-plugin.md
// Audio Pluginの実装すべきInterface
// Static methodについては AudioPluginStatic.ts を参照
export interface AudioPlugin {
	// このプラグインにおいて実行環境がサポートとしている拡張子(.抜き)
	// e.g.) ["aac", "ogg"]
	supportedFormats: string[];

	createAsset: (
		id: string,
		assetPath: string,
		duration: number,
		system: pdi.AudioSystem,
		loop: boolean,
		hint: pdi.AudioAssetHint
	) => AudioAsset;

	createPlayer: (system: pdi.AudioSystem, manager: AudioManager) => AudioPlayer;
}
