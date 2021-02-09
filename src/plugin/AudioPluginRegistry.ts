"use strict";
import { AudioPluginStatic } from "./AudioPluginStatic";

var audioPlugins: AudioPluginStatic[] = [];

// eslint-disable-next-line @typescript-eslint/naming-convention
export var AudioPluginRegistry = { // export してるため命名規則の lint を除外
	addPlugin(plugin: AudioPluginStatic): void {
		if (audioPlugins.indexOf(plugin) === -1) {
			audioPlugins.push(plugin);
		}
	},
	getRegisteredAudioPlugins(): AudioPluginStatic[] {
		return audioPlugins;
	},
	clear(): void {
		audioPlugins = [];
	}
};
