import { Platform, PlatformParameterObject } from "./Platform";
export { Platform, PlatformParameterObject };
export { ResourceFactory, ResourceFactoryParameterObject };

import { AudioPluginRegistry } from "./plugin/AudioPluginRegistry";
export { AudioPluginRegistry };
export { AudioPlugin } from "./plugin/AudioPlugin";
export { AudioPluginStatic } from "./plugin/AudioPluginStatic";
export { AudioPluginManager } from "./plugin/AudioPluginManager";

// TODO: Audio Pluginの実態は別リポジトリに切り出す事を検討する
import { HTMLAudioPlugin } from "./plugin/HTMLAudioPlugin/HTMLAudioPlugin";
import { ProxyAudioPlugin } from "./plugin/ProxyAudioPlugin/ProxyAudioPlugin";
import { WebAudioPlugin } from "./plugin/WebAudioPlugin/WebAudioPlugin";
export { HTMLAudioPlugin };
export { WebAudioPlugin };

import { ResourceFactory, ResourceFactoryParameterObject } from "./ResourceFactory";
export { ProxyAudioPlugin };
