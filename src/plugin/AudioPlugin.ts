"use strict";
import * as g from "@akashic/akashic-engine";
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
		system: g.AudioSystemLike,
		loop: boolean,
		hint: g.AudioAssetHint
	) => AudioAsset;

	createPlayer: (system: g.AudioSystemLike, manager: AudioManager) => AudioPlayer;
}
