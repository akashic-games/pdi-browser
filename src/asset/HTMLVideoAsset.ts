import * as g from "@akashic/akashic-engine";
import {HTMLVideoPlayer} from "./HTMLVideoPlayer";

class VideoAssetSurface extends g.Surface {

	constructor(width: number, height: number, drawable: HTMLVideoElement) {
		super(width, height, drawable);
	}

	renderer(): g.Renderer {
		throw g.ExceptionFactory.createAssertionError("VideoAssetSurface cannot be rendered.");
	}

	isPlaying(): boolean {
		return false;
	}
}

export class HTMLVideoAsset extends g.VideoAsset {
	_player: g.VideoPlayer;
	_surface: g.Surface;

	constructor(id: string, assetPath: string, width: number, height: number, system: g.VideoSystem, loop: boolean, useRealSize: boolean) {
		super(id, assetPath, width, height, system, loop, useRealSize);
		this._player = new HTMLVideoPlayer();
		this._surface = new VideoAssetSurface(width, height, null);
	}

	inUse(): boolean {
		return false;
	}

	_load(loader: g.AssetLoadHandler): void {
		setTimeout(() => {
			loader._onAssetLoad(this);
		}, 0);
	}

	getPlayer(): g.VideoPlayer {
		return this._player;
	}

	asSurface(): g.Surface {
		return this._surface;
	}
}
