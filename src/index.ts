import { Platform, PlatformParameterObject } from "./Platform";
export { Platform, PlatformParameterObject };
import { ResourceFactory, ResourceFactoryParameterObject } from "./ResourceFactory";
export { ResourceFactory, ResourceFactoryParameterObject };

// akashic-engine内部でresourceを使えるように初期設定
import * as g from "@akashic/akashic-engine";
export { g };

import { AudioPluginRegistry } from "./plugin/AudioPluginRegistry";
export { AudioPluginRegistry };
export { AudioPlugin } from "./plugin/AudioPlugin";
export { AudioPluginStatic } from "./plugin/AudioPluginStatic";
export { AudioPluginManager } from "./plugin/AudioPluginManager";

// TODO: Audio Pluginの実態は別リポジトリに切り出す事を検討する
import { HTMLAudioPlugin } from "./plugin/HTMLAudioPlugin/HTMLAudioPlugin";
import { WebAudioPlugin } from "./plugin/WebAudioPlugin/WebAudioPlugin";
export { HTMLAudioPlugin };
export { WebAudioPlugin };

import { ProxyAudioPlugin } from "./plugin/ProxyAudioPlugin/ProxyAudioPlugin";
export { ProxyAudioPlugin };
