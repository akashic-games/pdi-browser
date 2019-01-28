"use strict";
import { AudioPlugin } from "./AudioPlugin";
import { AudioPluginStatic } from "./AudioPluginStatic";
/*
 Audioプラグインを登録し、現在登録しているプラグインを管理するクラス
 仕様は docs/audio-plugin.md を参照

 TODO: 各Gameインスタンスが一つのAudioプラグインしか持たないので、
 PluginManagerが状態をもたずにGame自体にpluginを登録する方式もあり
 */
export class AudioPluginManager {
	private _activePlugin: AudioPlugin;

	constructor() {
		this._activePlugin = undefined;
	}

	getActivePlugin(): AudioPlugin {
		if (this._activePlugin === undefined) {
			return null;
		}
		return this._activePlugin;
	}

	// Audioプラグインに登録を行い、どれか一つでも成功ならtrue、それ以外はfalseを返す
	tryInstallPlugin(plugins: AudioPluginStatic[]): boolean {
		var PluginConstructor = this.findFirstAvailablePlugin(plugins);
		if (PluginConstructor) {
			this._activePlugin = new PluginConstructor();
			return true;
		}
		// Step 3
		return false;
	}


	findFirstAvailablePlugin(plugins: AudioPluginStatic[]): AudioPluginStatic {
		for (var i = 0, len = plugins.length; i < len; i++) {
			// Step 1
			var plugin = plugins[i];
			// Step 2
			if (plugin.isSupported()) {
				return plugin;
			}
		}
	}
}

