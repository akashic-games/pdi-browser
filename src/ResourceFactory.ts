import * as pdi from "@akashic/pdi-types";
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

export class ResourceFactory implements pdi.ResourceFactory {
	_audioPluginManager: AudioPluginManager;
	_audioManager: AudioManager;
	_rendererCandidates: string[] | null = null;
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
		system: pdi.AudioSystem,
		loop: boolean,
		hint: pdi.AudioAssetHint
	): AudioAsset {
		const activePlugin = this._audioPluginManager.getActivePlugin()!; // 利用側でtryInstallPlugin()が事前に呼ばれているためnon-nullとして扱う
		const audioAsset = activePlugin.createAsset(id, assetPath, duration, system, loop, hint);
		this._audioManager.registerAudioAsset(audioAsset);
		audioAsset.onDestroyed.addOnce(this._onAudioAssetDestroyed as (arg: pdi.Asset) => void, this);
		return audioAsset;
	}

	createAudioPlayer(system: pdi.AudioSystem): pdi.AudioPlayer {
		const activePlugin = this._audioPluginManager.getActivePlugin()!;
		return activePlugin.createPlayer(system, this._audioManager);
	}

	createImageAsset(id: string, assetPath: string, width: number, height: number): pdi.ImageAsset {
		return new HTMLImageAsset(id, assetPath, width, height);
	}

	createVideoAsset(
		id: string,
		assetPath: string,
		width: number,
		height: number,
		system: pdi.VideoSystem,
		loop: boolean,
		useRealSize: boolean
	): pdi.VideoAsset {
		return new HTMLVideoAsset(id, assetPath, width, height, system, loop, useRealSize);
	}

	createTextAsset(id: string, assetPath: string): pdi.TextAsset {
		return new XHRTextAsset(id, assetPath);
	}

	createScriptAsset(id: string, assetPath: string): pdi.ScriptAsset {
		return new XHRScriptAsset(id, assetPath);
	}

	createPrimarySurface(width: number, height: number): CanvasSurface {
		return this._surfaceFactory.createPrimarySurface(width, height, this._rendererCandidates!); // Platformなど外部から渡される
	}

	createSurface(width: number, height: number): CanvasSurface {
		return this._surfaceFactory.createBackSurface(width, height, this._rendererCandidates!);
	}

	createGlyphFactory(
		fontFamily: string|string[],
		fontSize: number,
		baseline?: number,
		fontColor?: string,
		strokeWidth?: number,
		strokeColor?: string,
		strokeOnly?: boolean,
		fontWeight?: pdi.FontWeightString
	): pdi.GlyphFactory {
		return new GlyphFactory(fontFamily, fontSize, baseline, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight);
	}

	_onAudioAssetDestroyed(asset: AudioAsset): void {
		this._audioManager.removeAudioAsset(asset);
	}
}
