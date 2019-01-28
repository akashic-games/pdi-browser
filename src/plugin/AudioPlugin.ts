"use strict";
import g = require("@akashic/akashic-engine");
import { AudioManager } from "../AudioManager";
// Audioプラグインの詳細は docs/audio-plugin.md
// Audio Pluginの実装すべきInterface
// Static methodについては AudioPluginStatic.ts を参照
export interface AudioPlugin {
	// このプラグインにおいて実行環境がサポートとしている拡張子(.抜き)
	// e.g.) ["aac", "ogg"]
	supportedFormats: string[];

	createAsset: (id: string, assetPath: string, duration: number,
	              system: g.AudioSystem, loop: boolean, hint: g.AudioAssetHint) => g.AudioAsset;
	createPlayer: (system: g.AudioSystem, manager: AudioManager) => g.AudioPlayer;
}
