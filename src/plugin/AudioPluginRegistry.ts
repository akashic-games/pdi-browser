"use strict";
import { AudioPluginStatic } from "./AudioPluginStatic";

var audioPlugins: AudioPluginStatic[] = [];

export var AudioPluginRegistry = {
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
