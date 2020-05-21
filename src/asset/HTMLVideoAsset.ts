import * as g from "@akashic/akashic-engine";
import { Surface } from "../Surface";
import { Asset } from "./Asset";
import { HTMLVideoPlayer } from "./HTMLVideoPlayer";

class VideoAssetSurface extends Surface {
	constructor(width: number, height: number, drawable: HTMLVideoElement) {
		super(width, height, drawable);
	}

	renderer(): g.RendererLike {
		throw new Error("VideoAssetSurface cannot be rendered.");
	}

	isPlaying(): boolean {
		return false;
	}
}

export class HTMLVideoAsset extends Asset implements g.VideoAssetLike {
	type: "video" = "video";
	width: number;
	height: number;
	realWidth: number;
	realHeight: number;
	_system: g.VideoSystemLike;
	_loop: boolean;
	_useRealSize: boolean;
	_player: HTMLVideoPlayer;
	_surface: VideoAssetSurface;

	constructor(id: string, assetPath: string, width: number, height: number, system: g.VideoSystemLike, loop: boolean, useRealSize: boolean) {
		super(id, assetPath);
		this.width = width;
		this.height = height;
		this.realWidth = 0;
		this.realHeight = 0;
		this._system = system;
		this._loop = loop;
		this._useRealSize = useRealSize;
		this._player = new HTMLVideoPlayer();
		this._surface = new VideoAssetSurface(width, height, null);
	}

	play(_loop?: boolean): g.VideoPlayerLike {
		this.getPlayer().play(this);
		return this.getPlayer();
	}

	stop(): void {
		this.getPlayer().stop();
	}

	inUse(): boolean {
		return false;
	}

	_load(loader: g.AssetLoadHandler): void {
		setTimeout(() => {
			loader._onAssetLoad(this);
		}, 0);
	}

	getPlayer(): HTMLVideoPlayer {
		return this._player;
	}

	asSurface(): VideoAssetSurface {
		return this._surface;
	}
}
