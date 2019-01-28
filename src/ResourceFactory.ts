import * as g from "@akashic/akashic-engine";
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

export class ResourceFactory extends g.ResourceFactory {
	_audioPluginManager: AudioPluginManager;
	_audioManager: AudioManager;
	_rendererCandidates: string[];
	_surfaceFactory: SurfaceFactory;
	_platform: Platform;

	constructor(param: ResourceFactoryParameterObject) {
		super();
		this._audioPluginManager = param.audioPluginManager;
		this._audioManager = param.audioManager;
		this._platform = param.platform;
		this._surfaceFactory = new SurfaceFactory();
	}

	createAudioAsset(id: string, assetPath: string, duration: number,
	                 system: g.AudioSystem, loop: boolean, hint: g.AudioAssetHint): g.AudioAsset {
		var activePlugin = this._audioPluginManager.getActivePlugin();
		var audioAsset = activePlugin.createAsset(id, assetPath, duration, system, loop, hint);
		if (audioAsset.onDestroyed) {
			this._audioManager.registerAudioAsset(audioAsset);
			audioAsset.onDestroyed.add(this._onAudioAssetDestroyed, this);
		}
		return audioAsset;
	}

	createAudioPlayer(system: g.AudioSystem): g.AudioPlayer {
		var activePlugin = this._audioPluginManager.getActivePlugin();
		return activePlugin.createPlayer(system, this._audioManager);
	}

	createImageAsset(id: string, assetPath: string, width: number, height: number): g.ImageAsset {
		return new HTMLImageAsset(id, assetPath, width, height);
	}

	createVideoAsset(id: string, assetPath: string, width: number, height: number,
	                 system: g.VideoSystem, loop: boolean, useRealSize: boolean): g.VideoAsset {
		return new HTMLVideoAsset(id, assetPath, width, height, system, loop, useRealSize);
	}

	createTextAsset(id: string, assetPath: string): g.TextAsset {
		return new XHRTextAsset(id, assetPath);
	}

	createScriptAsset(id: string, assetPath: string): g.ScriptAsset {
		return new XHRScriptAsset(id, assetPath);
	}

	createPrimarySurface(width: number, height: number): CanvasSurface {
		return this._surfaceFactory.createPrimarySurface(width, height, this._rendererCandidates);
	}

	createSurface(width: number, height: number): CanvasSurface {
		return this._surfaceFactory.createBackSurface(width, height, this._rendererCandidates);
	}

	createGlyphFactory(fontFamily: g.FontFamily|string|(g.FontFamily|string)[], fontSize: number, baseline?: number,
	                   fontColor?: string, strokeWidth?: number, strokeColor?: string, strokeOnly?: boolean,
	                   fontWeight?: g.FontWeight): g.GlyphFactory {
		return new GlyphFactory(fontFamily, fontSize, baseline, fontColor,
		                        strokeWidth, strokeColor, strokeOnly, fontWeight);
	}

	_onAudioAssetDestroyed(asset: g.AudioAsset): void {
		this._audioManager.removeAudioAsset(asset);
	}
}
