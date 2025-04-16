"use strict";
import type { AudioPlugin } from "./AudioPlugin";
import type { AudioPluginStatic } from "./AudioPluginStatic";
/*
 Audioプラグインを登録し、現在登録しているプラグインを管理するクラス

 TODO: 各Gameインスタンスが一つのAudioプラグインしか持たないので、
 PluginManagerが状態をもたずにGame自体にpluginを登録する方式もあり
 */
export class AudioPluginManager {
	private _activePlugin: AudioPlugin | null;

	constructor() {
		this._activePlugin = null;
	}

	getActivePlugin(): AudioPlugin | null {
		return this._activePlugin;
	}

	// Audioプラグインに登録を行い、どれか一つでも成功ならtrue、それ以外はfalseを返す
	tryInstallPlugin(plugins: (AudioPluginStatic | AudioPlugin)[]): boolean {
		for (let i = 0, len = plugins.length; i < len; i++) {
			const p = plugins[i];
			if ((p as any).isSupported) {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				const PluginConstructor = (p as AudioPluginStatic); // インスタンス化するので命名規則の lint を除外
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

	clear(): void {
		this._activePlugin?.clear();
	}
}
