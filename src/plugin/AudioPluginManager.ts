"use strict";
import { AudioPlugin } from "./AudioPlugin";
import { AudioPluginStatic } from "./AudioPluginStatic";
/*
 Audioプラグインを登録し、現在登録しているプラグインを管理するクラス

 TODO: 各Gameインスタンスが一つのAudioプラグインしか持たないので、
 PluginManagerが状態をもたずにGame自体にpluginを登録する方式もあり
 */
export class AudioPluginManager {
	private _activePlugin: AudioPlugin;

	constructor() {
		this._activePlugin = null!;
	}

	getActivePlugin(): AudioPlugin {
		return this._activePlugin;
	}

	// Audioプラグインに登録を行い、どれか一つでも成功ならtrue、それ以外はfalseを返す
	tryInstallPlugin(plugins: (AudioPluginStatic | AudioPlugin)[]): boolean {
		for (var i = 0, len = plugins.length; i < len; i++) {
			var p = plugins[i];
			if ((p as any).isSupported) {
				const PluginConstructor = (p as AudioPluginStatic);
				if (PluginConstructor.isSupported()) {
					this._activePlugin = new PluginConstructor();
					return true;
				}
			} else {
				this._activePlugin = p as AudioPlugin;
				return true;
			}
		}
		return false;
	}
}
