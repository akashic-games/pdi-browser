"use strict";
import type { AudioPlugin } from "./AudioPlugin";

export interface AudioPluginStatic {
	// Audio Pluginの実装すべきStatic methodについての定義
	new (): AudioPlugin;
	// 実行環境がこのpluginをサポートしているか返す
	isSupported(): boolean;
}
