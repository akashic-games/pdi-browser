import * as g from "@akashic/akashic-engine";
import { AudioAsset } from "./asset/AudioAsset";
import { HTMLImageAsset } from "./asset/HTMLImageAsset";
import { HTMLVideoAsset } from "./asset/HTMLVideoAsset";
import { XHRTextAsset } from "./asset/XHRTextAsset";
import { XHRScriptAsset } from "./asset/XHRScriptAsset";
import { AudioPluginManager } from "./plugin/AudioPluginManager";
import { AudioManager } from "./AudioManager";
import { Platform } from "./Platform";
import { GlyphFactory } from "./canvas/GlyphFactory";
import { SurfaceFactory } from "./canvas/shims/SurfaceFactory";
import { CanvasSurface } from "./canvas/CanvasSurface";

export interface ResourceFactoryParameterObject {
	audioPluginManager: AudioPluginManager;
	audioManager: AudioManager;
	platform: Platform;
}

export class ResourceFactory implements g.ResourceFactoryLike {
	_audioPluginManager: AudioPluginManager;
	_audioManager: AudioManager;
	_rendererCandidates: string[];
	_surfaceFactory: SurfaceFactory;
	_platform: Platform;

	constructor(param: ResourceFactoryParameterObject) {
		this._audioPluginManager = param.audioPluginManager;
		this._audioManager = param.audioManager;
		this._platform = param.platform;
		this._surfaceFactory = new SurfaceFactory();
	}

	createAudioAsset(
		id: string,
		assetPath: string,
		duration: number,
		system: g.AudioSystemLike,
		loop: boolean,
		hint: g.AudioAssetHint
	): AudioAsset {
		const activePlugin = this._audioPluginManager.getActivePlugin();
		const audioAsset = activePlugin.createAsset(id, assetPath, duration, system, loop, hint);
		this._audioManager.registerAudioAsset(audioAsset);
		audioAsset.onDestroyed.addOnce(this._onAudioAssetDestroyed, this);
		return audioAsset;
	}

	createAudioPlayer(system: g.AudioSystemLike): g.AudioPlayerLike {
		const activePlugin = this._audioPluginManager.getActivePlugin();
		return activePlugin.createPlayer(system, this._audioManager);
	}

	createImageAsset(id: string, assetPath: string, width: number, height: number): g.ImageAssetLike {
		return new HTMLImageAsset(id, assetPath, width, height);
	}

	createVideoAsset(
		id: string,
		assetPath: string,
		width: number,
		height: number,
		system: g.VideoSystemLike,
		loop: boolean,
		useRealSize: boolean
	): g.VideoAssetLike {
		return new HTMLVideoAsset(id, assetPath, width, height, system, loop, useRealSize);
	}

	createTextAsset(id: string, assetPath: string): g.TextAssetLike {
		return new XHRTextAsset(id, assetPath);
	}

	createScriptAsset(id: string, assetPath: string): g.ScriptAssetLike {
		return new XHRScriptAsset(id, assetPath);
	}

	createPrimarySurface(width: number, height: number): CanvasSurface {
		return this._surfaceFactory.createPrimarySurface(width, height, this._rendererCandidates);
	}

	createSurface(width: number, height: number): CanvasSurface {
		return this._surfaceFactory.createBackSurface(width, height, this._rendererCandidates);
	}

	createGlyphFactory(
		fontFamily: string|string[],
		fontSize: number,
		baseline?: number,
		fontColor?: string,
		strokeWidth?: number,
		strokeColor?: string,
		strokeOnly?: boolean,
		fontWeight?: g.FontWeightString
	): g.GlyphFactoryLike {
		return new GlyphFactory(fontFamily, fontSize, baseline, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight);
	}

	createSurfaceAtlas(width: number, height: number): g.SurfaceAtlasLike {
		return new g.SurfaceAtlas(this.createSurface(width, height)); // TODO: 独自の実装を持つようにする
	}

	_onAudioAssetDestroyed(asset: AudioAsset): void {
		this._audioManager.removeAudioAsset(asset);
	}
}
